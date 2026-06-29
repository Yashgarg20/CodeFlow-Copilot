#from repo_analyzer import clone_repository
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from copilot.ai_client import generate_ai_response
from fastapi.responses import FileResponse
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle
from reportlab.lib import colors
import csv
import os
from database import (
    init_db,
    save_history,
    get_history as db_history
)

import json
import re

app = FastAPI()

# ---------------- DATABASE ----------------
init_db()

# ---------------- CORS ----------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------- Request Models ----------------

class ExplainRequest(BaseModel):
    log_text: str


class DocsRequest(BaseModel):
    error_text: str


class CommitRequest(BaseModel):
    diff: str

class ReviewRequest(BaseModel):
    code: str
 
class ReadmeRequest(BaseModel):
    repo_url: str | None = None
    project_description: str | None = None

class RepoRequest(BaseModel):
    repo_url: str




# ---------------- Helper Functions ----------------

def classify_error(text: str):
    text = text.lower()

    if "syntax" in text:
        return "Syntax Error"

    elif "type" in text:
        return "Type Error"

    elif "import" in text or "module" in text:
        return "Dependency Error"

    return "Runtime Error"


def detect_severity(text: str):
    text = text.lower()

    if "fatal" in text or "crash" in text:
        return "High"

    elif "warning" in text:
        return "Low"

    return "Medium"


def detect_language(text: str):
    text = text.lower()

    # ---------- Python ----------
    if (
        "def " in text
        or "import " in text
        or "print(" in text
        or "none" in text
        or "traceback" in text
        or "modulenotfounderror" in text
        or "attributeerror" in text
        or "indexerror" in text
    ):
        return "python"

    # ---------- JavaScript ----------
    if (
        "const " in text
        or "let " in text
        or "var " in text
        or "console.log" in text
        or "=>" in text
        or "typeerror" in text
        or "undefined" in text
    ):
        return "javascript"

    # ---------- React ----------
    if (
        "usestate" in text
        or "useeffect" in text
        or "return (" in text
        or "jsx" in text
        or "<div" in text
    ):
        return "jsx"

    # ---------- Java ----------
    if (
        "public class" in text
        or "system.out.println" in text
        or "nullpointerexception" in text
    ):
        return "java"

    # ---------- PHP ----------
    if (
        "<?php" in text
        or "$_" in text
        or "echo " in text
    ):
        return "php"

    # ---------- C# ----------
    if (
        "using system" in text
        or "namespace " in text
        or "console.writeline" in text
    ):
        return "csharp"

    # ---------- HTML ----------
    if (
        "<html" in text
        or "<body" in text
        or "<div" in text
    ):
        return "html"

    # ---------- CSS ----------
    if (
        "background:" in text
        or "font-size:" in text
        or ".container" in text
    ):
        return "css"

    # ---------- SQL ----------
    if (
        "select " in text
        or "insert into" in text
        or "update " in text
        or "delete from" in text
    ):
        return "sql"

    return "text"


def fallback_explanation(text: str):
    return {
        "explanation":
        "This error usually occurs because of undefined values, incorrect data types, missing dependencies, or logic mistakes.",

        "fix":
        "Verify variable initialization, dependency installation, and application logic."
    }


# ---------------- EXPLAIN ----------------

@app.post("/explain")
def explain(req: ExplainRequest):

    error_type = classify_error(req.log_text)
    severity = detect_severity(req.log_text)
    language = detect_language(req.log_text)

    prompt = f"""
Analyze this programming error.

Error:
{req.log_text}

Return ONLY valid JSON:

{{
    "explanation":"simple explanation",
    "fix":["step 1","step 2"]
}}
"""

    ai_response = generate_ai_response(prompt)

    print("\n========== EXPLAIN ==========")
    print(ai_response)
    print("============================\n")

    if ai_response:

        try:

            cleaned = re.sub(
                r"```json|```",
                "",
                ai_response
            ).strip()

            match = re.search(
                r"\{.*\}",
                cleaned,
                re.DOTALL
            )

            if match:

                parsed = json.loads(
                    match.group()
                )

                explanation = parsed.get(
                    "explanation",
                    ""
                )

                fix = parsed.get(
                    "fix",
                    []
                )

                if isinstance(fix, list):
                    fix = "\n• " + "\n• ".join(fix)

            else:
                raise Exception(
                    "No JSON Found"
                )

        except Exception as e:

            print(
                "JSON PARSE ERROR:",
                e
            )

            print(
                "AI RESPONSE:",
                cleaned
            )

            explanation = cleaned

            fix = (
                "Check code logic, variables, imports, "
                "and dependencies."
            )

    else:

        fallback = fallback_explanation(
            req.log_text
        )

        explanation = fallback["explanation"]

        fix = fallback["fix"]

    result = {
        "success": True,
        "language": language,
        "error_type": error_type,
        "severity": severity,
        "explanation": explanation,
        "fix": fix
    }

    save_history(
        language,
        error_type,
        severity,
        explanation
    )

    return result


# ---------------- DOCS ----------------

@app.post("/docs")
def docs(req: DocsRequest):

    prompt = f"""
Provide ONLY ONE useful documentation URL.

Error:

{req.error_text}

Return ONLY URL.
"""

    ai_response = generate_ai_response(prompt)

    if ai_response:

        match = re.search(
            r"https?://[^\s]+",
            ai_response
        )

        docs_link = (
            match.group()
            if match
            else "https://stackoverflow.com"
        )

    else:

        docs_link = "https://stackoverflow.com"

    save_history(
        "Documentation",
        "Docs Search",
        "Low",
        docs_link
    )

    return {
        "success": True,
        "docs": docs_link
    }
# ---------------- COMMIT ----------------

@app.post("/commit")
def commit(req: CommitRequest):

    prompt = f"""
Generate a SHORT git commit message.

Maximum 10 words.

Diff:

{req.diff}

Return ONLY commit message.
"""

    ai_response = generate_ai_response(prompt)

    if ai_response:

        message = (
            ai_response
            .strip()
            .split("\n")[0]
        )

    else:

        message = (
            "Fix: update application logic"
        )

    save_history(
        "Git",
        "Commit Generation",
        "Low",
        message
    )

    return {
        "success": True,
        "commit_message": message
    }
@app.post("/review")
def review(req: ReviewRequest):

    prompt = f"""
You are a senior software engineer.

Review the following code.

Return ONLY valid JSON.

Format:

{{
    "issues": [
        "...",
        "..."
    ],
    "severity": "Low | Medium | High",
    "suggestions": [
        "...",
        "..."
    ],
    "improved_code": "full improved code"
}}

Code:

{req.code}
"""

    ai_response = generate_ai_response(prompt)

    print("\n========== REVIEW ==========")
    print(ai_response)
    print("============================\n")

    if not ai_response:
        parsed = {
            "issues": ["Unable to generate AI review."],
            "severity": "Unknown",
            "suggestions": ["Please try again."],
            "improved_code": req.code,
        }

    else:
        try:
            cleaned = re.sub(
                r"```json|```",
                "",
                ai_response
            ).strip()

            match = re.search(
                r"\{.*\}",
                cleaned,
                re.DOTALL
            )

            if match:
                parsed = json.loads(match.group())
                parsed.setdefault("issues", [])
                parsed.setdefault("severity", "Unknown")
                parsed.setdefault("suggestions", [])
                parsed.setdefault("improved_code", req.code)
            else:
                raise Exception("No JSON found")

        except Exception as e:
            print("JSON PARSE ERROR:", e)

            parsed = {
                "issues": ["Unable to parse AI response."],
                "severity": "Unknown",
                "suggestions": ["Please try again."],
                "improved_code": req.code,
            }

    save_history(
        "Code Review",
        "Review",
        parsed.get("severity", "Low"),
        ", ".join(parsed.get("issues", []))
    )

    return {
    "success": True,
    "language": detect_language(req.code),
    "issues": parsed.get("issues", []),
    "severity": parsed.get("severity", "Unknown"),
    "suggestions": parsed.get("suggestions", []),
    "improved_code": parsed.get("improved_code", ""),
}

import requests

@app.post("/repository")
def analyze_repository(req: RepoRequest):

    try:

        url = req.repo_url.strip().rstrip("/")

        #repo_path = clone_repository(url)

        parts = url.split("/")

        owner = parts[-2]
        repo = parts[-1]

        github_api = f"https://api.github.com/repos/{owner}/{repo}"

        response = requests.get(github_api)

        if response.status_code != 200:
            return {
                "success": False,
                "message": "Repository not found."
            }

        repo_data = response.json()
        readme_api = f"https://api.github.com/repos/{owner}/{repo}/readme"

        readme_response = requests.get(
            readme_api,
            headers={
                "Accept": "application/vnd.github.raw" 
            }
        )

        if readme_response.status_code == 200:
            readme = readme_response.text[:2000]
        else:
            readme = ""
        

        prompt = f"""
Analyze this GitHub repository.

Repository:
{repo_data['name']}

Language:
{repo_data.get('language')}

Description:
{repo_data.get('description')}

README:

{readme}

Return ONLY JSON.

{{
"summary":"",
"strengths":[],
"improvements":[]
}}
"""

        ai = generate_ai_response(prompt)
        if not ai:
            ai = """
            {
                "summary":"Unable to analyze repository.",
                "strengths":[],
                "improvements":[]
            }
            """

        try:

            cleaned = re.sub(
                r"```json|```",
                "",
                ai
            ).strip()

            match = re.search(
                r"\{.*\}",
                cleaned,
                re.DOTALL
            )

            if match:
                parsed = json.loads(match.group())
            else:
                raise Exception("No JSON found")

        except Exception:

            parsed = {
                "summary": "Unable to generate AI summary.",
                "strengths": [],
                "improvements": []
            }
        save_history(
    "GitHub",
    "Repository Analysis",
    "Low",
    parsed["summary"]
)

        return {

            "success": True,

            "repository": repo_data["name"],

            "owner": repo_data["owner"]["login"],

            "description": repo_data.get("description"),

            "language": repo_data.get("language"),

            "stars": repo_data.get("stargazers_count"),

            "forks": repo_data.get("forks_count"),

            "issues": repo_data.get("open_issues_count"),

            "summary": parsed["summary"],

            "strengths": parsed["strengths"],

            "improvements": parsed["improvements"]

        }

    except Exception as e:

        return {
            "success": False,
            "message": str(e)
        }
@app.post("/readme")
def generate_readme(req: ReadmeRequest):

    prompt = f"""
You are an expert software engineer.

Generate a professional GitHub README in Markdown format.

Repository URL:
{req.repo_url}

Project Description:
{req.project_description}

Include the following sections:

# Project Title

## Overview

## Features

## Tech Stack

## Installation

## Usage

## Folder Structure (if possible)

## API Endpoints (if applicable)

## Future Improvements

## License

Return ONLY Markdown.
"""

    ai_response = generate_ai_response(prompt)

    if not ai_response:
        ai_response = "# README\n\nUnable to generate README."

    save_history(
        "README",
        "README Generation",
        "Low",
        "README generated successfully"
    )

    return {
        "success": True,
        "readme": ai_response
    }

# ---------------- HISTORY ----------------

@app.get("/history")
def get_history():

    rows = db_history()

    return [
    {
        "language": row[0],
        "error_type": row[1],
        "severity": row[2],
        "explanation": row[3],
        "created_at": row[4]
    }
    for row in rows
]


# ---------------- ANALYTICS ----------------

@app.get("/stats")
def stats():

    rows = db_history()

    total = len(rows)

    syntax_errors = len(
        [r for r in rows if r[1] == "Syntax Error"]
    )

    runtime_errors = len(
        [r for r in rows if r[1] == "Runtime Error"]
    )

    type_errors = len(
        [r for r in rows if r[1] == "Type Error"]
    )

    dependency_errors = len(
        [r for r in rows if r[1] == "Dependency Error"]
    )

    docs_count = len(
        [r for r in rows if r[1] == "Docs Search"]
    )

    commit_count = len(
        [r for r in rows if r[1] == "Commit Generation"]
    )
    review_count = len(
    [r for r in rows if r[1] == "Review"]
    )
    repository_count = len(
    [r for r in rows if r[1] == "Repository Analysis"]
    )
    readme_count = len(
    [r for r in rows if r[1] == "README Generation"]
)


    

    return {
        "total": total,
        "syntax": syntax_errors,
        "runtime": runtime_errors,
        "type": type_errors,
        "dependency": dependency_errors,
        "docs": docs_count,
        "commit": commit_count,
        "review": review_count,
        "repository": repository_count,
        "readme": readme_count
        
    }
@app.get("/export/pdf")
def export_pdf():

    rows = db_history()

    filename = "codeflow_report.pdf"

    doc = SimpleDocTemplate(filename, pagesize=letter)

    data = [
        ["Language", "Type", "Severity", "Result"]
    ]

    for row in rows:
        data.append([
            row[0],
            row[1],
            row[2],
            row[3][:80]
        ])

    table = Table(data)

    table.setStyle(TableStyle([

        ("BACKGROUND",(0,0),(-1,0),colors.darkblue),
        ("TEXTCOLOR",(0,0),(-1,0),colors.white),

        ("GRID",(0,0),(-1,-1),1,colors.grey),

        ("BACKGROUND",(0,1),(-1,-1),colors.beige),

        ("FONTNAME",(0,0),(-1,0),"Helvetica-Bold"),

        ("BOTTOMPADDING",(0,0),(-1,0),10),

    ]))

    doc.build([table])

    return FileResponse(
        filename,
        media_type="application/pdf",
        filename=filename
    )
@app.get("/export/csv")
def export_csv():

    rows = db_history()

    filename = "codeflow_report.csv"

    with open(
        filename,
        "w",
        newline="",
        encoding="utf-8"
    ) as file:

        writer = csv.writer(file)

        writer.writerow([
            "Language",
            "Type",
            "Severity",
            "Result"
        ])

        writer.writerows(rows)

    return FileResponse(
        filename,
        media_type="text/csv",
        filename=filename
    )


import requests
import sys

BASE_URL = "http://localhost:8000"


def explain(text):
    res = requests.post(f"{BASE_URL}/explain", json={"log_text": text})
    data = res.json()

    print("\n===== EXPLANATION =====")
    print(f"Type     : {data.get('error_type')}")
    print(f"Severity : {data.get('severity')}")

    print("\nExplanation:")
    print(data.get("explanation"))

    print("\nFix:")
    print(data.get("fix"))


def docs(text):
    res = requests.post(f"{BASE_URL}/docs", json={"error_text": text})
    data = res.json()

    print("\n===== DOCUMENTATION =====")
    print(data.get("docs"))


def commit(text):
    res = requests.post(f"{BASE_URL}/commit", json={"diff": text})
    data = res.json()

    print("\n===== COMMIT MESSAGE =====")
    print(data.get("commit_message"))


# ---------------- REVIEW ----------------

def review(text):
    res = requests.post(
        f"{BASE_URL}/review",
        json={"code": text}
    )

    data = res.json()

    print("\n===== AI CODE REVIEW =====")

    print("\n🔴 Issues Found:")
    for issue in data.get("issues", []):
        print(f"• {issue}")

    print(f"\n🟡 Severity: {data.get('severity')}")

    print("\n💡 Suggestions:")
    for suggestion in data.get("suggestions", []):
        print(f"• {suggestion}")

    print("\n💻 Improved Code:\n")
    print(data.get("improved_code"))

# ---------------- REPOSITORY ----------------

def repository(repo_url):
    res = requests.post(
        f"{BASE_URL}/repository",
        json={"repo_url": repo_url}
    )

    data = res.json()

    if not data.get("success"):
        print("\n❌ Repository analysis failed.")
        print(data.get("message"))
        return

    print("\n========== AI REPOSITORY INSIGHTS ==========\n")

    print(f"📦 Repository : {data.get('repository')}")
    print(f"👤 Owner      : {data.get('owner')}")
    print(f"💻 Language   : {data.get('language')}")
    print(f"⭐ Stars      : {data.get('stars')}")
    print(f"🍴 Forks      : {data.get('forks')}")
    print(f"🐞 Issues     : {data.get('issues')}")

    print("\n📝 Summary")
    print(data.get("summary"))

    print("\n💪 Strengths")
    for strength in data.get("strengths", []):
        print(f"✔ {strength}")

    print("\n🚀 Improvements")
    for improvement in data.get("improvements", []):
        print(f"• {improvement}")

def readme(text):

    res = requests.post(
        f"{BASE_URL}/readme",
        json={
            "repo_url": text,
            "project_description": text,
        },
    )

    data = res.json()

    print("\n========== GENERATED README ==========\n")

    print(data.get("readme"))

    with open("README.md", "w", encoding="utf-8") as f:
        f.write(data.get("readme"))

    print("\nREADME saved as README.md")


def show_help():
    print("\nUsage:")
    print('python cli.py explain "<error text>"')
    print('python cli.py docs "<error text>"')
    print('python cli.py commit "<git diff>"')
    print('python cli.py review "<source code>"')
    print('python cli.py repository "<github repository url>"')
    print('python cli.py readme "<github repository url>"')

if __name__ == "__main__":

    if len(sys.argv) < 3:
        show_help()
        sys.exit()

    command = sys.argv[1]
    text = " ".join(sys.argv[2:])

    if command == "explain":
        explain(text)

    elif command == "docs":
        docs(text)

    elif command == "commit":
        commit(text)

    elif command == "review":
        review(text)

    elif command == "repository":
        repository(text)
    
    elif command == "readme":
        readme(text)
    else:
        show_help()


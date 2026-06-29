import google.generativeai as genai
from .config import GEMINI_API_KEY, GEMINI_MODEL

if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)

def generate_ai_response(prompt: str):
    try:
        if not GEMINI_API_KEY:
            raise Exception("No API key")

        model = genai.GenerativeModel(GEMINI_MODEL)

        response = model.generate_content(prompt)

        return response.text.strip()

    except Exception as e:
        print("\nGEMINI ERROR:")
        print(e)
        print()

        return None
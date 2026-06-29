import sqlite3
from datetime import datetime

DB_NAME = "codeflow.db"

def init_db():
    conn = sqlite3.connect(DB_NAME)

    conn.execute("""
    CREATE TABLE IF NOT EXISTS history(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        language TEXT,
        error_type TEXT,
        severity TEXT,
        explanation TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)

    conn.commit()
    conn.close()


def save_history(language, error_type, severity, explanation):
    conn = sqlite3.connect(DB_NAME)

    created_at = datetime.now().strftime("%d %b %Y | %I:%M:%S %p")

    conn.execute(
        """
        INSERT INTO history
        (language,error_type,severity,explanation,created_at)
        VALUES(?,?,?,?,?)
        """,
        (
            language,
            error_type,
            severity,
            explanation,
            created_at
        )
    )

    conn.commit()
    conn.close()


def get_history():
    conn = sqlite3.connect(DB_NAME)

    rows = conn.execute("""
SELECT
language,
error_type,
severity,
explanation,
created_at
FROM history
ORDER BY id DESC
""").fetchall()

    conn.close()

    return rows
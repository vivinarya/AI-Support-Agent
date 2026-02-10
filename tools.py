# sample database for company policies
import json
import os

DB_FILE = "database.json"

def load_database():
    if not os.path.exists(DB_FILE):
        return {}
    with open(DB_FILE, "r") as f:
        return json.load(f)

def search_knowledge_base(query):
    data = load_database()
    # Simple fuzzy search
    for key, value in data.items():
        if key in query.lower():
            return value
    return None
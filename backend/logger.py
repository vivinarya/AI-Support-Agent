import json
from datetime import datetime

LOG_FILE = "agent_logs.json"

def log_interaction(user_question, search_query, retrieval_result, retry_triggered, final_answer):
    log_entry = {
        "timestamp": datetime.now().isoformat(),
        "inputs": {
            "user_question": user_question,
            "generated_search_query": search_query
        },
        "logic": {
            "retrieval_success": retrieval_result is not None,
            "retry_was_triggered": retry_triggered,
            "context_found": retrieval_result
        },
        "output": final_answer
    }

    try:
        with open(LOG_FILE, "r") as f:
            logs = json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        logs = []

    logs.append(log_entry)

    with open(LOG_FILE, "w") as f:
        json.dump(logs, f, indent=2)
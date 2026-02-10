# Resilient Agent

## Overview

This project implements a resilient AI agent designed to handle customer support queries with high reliability. It features an intelligent retry mechanism, self-correction capabilities for search queries, and structured logging for observability. The system now includes a **interactive Streamlit Dashboard** for real-time testing and knowledge base management.

## Key Features

- **Intelligent Keyword Extraction**: analyzing user input to identify core search terms.
- **Self-Correcting Search**: Automatically detects failed searches and generates synonyms or alternative keywords to retry.
- **Interactive Dashboard**: A web-based UI provides a chat interface and a **Control Panel** to manage the internal knowledge base (add/remove topics) without touching code.
- **Context-Aware Responses**: Uses retrieved knowledge base articles to answer user questions grounded in fact.
- **Structured Logging**: detailed JSON logs (`agent_logs.json`) track the entire decision process.
- **Evaluation Suite**: Integrated automated grading system to verify agent performance against golden test cases.

## Architecture

The agent follows a multi-step workflow to ensure robust performance:

1.  **Input Analysis**: The user's natural language question is processed.
2.  **Extraction**: The LLM extracts a precise search keyword (e.g., "refund" from "I want my money back").
3.  **Search & Verification**: The agent queries the internal knowledge base.
4.  **Self-Correction (if needed)**:
    *   If the initial search yields no results, the agent enters a recovery mode.
    *   It generates a synonym or related term (e.g., "money back" -> "refund").
    *   A second search is performed with the corrected term.
5.  **Response Generation**: The final answer is synthesized using the retrieved context.

## Setup

### Prerequisites

- Python 3.8+
- Groq API Key

### Installation

1.  Clone the repository.
2.  Install dependencies:
    ```bash
    pip install -r requirements.txt
    ```
    *(Note: Ensure `groq`, `python-dotenv`, `streamlit`, `pandas` are installed)*

3.  Configure Environment:
    Create a `.env` file in the root directory:
    ```env
    GROQ_API_KEY=your_api_key_here
    ```

## Usage

### Running the Dashboard (Recommended)
Launch the interactive web interface:
```bash
streamlit run app.py
```
This opens a browser window where you can:
*   Chat with the agent.
*   **Manage the Knowledge Base**: Use the sidebar to add new support topics or delete existing ones.

### Running the CLI Agent
To run a single interactive session in the terminal:
```bash
python agent.py
```

### Evaluation
To run the automated test suite and grade the agent's performance:
```bash
python eval.py
```

## Test Cases

The system is verified against the following scenarios to ensure reliability:

**Scenario: Refund Request (Self-Correction Triggered)**
*   **User Input**: "I want my money back."
*   **Extraction**: Agent extracts keyword: "money back".
*   **Search**: Queries database for "money back" -> Returns `None`.
*   **Self-Correction**: Agent realizes failure, generates synonym "refund".
*   **Retry**: Queries database for "refund" -> Returns Policy Context.
*   **Response**: Generates a polite answer based on the policy.

## Observability

All interactions are logged to `agent_logs.json`.

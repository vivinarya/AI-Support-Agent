import os
from huggingface_hub import InferenceClient
from tools import search_knowledge_base
from dotenv import load_dotenv

load_dotenv()

# 1. SETUP
REPO_ID = "google/flan-t5-large"
client = InferenceClient(token=os.getenv("HUGGINGFACE_API_KEY"))

def debug_step_1_extraction(question):
    print(f"\n--- STEP 1: KEYWORD EXTRACTION ('{question}') ---")
    
    # This is the exact prompt from your agent.py
    prompt = f"Extract the search keyword from this question: {question}"
    
    try:
        response = client.text_generation(prompt, model=REPO_ID, max_new_tokens=50).strip()
        print(f"   [LLM Output] Raw: '{response}'")
        
        # Simulate the cleaning logic
        cleaned = response.lower().replace("keyword", "").strip()
        print(f"   [Cleaned]    Final: '{cleaned}'")
        return cleaned
    except Exception as e:
        print(f"   [Error]      {e}")
        return None

def debug_step_2_search(keyword):
    print(f"\n--- STEP 2: DATABASE SEARCH ('{keyword}') ---")
    
    result = search_knowledge_base(keyword)
    
    if result:
        print(f"   [Success]    Found: '{result}'")
    else:
        print(f"   [Failed]     Result was None.")
        # Print valid keys to help debugging
        from tools import MOCK_KNOWLEDGE_BASE
        print(f"   [Hint]       Valid keys are: {list(MOCK_KNOWLEDGE_BASE.keys())}")

def run_debug():
    # Test Case 1: Refund
    keyword = debug_step_1_extraction("How do I get a refund?")
    if keyword:
        debug_step_2_search(keyword)

    # Test Case 2: Shipping
    keyword = debug_step_1_extraction("How much is express shipping?")
    if keyword:
        debug_step_2_search(keyword)

if __name__ == "__main__":
    run_debug()
import time
import os
from dotenv import load_dotenv
from groq import Groq
from agent import run_agent

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

MODEL_ID = "llama-3.3-70b-versatile"

TEST_DATASET = [
    {"question": "How do I get a refund?", "expected": "5-10 business days"},
    {"question": "Can I get my money back?", "expected": "5-10 business days"},
    {"question": "How much is express shipping?", "expected": "$15"},
    {"question": "I forgot my password", "expected": "Forgot Password button"}
]

def ai_grader(question, expected, actual):
    response = client.chat.completions.create(
        model=MODEL_ID,
        messages=[
            {"role": "system", "content": "You are a strict teacher. Output ONLY 'PASS' if the Student Answer contains the meaning of the Expected Answer. Otherwise output 'FAIL'."},
            {"role": "user", "content": f"Question: {question}\nExpected Fact: {expected}\nStudent Answer: {actual}"}
        ]
    )
    return response.choices[0].message.content.strip()

def run_evaluation():
    print("STARTING AI EVALUATION...")
    print("-" * 50)
    score = 0
    
    for i, test in enumerate(TEST_DATASET):
        print(f"\nTest {i+1}: {test['question']}")
        
        answer = run_agent(test['question'])
        print(f"   [Agent Answer] {answer}")

        grade = ai_grader(test['question'], test['expected'], answer)
        print(f"   [ AI Grade ] {grade}")
        
        if "PASS" in grade:
            score += 1
        time.sleep(1)

    print("-" * 50)
    print(f"FINAL SCORE: {score}/{len(TEST_DATASET)}")

if __name__ == "__main__":
    run_evaluation()
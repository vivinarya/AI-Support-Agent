import os
import time
from dotenv import load_dotenv
from groq import Groq
from tools import search_knowledge_base
from backend.logger import log_interaction

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))


MODEL_ID = "llama-3.3-70b-versatile" 

def run_agent(user_question, user_id="test_user"):
    retry_triggered = False


    
    extract_response = client.chat.completions.create(
        model=MODEL_ID,
        messages=[
            {"role": "system", "content": "You are a backend API. Extract ONE single search keyword from the user request. Output ONLY the keyword (e.g. 'refund'). Do not output sentences."},
            {"role": "user", "content": user_question}
        ]
    )
    
    search_query = extract_response.choices[0].message.content.strip().lower()
    search_query = search_query.replace("keyword:", "").replace('"', '').strip()
    



    result = search_knowledge_base(search_query)
    

    if result is None:

        
        retry_response = client.chat.completions.create(
            model=MODEL_ID,
            messages=[
                {"role": "system", "content": "The previous search failed. Generate a synonym or related keyword for this request. Output ONLY the single keyword."},
                {"role": "user", "content": f"Request: {user_question}. Failed keyword: {search_query}"}
            ]
        )
        new_query = retry_response.choices[0].message.content.strip().lower()

        
        result = search_knowledge_base(new_query)
        retry_triggered = True


    final_answer = ""
    if result:
        answer_response = client.chat.completions.create(
            model=MODEL_ID,
            messages=[
                {"role": "system", "content": "Answer the user question using ONLY the provided context. Be helpful and concise."},
                {"role": "user", "content": f"Context: {result}\n\nQuestion: {user_question}"}
            ]
        )
        final_answer = answer_response.choices[0].message.content
    else:
        final_answer = "I apologize, but I couldn't find that information in our database."


    log_interaction(user_question, search_query, result, retry_triggered, final_answer)

    return final_answer

if __name__ == "__main__":
    print(run_agent("I want my money back"))
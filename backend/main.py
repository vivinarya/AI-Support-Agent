import os
import time
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from pydantic import BaseModel
from dotenv import load_dotenv
from groq import Groq
from rag import query_knowledge_base
from logger import log_interaction

load_dotenv()


app = FastAPI(title="Enterprise RAG Agent API")
client = Groq(api_key=os.getenv("GROQ_API_KEY"))
MODEL_ID = "llama-3.3-70b-versatile"


limiter = Limiter(key_func=get_remote_address)
limiter = Limiter(key_func=get_remote_address)
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["POST", "GET"],
    allow_headers=["*"],
)


class ChatRequest(BaseModel):
    message: str

class ChatResponse(BaseModel):
    response: str
    context_used: str | None

@app.post("/chat", response_model=ChatResponse)
@limiter.limit("10/minute")
async def chat_endpoint(request: Request, body: ChatRequest):
    user_query = body.message
    retry_triggered = False
    
    context = query_knowledge_base(user_query)
    
    if not context:

        
        try:
            retry_completion = client.chat.completions.create(
                model=MODEL_ID,
                messages=[
                    {"role": "system", "content": "The user search failed. Output ONE synonym keyword for the request."},
                    {"role": "user", "content": user_query}
                ]
            )
            synonym = retry_completion.choices[0].message.content.strip()

            
            context = query_knowledge_base(synonym)
            retry_triggered = True
        except Exception as e:
            pass


    system_prompt = f"""
    You are a professional support agent. Answer the user strictly based on the context below.
    If the context is empty, politely say you do not have that information.
    
    CONTEXT: {str(context)}
    """
    
    try:
        completion = client.chat.completions.create(
            model=MODEL_ID,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_query}
            ]
        )
        final_answer = completion.choices[0].message.content
        

        log_interaction(user_query, "RAG_Search", str(context), retry_triggered, final_answer)
        
        return {
            "response": final_answer,
            "context_used": context if context else "None"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class EntryRequest(BaseModel):
    title: str
    content: str

@app.post("/add-entry")
@limiter.limit("5/minute")
async def add_entry_endpoint(request: Request, body: EntryRequest):
    try:
        from rag import add_document
        add_document(body.title, body.content)
        return {"message": "Entry added successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

from fastapi import UploadFile, File

@app.post("/upload")
@limiter.limit("5/minute")
async def upload_document_endpoint(request: Request, file: UploadFile = File(...)):
    try:
        from rag import add_document
        import io
        
        content = await file.read()
        filename = file.filename.lower()
        text_content = ""

        if filename.endswith(".pdf"):
            try:
                import pypdf
                pdf_reader = pypdf.PdfReader(io.BytesIO(content))
                for page in pdf_reader.pages:
                    text_content += page.extract_text() + "\n"
            except ImportError:

                raise HTTPException(status_code=500, detail="Backend missing PDF support (pypdf).")
            except Exception as e:

                 raise HTTPException(status_code=400, detail=f"Invalid PDF file: {str(e)}")
        else:
            try:
                text_content = content.decode("utf-8")
            except UnicodeDecodeError:
                raise HTTPException(status_code=400, detail="File must be a UTF-8 text file or a PDF.")

        if not text_content.strip():
             raise HTTPException(status_code=400, detail="File is empty or could not extract text.")

        add_document(file.filename, text_content)
        return {"message": f"File '{file.filename}' processed and added to knowledge base"}
    except HTTPException:
        raise
    except Exception as e:

        raise HTTPException(status_code=500, detail=f"Failed to process file: {str(e)}")
import chromadb
from sentence_transformers import SentenceTransformer
import os

DB_PATH = "./chroma_db"
COLLECTION_NAME = "enterprise_knowledge"

client = chromadb.PersistentClient(path=DB_PATH)


embed_model = SentenceTransformer('all-MiniLM-L6-v2')

collection = client.get_or_create_collection(name=COLLECTION_NAME)

def add_document(doc_id: str, text: str):

    vector = embed_model.encode(text).tolist()
    collection.add(
        documents=[text],
        embeddings=[vector],
        ids=[doc_id]
    )

def query_knowledge_base(query_text: str, n_results: int = 1):

    try:
        query_vector = embed_model.encode(query_text).tolist()
        
        results = collection.query(
            query_embeddings=[query_vector],
            n_results=n_results
        )
        
        if results['documents'] and results['documents'][0]:
            return results['documents'][0][0]
        return None
    except Exception as e:
        print(f"RAG Error: {e}")
        return None

if collection.count() == 0:

    add_document("refund_policy", "Refunds are processed within 5-10 business days. No refunds after 30 days.")
    add_document("shipping_policy", "Standard shipping is free. Express shipping costs $15 and takes 2 days.")
    add_document("password_reset", "To reset your password, go to Settings > Security > Reset Password.")
    add_document("hours", "Support hours are Monday to Friday, 9 AM to 5 PM EST.")

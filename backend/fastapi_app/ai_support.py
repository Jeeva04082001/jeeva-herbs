import json
import os
from pathlib import Path

from google import genai
from pydantic import BaseModel, Field

# Import the RAG search function
from fastapi_app.rag_service import search_knowledge

PROMPT_FILE = (
    Path(__file__).parent
    / "prompts"
    / "support_instructions.txt"
)

# Global caches
_CACHED_INSTRUCTIONS = None
_AI_CLIENT = None

def get_ai_client():
    global _AI_CLIENT
    if _AI_CLIENT is None:
        api_key = os.getenv("GEMINI_API_KEY", "").strip()
        if not api_key:
            raise ValueError("GEMINI_API_KEY is not configured")
        _AI_CLIENT = genai.Client(api_key=api_key)
    return _AI_CLIENT

def get_instructions() -> str:
    global _CACHED_INSTRUCTIONS
    if _CACHED_INSTRUCTIONS is None:
        _CACHED_INSTRUCTIONS = PROMPT_FILE.read_text(encoding="utf-8")
    return _CACHED_INSTRUCTIONS

class TicketAIResult(BaseModel):
    category: str = Field(description="product, delivery, payment, quality, order, other")
    priority: str = Field(description="low, medium, high, urgent")
    suggested_reply: str

def classify_ticket(subject: str, description: str):
    try:
        client = get_ai_client()
    except ValueError:
        return None

    prompt = f"""
Classify this customer support ticket for Jeeva Herbs.
Allowed categories: product, delivery, payment, quality, order, other.
Allowed priorities: low, medium, high, urgent.
Suggest a polite customer-support reply.
Subject: {subject}
Description: {description}
"""

    response = client.models.generate_content(
        model=os.getenv("GEMINI_MODEL", "gemini-2.5-flash"),
        contents=prompt,
        config={
            "response_mime_type": "application/json",
            "response_schema": TicketAIResult,
        },
    )
    return TicketAIResult.model_validate_json(response.text)


# --- NEW: Tool definition for the LLM ---
def search_company_knowledge(query: str) -> str:
    """
    Searches the Jeeva Herbs company knowledge base.
    Call this tool when the customer asks about business policies, delivery rules, returns, or FAQs.
    Do NOT call this tool for product prices, stock, or ingredients.
    """
    try:
        documents = search_knowledge(query, k=3)
        if not documents:
            return "No matching information found in the knowledge base."
            
        return "\n\n".join(
            f"Source: {doc.metadata.get('source', 'Knowledge base')}\n{doc.page_content}"
            for doc in documents
        )
    except Exception as e:
        return f"Error accessing knowledge base: {str(e)}"


# --- UPDATED: Uses Chat session and passes the tool ---
def generate_support_answer(
    question: str,
    product_context: str,
    conversation_history: str = "",
) -> str:
    client = get_ai_client()
    instructions = get_instructions()

    system_instruction = f"""
    You are the customer support assistant for Jeeva Herbs.

    INSTRUCTIONS:
    {instructions}

    Recent conversation history:
    {conversation_history}

    Current Product Database Data (Prices, Stock, Ingredients):
    {product_context}
    """

    chat = client.chats.create(
        model=os.getenv("GEMINI_MODEL", "gemini-2.5-flash"),
        config={
            "system_instruction": system_instruction,
            "tools": [search_company_knowledge],
        }
    )

    response = chat.send_message(question)

    return response.text or (
        "Sorry, I couldn't generate an answer. "
        "Please contact our support team."
    )
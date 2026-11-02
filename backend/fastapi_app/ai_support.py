
import json
import os

from google import genai
from pydantic import BaseModel, Field
from pathlib import Path

PROMPT_FILE = (
    Path(__file__).parent
    / "prompts"
    / "support_instructions.txt"
)



class TicketAIResult(BaseModel):
    category: str = Field(
        description="product, delivery, payment, quality, order, other"
    )
    priority: str = Field(
        description="low, medium, high, urgent"
    )
    suggested_reply: str


def classify_ticket(subject: str, description: str):
    api_key = os.getenv("GEMINI_API_KEY", "").strip()

    if not api_key:
        return None

    client = genai.Client(api_key=api_key)

    prompt = f"""
Classify this customer support ticket for Jeeva Herbs.

Allowed categories:
product, delivery, payment, quality, order, other.

Allowed priorities:
low, medium, high, urgent.

Suggest a polite customer-support reply.
Do not invent order status, refunds, delivery dates,
health benefits, or actions that have not been performed.

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

    result = TicketAIResult.model_validate_json(response.text)

    return result



def generate_support_answer(
    question: str,
    context: str,
    conversation_history: str = "",
) -> str:
    api_key = os.getenv("GEMINI_API_KEY", "").strip()

    if not api_key:
        raise ValueError("GEMINI_API_KEY is not configured")

    client = genai.Client(api_key=api_key)

    instructions = PROMPT_FILE.read_text(encoding="utf-8")

    prompt = f"""
    You are the customer support assistant for Jeeva Herbs.

    INSTRUCTIONS:
    {instructions}

    Recent conversation:
    {conversation_history}

    Provided context:
    {context}

    Current customer question:
    {question}

    Answer:
    """



    response = client.models.generate_content(
        model=os.getenv("GEMINI_MODEL", "gemini-2.5-flash"),
        contents=prompt,
    )

    return response.text or (
        "Sorry, I couldn't generate an answer. "
        "Please contact our support team."
    )







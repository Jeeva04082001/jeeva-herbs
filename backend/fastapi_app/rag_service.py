
from pathlib import Path
import os

from google import genai
from langchain_community.document_loaders import TextLoader
from langchain_community.vectorstores import FAISS
from langchain_core.embeddings import Embeddings
from langchain_text_splitters import RecursiveCharacterTextSplitter
from dotenv import load_dotenv

load_dotenv()

BASE_DIR = Path(__file__).resolve().parent.parent
KNOWLEDGE_DIR = BASE_DIR / "knowledge_base"
INDEX_DIR = BASE_DIR / "faiss_index"

EMBEDDING_MODEL = "gemini-embedding-001"


class GeminiEmbeddings(Embeddings):
    def __init__(self):
        api_key = os.getenv("GEMINI_API_KEY", "").strip()

        if not api_key:
            raise ValueError("GEMINI_API_KEY is not configured")

        self.client = genai.Client(api_key=api_key)

    def embed_documents(self, texts: list[str]) -> list[list[float]]:
        response = self.client.models.embed_content(
            model=EMBEDDING_MODEL,
            contents=texts,
            config={"task_type": "RETRIEVAL_DOCUMENT"},
        )

        return [item.values for item in response.embeddings]

    def embed_query(self, text: str) -> list[float]:
        response = self.client.models.embed_content(
            model=EMBEDDING_MODEL,
            contents=text,
            config={"task_type": "RETRIEVAL_QUERY"},
        )

        return response.embeddings[0].values


def build_knowledge_index():
    documents = []

    for file_path in KNOWLEDGE_DIR.glob("*.txt"):
        loader = TextLoader(str(file_path), encoding="utf-8")
        docs = loader.load()

        for doc in docs:
            doc.metadata["source"] = file_path.name

        documents.extend(docs)

    if not documents:
        raise ValueError(
            f"No .txt knowledge-base files found in {KNOWLEDGE_DIR}"
        )

    splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=150,
    )
    chunks = splitter.split_documents(documents)

    embeddings = GeminiEmbeddings()
    vector_store = FAISS.from_documents(chunks, embeddings)

    INDEX_DIR.mkdir(parents=True, exist_ok=True)
    vector_store.save_local(str(INDEX_DIR))

    return len(chunks)


def search_knowledge(question: str, k: int = 3):
    if not INDEX_DIR.exists():
        raise RuntimeError(
            "Knowledge index not found. Run build_rag_index.py first."
        )

    embeddings = GeminiEmbeddings()

    vector_store = FAISS.load_local(
        str(INDEX_DIR),
        embeddings,
        allow_dangerous_deserialization=True,
    )

    return vector_store.similarity_search(question, k=k)



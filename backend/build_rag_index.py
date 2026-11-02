
from fastapi_app.rag_service import (
    build_knowledge_index,
    search_knowledge,
)

if __name__ == "__main__":
    print("Building knowledge index...")

    chunk_count = build_knowledge_index()
    print(f"Index built successfully. Chunks: {chunk_count}")

    question = "What ingredients are used in Moringa and Curry Leaves Idly Podi?"
    results = search_knowledge(question)

    print("\nRetrieval test:")
    for i, doc in enumerate(results, start=1):
        print(f"\nResult {i}")
        print("Source:", doc.metadata.get("source"))
        print("Content:", doc.page_content)








import hashlib
import re


def chunk_text(text: str, document_id: str, version: str):
    paragraphs = re.split(r"\n\s*\n", text)
    chunks = []
    for paragraph in paragraphs:
        for offset in range(0, len(paragraph), 1600):
            passage = paragraph[offset : offset + 1600].strip()
            if passage:
                n = len(chunks) + 1
                chunks.append(
                    {
                        "chunk_id": f"{document_id}@{version}:{n}",
                        "text": passage,
                        "document_id": document_id,
                        "version": version,
                    }
                )
    return chunks


def fingerprint(data):
    return hashlib.sha256(data).hexdigest()

import os
import re
from typing import Dict, List, Any, Optional
import fitz  # PyMuPDF
from docx import Document as DocxDocument

class DocumentProcessor:
    @staticmethod
    def extract_from_pdf(file_path: str) -> Dict[str, Any]:
        """
        Extracts pages, text blocks, rect coordinates, and full text from PDF using PyMuPDF.
        """
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"File not found: {file_path}")

        doc = fitz.open(file_path)
        pages_data = []
        full_text_parts = []
        total_words = 0

        for page_num in range(len(doc)):
            page = doc[page_num]
            text = page.get_text("text")
            full_text_parts.append(text)
            words = len(text.split())
            total_words += words

            # Extract detailed text blocks with coordinates (bbox: x0, y0, x1, y1)
            blocks_raw = page.get_text("blocks")
            blocks = []
            for b in blocks_raw:
                if len(b) >= 5:
                    block_text = b[4].strip()
                    if block_text:
                        blocks.append({
                            "bbox": [round(b[0], 2), round(b[1], 2), round(b[2], 2), round(b[3], 2)],
                            "text": block_text,
                            "lines": block_text.split("\n")
                        })

            pages_data.append({
                "page_number": page_num + 1,
                "text": text,
                "blocks": blocks,
                "word_count": words,
                "width": round(page.rect.width, 2),
                "height": round(page.rect.height, 2)
            })

        full_text = "\n\n".join(full_text_parts)
        doc.close()

        return {
            "file_type": "pdf",
            "page_count": len(pages_data),
            "word_count": total_words,
            "char_count": len(full_text),
            "pages": pages_data,
            "full_text": full_text
        }

    @staticmethod
    def extract_from_docx(file_path: str) -> Dict[str, Any]:
        """
        Extracts paragraphs, headings, and text from DOCX file.
        """
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"File not found: {file_path}")

        doc = DocxDocument(file_path)
        paragraphs_data = []
        full_text_parts = []
        total_words = 0

        # Approximate pages based on ~350 words per standard academic manuscript page
        running_word_count = 0
        current_page = 1

        for idx, p in enumerate(doc.paragraphs):
            text = p.text.strip()
            if not text:
                continue

            words = len(text.split())
            running_word_count += words
            total_words += words
            page_estimate = max(1, (running_word_count // 350) + 1)

            is_heading = False
            heading_level = 0
            if p.style and p.style.name:
                style_name = p.style.name.lower()
                if "heading" in style_name:
                    is_heading = True
                    match = re.search(r'\d+', style_name)
                    heading_level = int(match.group(0)) if match else 1

            paragraphs_data.append({
                "paragraph_index": idx + 1,
                "text": text,
                "is_heading": is_heading,
                "heading_level": heading_level,
                "page_estimate": page_estimate,
                "word_count": words
            })
            full_text_parts.append(text)

        full_text = "\n\n".join(full_text_parts)
        total_pages = max(1, (total_words // 350) + 1)

        # Build simulated page blocks for DOCX
        pages_data = []
        for p_num in range(1, total_pages + 1):
            p_paras = [p for p in paragraphs_data if p["page_estimate"] == p_num]
            p_text = "\n\n".join([p["text"] for p in p_paras])
            pages_data.append({
                "page_number": p_num,
                "text": p_text,
                "blocks": [{"bbox": [50, 50, 550, 750], "text": p["text"]} for p in p_paras],
                "word_count": len(p_text.split()),
                "width": 612.0,
                "height": 792.0
            })

        return {
            "file_type": "docx",
            "page_count": total_pages,
            "word_count": total_words,
            "char_count": len(full_text),
            "paragraphs": paragraphs_data,
            "pages": pages_data,
            "full_text": full_text
        }

    @classmethod
    def process_document(cls, file_path: str) -> Dict[str, Any]:
        ext = os.path.splitext(file_path)[1].lower()
        if ext == ".pdf":
            return cls.extract_from_pdf(file_path)
        elif ext in [".docx", ".doc"]:
            return cls.extract_from_docx(file_path)
        else:
            raise ValueError(f"Unsupported file format '{ext}'. Only PDF and DOCX are supported.")

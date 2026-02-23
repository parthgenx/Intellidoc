import PyPDF2
import pdfplumber
from PIL import Image
import pytesseract
import os
from typing import List, Dict


class DocumentProcessor:
    def extract_text_from_pdf(self, pdf_path: str) -> str:
        text = self._extract_with_pypdf2(pdf_path)
        word_count = len(text.split())

        try:
            with open(pdf_path, 'rb') as file:
                pdf_reader = PyPDF2.PdfReader(file)
                num_pages = len(pdf_reader.pages)
        except Exception:
            num_pages = 1

        words_per_page = word_count / num_pages if num_pages > 0 else word_count

        if words_per_page < 50:
            text = self._extract_with_ocr(pdf_path)

        return text

    def _extract_with_pypdf2(self, pdf_path: str) -> str:
        try:
            text = ""
            with open(pdf_path, 'rb') as file:
                pdf_reader = PyPDF2.PdfReader(file)
                for page_num, page in enumerate(pdf_reader.pages):
                    page_text = page.extract_text()
                    text += f"\n--- Page {page_num + 1} ---\n"
                    text += page_text
            return text
        except Exception:
            return ""

    def _extract_with_ocr(self, pdf_path: str) -> str:
        try:
            text = ""
            with pdfplumber.open(pdf_path) as pdf:
                for page_num, page in enumerate(pdf.pages):
                    img = page.to_image(resolution=300)
                    page_text = pytesseract.image_to_string(img.original)
                    text += f"\n--- Page {page_num + 1} ---\n"
                    text += page_text
            return text
        except Exception:
            return ""

    def chunk_text(self, text: str, chunk_size: int = 1000, overlap: int = 200) -> List[Dict]:
        chunks = []
        start = 0
        chunk_id = 0

        while start < len(text):
            end = start + chunk_size
            chunk_content = text[start:end]
            chunks.append({
                "chunk_id": chunk_id,
                "text": chunk_content,
                "start_pos": start,
                "end_pos": end,
                "length": len(chunk_content)
            })
            start = end - overlap
            chunk_id += 1

        return chunks


document_processor = DocumentProcessor()
import PyPDF2
import pdfplumber
import pytesseract
from typing import List, Dict
from langchain_text_splitters import RecursiveCharacterTextSplitter


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
        splitter = RecursiveCharacterTextSplitter(
            chunk_size=chunk_size,
            chunk_overlap=overlap,
            separators=["\n\n", "\n", " ", ""],
        )

        chunks = []
        cursor = 0

        for chunk_id, chunk_content in enumerate(splitter.split_text(text)):
            search_start = max(0, cursor - overlap)
            start_pos = text.find(chunk_content, search_start)
            if start_pos == -1:
                start_pos = search_start

            end_pos = start_pos + len(chunk_content)
            cursor = end_pos

            chunks.append({
                "chunk_id": chunk_id,
                "text": chunk_content,
                "start_pos": start_pos,
                "end_pos": end_pos,
                "length": len(chunk_content)
            })

        return chunks


document_processor = DocumentProcessor()

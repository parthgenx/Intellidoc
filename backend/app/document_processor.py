import PyPDF2
import pdfplumber
from PIL import Image
import pytesseract
import os
from typing import List,Dict

pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'

class DocumentProcessor:
    """Process PDF documents - extract text, handle OCR"""

    def extract_text_from_pdf(self, pdf_path: str) -> str:

        print(f"📄 Processing PDF: {pdf_path}")
    
    # Try text extraction first
        text = self._extract_with_pypdf2(pdf_path)
    
    # Calculate words (better metric than characters)
        word_count = len(text.split())
    
    # If less than 50 words per page, probably scanned
    # Let's check page count
        try:
            with open(pdf_path, 'rb') as file:
                pdf_reader = PyPDF2.PdfReader(file)
                num_pages = len(pdf_reader.pages)
        except:
            num_pages = 1
    
        words_per_page = word_count / num_pages if num_pages > 0 else word_count
    
        print(f"📊 Extracted: {len(text)} chars, {word_count} words, {num_pages} pages")
        print(f"📊 Average: {words_per_page:.1f} words/page")
    
    # If less than 50 words per page, use OCR
        if words_per_page < 50:
            print(f"📸 Low word count detected, using OCR...")
            text = self._extract_with_ocr(pdf_path)
            print(f"✅ OCR completed! ({len(text)} characters)")
        else:
            print(f"✅ Text extracted successfully!")
    
        return text
    
    def _extract_with_pypdf2(self, pdf_path: str) -> str:

        try:
            text = ""
            with open(pdf_path, 'rb') as file:
                pdf_reader = PyPDF2.PdfReader(file)

                for page_num,page in enumerate(pdf_reader.pages):
                    page_text = page.extract_text()
                    text += f"\n--- Page {page_num + 1} ---\n"
                    text += page_text

            return text

        except Exception as e:
            print(f"PyPDF2 error: {e}")
            return ""

    def _extract_with_ocr(self, pdf_path: str) -> str:

        try:
            text = ""

            with pdfplumber.open(pdf_path) as pdf:
                for page_num,page in enumerate(pdf.pages):

                    img = page.to_image(resolution=300)

                    page_text = pytesseract.image_to_string(img.original)

                    text += f"\n--- Page {page_num + 1} ---\n"
                    text += page_text
                    
                    print(f"✅ OCR completed for page {page_num + 1}")
            
            return text
        except Exception as e:
            print(f"OCR error: {e}")
            return ""
        
    def chunk_text(self, text: str, chunk_size: int = 1000, overlap: int = 200) -> List[Dict]:

        chunks = []
        start = 0
        chunk_id = 0

        while start < len(text):

            end = start+chunk_size
            chunk_text = text[start:end]

            chunks.append({
                "chunk_id": chunk_id,
                "text": chunk_text,
                "start_pos": start,
                "end_pos": end,
                "length": len(chunk_text)
            })

            start = end - overlap
            chunk_id += 1

        print(f"📦 Created {len(chunks)} chunks")
        return chunks

document_processor = DocumentProcessor()
            
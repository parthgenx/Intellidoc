FROM python:3.12-slim

WORKDIR /app

# pytesseract calls the Tesseract executable; poppler-utils helps PDF tooling.
RUN apt-get update \
    && apt-get install --no-install-recommends -y tesseract-ocr poppler-utils \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY app ./app

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]

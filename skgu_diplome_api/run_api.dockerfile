FROM python:3.11.4

ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

WORKDIR /back
COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD python -m src.api.main

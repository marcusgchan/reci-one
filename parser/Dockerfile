FROM python:3.11.2-buster

WORKDIR /parser

COPY requirements.txt .

RUN pip install -r requirements.txt

COPY . .

CMD ["flask", "--app", "./", "run", "--host", "0.0.0.0", "--port", "8000"] 

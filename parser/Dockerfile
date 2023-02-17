FROM python:3.11.2-buster

WORKDIR /app

COPY requirements.txt ./

RUN pip install -r requirements.txt

COPY . .

ENV FLASK_APP=recipe-parser
ENV FLASK_ENV=development

CMD [ "flask", "--app", "./", "run","--host","0.0.0.0","--port","8000", "--debug"]


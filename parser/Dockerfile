FROM python:3.11.2-buster

WORKDIR /parser

COPY requirements.txt .

ENV VIRTUAL_ENV=/opt/venv
RUN python -m venv $VIRTUAL_ENV
ENV PATH="$VIRTUAL_ENV/bin:$PATH"

RUN pip install -r requirements.txt

COPY . .

CMD ["flask", "--app", "api.index", "run", "--host", "0.0.0.0", "--port", "8000"]

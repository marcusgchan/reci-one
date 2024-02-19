FROM python:3.11.2-buster

ENV PYTHONFAULTHANDLER=1 \
  PYTHONUNBUFFERED=1 \
  PYTHONHASHSEED=random \
  PIP_NO_CACHE_DIR=off \
  PIP_DISABLE_PIP_VERSION_CHECK=on \
  PIP_DEFAULT_TIMEOUT=100 \
  # Poetry's configuration:
  POETRY_NO_INTERACTION=1 \
  POETRY_VIRTUALENVS_CREATE=false \
  POETRY_CACHE_DIR='/var/cache/pypoetry' \
  POETRY_HOME='/usr/local' \
  POETRY_VERSION=1.7.1
  # ^^^
  # Make sure to update it!

# System deps:
RUN curl -sSL https://install.python-poetry.org | python3 -

WORKDIR /parser

COPY pyproject.toml .

COPY poetry.lock .

# Project initialization:
RUN poetry install --no-interaction --no-ansi

# COPY . .

CMD ["flask", "--app", "api.index", "run", "--host", "0.0.0.0", "--port", "8000"]

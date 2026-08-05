FROM ghcr.io/astral-sh/uv:python3.14-bookworm-slim AS base

ENV UV_COMPILE_BYTECODE=1 \
    UV_LINK_MODE=copy \
    PATH="/app/.venv/bin:$PATH"

WORKDIR /app
COPY backend/pyproject.toml backend/uv.lock ./


# Test image: dev dependencies included. Build with --target test.
FROM base AS test
RUN uv sync --locked
COPY backend/ ./
CMD ["pytest"]


FROM base AS runtime
RUN uv sync --locked --no-dev
COPY backend/ ./

RUN useradd --create-home app \
    && mkdir -p /data \
    && chown -R app:app /app /data
USER app

ENV KANBAN_DB=/data/kanban.db
EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]

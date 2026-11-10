"""AMIX - AI Intelligence Layer entrypoint."""

from contextlib import asynccontextmanager
from typing import AsyncIterator

from fastapi import FastAPI

from amix.api import gateway
from amix.engine import memory, workflow
from amix.serving.vllm_client import VLLMClient


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    # Initialize intelligence layer components on startup.
    app.state.memory = memory.MemoryStore()
    app.state.workflow = workflow.WorkflowEngine()
    app.state.vllm = VLLMClient()
    gateway.configure_client(app.state.vllm)
    yield


app = FastAPI(
    title="AMIX",
    description="India-first AI intelligence platform - from contextual AI to Super Intelligence.",
    version="0.1.0",
)


app.include_router(gateway.router)


@app.get("/health")
async def health() -> dict:
    return {
        "status": "ok",
        "intelligence": "AMIX",
        "product": "SHUTTER",
    }


def main() -> None:
    import uvicorn

    uvicorn.run("amix.app:app", host="0.0.0.0", port=8000, reload=True)

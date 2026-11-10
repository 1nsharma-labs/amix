# AMIX

**AMIX** is an India-first AI intelligence company architecture with a long-term mission to reach **Super Intelligence (SI)**.

- **AMIX** — parent intelligence brand: research, models, infrastructure, intelligence
- **SHUTTER** — product brand: where people use AMIX intelligence (Web, Android, Chrome, Enterprise API, MCP)

## Vision

The next era of AI should not be a thin wrapper over Western models. It should be sovereign, contextual intelligence — built in India, expanded globally, and progressing from useful AI to Super Intelligence.

## The Three Principles

1. **India First** — Indian languages, culture, business logic; evaluated via **AMIX-Indic-Bench**
2. **Own Intelligence** — own datasets, models, training, memory, infrastructure
3. **AI → SI** — build useful, safe AI first; grow into collaborative Super Intelligence

## Architecture

Two decoupled layers:

### AMIX Intelligence Layer (Core Engine)
- Unified API Gateway (smart routing, caching, cost tracking)
- Autonomous Workflow Engine (task decomposition, 12-agent fleet, self-correction)
- Memory Subsystem (short-term, long-term, episodic)
- Model Fleet (AMIX-Lite, AMIX-India, AMIX-Code, AMIX-Pro, AMIX-Reason, AMIX-SI)

### SHUTTER Product Layer (Edge)
- Web, Android, Chrome Extension, Unified API, MCP Server

## Roadmap

- Phase 1 (0–3 months): India-first AI platform
- Phase 2 (3–12 months): AMIX models + Indian RAG
- Phase 3 (1–3 years): Train own models
- Phase 4 (3–5+ years): Advanced reasoning research
- Phase 5 (5+ years): Super Intelligence research

## Quickstart

```bash
git clone <repo-url> AMIX
cd AMIX
pip install -e .
uvicorn amix.app:app --reload
```

## 0-Cost Open-Source GPU Serving

Run AMIX open-source models on free GPU platforms (Google Colab / Kaggle) via vLLM:

```bash
bash scripts/serve_amix.sh
```

- **AMIX-Lite** → `Qwen/Qwen3-0.6B-Instruct` (fast, lightweight, edge-capable)
- **AMIX-Reason** → `Qwen/Qwen3-8B-Instruct` (frontier reasoning, fits free T4 GPU)

Configure via `AMIX/.env` (`VLLM_BASE_URL`, model names).

## License

MIT

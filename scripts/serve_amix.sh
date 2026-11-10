#!/usr/bin/env bash
# Serve AMIX open-source models via vLLM on a free GPU (Google Colab / Kaggle).
# Usage in Colab/Kaggle cell:
#   !wget -q https://github.com/vllm-project/vllm/releases/download/v0.9.0/vllm-0.9.0-cp38-cp38-manylinux_2_28_x86_64.whl
#   !pip install vllm
#   !python -m vllm.entrypoints.openai.api_server --model Qwen/Qwen3-8B-Instruct --port 8000

set -e

MODEL="${AMIX_REASON_MODEL:-Qwen/Qwen3-8B-Instruct}"
PORT="${VLLM_PORT:-8000}"

python -m vllm.entrypoints.openai.api_server \
  --model "$MODEL" \
  --tensor-parallel-size 1 \
  --gpu-memory-utilization 0.9 \
  --port "$PORT"

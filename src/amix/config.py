"""AMIX configuration - open-source model fleet, routing, cache, pricing."""

# --- Open-source model fleet (runnable on free GPU via vLLM, OpenAI-compatible) ---
AMIX_LITE_MODEL = "Qwen/Qwen3-0.6B-Instruct"
AMIX_REASON_MODEL = "Qwen/Qwen3-14B-Instruct"

# --- Routing ---
ROUTING_COMPLEXITY_THRESHOLD = 0.6

# --- Cache ---
CACHE_TTL_SECONDS = 3600

# --- Pricing (USD per 1M tokens, input / output) ---
MODEL_PRICING = {
    AMIX_LITE_MODEL: {"input": 0.06, "output": 0.06},
    AMIX_REASON_MODEL: {"input": 0.35, "output": 2.0},
}

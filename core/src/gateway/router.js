/**
 * AMIX Unified API Gateway & Intelligent Multi-Model Router
 * 
 * Part of AMIX Intelligence Layer
 * Routes prompts across the AMIX Model Fleet with automatic latency,
 * complexity estimation, Indic language detection, and cost optimization.
 */

export const MODEL_FLEET = {
  'amix-lite': {
    id: 'amix-lite',
    name: 'AMIX-Lite (0.5B Edge)',
    target: 'Qwen/Qwen2.5-0.5B-Instruct',
    costPer1kTokens: 0.0001,
    latencyMs: 35,
    maxTokens: 4096,
    tier: 'edge'
  },
  'amix-india': {
    id: 'amix-india',
    name: 'AMIX-India (Indic & Hinglish Sovereign)',
    target: 'amix/indic-sovereign-7b',
    costPer1kTokens: 0.0003,
    latencyMs: 75,
    maxTokens: 8192,
    tier: 'vernacular'
  },
  'amix-code': {
    id: 'amix-code',
    name: 'AMIX-Code (Polyglot Synthesizer)',
    target: 'Qwen/Qwen2.5-Coder-7B-Instruct',
    costPer1kTokens: 0.0004,
    latencyMs: 85,
    maxTokens: 16384,
    tier: 'coder'
  },
  'amix-pro': {
    id: 'amix-pro',
    name: 'AMIX-Pro (Enterprise Multimodal)',
    target: 'meta-llama/Llama-3.3-70B-Instruct',
    costPer1kTokens: 0.0015,
    latencyMs: 140,
    maxTokens: 32768,
    tier: 'enterprise'
  },
  'amix-reason': {
    id: 'amix-reason',
    name: 'AMIX-Reason (Chain-of-Thought Verifier)',
    target: 'deepseek-ai/DeepSeek-R1-Distill-Qwen-8B',
    costPer1kTokens: 0.0012,
    latencyMs: 160,
    maxTokens: 16384,
    tier: 'reasoning'
  },
  'amix-si': {
    id: 'amix-si',
    name: 'AMIX-SI (Super Intelligence Consensus)',
    target: 'amix-super-intelligence-ensemble-v1',
    costPer1kTokens: 0.0030,
    latencyMs: 240,
    maxTokens: 65536,
    tier: 'sovereign-si'
  }
};

export class GatewayRouter {
  constructor(options = {}) {
    this.cache = new Map();
    this.cacheTTL = options.cacheTTL || 300000; // 5 mins
    this.requestLog = [];
    this.customEndpoints = options.endpoints || {};
  }

  /**
   * Detect Indic script or code-mixed Hinglish
   */
  detectIndicContext(text) {
    if (!text) return { isIndic: false, script: 'latin', confidence: 0 };

    // Devanagari, Bengali, Tamil, Telugu, Gujarati, Gurmukhi, Kannada, Malayalam, Oriya Unicode ranges
    const indicRegex = /[\u0900-\u097F\u0980-\u09FF\u0A80-\u0AFF\u0B00-\u0B7F\u0B80-\u0BFF\u0C00-\u0C7F\u0C80-\u0CFF\u0D00-\u0D7F]/;
    const hasIndicScript = indicRegex.test(text);

    // Common Hinglish / Romanized Indic vocabulary tokens
    const hinglishMarkers = [
      'kya', 'hai', 'kaise', 'bhai', 'mujhe', 'karna', 'hoga', 'mera', 'meri',
      'paise', 'bhejo', 'kirana', 'dukaan', 'khata', 'bahi', 'sahukar', 'theek',
      'accha', 'shukriya', 'namaste', 'dhanyawad', 'upay', 'samaadhan', 'jugad',
      'vyapaar', 'mandir', 'bazaar', 'dost', 'zaroorat', 'kaam', 'suno'
    ];

    const lower = text.toLowerCase();
    const words = lower.split(/[^a-zA-Z0-9\u0900-\u097F]/).filter(Boolean);
    let matchedHinglishCount = 0;

    for (const w of words) {
      if (hinglishMarkers.includes(w)) {
        matchedHinglishCount++;
      }
    }

    const hinglishRatio = words.length > 0 ? (matchedHinglishCount / words.length) : 0;
    const isHinglish = matchedHinglishCount >= 1 && (hinglishRatio > 0.08 || matchedHinglishCount >= 2);

    return {
      isIndic: hasIndicScript || isHinglish,
      isNativeScript: hasIndicScript,
      isHinglish,
      matchedTokens: matchedHinglishCount,
      confidence: hasIndicScript ? 0.99 : (isHinglish ? Math.min(0.95, 0.4 + matchedHinglishCount * 0.15) : 0.05)
    };
  }

  /**
   * Estimate query complexity score (0.0 - 1.0)
   */
  estimateComplexity(query) {
    if (!query) return 0;
    const words = query.trim().split(/\s+/);
    let score = Math.min(0.4, (words.length / 50) * 0.4);

    const reasoningKeywords = [
      'derive', 'prove', 'optimize', 'benchmark', 'architect', 'analyze',
      'refactor', 'simulate', 'distributed', 'consensus', 'cryptographic',
      'sub-millisecond', 'deadlock', 'concurrency', 'super intelligence',
      'quantum', 'hypothesis', 'theorem', 'causality'
    ];

    const codingKeywords = [
      'function', 'class', 'import', 'async', 'dockerfile', 'kubernetes',
      'api', 'graphql', 'sql', 'regex', 'endpoint', 'component', 'rust',
      'golang', 'typescript', 'python', 'adb', 'bash', 'powershell'
    ];

    const lower = query.toLowerCase();
    for (const kw of reasoningKeywords) {
      if (lower.includes(kw)) score += 0.12;
    }
    for (const kw of codingKeywords) {
      if (lower.includes(kw)) score += 0.08;
    }

    return Math.min(1.0, Number(score.toFixed(3)));
  }

  /**
   * Route query to optimal AMIX model
   */
  route(query, options = {}) {
    const startTime = Date.now();
    const cacheKey = `amix_route_${query.trim().toLowerCase()}`;

    if (!options.bypassCache && this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheTTL) {
        return {
          ...cached.result,
          cached: true,
          routeLatencyMs: Date.now() - startTime
        };
      }
    }

    const complexity = this.estimateComplexity(query);
    const indicInfo = this.detectIndicContext(query);
    const lower = query.toLowerCase();

    let selectedModel = 'amix-lite';
    let routingReason = 'Simple objective, routed to low-latency edge model';

    // 1. Super Intelligence tier request
    if (complexity >= 0.85 || lower.includes('super intelligence') || lower.includes('consensus') || lower.includes('hypothesis')) {
      selectedModel = 'amix-si';
      routingReason = 'High cognitive complexity or SI consensus synthesis requested';
    }
    // 2. Complex Reasoning tier
    else if (complexity >= 0.65 || lower.includes('reason') || lower.includes('prove') || lower.includes('audit')) {
      selectedModel = 'amix-reason';
      routingReason = 'Deep chain-of-thought verification required';
    }
    // 3. Indic Vernacular / Hinglish
    else if (indicInfo.isIndic) {
      selectedModel = 'amix-india';
      routingReason = `Indic context detected (${indicInfo.isNativeScript ? 'Native Indic Script' : 'Code-mixed Hinglish'})`;
    }
    // 4. Code & Systems Engineering
    else if (complexity >= 0.35 || lower.includes('code') || lower.includes('function') || lower.includes('api') || lower.includes('bug')) {
      selectedModel = 'amix-code';
      routingReason = 'Coding & syntax generation workload';
    }
    // 5. Enterprise / Long context
    else if (complexity >= 0.25 || wordsCount(query) > 30) {
      selectedModel = 'amix-pro';
      routingReason = 'Multi-domain contextual inquiry';
    }

    // Explicit override if requested
    if (options.forceModel && MODEL_FLEET[options.forceModel]) {
      selectedModel = options.forceModel;
      routingReason = `User forced model override to ${selectedModel}`;
    }

    const modelMeta = MODEL_FLEET[selectedModel];
    const estimatedTokens = Math.max(16, Math.ceil(query.length / 3.8));
    const estimatedCostUsd = Number(((estimatedTokens / 1000) * modelMeta.costPer1kTokens).toFixed(6));

    const result = {
      modelId: modelMeta.id,
      modelName: modelMeta.name,
      targetEndpoint: modelMeta.target,
      tier: modelMeta.tier,
      complexity,
      indicContext: indicInfo,
      estimatedTokens,
      estimatedCostUsd,
      estimatedLatencyMs: modelMeta.latencyMs,
      routeLatencyMs: Date.now() - startTime,
      routingReason,
      cached: false,
      timestamp: new Date().toISOString()
    };

    this.cache.set(cacheKey, { result, timestamp: Date.now() });
    this.requestLog.push({ query: query.substring(0, 80), ...result });

    return result;
  }

  getMetrics() {
    return {
      totalRouted: this.requestLog.length,
      cachedHits: this.requestLog.filter(r => r.cached).length,
      models: Object.keys(MODEL_FLEET).map(key => ({
        id: key,
        name: MODEL_FLEET[key].name,
        requests: this.requestLog.filter(r => r.modelId === key).length
      }))
    };
  }
}

function wordsCount(str) {
  return str.trim().split(/\s+/).filter(Boolean).length;
}

export const defaultRouter = new GatewayRouter();

/**
 * Automated Test Suite for AMIX
 */

import assert from 'node:assert';
import { describe, it } from 'node:test';
import { GatewayRouter, MODEL_FLEET } from '../core/src/gateway/router.js';
import { TwelveFleetEngine, FLEET_MANIFEST } from '../core/src/agents/twelveFleet.js';
import { IndicBenchmarkRunner, INDIC_BENCH_DATASET } from '../core/src/bench/indicBench.js';
import { AmixMcpServer } from '../core/src/mcp/server.js';

describe('AMIX Gateway Router', () => {
  const router = new GatewayRouter();

  it('should detect Hinglish and route to amix-india', () => {
    const res = router.route('Bhai mera payment nahi hua upi se, kya karu?');
    assert.strictEqual(res.modelId, 'amix-india');
    assert.strictEqual(res.indicContext.isIndic, true);
    assert.strictEqual(res.indicContext.isHinglish, true);
  });

  it('should detect Devanagari script and route to amix-india', () => {
    const res = router.route('किराना दुकान के लिए बही खाता प्रबंधन');
    assert.strictEqual(res.modelId, 'amix-india');
    assert.strictEqual(res.indicContext.isNativeScript, true);
  });

  it('should route high complexity reasoning to amix-reason or amix-si', () => {
    const res = router.route('Derive cryptographic zero knowledge proof consensus under quantum adversarial conditions');
    assert.ok(['amix-reason', 'amix-si'].includes(res.modelId));
    assert.ok(res.complexity > 0.5);
  });

  it('should route simple queries to amix-lite', () => {
    const res = router.route('Hello world');
    assert.strictEqual(res.modelId, 'amix-lite');
  });

  it('should support caching on repeat queries', () => {
    const q = 'Fast caching test query';
    const first = router.route(q);
    const second = router.route(q);
    assert.strictEqual(second.cached, true);
  });
});

describe('AMIX 12-Agent Autonomous Fleet', () => {
  const fleet = new TwelveFleetEngine();

  it('manifest should contain exactly 12 specialized agents', () => {
    assert.strictEqual(FLEET_MANIFEST.length, 12);
  });

  it('should execute end-to-end trace with all 12 agents', async () => {
    const goal = 'Architect an offline-first mobile sync protocol for rural Kirana merchants';
    const res = await fleet.execute(goal);

    assert.strictEqual(res.status, 'completed');
    assert.strictEqual(res.agentCount, 12);
    assert.strictEqual(res.trace.length, 12);
    assert.strictEqual(res.finalOutput.tests, 6);
    assert.strictEqual(res.finalOutput.securityScore, 100);
    assert.ok(res.finalOutput.confidence > 0.95);
  });

  it('should recall previous task in memory', async () => {
    const goal = 'Rural kirana merchants inventory optimization';
    await fleet.execute(goal);
    
    // Check Synapse recall
    const res2 = await fleet.execute('Tell me more about rural kirana merchants inventory');
    const synapseStep = res2.trace.find(s => s.agent === 'AMIX-Synapse');
    assert.ok(synapseStep);
  });
});

describe('AMIX-Indic-Bench Runner', () => {
  const runner = new IndicBenchmarkRunner();

  it('should have complete dataset of Indic test cases', () => {
    assert.ok(INDIC_BENCH_DATASET.length >= 6);
  });

  it('should successfully run suite and achieve > 90% benchmark score', async () => {
    const suite = await runner.runSuite('amix-india');
    assert.strictEqual(suite.targetModel, 'amix-india');
    assert.strictEqual(suite.passedCount, suite.totalTestCases);
    assert.ok(suite.overallScore >= 90.0);
  });
});

describe('AMIX MCP Server', () => {
  const server = new AmixMcpServer();

  it('should register all expected tools', () => {
    const tools = server.getTools();
    assert.strictEqual(tools.length, 4);
    const names = tools.map(t => t.name);
    assert.ok(names.includes('amix_route'));
    assert.ok(names.includes('amix_fleet_execute'));
    assert.ok(names.includes('amix_indic_benchmark'));
    assert.ok(names.includes('amix_system_status'));
  });

  it('should handle amix_route tool call', async () => {
    const toolRes = await server.handleCallTool('amix_route', { prompt: 'Test MCP routing' });
    assert.ok(toolRes.content);
    const parsed = JSON.parse(toolRes.content[0].text);
    assert.strictEqual(parsed.modelId, 'amix-lite');
  });

  it('should handle amix_system_status tool call', async () => {
    const toolRes = await server.handleCallTool('amix_system_status', {});
    const parsed = JSON.parse(toolRes.content[0].text);
    assert.strictEqual(parsed.version, '1.0.0');
    assert.strictEqual(parsed.contact.email, 'amitsharma9976@gmail.com');
  });
});

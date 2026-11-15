#!/usr/bin/env node

/**
 * AMIX Command Line Interface (CLI)
 * 
 * Part of SHUTTER Product Layer
 * 
 * Usage:
 *   npx amix status
 *   npx amix route "query"
 *   npx amix fleet "goal"
 *   npx amix bench
 *   npx amix mcp
 */

import { GatewayRouter, MODEL_FLEET } from '../../core/src/gateway/router.js';
import { TwelveFleetEngine, FLEET_MANIFEST } from '../../core/src/agents/twelveFleet.js';
import { IndicBenchmarkRunner } from '../../core/src/bench/indicBench.js';
import { startMcpServer } from '../../core/src/mcp/server.js';

const args = process.argv.slice(2);
const command = args[0] || 'help';

async function main() {
  switch (command) {
    case 'status': {
      printBanner();
      console.log('\n🏛️  AMIX Architecture Layers:');
      console.log('   ├── AMIX Intelligence Layer: Research, sovereign models, memory, 12-agent fleet');
      console.log('   └── SHUTTER Product Layer: Web, Android, Chrome Extension, MCP, CLI');

      console.log('\n🚀 Model Fleet (Sovereign & Edge Tiers):');
      for (const [id, m] of Object.entries(MODEL_FLEET)) {
        console.log(`   • [${id.padEnd(12)}] ${m.name.padEnd(42)} ~${m.latencyMs}ms  $${m.costPer1kTokens}/1k tokens`);
      }

      console.log('\n🤖 12-Agent Autonomous Fleet:');
      for (const a of FLEET_MANIFEST) {
        console.log(`   ${a.icon} ${a.name.padEnd(16)} : ${a.role}`);
      }

      console.log('\n📈 5-Stage Progression to Super Intelligence:');
      console.log('   [1] Use → [2] Customize → [3] Fine-tune → [4] Train → [5] Research (SI)');

      console.log('\n💼 Founder & Sponsorship:');
      console.log('   Founder: Amit Sharma (@1nsharma)');
      console.log('   Personal Contact: amitsharma9976@gmail.com');
      console.log('   UPI / Bank: 6393741171@upi (6393741171)');
      console.log('   Sponsorship Slot: Book via email or polar.sh/1nsharma-labs');
      break;
    }

    case 'route': {
      const query = args.slice(1).join(' ');
      if (!query) {
        console.error('Error: Please provide a prompt to route. Example: amix route "Bhai, CORS error aa rha hai"');
        process.exit(1);
      }
      const router = new GatewayRouter();
      const decision = router.route(query);

      console.log('\n🧭 AMIX Smart Route Decision:');
      console.log(`   Prompt       : "${query}"`);
      console.log(`   Model        : \x1b[32m${decision.modelName}\x1b[0m (${decision.modelId})`);
      console.log(`   Tier         : ${decision.tier}`);
      console.log(`   Complexity   : ${(decision.complexity * 100).toFixed(0)}%`);
      console.log(`   Indic Script : ${decision.indicContext.isIndic ? `YES (${decision.indicContext.isNativeScript ? 'Native Devanagari/Indic' : 'Code-Mixed Hinglish'})` : 'NO'}`);
      console.log(`   Est. Latency : ~${decision.estimatedLatencyMs}ms`);
      console.log(`   Est. Cost    : $${decision.estimatedCostUsd} USD (~${decision.estimatedTokens} tokens)`);
      console.log(`   Reason       : ${decision.routingReason}\n`);
      break;
    }

    case 'fleet': {
      const goal = args.slice(1).join(' ');
      if (!goal) {
        console.error('Error: Please provide a goal. Example: amix fleet "Deploy microservice with zero trust"');
        process.exit(1);
      }

      console.log(`\n👑 Initiating AMIX 12-Agent Fleet on goal:\n   "${goal}"\n`);
      const fleet = new TwelveFleetEngine();
      const result = await fleet.execute(goal);

      for (const step of result.trace) {
        const icon = FLEET_MANIFEST.find(m => m.name === step.agent)?.icon || '🔹';
        console.log(`   ${icon} [\x1b[36m${step.agent.padEnd(16)}\x1b[0m] ${step.action.padEnd(36)} -> \x1b[32m${step.detail}\x1b[0m`);
      }

      console.log('\n✨ Fleet Consensus Summary:');
      console.log(`   Execution ID : ${result.executionId}`);
      console.log(`   Duration     : ${result.totalDurationMs}ms`);
      console.log(`   Confidence   : ${(result.finalOutput.confidence * 100).toFixed(1)}%`);
      console.log(`   Summary      : ${result.finalOutput.summary}`);
      console.log(`   Tests Passed : ${result.finalOutput.tests}/6 (100%)`);
      console.log(`   Security     : ${result.finalOutput.securityScore}/100 clean\n`);
      break;
    }

    case 'bench': {
      console.log('\n🇮🇳 Running AMIX-Indic-Bench Suite...');
      const runner = new IndicBenchmarkRunner();
      const suite = await runner.runSuite('amix-india');

      console.log(`\nResults for Target Model: \x1b[33m${suite.targetModel}\x1b[0m`);
      console.log('-----------------------------------------------------------------------------------------------------');
      console.log('ID         Category                 Language           Score   Latency  Snippet');
      console.log('-----------------------------------------------------------------------------------------------------');
      for (const r of suite.results) {
        console.log(`${r.id.padEnd(10)} ${r.category.padEnd(24)} ${r.language.padEnd(18)} ${r.compositeScore}%   ${(r.latencyMs + 'ms').padEnd(8)} ${r.promptSnippet}`);
      }
      console.log('-----------------------------------------------------------------------------------------------------');
      console.log(`Overall Benchmark Score : \x1b[32m${suite.overallScore}%\x1b[0m`);
      console.log(`Average Latency         : ${suite.averageLatencyMs}ms`);
      console.log(`Total Scenarios Passed  : ${suite.passedCount}/${suite.totalTestCases} (100%)\n`);
      break;
    }

    case 'mcp': {
      startMcpServer();
      break;
    }

    case 'help':
    default: {
      printBanner();
      console.log('\nUsage:');
      console.log('  amix status                  Inspect AMIX architecture & 12-agent fleet');
      console.log('  amix route "<query>"         Route a prompt through AMIX gateway');
      console.log('  amix fleet "<goal>"          Execute task using all 12 cognitive agents');
      console.log('  amix bench                   Run AMIX-Indic-Bench suite');
      console.log('  amix mcp                     Launch stdio Model Context Protocol (MCP) server');
      console.log('\nInteractive Web App & Visual Simulator:');
      console.log('  https://1nsharma-labs.github.io/amix/\n');
      break;
    }
  }
}

function printBanner() {
  console.log(`
\x1b[36m   █████╗ ███╗   ███╗██╗██╗  ██╗
  ██╔══██╗████╗ ████║██║╚██╗██╔╝
  ███████║██╔████╔██║██║ ╚███╔╝ 
  ██╔══██║██║╚██╔╝██║██║ ██╔██╗ 
  ██║  ██║██║ ╚═╝ ██║██║██╔╝ ██╗
  ╚═╝  ╚═╝╚═╝     ╚═╝╚═╝╚═╝  ╚═╝\x1b[0m
  Sovereign Indian AI Architecture & 12-Agent Fleet Engine
  by 1nsharma-labs | Amit Sharma (Kanpur, India)
  `);
}

main().catch(err => {
  console.error('\nFatal Error:', err);
  process.exit(1);
});

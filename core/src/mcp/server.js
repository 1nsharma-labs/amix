/**
 * AMIX Model Context Protocol (MCP) Server
 * 
 * Part of SHUTTER Product Layer (Edge Delivery)
 * Exposes AMIX Intelligence & 12-Agent Fleet to Cursor, Claude Desktop,
 * Antigravity, and other MCP-compliant environments via Stdio JSON-RPC.
 */

import readline from 'readline';
import { GatewayRouter, MODEL_FLEET } from '../gateway/router.js';
import { TwelveFleetEngine } from '../agents/twelveFleet.js';
import { IndicBenchmarkRunner } from '../bench/indicBench.js';

export class AmixMcpServer {
  constructor() {
    this.router = new GatewayRouter();
    this.fleet = new TwelveFleetEngine();
    this.bench = new IndicBenchmarkRunner();
  }

  getTools() {
    return [
      {
        name: 'amix_route',
        description: 'Intelligently route a prompt across AMIX model fleet with cost, complexity, and Indic detection.',
        inputSchema: {
          type: 'object',
          properties: {
            prompt: { type: 'string', description: 'The prompt or task description to route' },
            forceModel: { type: 'string', description: 'Optional model override (amix-lite, amix-india, amix-code, amix-pro, amix-reason, amix-si)' }
          },
          required: ['prompt']
        }
      },
      {
        name: 'amix_fleet_execute',
        description: 'Orchestrate all 12 autonomous AMIX cognitive agents to solve a complex objective with verified consensus.',
        inputSchema: {
          type: 'object',
          properties: {
            goal: { type: 'string', description: 'The end-to-end mission or engineering objective' }
          },
          required: ['goal']
        }
      },
      {
        name: 'amix_indic_benchmark',
        description: 'Execute the AMIX-Indic-Bench suite evaluating low-resource Indic languages and code-mixed Hinglish.',
        inputSchema: {
          type: 'object',
          properties: {
            targetModel: { type: 'string', description: 'Model to evaluate (defaults to amix-india)' }
          }
        }
      },
      {
        name: 'amix_system_status',
        description: 'Inspect AMIX Intelligence Layer & SHUTTER Product Layer architecture health and fleet metadata.',
        inputSchema: {
          type: 'object',
          properties: {}
        }
      }
    ];
  }

  async handleCallTool(name, args) {
    switch (name) {
      case 'amix_route': {
        const result = this.router.route(args.prompt, { forceModel: args.forceModel });
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      }
      case 'amix_fleet_execute': {
        const result = await this.fleet.execute(args.goal);
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      }
      case 'amix_indic_benchmark': {
        const result = await this.bench.runSuite(args.targetModel || 'amix-india');
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      }
      case 'amix_system_status': {
        const status = {
          architecture: 'AMIX Sovereign AI Architecture',
          version: '1.0.0',
          parentBrand: 'AMIX (Intelligence Layer)',
          productBrand: 'SHUTTER (Consumer/Edge Layer)',
          models: MODEL_FLEET,
          agents: 12,
          roadmap: '5-Stage Progression: Use -> Customize -> Fine-tune -> Train -> Research (Super Intelligence)',
          contact: {
            founder: 'Amit Sharma (@1nsharma)',
            email: 'amitsharma9976@gmail.com',
            upi: '6393741171@upi'
          }
        };
        return { content: [{ type: 'text', text: JSON.stringify(status, null, 2) }] };
      }
      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  }

  startStdio() {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      terminal: false
    });

    rl.on('line', async (line) => {
      if (!line.trim()) return;
      try {
        const req = JSON.parse(line);
        const res = await this.handleRpc(req);
        if (res) {
          process.stdout.write(JSON.stringify(res) + '\n');
        }
      } catch (err) {
        process.stdout.write(JSON.stringify({
          jsonrpc: '2.0',
          id: null,
          error: { code: -32603, message: err.message }
        }) + '\n');
      }
    });
  }

  async handleRpc(req) {
    const { id, method, params } = req;
    if (method === 'initialize') {
      return {
        jsonrpc: '2.0',
        id,
        result: {
          protocolVersion: '2024-11-05',
          serverInfo: { name: 'amix-mcp-server', version: '1.0.0' },
          capabilities: { tools: {} }
        }
      };
    }
    if (method === 'tools/list') {
      return {
        jsonrpc: '2.0',
        id,
        result: { tools: this.getTools() }
      };
    }
    if (method === 'tools/call') {
      try {
        const toolResult = await this.handleCallTool(params.name, params.arguments || {});
        return { jsonrpc: '2.0', id, result: toolResult };
      } catch (err) {
        return { jsonrpc: '2.0', id, error: { code: -32000, message: err.message } };
      }
    }
    return null;
  }
}

export function startMcpServer() {
  const server = new AmixMcpServer();
  server.startStdio();
}

if (process.argv[1] && process.argv[1].endsWith('server.js')) {
  startMcpServer();
}

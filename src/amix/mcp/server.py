"""AMIX MCP server - expose AMIX intelligence tools to agent clients."""

import httpx
from mcp.server.fastmcp import FastMCP

mcp = FastMCP("AMIX")


@mcp.tool()
async def query_intelligence(prompt: str) -> str:
    """Query the AMIX intelligence engine via the Unified API Gateway."""
    async with httpx.AsyncClient() as client:
        resp = await client.post(
            "http://localhost:8000/v1/intelligence/query",
            json={"prompt": prompt},
        )
        resp.raise_for_status()
        data = resp.json()
        return f"model={data.get('model')} complexity={data.get('complexity')}\n{data.get('content')}"


if __name__ == "__main__":
    mcp.run()

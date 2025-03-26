#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';
import axios from 'axios';

const API_KEY = process.env.SHODAN_API_KEY; // provided by MCP config
if (!API_KEY) {
  throw new Error('SHODAN_API_KEY environment variable is required');
}

const shodanApi = axios.create({
  baseURL: 'https://api.shodan.io',
  timeout: 5000,
  params: { key: API_KEY },
});

class ShodanServer {
  private server: Server;

  constructor() {
    this.server = new Server({
        name: 'shodan-mcp-server',
        version: '0.1.0',
        capabilities: {
          resources: {},
          tools: {},
        },
      }
    );

    this.setupToolHandlers();

    this.server.onerror = (error) => console.error('[MCP Error]', error);
    process.on('SIGINT', async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  private setupToolHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: 'get_ip_info',
          description: 'Get information about a specific IP address',
          inputSchema: {
            type: 'object',
            properties: {
              ip: { type: 'string', description: 'The IP address to query' },
            },
            required: ['ip'],
          },
        },
        {
          name: 'dns_lookup',
          description: 'Perform DNS lookups for a given domain',
          inputSchema: {
            type: 'object',
            properties: {
              hostname: { type: 'string', description: 'The hostname to resolve' },
            },
            required: ['hostname'],
          },
        },
        {
          name: 'get_vulnerabilities',
          description: 'Track vulnerabilities associated with a specific IP address',
          inputSchema: {
            type: 'object',
            properties: {
              ip: { type: 'string', description: 'The IP address to query for vulnerabilities' },
            },
            required: ['ip'],
          },
        },
        {
          name: 'cve_info',
          description: 'Retrieve information about a specific CVE ID',
          inputSchema: {
            type: 'object',
            properties: {
              cve: { type: 'string', description: 'The CVE ID to query' },
            },
            required: ['cve'],
          },
        },
        {
          name: 'search',
          description: 'Search Shodan for devices matching a query',
          inputSchema: {
            type: 'object',
            properties: {
              query: { type: 'string', description: 'The search query' },
            },
            required: ['query'],
          },
        },
        {
          name: 'cvedb_info',
          description: 'Retrieve information about a specific CVE ID from cvedb.shodan.io',
          inputSchema: {
            type: 'object',
            properties: {
              cve: { type: 'string', description: 'The CVE ID to query' },
            },
            required: ['cve'],
          },
        },
      ],
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      try {
        switch (request.params.name) {
          case 'get_ip_info':
            return this.getIpInfo(String(request.params.arguments?.ip));
          case 'dns_lookup':
            return this.dnsLookup(String(request.params.arguments?.hostname));
          case 'get_vulnerabilities':
            return this.getVulnerabilities(String(request.params.arguments?.ip));
          case 'cve_info':
            return this.getCveInfo(String(request.params.arguments?.cve));
          case 'cvedb_info':
            return this.getCvedbInfo(String(request.params.arguments?.cve));
          case 'search':
            return this.search(String(request.params.arguments?.query));
          default:
            throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${request.params.name}`);
        }
      } catch (error) {
        console.error(`Tool execution failed: ${error}`);
        return {
          content: [{ type: 'text', text: `Tool execution failed: ${error}` }],
          isError: true,
        };
      }
    });
  }

  private async getIpInfo(ip: string) {
    try {
      const response = await shodanApi.get(`/shodan/host/${ip}`);
      return { content: [{ type: 'text', text: JSON.stringify(response.data, null, 2) }] };
    } catch (error: any) {
      throw new Error(`Shodan API error: ${error.message}`);
    }
  }

  private async dnsLookup(hostname: string) {
    try {
      const response = await shodanApi.get(`/dns/resolve`, { params: { hostnames: hostname } });
      return { content: [{ type: 'text', text: JSON.stringify(response.data, null, 2) }] };
    } catch (error: any) {
      throw new Error(`Shodan API error: ${error.message}`);
    }
  }

  private async getVulnerabilities(ip: string) {
    try {
      const response = await shodanApi.get(`/shodan/host/${ip}/vulns`);
      return { content: [{ type: 'text', text: JSON.stringify(response.data, null, 2) }] };
    } catch (error: any) {
      throw new Error(`Shodan API error: ${error.message}`);
    }
  }

  private async getCveInfo(cve: string) {
    try {
      const response = await shodanApi.get(`/vulnerability/${cve}`);
      return { content: [{ type: 'text', text: JSON.stringify(response.data, null, 2) }] };
    } catch (error: any) {
      throw new Error(`Shodan API error: ${error.message}`);
    }
  }

  private async search(query: string) {
    try {
      const response = await shodanApi.get(`/shodan/host/search`, { params: { query } });
      return { content: [{ type: 'text', text: JSON.stringify(response.data, null, 2) }] };
    } catch (error: any) {
      throw new Error(`Shodan API error: ${error.message}`);
    }
  }

  private async getCvedbInfo(cve: string) {
    try {
      const response = await axios.get(`https://cvedb.shodan.io/api/search?query=${cve}`);
      return { content: [{ type: 'text', text: JSON.stringify(response.data, null, 2) }] };
    } catch (error: any) {
      throw new Error(`Cvedb API error: ${error.message}`);
    }
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Shodan MCP server running on stdio');
  }
}

const server = new ShodanServer();

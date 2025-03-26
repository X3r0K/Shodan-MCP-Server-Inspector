import { Client } from './node_modules/@modelcontextprotocol/sdk/dist/client/index.js';
import { StdioClientTransport } from './node_modules/@modelcontextprotocol/sdk/dist/client/stdio.js';
import * as dotenv from 'dotenv';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

async function checkServer() {
  let client;
  let transport;

  try {
    client = new Client({
      name: "ShodanStatusChecker",
      version: "1.0.0"
    }, {
      capabilities: {
        tools: true
      }
    });

    transport = new StdioClientTransport({
      command: process.execPath,
      args: ['build/index.js'],
      env: {
        ...process.env,
        NODE_NO_WARNINGS: '1'
      }
    });

    console.log('Attempting to connect to Shodan MCP server...');
    await client.connect(transport);
    console.log('✅ Server is online and responding');
    
    // List available tools to verify functionality
    const tools = await client.listTools();
    console.log('\nAvailable tools:');
    tools.tools.forEach(tool => {
      console.log(`- ${tool.name}: ${tool.description}`);
    });
    
  } catch (error) {
    console.error('❌ Server connection failed:', error.message);
    if (error.stack) {
      console.error('\nStack trace:', error.stack);
    }
    process.exit(1);
  } finally {
    if (client) {
      try {
        await client.close();
      } catch (closeError) {
        console.error('Error closing client:', closeError);
      }
    }
  }
}

checkServer().catch(console.error); 
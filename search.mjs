import { Client } from './node_modules/@modelcontextprotocol/sdk/dist/client/index.js';
import { StdioClientTransport } from './node_modules/@modelcontextprotocol/sdk/dist/client/stdio.js';
import * as dotenv from 'dotenv';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

async function searchShodan() {
  let client;
  let transport;
  let childProcess;

  try {
    client = new Client({
      name: "ShodanSearchClient",
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

    console.log('Connecting to server...');
    await client.connect(transport);
    console.log('Connected to server');
    
    console.log('Sending search request...');
    const result = await client.callTool({
      name: "search",
      args: { query: "log4j country:US city:Atlanta" }
    });

    console.log('Search results:');
    console.log(JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('Error:', error.message);
    if (error.stack) {
      console.error('Stack trace:', error.stack);
    }
  } finally {
    // Clean up resources
    if (client) {
      try {
        console.log('Closing client connection...');
        await client.close();
        console.log('Client connection closed');
      } catch (closeError) {
        console.error('Error closing client:', closeError);
      }
    }
    // Force exit after cleanup
    setTimeout(() => process.exit(0), 100);
  }
}

searchShodan().catch(console.error); 
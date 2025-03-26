# Shodan MCP Server

A Model Context Protocol (MCP) server that provides access to Shodan's internet scanning capabilities through a standardized interface.

## Overview

This server implements the Model Context Protocol to expose Shodan's powerful internet scanning and reconnaissance capabilities. It provides a standardized interface for querying Shodan's database of internet-connected devices, services, and vulnerabilities.

## Features

- **Search Capabilities**: Query Shodan's database using advanced search filters
- **DNS Lookup**: Resolve domain names and get detailed DNS information
- **CVE Information**: Get detailed information about Common Vulnerabilities and Exposures
- **Get Vulnerabilities**: Get detailed infor Vulnerabilities related to an IP address
- **Standardized Interface**: Uses MCP protocol for consistent communication
- **Environment Variable Support**: Secure API key management through environment variables

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)
- Shodan API key

## Installation

1. Clone the repository:

    ```bash
    git clone https://github.com/yourusername/shodan-mcp-server.git
    cd shodan-mcp-server
    ```

2. Install dependencies:

    ```bash
    npm install
    ```

3. Create a `.env.local` file in the root directory and add your Shodan API key:

    ```bash
    SHODAN_API_KEY=your_api_key_here
    ```

## Usage

### Starting the Server

1. Build the server:

    ```bash
    npm run build
    ```

2. Start the server:

    ```bash
    node build/index.js
    ```

### Available Tools

1. **Search Tool**
   - Query: Search for devices and services using Shodan's search syntax
   - Example: `log4j country:US city:Atlanta`
   - Returns: List of matching devices with detailed information

2. **DNS Lookup Tool**
   - Query: Domain name to resolve
   - Example: `example.com`
   - Returns: DNS records and related information

3. **CVE Info Tool**
   - Query: CVE identifier
   - Example: `CVE-2021-44228`
   - Returns: Detailed vulnerability information

### Example Queries

```javascript
// Search for Log4j vulnerable systems in the US
{
  "query": "log4j country:US"
}

// DNS lookup for a domain
{
  "query": "example.com"
}

// Get CVE information
{
  "query": "CVE-2021-44228"
}
```

### Using the MCP Inspector

![image](https://github.com/user-attachments/assets/81c5a0d8-c105-4a47-97ee-2905aa5bb6bc)


You can use the MCP inspector to interact with the server directly:

1. Install the MCP inspector:
```bash
npm install -g @modelcontextprotocol/inspector
```

2. Run the inspector with your server:
```bash
npx @modelcontextprotocol/inspector build/index.js
```

The inspector provides an interactive interface to:
- Test all available tools
- View tool documentation
- Debug server responses
- Monitor server status

## Environment Variables

- `SHODAN_API_KEY`: Your Shodan API key (required)
- `PORT`: Server port (optional, defaults to 3000)
- `LOG_LEVEL`: Logging level (optional, defaults to 'info')

## Error Handling

The server implements comprehensive error handling for:
- Invalid API keys
- Rate limiting
- Network issues
- Invalid queries
- Server errors

## Security Considerations

1. API Key Protection:
   - Never commit API keys to version control
   - Use environment variables for sensitive data
   - Rotate API keys regularly

2. Rate Limiting:
   - Respect Shodan's API rate limits
   - Implement client-side rate limiting

3. Data Privacy:
   - Filter sensitive information from responses
   - Implement access controls as needed


## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Shodan for providing the API
- Model Context Protocol team for the MCP specification


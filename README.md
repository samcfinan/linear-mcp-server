# Linear MCP Server

A [Model Context Protocol](https://github.com/modelcontextprotocol) server for the [Linear API](https://developers.linear.app/docs/graphql/working-with-the-graphql-api).

Intended to be more feature rich than existing Linear MCP servers and intended for holistic project management via Claude.

This is based off of https://github.com/jerhadf/linear-mcp-server with more functionality.

Features:
* Initiatives
* Projects
* Issues
* Relationships
* Prioritization

## Installation

Add server config to Claude Desktop.

NOTE: Claude does not work well with nvm environments. Make sure to reference the version of Node with its absolute path.

```
{
  "mcpServers": {
    "linear": {
      "command": "/Users/USERNAME/.nvm/versions/node/v22.13.0/bin/node",
      "args": [
        "--experimental-strip-types",
        "/absolute/path/to/repo/index.ts"
      ],
      "env": {
        "LINEAR_API_KEY": "your_linear_api_key_here"
      }
    }
  }
}
```

## Available Tools

### Project Management
* `create-project` - Create a new Linear project
* `view-project` - View a Linear project by ID
* `update-project` - Update a Linear project

### Initiative Management
* `create-initiative` - Create a new Linear initiative
* `view-initiative` - View a Linear initiative by ID
* `update-initiative` - Update a Linear initiative

### Issue Management
* `create-issue` - Create a new Linear issue
* `view-issue` - View a Linear issue by ID
* `update-issue` - Update a Linear issue
* `search-issues` - Search Linear issues

### Issue Relations
* `create-issue-relation` - Create a relation between two issues (blocks, duplicates, etc.)
* `view-issue-relations` - View all relations for a given issue
* `delete-issue-relation` - Delete a relation between two issues


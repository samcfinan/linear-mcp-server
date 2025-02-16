# Linear MCP Server

[![smithery badge](https://smithery.ai/badge/@samcfinan/linear-mcp-server)](https://smithery.ai/server/@samcfinan/linear-mcp-server)

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

### Installing via Smithery

To install Linear MCP Server for Claude Desktop automatically via [Smithery](https://smithery.ai/server/@samcfinan/linear-mcp-server):

```bash
npx -y @smithery/cli install @samcfinan/linear-mcp-server --client claude
```

### Manual Installation
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



## Example

```
User:
Break the Implement Contact API Endpoints issue into multiple issues, one for each endpoint

Claude:
I'll break down the API endpoints issue into separate issues for each endpoint and create the appropriate relationships.


View result from create-issue from linear (local)


View result from create-issue from linear (local)


View result from create-issue from linear (local)


View result from create-issue from linear (local)


View result from create-issue from linear (local)

Now let's create the relationships between these new issues and the existing ones. First, they all depend on the TypeScript Models issue:


View result from create-issue-relation from linear (local)


View result from create-issue-relation from linear (local)


View result from create-issue-relation from linear (local)


View result from create-issue-relation from linear (local)


View result from create-issue-relation from linear (local)

I've created five separate issues for each endpoint and set up their relationships:

GET /contacts (List) - d1aae514
GET /contacts/:id (Single) - 01850d5d
POST /contacts (Create) - 2e0f2b75
PUT /contacts/:id (Update) - d22b143d
DELETE /contacts/:id (Delete) - dde30779
All of these endpoints depend on the TypeScript Models issue (2c38c6ee) being completed first.

The UI Components issue (dd214884) and Search/Filter issue (81a33a29) now should depend on the completion of these endpoint issues, particularly the GET endpoints.

Would you like me to:

Create those additional relationships with the UI Components?
Add any specific cross-dependencies between the endpoints themselves?
Break down any of these endpoint issues into more granular tasks?
```

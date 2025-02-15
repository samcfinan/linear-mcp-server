import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js"
import { LinearClient, LinearError } from "@linear/sdk"
import { z } from "zod"

// Initialize Linear client
const linearClient = new LinearClient({
  apiKey: process.env.LINEAR_API_KEY ?? "",
})

if (!process.env.LINEAR_API_KEY) {
  throw new Error("LINEAR_API_KEY is not set")
}

// Get default team ID (required for creating issues and projects)
let defaultTeamId: string

const initializeTeam = async () => {
  const teams = await linearClient.teams()
  const firstTeam = teams.nodes[0]
  if (!firstTeam) {
    throw new Error("No teams found in Linear workspace")
  }
  defaultTeamId = firstTeam.id
}

// Initialize team ID
initializeTeam().catch(console.error)

// Default prompt definition
const defaultPrompt = {
  name: "default",
  description: "Default prompt for Linear MCP Server",
  messages: [
    {
      role: "system",
      content: {
        type: "text",
        text: "You are a Linear assistant that helps manage issues and projects. For issue queries, use the search-issues tool directly with appropriate filters like 'assignee:@me' and 'priority:high'.",
      },
    },
  ],
}

// Create an MCP server
const server = new McpServer({
  name: "linear",
  version: "1.0.0",
  description: "Linear MCP Server for accessing Linear resources",
  capabilities: {
    prompts: {
      default: defaultPrompt,
    },
    resources: {
      templates: true,
      read: true,
    },
    tools: {
      "create-project": {
        description: "Create a new Linear project",
      },
      "view-project": {
        description: "View a Linear project by ID",
      },
      "update-project": {
        description: "Update a Linear project",
      },
      "create-initiative": {
        description: "Create a new Linear initiative",
      },
      "view-initiative": {
        description: "View a Linear initiative by ID",
      },
      "update-initiative": {
        description: "Update a Linear initiative",
      },
      "create-issue": {
        description: "Create a new Linear issue",
      },
      "view-issue": {
        description: "View a Linear issue by ID",
      },
      "update-issue": {
        description: "Update a Linear issue",
      },
      "search-issues": {
        description: "Search Linear issues",
      },
      "create-issue-relation": {
        description:
          "Create a relation between two issues (blocks, duplicates, etc.)",
      },
      "view-issue-relations": {
        description: "View all relations for a given issue",
      },
      "delete-issue-relation": {
        description: "Delete a relation between two issues",
      },
    },
  },
})

// Helper function to handle errors consistently
const handleError = (error: unknown, context: string) => {
  if (error instanceof LinearError) {
    return {
      content: [
        {
          type: "text" as const,
          text: `Linear API Error: ${error.message}`,
        },
      ],
      isError: true,
    }
  }
  return {
    content: [
      {
        type: "text" as const,
        text: `Error ${context}: ${error instanceof Error ? error.message : String(error)}`,
      },
    ],
    isError: true,
  }
}

// Project management tools
server.tool(
  "create-project",
  {
    name: z.string(),
    description: z.string().optional(),
    state: z
      .enum(["planned", "started", "paused", "completed", "canceled"])
      .optional(),
  },
  async ({ name, description, state }) => {
    try {
      const project = await linearClient.createProject({
        name,
        description,
        teamIds: [defaultTeamId],
        state: state as any,
      })
      const createdProject = await project.project
      if (!createdProject) {
        throw new Error("Failed to create project")
      }
      return {
        content: [
          {
            type: "text",
            text: `Project created successfully. ID: ${createdProject.id}`,
          },
        ],
      }
    } catch (error: unknown) {
      return handleError(error, "creating project")
    }
  },
)

server.tool("view-project", { id: z.string() }, async ({ id }) => {
  try {
    const project = await linearClient.project(id)
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(project, null, 2),
        },
      ],
    }
  } catch (error: unknown) {
    return handleError(error, "viewing project")
  }
})

server.tool(
  "update-project",
  {
    id: z.string(),
    name: z.string().optional(),
    description: z.string().optional(),
    content: z.string().optional(),
    priority: z.number().min(0).max(4).optional(),
    state: z
      .enum(["planned", "started", "paused", "completed", "canceled"])
      .optional(),
  },
  async ({ id, name, description, content, priority }) => {
    try {
      await linearClient.updateProject(id, {
        name,
        description,
        content,
        priority,
      })
      return {
        content: [
          {
            type: "text",
            text: "Project updated successfully",
          },
        ],
      }
    } catch (error: unknown) {
      return handleError(error, "updating project")
    }
  },
)

// Initiative management tools
server.tool(
  "create-initiative",
  {
    name: z.string(),
    description: z.string().optional(),
  },
  async ({ name, description }) => {
    try {
      const initiative = await linearClient.createInitiative({
        name,
        description,
      })
      const createdInitiative = await initiative.initiative
      if (!createdInitiative) {
        throw new Error("Failed to create initiative")
      }
      return {
        content: [
          {
            type: "text",
            text: `Initiative created successfully. ID: ${createdInitiative.id}`,
          },
        ],
      }
    } catch (error: unknown) {
      return handleError(error, "creating initiative")
    }
  },
)

server.tool("view-initiative", { id: z.string() }, async ({ id }) => {
  try {
    const initiative = await linearClient.initiative(id)
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(initiative, null, 2),
        },
      ],
    }
  } catch (error: unknown) {
    return handleError(error, "viewing initiative")
  }
})

server.tool(
  "update-initiative",
  {
    id: z.string(),
    name: z.string().optional(),
    description: z.string().optional(),
  },
  async ({ id, name, description }) => {
    try {
      const initiative = await linearClient.initiative(id)
      await initiative.update({ name, description })
      return {
        content: [
          {
            type: "text",
            text: "Initiative updated successfully",
          },
        ],
      }
    } catch (error: unknown) {
      return handleError(error, "updating initiative")
    }
  },
)

// Issue management tools
server.tool(
  "create-issue",
  {
    title: z.string(),
    description: z.string().optional(),
    priority: z.number().min(0).max(4).optional(),
    projectId: z.string().optional(),
  },
  async ({ title, description, priority, projectId }) => {
    try {
      const issue = await linearClient.createIssue({
        title,
        description,
        priority,
        projectId,
        teamId: defaultTeamId,
      })
      const createdIssue = await issue.issue
      if (!createdIssue) {
        throw new Error("Failed to create issue")
      }
      return {
        content: [
          {
            type: "text",
            text: `Issue created successfully. ID: ${createdIssue.id}`,
          },
        ],
      }
    } catch (error: unknown) {
      return handleError(error, "creating issue")
    }
  },
)

server.tool("view-issue", { id: z.string() }, async ({ id }) => {
  try {
    const issue = await linearClient.issue(id)
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(issue, null, 2),
        },
      ],
    }
  } catch (error: unknown) {
    return handleError(error, "viewing issue")
  }
})

server.tool(
  "update-issue",
  {
    id: z.string(),
    title: z.string().optional(),
    description: z.string().optional(),
    priority: z.number().min(0).max(4).optional(),
    projectId: z.string().optional(),
  },
  async ({ id, title, description, priority, projectId }) => {
    try {
      const issue = await linearClient.issue(id)
      await issue.update({ title, description, priority, projectId })
      return {
        content: [
          {
            type: "text",
            text: "Issue updated successfully",
          },
        ],
      }
    } catch (error: unknown) {
      return handleError(error, "updating issue")
    }
  },
)

server.tool("search-issues", { query: z.string() }, async ({ query }) => {
  try {
    const issues = await linearClient.issues({
      filter: {
        or: [
          { title: { contains: query } },
          { description: { contains: query } },
        ],
      },
    })
    const issuesList = issues.nodes
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(issuesList, null, 2),
        },
      ],
    }
  } catch (error: unknown) {
    return handleError(error, "searching issues")
  }
})

server.tool(
  "create-issue-relation",
  {
    issueId: z.string(),
    relatedIssueId: z.string(),
    type: z.enum(["blocks", "duplicate", "related"]),
  },
  async ({ issueId, relatedIssueId, type }) => {
    try {
      const relation = await linearClient.createIssueRelation({
        issueId,
        relatedIssueId,
        // Linear SDK uses an enum which is not exported
        // @ts-ignore-next-line
        type: type,
      })
      return {
        content: [
          {
            type: "text",
            text: "Issue relation created successfully",
          },
        ],
      }
    } catch (error: unknown) {
      return handleError(error, "creating issue relation")
    }
  },
)

server.tool(
  "view-issue-relations",
  { issueId: z.string() },
  async ({ issueId }) => {
    try {
      const issue = await linearClient.issue(issueId)
      const relations = await issue.relations()
      const inverseRelations = await issue.inverseRelations()

      const formattedRelations = await Promise.all([
        ...relations.nodes.map(async (relation) => {
          const relatedIssue = await relation.relatedIssue
          if (!relatedIssue) {
            return null
          }
          return {
            type: relation.type,
            relatedIssue: {
              id: relatedIssue.id,
              title: relatedIssue.title,
            },
          }
        }),
        ...inverseRelations.nodes.map(async (relation) => {
          const relatedIssue = await relation.issue
          if (!relatedIssue) {
            return null
          }
          return {
            type: `inverse_${relation.type}`,
            relatedIssue: {
              id: relatedIssue.id,
              title: relatedIssue.title,
            },
          }
        }),
      ])

      const validRelations = formattedRelations.filter(
        (r): r is NonNullable<typeof r> => r !== null,
      )

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(validRelations, null, 2),
          },
        ],
      }
    } catch (error: unknown) {
      return handleError(error, "viewing issue relations")
    }
  },
)

server.tool(
  "delete-issue-relation",
  {
    issueId: z.string(),
    relatedIssueId: z.string(),
  },
  async ({ issueId, relatedIssueId }) => {
    try {
      // First, find the relation ID by looking up both direct and inverse relations
      const issue = await linearClient.issue(issueId)
      const relations = await issue.relations()
      const inverseRelations = await issue.inverseRelations()

      let relationToDelete: { id: string } | undefined

      // Check direct relations
      for (const relation of relations.nodes) {
        const related = await relation.relatedIssue
        if (related && related.id === relatedIssueId) {
          relationToDelete = relation
          break
        }
      }

      // Check inverse relations if not found
      if (!relationToDelete) {
        for (const relation of inverseRelations.nodes) {
          const related = await relation.issue
          if (related && related.id === relatedIssueId) {
            relationToDelete = relation
            break
          }
        }
      }

      if (!relationToDelete) {
        throw new Error("Relation not found between the specified issues")
      }

      await linearClient.deleteIssueRelation(relationToDelete.id)

      return {
        content: [
          {
            type: "text",
            text: "Issue relation deleted successfully",
          },
        ],
      }
    } catch (error: unknown) {
      return handleError(error, "deleting issue relation")
    }
  },
)

// Start receiving messages on stdin and sending messages on stdout
const transport = new StdioServerTransport()
await server.connect(transport)

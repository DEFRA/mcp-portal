# Defra MCP Registry Portal

[![Security Rating](https://sonarcloud.io/api/project_badges/measure?project=DEFRA_mcp-portal&metric=security_rating)](https://sonarcloud.io/summary/new_code?id=DEFRA_mcp-portal)
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=DEFRA_mcp-portal&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=DEFRA_mcp-portal)
[![Coverage](https://sonarcloud.io/api/project_badges/measure?project=DEFRA_mcp-portal&metric=coverage)](https://sonarcloud.io/summary/new_code?id=DEFRA_mcp-portal)

Defra's curated registry of approved [Model Context Protocol (MCP)](https://modelcontextprotocol.io/) servers for use with GitHub Copilot and other AI coding assistants.

- [Overview](#overview)
- [Key Features](#key-features)
- [Requirements](#requirements)
- [Getting Started](#getting-started)
  - [Install dependencies](#install-dependencies)
  - [Environment variables](#environment-variables)
  - [Run in development mode](#run-in-development-mode)
  - [Run in production mode](#run-in-production-mode)
- [Adding MCP Servers](#adding-mcp-servers)
- [API Reference](#api-reference)
- [Docker](#docker)
  - [Development image](#development-image)
  - [Production image](#production-image)
  - [Docker Compose](#docker-compose)
- [Testing](#testing)
- [Dependency Management](#dependency-management)
- [Code Quality](#code-quality)
- [Licence](#licence)

## Overview

The MCP Registry Portal serves two purposes:

1. **Web UI** — A GOV.UK-styled interface where Defra teams can browse the list of approved MCP servers, view their descriptions, transport types, and versions.
2. **REST API** — An API compliant with the [MCP Registry v0.1 specification](https://static.modelcontextprotocol.io/schemas/2025-12-11/server.schema.json), making approved servers discoverable by compatible MCP clients or AI assistants within Defra.

Servers are reviewed and approved by the AI Capabilities and Enablement (AICE) team before being listed. Only servers listed here are sanctioned for use within Defra Digital Delivery.

GitHub Copilot organizations can [configure this registry as their allowlist](https://docs.github.com/en/copilot/reference/mcp-allowlist-enforcement) to enforce "Registry only" mode, ensuring all MCP servers are pre-approved before use.

## Requirements

- **Node.js** ≥ 24 (see [`.nvmrc`](.nvmrc))
- **Redis** — required in production; optional locally (falls back to in-memory cache)

Install [nvm](https://github.com/nvm-sh/nvm) to manage Node.js versions, then:

```bash
nvm use
```

## Getting Started

### Install dependencies

```bash
npm install
```

### Environment variables

The application is configured via environment variables. Key variables:

| Variable | Default | Description |
|---|---|---|
| `PORT` | `3000` | Port the server binds to |
| `NODE_ENV` | `development` | `development`, `production`, or `test` |
| `SESSION_CACHE_ENGINE` | `memory` (dev) / `redis` (prod) | Session backend: `redis` or `memory` |
| `SESSION_COOKIE_PASSWORD` | *(insecure default)* | Cookie encryption key — **must be set in production** (≥ 32 chars) |
| `REDIS_HOST` | `127.0.0.1` | Redis hostname |
| `REDIS_KEY_PREFIX` | `mcp-registry:` | Namespace prefix for Redis keys |
| `USE_SINGLE_INSTANCE_CACHE` | `true` (non-prod) | Connect to a single Redis instance rather than a cluster |
| `HTTP_PROXY` | — | Forward proxy URL |
| `LOG_LEVEL` | `info` | Pino log level |
| `ACE_SLACK_CHANNEL_URL` | `#` | URL for the #ask-ace Slack channel (shown in the UI) |

Copy `.env.example` to `.env` (if provided) or set variables directly in your shell.

### Run in development mode

Starts the server with file watching (Nodemon) and Vite asset rebuilding in parallel:

```bash
npm run start:dev
```

The application will be available at [http://localhost:3000](http://localhost:3000).

### Run in production mode

```bash
npm start
```

## Adding MCP Servers

The registry is managed by the AICE team. To request that a server be added to the registry, contact the AICE team via Slack in the #ask-ace channel with:

- A link to the server's repository or documentation
- A brief description of the use case and why it should be approved

The registry is driven by [`src/data/mcp-servers.json`](src/data/mcp-servers.json). Approved servers are added by the AICE team following review and validation.

Each server entry follows this shape:

```json
{
  "id": "namespace/server-name",
  "title": "Human-readable title",
  "description": "Brief description of what the server does.",
  "version": "1.0.0",
  "websiteUrl": "https://example.com/docs",
  "transports": [
    {
      "type": "http",
      "url": "https://api.example.com/mcp",
      "headers": {
        "Authorization": "Bearer <YourToken>"
      }
    },
    {
      "type": "stdio",
      "package": {
        "registryType": "npm",
        "identifier": "@example/mcp-server",
        "runtimeHint": "npx"
      },
      "env": {
        "EXAMPLE_API_KEY": "<YourApiKey>"
      }
    }
  ],
  "status": "active",
  "publishedAt": "2025-01-01T00:00:00Z",
  "updatedAt": "2025-01-01T00:00:00Z"
}
```

| Field | Required | Description |
|---|---|---|
| `id` | Yes | Qualified name used as the registry identifier (`namespace/name`) |
| `title` | Yes | Display name |
| `description` | Yes | Short description shown in the UI and API |
| `version` | Yes | Version string (e.g. `1.0.0` or `latest`) |
| `websiteUrl` | Yes | Link to the server's documentation or homepage |
| `transports` | Yes | One or more transport definitions (HTTP and/or stdio) |
| `status` | Yes | `active`, `deprecated`, or `inactive` |
| `publishedAt` | Yes | ISO 8601 timestamp of first publication |
| `updatedAt` | Yes | ISO 8601 timestamp of last update |
| `repository` | No | Optional `{ url, source, id }` object |

## API Reference

The API implements the [MCP Registry v0.1 specification](https://modelcontextprotocol.io/registry/about/), allowing GitHub Copilot and other MCP clients within Defra to discover and configure approved servers from this registry.

### Endpoints

- **`GET /v0.1/servers`** — Returns all approved MCP servers in the registry, including their configurations, transport types (HTTP, stdio), and environment variable requirements.

- **`GET /v0.1/servers/{namespace}/{name}/versions/latest`** — Returns the latest version of a specific server (e.g., `/v0.1/servers/com.sonarsource/sonarqube-mcp-server/versions/latest`).

- **`GET /v0.1/servers/{namespace}/{name}/versions/{version}`** — Returns a specific version of a server (e.g., `/v0.1/servers/com.sonarsource/sonarqube-mcp-server/versions/1.0.0`).

All endpoints also accept `OPTIONS` requests for CORS preflight. Configure your MCP client to point to `https://<host>/v0.1/servers` to automatically discover and load all approved servers.

## Docker

> [!TIP]
> For Apple Silicon users, you may need to add `--platform linux/amd64` to build commands for compatibility.

### Development image

```bash
docker build --target development --no-cache --tag mcp-portal:development .
docker run -p 3000:3000 mcp-portal:development
```

### Production image

```bash
docker build --no-cache --tag mcp-portal .
docker run -p 3000:3000 mcp-portal
```

### Docker Compose

Starts the portal alongside a Redis instance:

```bash
docker compose up --build -d
```

## Testing

Run the full test suite (lint → build → unit tests with coverage):

```bash
npm test
```

Run only the unit tests:

```bash
npm run test:js
```

Coverage reports are written to `./coverage/`.

### Windows line endings

If you experience formatting issues on Windows, update your global git config:

```bash
git config --global core.autocrlf false
```

## Dependency Management

[Dependabot](.github/dependabot.yml) is configured to open weekly pull requests for npm and GitHub Actions dependency updates.

## Code Quality

[SonarCloud](https://sonarcloud.io/summary/new_code?id=DEFRA_mcp-portal) is used for static analysis and security scanning. Setup instructions are in [sonar-project.properties](sonar-project.properties).

Run linting locally:

```bash
npm run lint        # ESLint + Stylelint
npm run lint:js     # ESLint only
npm run lint:scss   # Stylelint only
```

## Licence

THIS INFORMATION IS LICENSED UNDER THE CONDITIONS OF THE OPEN GOVERNMENT LICENCE found at:

<http://www.nationalarchives.gov.uk/doc/open-government-licence/version/3>

The following attribution statement MUST be cited in your products and applications when using this information.

> Contains public sector information licensed under the Open Government license v3

### About the licence

The Open Government Licence (OGL) was developed by the Controller of Her Majesty's Stationery Office (HMSO) to enable
information providers in the public sector to license the use and re-use of their information under a common open
licence.

It is designed to encourage use and re-use of information freely and flexibly, with only a few conditions.

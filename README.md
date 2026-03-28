# AI SaaS Ticket Management (Backend)

NestJS backend for a multi-tenant SaaS ticketing system with:
- PostgreSQL (Prisma) + pgvector knowledge base
- Kafka event bus for async workflows
- AWS S3 for tenant document storage
- Ollama for ticket classification and response drafting

## Environment (`.env`)

Create a `.env` file in the repo root:

```dotenv
# App
NODE_ENV=development
APP_PORT=3000
JWT_SECRET=replace-me
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/DB_NAME?schema=public
USER_DEFAULT_PASSWORD=replace-me

# AWS S3 (used for tenant doc uploads)
AWS_ACCESS_KEY=replace-me
AWS_SECRET_KEY=replace-me
AWS_REGION=ap-south-1
AWS_S3_BUCKET=replace-me

# Kafka
KAFKA_CLIENT_ID=replace-me
KAFKA_GROUP_ID=replace-me
KAFKA_BROKER=localhost:9092

# Ollama (AI provider)
# Default Ollama server is typically http://localhost:11434
OLLAMA_TEXT_GENERATION_URL=http://localhost:11434/api/generate
OLLAMA_EMBEDDING_GENERATION_URL=http://localhost:11434/api/embeddings
OLLAMA_TEXT_GENERATION_MODEL=phi3
OLLAMA_EMBEDDING_GENERATION_MODEL=nomic-embed-text
```

## Run Ollama

1) Install Ollama and start the server (keep it running in a terminal):
```bash
ollama serve
```

2) Pull the models you configured in `.env` (examples match the defaults above):
```bash
ollama pull phi3
ollama pull nomic-embed-text
```

3) Verify `.env` points to the running Ollama server:
- `OLLAMA_TEXT_GENERATION_URL` → `/api/generate`
- `OLLAMA_EMBEDDING_GENERATION_URL` → `/api/embeddings`

## Setup

```bash
npm install
npm run prisma:generate
```

## Run

```bash
# development
npm run start

# watch mode
npm run start:dev
```

## Tenant-aware local requests
Because tenant is resolved from Host, ensure your HTTP client sets a tenant subdomain host:
- Example: `acme.localhost:3002`
- For tools that don’t support arbitrary Host headers, add an entry to `/etc/hosts` mapping a fake domain to `127.0.0.1`.
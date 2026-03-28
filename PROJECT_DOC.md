# AI SaaS Ticket Management — Project Documentation

This repository is a NestJS backend for a multi-tenant SaaS ticketing system with:
- PostgreSQL (Prisma) for core data
- Kafka as an internal event bus (async workflows)
- AWS S3 for tenant document storage
- pgvector + semantic search for knowledge-base retrieval
- Ollama as the AI provider (ticket classification + response drafting)

> Code entrypoint: `src/main.ts` (HTTP API + Kafka microservice).

## Table of contents

- [1) High-level architecture](#1-high-level-architecture)
- [2) Runtime / bootstrap](#2-runtime--bootstrap)
- [3) Multi-tenancy](#3-multi-tenancy)
- [4) Modules and responsibilities](#4-modules-and-responsibilities)
- [5) HTTP API surface](#5-http-api-surface)
- [6) Kafka integration](#6-kafka-integration)
- [7) Core workflows](#7-core-workflows)
- [8) Database schema (Prisma)](#8-database-schema-prisma)
- [9) Health checks](#9-health-checks)
- [10) Configuration (env vars)](#10-configuration-env-vars)
- [11) Local development runbook](#11-local-development-runbook)

---

## 1) High-level architecture

```text
                    ┌─────────────────────────────┐
                    │   Client (web/mobile/etc)   │
                    └──────────────┬──────────────┘
                                   │ HTTP
                                   ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                           NestJS application                              │
│                                                                          │
│  HTTP API (controllers)                     Kafka microservice consumer   │
│  - /api/v1/auth/*                           - @KafkaEventPattern handlers │
│  - /api/v1/tickets/*                        - same process by default      │
│  - /api/v1/tenant/*                                                        │
│  - /api/v1/users/*                                                         │
│  - /api/v1/admin/*                                                         │
│                                                                          │
│  Domain modules: auth, tenants, tickets, user, knowledge-base, audit      │
└───────────────┬───────────────────────┬───────────────────────┬──────────┘
                │                       │                       │
                ▼                       ▼                       ▼
         PostgreSQL (Prisma)          Kafka broker             Ollama
         - pgvector (vector)         - topic: event-bus        - text gen
         - core entities             - async workflows         - embeddings
                │
                ▼
             AWS S3
         - tenant docs (PDFs)
```

Notes:
- The app both **produces** and **consumes** Kafka events.
- Knowledge-base ingestion is an async pipeline (Kafka-driven).
- Ticket lifecycle (classify → assign → AI response) is also Kafka-driven.

---

## 2) Runtime / bootstrap

### HTTP server
- Bootstrapped in `src/main.ts`.
- Global API prefix: `src/shared/constants/common.constant.ts` exports `API_PREFIX = '/api/v1'`.
- Global validation and exception formatting: `src/shared/utils/app.utils.ts` + `src/shared/filters/http-exception.filter.ts`.

### Kafka microservice (consumer)
`src/shared/utils/app.utils.ts` connects a Kafka microservice via `app.connectMicroservice({ transport: Transport.KAFKA, ... })` and starts it with `app.startAllMicroservices()`.

Key Kafka settings (from env):
- `KAFKA_CLIENT_ID`
- `KAFKA_GROUP_ID`
- `KAFKA_BROKER`

### Kafka producer client
`src/infra/kafka/kafka.module.ts` registers a `ClientKafka` in `producerOnlyMode: true` and exposes `KafkaProducer` (`src/infra/kafka/service/kafka-producer.service.ts`) as the app’s emitting interface.

---

## 3) Multi-tenancy

Multi-tenancy is enforced via a global guard:
- `src/app.module.ts` registers `TenantGuard` as a global `APP_GUARD`.
- `src/shared/guards/tenant.guard.ts` resolves tenant **from the Host header**:
  - It expects a hostname shaped like `<tenantSlug>.<domain>[:port]`
  - It extracts the `subdomain` and uses it to fetch a tenant by slug (`TenantRepository.findTenantBySlug`)
  - It sets `request.tenantId` for downstream usage

Implications:
- For local dev, use something like `acme.localhost:3002` (subdomain = `acme`).
- Public routes bypass tenant resolution using `@Public()` (`src/shared/decorators/public-route.decorator.ts`).

---

## 4) Modules and responsibilities

### `AuthModule` (`src/modules/auth/*`)
Responsibilities:
- Tenant + initial admin registration
- Sign-in → JWT issuance
- Customer registration within an existing tenant

Key classes:
- `AuthController` (`src/modules/auth/auth.controller.ts`)
- `AuthService` (`src/modules/auth/service/auth.service.ts`)
- `JwtApplicationService` (`src/modules/auth/service/jwt.service.ts`)

### `TenantModule` (`src/modules/tenants/*`)
Responsibilities:
- Upload tenant documents (PDFs) to S3
- Create tenant doc metadata in DB
- Emit Kafka event to kick off ingestion

Key classes:
- `TenantController` (`src/modules/tenants/tenant.controller.ts`)
- `TenantDocService` (`src/modules/tenants/service/tenant-doc.service.ts`)
- `AwsS3Service` (`src/infra/aws/aws-s3.service.ts`)

### `UserModule` (`src/modules/user/*`)
Responsibilities:
- User lookup (me)
- Admin endpoints to create agents + list tenant users
- Kafka handler for `AGENT_CREATED` to seed routing tables (workload + skills)

Key classes:
- `UserController` (`src/modules/user/user.controller.ts`)
- `AdminController` (`src/modules/user/admin.controller.ts`)
- `AgentCreatedEventHandler` (`src/modules/user/handlers/kafka/agent-created-event.handler.ts`)

### `TicketModule` (`src/modules/tickets/*`)
Responsibilities:
- Customer creates ticket
- Kafka-driven pipeline:
  1) classify ticket (AI)
  2) assign to best agent (workload + skill)
  3) draft AI response using KB context
- Agent reviews AI response

Key classes:
- `TicketController` (`src/modules/tickets/ticket.controller.ts`)
- `TicketService` (`src/modules/tickets/service/ticket.service.ts`)
- Kafka handlers:
  - `TicketCreatedEventHandler` (`src/modules/tickets/handlers/kafka/ticket-created-event.handler.ts`)
  - `TicketClassifiedEventHandler` (`src/modules/tickets/handlers/kafka/ticket-classified-event.handler.ts`)
  - `TicketAssignedEventHandler` (`src/modules/tickets/handlers/kafka/ticket-assigned-event.handler.ts`)

### `KnowledgeBaseModule` (`src/modules/knowledge-base/*`)
Responsibilities:
- Kafka-driven document ingestion pipeline:
  1) parse PDF from S3 → cleaned text
  2) chunk text
  3) generate embeddings via Ollama
  4) store chunks + embeddings in pgvector table
  5) mark document processed + audit log
- Semantic search for retrieval

Key classes:
- `DocParserService` (`src/modules/knowledge-base/service/doc-parser.service.ts`)
- `TextCleanerService` (`src/modules/knowledge-base/service/text-cleaner.service.ts`)
- `TextChunkerService` (`src/modules/knowledge-base/service/text-chunker.service.ts`)
- `EmbeddingsGeneratorService` (`src/modules/knowledge-base/service/embeddings-generator.service.ts`)
- `SemanticSearchService` (`src/modules/knowledge-base/service/semantic-search.service.ts`)

### `AiCoreModule` (`src/modules/ai-core/*`)
Responsibilities:
- Implements AI provider calls (currently Ollama) for:
  - ticket classification prompt → JSON
  - embeddings generation for semantic search + validation
  - response drafting prompt using KB context

Key classes:
- `AiProviderService` (`src/modules/ai-core/service/ai-provider.service.ts`)
- Prompt templates: `src/modules/ai-core/utils/prompt.utils.ts`

### `AuditModule` (`src/modules/audit/*`)
Responsibilities:
- Write audit logs for security/traceability.

Key classes:
- `AuditService` (`src/modules/audit/service/audit.service.ts`)
- `AuditRepository` (`src/modules/audit/repository/audit.repository.ts`)

---

## 5) HTTP API surface

All routes are under `/api/v1` (global prefix).

### Auth (`/api/v1/auth`)

#### `POST /auth/register` (Public)
Creates:
- a new `Tenant`
- an `ADMIN` user for that tenant
- a `SYSTEM` user (used for system actions/audit logs)

Implemented in:
- `AuthController.register`
- `AuthService.registerUser`

#### `POST /auth/signin`
Requires tenant resolution via Host header (not marked `@Public()`).
Returns `{ token }` (JWT).

#### `POST /auth/register-customer`
Requires tenant resolution via Host header (not marked `@Public()`).
Creates a `CUSTOMER` user under the tenant.

### Tenant (`/api/v1/tenant`)

#### `POST /tenant/docs` (Roles: `ADMIN`, `AGENT`)
Multipart upload (`file`).
Stores file to S3 and emits `TENANT_DOC_UPLOADED`.

### Users (`/api/v1/users`)

#### `GET /users/me` (Authenticated)
Returns current user info.

### Admin (`/api/v1/admin`) (Role: `ADMIN`)

#### `POST /admin/users`
Creates an agent user (password = `USER_DEFAULT_PASSWORD`) and emits `AGENT_CREATED`.

#### `GET /admin/users`
Lists users within the tenant.

### Tickets (`/api/v1/tickets`)

#### `POST /tickets` (Role: `CUSTOMER`)
Creates a ticket + initial customer message, then emits `TICKET_CREATED`.

#### `PATCH /tickets/:ticketId/messages/:messageId/review` (Role: `AGENT`)
Agent reviews an AI-generated message (approve/reject, optionally edits content).

### Health (`/api/v1/health`)

#### `GET /health/liveness` (Public)
Simple process liveness response.

#### `GET /health/readiness` (Public)
Checks dependencies:
- DB (Prisma)
- AWS (STS)
- Kafka broker reachability

---

## 6) Kafka integration

### Topics
Defined in `src/infra/kafka/enums/kafka.enum.ts`:
- `event-bus` (primary)
- `dead-letter-queue` (declared but not currently used in code)

### Event envelope
All events follow the same envelope (`src/infra/kafka/events/base.event.ts` and `src/infra/kafka/type/kafka.type.ts`):

```json
{
  "id": "cuid2",
  "name": "EVENT_NAME",
  "occurredAt": "ISO timestamp",
  "payload": { "..." : "..." }
}
```

### Producing
All producing goes through:
- `KafkaProducer.emit(topic, event)` (`src/infra/kafka/service/kafka-producer.service.ts`)

Typical pattern:
- Create domain event class extending `BaseEvent<TPayload>` (e.g. `TicketCreatedEvent`)
- Emit to `KafkaTopic.EVENT_BUS`

### Consuming
Kafka consumers are implemented as Nest “microservice controllers”.

Filtering by event-name is done by a custom decorator:
- `KafkaEventPattern(topicName, eventName)` (`src/infra/kafka/decorators/event-pattern.decorator.ts`)
  - It registers a Nest `@EventPattern(topicName)`
  - It wraps the handler, and **only executes** if `payload.name === eventName`

### Event types (payloads)

Ticketing:
- `TICKET_CREATED`: `{ tenantId, ticketId, subject, message }`
- `TICKET_CLASSIFIED`: `{ tenantId, ticketId, message }`
- `TICKET_ASSIGNED`: `{ tenantId, ticketId, message }`

Agents:
- `AGENT_CREATED`: `{ agentId, tenantId, skills: AgentSkill[] }`

Knowledge base ingestion:
- `TENANT_DOC_UPLOADED`: `{ tenantId, docId, fileKey }`
- `TENANT_DOC_PARSED`: `{ tenantId, docId, cleanedText }`
- `TENANT_DOC_CHUNKED`: `{ tenantId, docId, chunks: TextChunk[] }`
- `TENANT_DOC_EMBEDDINGS_GENERATED`: `{ tenantId, docId }`

### Manual event samples
`producer.kafka` contains example envelopes for producing test messages to Kafka.

---

## 7) Core workflows

### 7.1 Tenant onboarding (register)

1) `POST /api/v1/auth/register` (public)
2) Create tenant
3) Create tenant admin user
4) Create tenant system user (`getTenantSystemUserEmail(tenantId)`)
5) Write audit logs for the above actions

### 7.2 Document ingestion pipeline (knowledge base)

Triggered by `POST /api/v1/tenant/docs`:

1) Upload PDF to S3 (`AwsS3Service.uploadFile`)
2) Create DB metadata in `tenant_docs`
3) Emit Kafka `TENANT_DOC_UPLOADED`
4) Consumer flow on `event-bus`:
   - `TENANT_DOC_UPLOADED` → parse PDF from S3 → clean text → emit `TENANT_DOC_PARSED`
   - `TENANT_DOC_PARSED` → chunk cleaned text → emit `TENANT_DOC_CHUNKED`
   - `TENANT_DOC_CHUNKED` → generate embeddings (batched) + insert into `knowledge_chunks` → emit `TENANT_DOC_EMBEDDINGS_GENERATED`
   - `TENANT_DOC_EMBEDDINGS_GENERATED` → mark doc `PROCESSED` + audit log

Storage:
- Chunks are stored in `knowledge_chunks` with a `vector(768)` embedding.
- Retrieval uses pgvector distance (`<=>`) and a similarity threshold in code.

### 7.3 Ticket lifecycle pipeline

Triggered by `POST /api/v1/tickets`:

1) Create `tickets` record (status `OPEN`)
2) Create initial `messages` record (sender = customer)
3) Emit Kafka `TICKET_CREATED`
4) Consumer flow:
   - `TICKET_CREATED` → classify ticket (AI) → update ticket fields → emit `TICKET_CLASSIFIED`
   - `TICKET_CLASSIFIED` → pick best agent (skill + level + workload) → update assignment + workload → emit `TICKET_ASSIGNED`
   - `TICKET_ASSIGNED` → generate AI reply:
     - embed query
     - retrieve context from KB
     - generate reply using context-only prompt
     - validate structure + grounding + relevance
     - create AI `messages` record with `aiResponseStatus`
5) Agent review (HTTP):
   - `PATCH /tickets/:ticketId/messages/:messageId/review`
   - only the assigned agent can review
   - updates message status to `APPROVED` or `REJECTED` and optionally overwrites content
   - creates audit log entry

---

## 8) Database schema (Prisma)

Prisma schema: `prisma/schema.prisma` (PostgreSQL datasource).

### Core entities

#### `tenants` (model `Tenant`)
- `id` (uuid, PK)
- `name`
- `slug` (unique)
- `createdAt`

#### `users` (model `User`)
- `id` (uuid, PK)
- `tenantId` (FK → `tenants.id`)
- `email` (unique per tenant via `@@unique([tenantId, email])`)
- `name`
- `passwordHash`
- `role` (`UserRole`: `ADMIN|AGENT|CUSTOMER|SYSTEM`)
- `agentLevel` (`AgentLevel`: `JUNIOR|MID|SENIOR`, nullable)
- timestamps

Relations:
- `User.tenant` → `Tenant.users`
- `User.createdTickets` / `User.assignedTickets`
- `User.workload` → `AgentWorkload`
- `User.skills` → `AgentSkillMap`

#### `audit_logs` (model `AuditLog`)
- `tenantId`
- `actorUserId`
- `action`, `entityType`, `entityId`
- `beforeState` (JSON), `afterState` (JSON)
- optional `ipAddress`, `userAgent`
- `createdAt`

#### `tickets` (model `Ticket`)
- `tenantId`
- `createdById` (FK → `users.id`)
- `assignedToId` (FK → `users.id`, nullable)
- `subject`
- `status` (`TicketStatus`)
- `priority` (`TicketPriority`)
- AI classification fields:
  - `category` (`TicketCategory`, nullable)
  - `sentiment` (`TicketSentiment`, nullable)
  - `aiConfidence` (float, nullable)
- `version` (optimistic version counter, currently not used for concurrency)
- `closedAt` (nullable)
- timestamps

#### `messages` (model `Message`)
- `ticketId` (FK → `tickets.id`)
- `senderId` (FK → `users.id`, nullable)
- `senderType` (`SenderType`: `CUSTOMER|AGENT|AI`)
- `content` (nullable; AI failures may store no content)
- AI response bookkeeping:
  - `aiResponseStatus` (`AiResponseStatus`: `AUTO_SEND|QUEUE_FOR_REVIEW|FAILED|APPROVED|REJECTED`, nullable)
  - `aiResponseConfidence` (float, nullable)
  - `aiResponseError` (text, nullable)
- `createdAt`, `updatedAt`

### Agent routing support tables

#### `agent_workload` (model `AgentWorkload`)
- PK: `agentId` (also FK → `users.id`)
- `tenantId` (FK → `tenants.id`)
- `activeTicketCount` (int)
- `updatedAt`

#### `agent_skill_map` (model `AgentSkillMap`)
- composite PK: `(agentId, skill)`
- `tenantId`
- FKs:
  - `agentId` → `users.id`
  - `tenantId` → `tenants.id`
- `skill` (`AgentSkill`: `BUG|FEATURE_REQUEST|BILLING|TECHNICAL|SUPPORT|GENERAL`)

### Knowledge base tables

#### `tenant_docs` (model `TenantDoc`)
- `tenantId`, `uploadedBy` (stored as strings)
- `fileName`, `fileKey`
- `status` (`DocStatus`)
- timestamps

> Note: `TenantDoc` currently does **not** declare Prisma relations to `Tenant` / `User`. (It stores ids only.)

#### `knowledge_chunks` (model `KnowledgeChunk`)
- `tenantId`
- `documentId`
- `chunkIndex`
- `content`
- `embedding` (`vector(768)` via Prisma `Unsupported("vector(768)")`)
- `createdAt`

Migrations:
- pgvector enabled and `knowledge_chunks` created in `prisma/migrations/20260313144922_add_knowledge_chunks/migration.sql`.

Indexes:
- most tables include tenantId indexes
- `knowledge_chunks` has `tenantId` and `documentId` indexes
- an ivfflat embedding index is created in the knowledge-chunks migration but later dropped by `prisma/migrations/20260314113647_add_tenant_doc_status/migration.sql`

---

## 9) Health checks

`GET /api/v1/health/readiness` uses Nest Terminus to check:
- DB: `PrismaHealthIndicator` (`SELECT 1` with timeout)
- AWS: `AwsHealthIndicator` (STS `GetCallerIdentity`)
- Kafka: `KafkaHealthIndicator` (broker ping check via microservices transport)

---

## 10) Configuration (env vars)

All config keys are defined in `src/shared/enums/env-config.enum.ts` and read via `src/shared/utils/env-config.utils.ts`.

Required in practice:
- `NODE_ENV` (`development` | `production`)
- `APP_PORT`
- `DATABASE_URL`
- `JWT_SECRET`
- `USER_DEFAULT_PASSWORD`
- `KAFKA_CLIENT_ID`, `KAFKA_GROUP_ID`, `KAFKA_BROKER`
- `OLLAMA_TEXT_GENERATION_URL`, `OLLAMA_TEXT_GENERATION_MODEL`
- `OLLAMA_EMBEDDING_GENERATION_URL`, `OLLAMA_EMBEDDING_GENERATION_MODEL`
- `AWS_REGION`, `AWS_S3_BUCKET`, and credentials (`AWS_ACCESS_KEY`, `AWS_SECRET_KEY`) unless you adjust AWS auth strategy

---

## 11) Local development runbook

### Prerequisites
- Node.js + npm
- PostgreSQL with `pgvector` available (extension `vector`)
- Kafka broker reachable from the app
- Ollama reachable from the app (HTTP endpoints)
- S3-compatible bucket reachable from the app (AWS S3, or a compatible provider if you adapt config)
- Refer to `README.md` for local development setup.
# Portal Secretaria Educacional — CEBEES + CBMF

Ferramenta interna do grupo educacional CEBEES + CBMF para gestão da Secretaria Educacional: match inteligente de professores, contratos, turmas, alunos, financeiro, certificação e compliance.

**Não é um produto SaaS.** É um sistema interno usado exclusivamente pelas empresas do grupo.

## Stack

- **Backend**: Node.js 20 LTS + Express + Sequelize + Joi (TypeScript)
- **Frontend**: React 18 + TypeScript + Vite + Material-UI v5 + React Query + React Router
- **Banco**: PostgreSQL 15
- **Cache/Fila**: Redis 7 + BullMQ
- **Storage**: AWS S3 (MinIO em dev)
- **Infra**: Docker / docker-compose (dev) → AWS ECS Fargate + RDS + ElastiCache (prod)

## Estrutura

```
cebees/
├── apps/
│   ├── api/       # Express + Sequelize
│   └── web/       # React + Vite
├── packages/
│   ├── shared-types/
│   └── eslint-config/
├── infra/
│   ├── docker/    # docker-compose para dev
│   └── terraform/ # IaC para prod (fases posteriores)
└── docs/
    ├── PDR.pdf    # referência de requisitos
    └── adr/       # Architecture Decision Records
```

## Requisitos

- Node.js 20+ (`nvm use` com o `.nvmrc`)
- npm 10+
- Docker Desktop (para subir postgres/redis/minio localmente)

## Setup

```bash
# 1. Instalar dependências
npm install

# 2. Subir serviços de infraestrutura (postgres, redis, minio)
npm run docker:up

# 3. Rodar migrations e seeds
npm run migrate
npm run seed

# 4. Iniciar api e web em paralelo
npm run dev
```

API: http://localhost:3000
Web: http://localhost:5173
MinIO console: http://localhost:9001 (admin/admin12345)

## Scripts úteis

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Inicia api + web em modo watch |
| `npm run build` | Build de produção de todos os workspaces |
| `npm test` | Roda testes de todos os workspaces |
| `npm run lint` | ESLint em todos os workspaces |
| `npm run typecheck` | TypeScript em strict mode |
| `npm run migrate` | Aplica migrations pendentes |
| `npm run seed` | Popula dados de desenvolvimento |
| `npm run docker:up` | Sobe postgres/redis/minio |
| `npm run docker:down` | Desliga stack local |

## Roadmap

Plano completo em `C:\Users\vinic\.claude\plans\c-users-vinic-onedrive-rea-de-trabalho-tranquil-mist.md`.

- **Fase 1** (atual): MVP Módulo 01 Match Professores — motor de alocação + portal professor + RBAC + LGPD.
- **Fase 2**: Módulos 02-07 (Secretaria Acadêmica, Financeiro, Coordenação, Alunos, Certificação, Jurídico).
- **Fase 3**: Separação multi-tenant CEBEES × CBMF + relatórios consolidados.
- **Fase 4**: SSO corporativo, integração com sistemas legados, data warehouse interno.

## Documentação

- `docs/PDR.pdf` — Product Design Requirements v1.0
- `docs/adr/` — decisões arquiteturais
- Referências de integração em `docs/integrations/`

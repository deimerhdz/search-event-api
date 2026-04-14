# Search Events - Búsqueda Semántica de Eventos

> Servidor de búsqueda inteligente de eventos usando embeddings semánticos y vector database

## Descripción del Proyecto

**Search Events** es una aplicación backend que implementa búsqueda semántica para eventos. En lugar de buscar por palabras clave exactas, entiende el significado de las queries y retorna eventos relevantes basados en similitud semántica.

### ¿Qué lo hace especial?

- **Búsqueda Semántica**: Encuentra eventos por significado, no solo por palabras clave
- **Alto Rendimiento**: Vector database (Pinecone) para búsquedas instantáneas
- **IA Local**: Embeddings generados con HuggingFace Transformers (sin dependencia de APIs externas siempre iniciado)
- **Modular**: Arquitectura separada en capas (Controller → Service → Embeddings → Vector DB)
- **Persistencia**: PostgreSQL para almacenar datos estructurados

## Flujo de Funcionamiento

### 1️ Creación de Evento

```
POST /events
│
├─> EventsService.create()
│   ├─> Guardar en PostgreSQL
│   ├─> Generar embedding del texto
│   └─> Indexar vector en Pinecone
│
└─>  Evento creado y indexado
```

### 2️ Búsqueda de Evento

```
POST /events/search
│
├─> EventsService.search()
│   ├─> Generar embedding de la query
│   ├─> Buscar vectores similares en Pinecone
│   └─> Retornar resultados ordenados por score
│
└─>  Eventos relevantes
```

## Tecnologías Utilizadas

| Tecnología                   | Propósito                  |
| ---------------------------- | -------------------------- |
| **NestJS**                   | Framework backend modular  |
| **TypeScript**               | Tipado estático            |
| **TypeORM**                  | ORM para PostgreSQL        |
| **PostgreSQL**               | Base de datos relacional   |
| **HuggingFace Transformers** | Generación de embeddings   |
| **Pinecone**                 | Vector database            |
| **Docker Compose**           | Orquestación de containers |

## Configuración

### Requisitos Previos

- Node.js 18+
- PostgreSQL 14+
- Docker & Docker Compose (opcional)
- Cuenta Pinecone con API Key

### Variables de Entorno (.env)

```bash
# Base de datos
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=search_events

# Pinecone
PINECONE_API_KEY=your-api-key
PINECONE_INDEX_NAME=events
PINECONE_NAMESPACE=events

# Búsqueda (configuración)
SEARCH_TOP_K=10
SEARCH_SCORE_THRESHOLD=0.5
```

### Instalación

1. **Clonar o descargar el proyecto**

```bash
cd search-events
```

2. **Instalar dependencias**

```bash
npm install
```

3. **Configurar variables de entorno**

```bash
cp .env.example .env
# Editar .env con tus credenciales
```

4. **Levantar PostgreSQL (con Docker)**

```bash
docker-compose up -d
```

5. **Ejecutar migraciones** (si existen)

```bash
npm run migration:run
```

## Ejecución

### Modo Desarrollo (Watch)

```bash
npm run start:dev
```

- Reinicia automáticamente al detectar cambios
- Incluye debugging integrado

### Modo Producción

```bash
npm run build
npm run start:prod
```

### Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Coverage
npm run test:cov
```

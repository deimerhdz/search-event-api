import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  app: {
    nodeEnv: process.env.NODE_ENV ?? 'development',
    port: parseInt(process.env.PORT ?? '3000', 10),
    apiPrefix: process.env.API_PREFIX ?? 'api/v1',
  },
  database: {
    host: process.env.DB_HOST ?? 'localhost',
    port: parseInt(process.env.DB_PORT ?? '5432', 10),
    username: process.env.DB_USER ?? 'postgres',
    password: process.env.DB_PASSWORD ?? '',
    name: process.env.DB_NAME ?? 'events_db',
    synchronize: process.env.DB_SYNCHRONIZE === 'true',
    logging: process.env.DB_LOGGING === 'true',
  },
  openai: {
    apiKey: process.env.OPENAI_API_KEY ?? '',
    embeddingModel:
      process.env.OPENAI_EMBEDDING_MODEL ?? 'text-embedding-3-small',
    embeddingDimensions: parseInt(
      process.env.OPENAI_EMBEDDING_DIMENSIONS ?? '1536',
      10,
    ),
  },
  pinecone: {
    apiKey: process.env.PINECONE_API_KEY ?? '',
    indexName: process.env.PINECONE_INDEX_NAME ?? 'concert-events',
    cloud: process.env.PINECONE_CLOUD ?? 'aws',
    region: process.env.PINECONE_REGION ?? 'us-east-1',
    namespace: process.env.PINECONE_NAMESPACE ?? 'concerts',
  },
  search: {
    topK: parseInt(process.env.SEARCH_TOP_K ?? '10', 10),
    scoreThreshold: parseFloat(process.env.SEARCH_SCORE_THRESHOLD ?? '0.5'),
  },
}));

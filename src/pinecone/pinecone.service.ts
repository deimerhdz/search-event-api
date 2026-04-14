// src/pinecone/pinecone.service.ts
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Index, Pinecone, RecordMetadata } from '@pinecone-database/pinecone';

export interface EventVectorMetadata extends RecordMetadata {
  eventId: string;
  title: string;
  location: string;
  date: string;
  price: number;
  createdAt: string;
}

export interface PineconeQueryMatch {
  id: string;
  score: number;
  metadata: EventVectorMetadata;
}

export interface EventPayload extends Omit<EventVectorMetadata, 'eventId'> {}

@Injectable()
export class PineconeService implements OnModuleInit {
  private readonly logger = new Logger(PineconeService.name);
  private readonly client: Pinecone;
  private readonly indexName: string;
  private readonly namespace: string;
  private index: Index<EventVectorMetadata>;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.getOrThrow<string>('app.pinecone.apiKey');
    this.indexName = this.configService.getOrThrow<string>(
      'app.pinecone.indexName',
    );
    this.namespace = this.configService.getOrThrow<string>(
      'app.pinecone.namespace',
    );
    this.client = new Pinecone({ apiKey });
    this.logger.log(
      `PineconeService initialized — index: "${this.indexName}" | namespace: "${this.namespace}"`,
    );
  }

  async onModuleInit(): Promise<void> {
    try {
      const existingIndexes = await this.client.listIndexes();

      const exists = existingIndexes.indexes?.some(
        (i) => i.name === this.indexName,
      );

      if (!exists) {
        this.logger.warn(`Index "${this.indexName}" no existe. Creándolo...`);

        await this.client.createIndex({
          name: this.indexName,
          dimension: 384, // debe coincidir con all-MiniLM-L6-v2
          metric: 'cosine',
          spec: {
            serverless: {
              cloud: 'aws',
              region: 'us-east-1',
            },
          },
          waitUntilReady: true,
        });

        this.logger.log(`Index "${this.indexName}" creado correctamente`);
      }

      this.index = this.client.index<EventVectorMetadata>(this.indexName);

      const stats = await this.index.describeIndexStats();

      this.logger.log(
        `Pinecone index ready — total vectors: ${stats.totalRecordCount ?? 0}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to connect to Pinecone index "${this.indexName}"`,
        (error as Error).message,
      );
      throw error;
    }
  }

  async upsertEventEmbedding(
    eventId: string,
    embedding: number[],
    metadata: EventPayload,
  ): Promise<void> {
    this.logger.debug(`Upserting vector for event: ${eventId}`);
    try {
      await this.index.namespace(this.namespace).upsert({
        records: [
          {
            id: eventId,
            values: embedding,
            metadata: this.mapToVectorMetadata(eventId, metadata),
          },
        ],
      });

      this.logger.log(`Vector upserted for event: ${eventId}`);
    } catch (error) {
      this.logger.error(`Failed to upsert vector for event: ${eventId}`, {
        error: (error as Error).message,
      });
      throw error;
    }
  }

  async queryByEmbedding(
    queryEmbedding: number[],
    topK: number,
    scoreThreshold: number,
  ): Promise<PineconeQueryMatch[]> {
    this.logger.debug(
      `Querying Pinecone — topK: ${topK} | threshold: ${scoreThreshold}`,
    );

    try {
      const response = await this.index.namespace(this.namespace).query({
        vector: queryEmbedding,
        topK,
        includeMetadata: true,
        includeValues: false,
      });

      const matches = (response.matches ?? [])
        .filter((m) => (m.score ?? 0) >= scoreThreshold)
        .map((m) => ({
          id: m.id,
          score: m.score ?? 0,
          metadata: m.metadata as EventVectorMetadata,
        }));

      this.logger.debug(
        `Query returned ${response.matches?.length ?? 0} raw matches, ` +
          `${matches.length} after threshold filter`,
      );

      return matches;
    } catch (error) {
      this.logger.error('Failed to query Pinecone', {
        error: (error as Error).message,
      });
      throw error;
    }
  }

  async getIndexStats(): Promise<Record<string, unknown>> {
    const stats = await this.index.describeIndexStats();
    return stats as unknown as Record<string, unknown>;
  }

  private mapToVectorMetadata(
    eventId: string,
    payload: EventPayload,
  ): EventVectorMetadata {
    return {
      eventId,
      title: payload.title.toString(),
      location: payload.location.toString(),
      date: payload.date.toString(),
      price: parseInt(payload.price.toString(), 10),
      createdAt: payload.createdAt.toString(),
    };
  }
}

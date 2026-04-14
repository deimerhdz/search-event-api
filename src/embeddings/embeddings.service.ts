import { Injectable, Logger, OnModuleInit } from '@nestjs/common';

import { pipeline, FeatureExtractionPipeline } from '@huggingface/transformers';
@Injectable()
export class EmbeddingsService implements OnModuleInit {
  private readonly logger = new Logger(EmbeddingsService.name);
  private extractor: FeatureExtractionPipeline;

  private readonly model = 'Xenova/all-MiniLM-L6-v2';

  async onModuleInit() {
    this.logger.log(`Cargando modelo: ${this.model}`);
    this.extractor = await pipeline('feature-extraction', this.model);
    this.logger.log('Modelo cargado exitosamente');
  }

  async generateEmbedding(text: string): Promise<number[]> {
    const sanitized = text.replace(/\s+/g, ' ').trim();

    try {
      const output = await this.extractor(sanitized, {
        pooling: 'mean',
        normalize: true,
      });

      const embedding = output.tolist()[0];

      if (!embedding?.length) {
        throw new Error('El modelo retornó un embedding vacío');
      }

      this.logger.debug(
        `Embedding generado — dimensiones: ${embedding.length}`,
      );
      return embedding;
    } catch (error) {
      this.logger.error('Error al generar embedding', {
        error: (error as Error).message,
        text: sanitized.substring(0, 100),
      });
      throw error;
    }
  }
}

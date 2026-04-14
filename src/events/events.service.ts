import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { EmbeddingsService } from '../embeddings/embeddings.service';
import { PineconeService } from '../pinecone/pinecone.service';
import { Event } from './entities/event.entity';
import { CreateEventDto } from './dto/create-event.dto';
import {
  SearchEventDto,
  SearchResponseDto,
  SearchResultItemDto,
} from './dto/search-event.dto';

@Injectable()
export class EventsService {
  private readonly logger = new Logger(EventsService.name);
  private readonly defaultTopK: number;
  private readonly defaultScoreThreshold: number;

  constructor(
    @InjectRepository(Event)
    private readonly eventRepository: Repository<Event>,
    private readonly embeddingsService: EmbeddingsService,
    private readonly pineconeService: PineconeService,
    private readonly configService: ConfigService,
  ) {
    this.defaultTopK = this.configService.get<number>('search.topK', 10);
    this.defaultScoreThreshold = this.configService.get<number>(
      'search.scoreThreshold',
      0.5,
    );
  }

  async create(dto: CreateEventDto): Promise<Event> {
    const event = this.eventRepository.create({
      ...dto,
      isIndexed: false,
    });
    const saved = await this.eventRepository.save(event);
    this.logger.debug(`Event persisted — id: ${saved.id}`);

    try {
      const embeddingText = saved.toEmbeddingText();
      const embedding =
        await this.embeddingsService.generateEmbedding(embeddingText);

      await this.pineconeService.upsertEventEmbedding(saved.id, embedding, {
        title: saved.title,
        location: saved.location,
        date: saved.date.toISOString(),
        price: saved.price,
        createdAt: saved.createdAt.toISOString(),
      });

      await this.eventRepository.update(saved.id, { isIndexed: true });
      saved.isIndexed = true;

      this.logger.log(
        `Event created and indexed successfully — id: ${saved.id}`,
      );
    } catch (error) {
      this.logger.error(
        `Event saved but indexing failed for id: ${saved.id}. ` +
          (error as Error).message,
      );
    }

    return saved;
  }

  async search(dto: SearchEventDto): Promise<SearchResponseDto> {
    const topK = dto.topK ?? this.defaultTopK;
    const scoreThreshold = dto.scoreThreshold ?? this.defaultScoreThreshold;

    const queryEmbedding = await this.embeddingsService.generateEmbedding(
      dto.query,
    );

    const matches = await this.pineconeService.queryByEmbedding(
      queryEmbedding,
      topK,
      scoreThreshold,
    );

    if (matches.length === 0) {
      this.logger.debug('No matches found in Pinecone');
      return { results: [], total: 0, query: dto.query };
    }

    const eventIds = matches.map((m) => m.id);
    const events = await this.eventRepository.findByIds(eventIds);

    if (events.length === 0) {
      this.logger.warn(
        `Pinecone returned IDs not found in DB: ${eventIds.join(', ')}`,
      );
      return { results: [], total: 0, query: dto.query };
    }

    const eventMap = new Map<string, Event>(events.map((e) => [e.id, e]));

    const results: SearchResultItemDto[] = matches
      .filter((m) => eventMap.has(m.id))
      .map((m) => ({
        ...eventMap.get(m.id)!,
        score: m.score,
      }))
      .sort((a, b) => b.score - a.score);

    this.logger.log(
      `Search complete — query: "${dto.query}" | results: ${results.length}`,
    );

    return { results, total: results.length, query: dto.query };
  }

  async findAll(): Promise<Event[]> {
    return this.eventRepository.find({
      order: { date: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Event> {
    const event = await this.eventRepository.findOne({ where: { id } });
    if (!event) {
      throw new NotFoundException(`Event with id "${id}" not found`);
    }
    return event;
  }

  async getIndexStats(): Promise<Record<string, unknown>> {
    return this.pineconeService.getIndexStats();
  }
}

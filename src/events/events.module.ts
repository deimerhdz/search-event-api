import { Module } from '@nestjs/common';
import { EventsService } from './events.service';
import { EventsController } from './events.controller';
import { EmbeddingsModule } from 'src/embeddings/embeddings.module';
import { PineconeModule } from 'src/pinecone/pinecone.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Event } from './entities/event.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Event]),
    PineconeModule,
    EmbeddingsModule,
  ],
  controllers: [EventsController],
  providers: [EventsService],
})
export class EventsModule {}

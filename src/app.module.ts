import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EventsModule } from './events/events.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmConfig } from 'typeorm.config';
import { EmbeddingsModule } from './embeddings/embeddings.module';
import { PineconeModule } from './pinecone/pinecone.module';
import { ConfigModule } from '@nestjs/config';
import configuration from './config/configuration';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    TypeOrmModule.forRoot(typeOrmConfig),
    EventsModule,
    EmbeddingsModule,
    PineconeModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

import {
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
} from '@nestjs/common';

import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { SearchEventDto, SearchResponseDto } from './dto/search-event.dto';
import { Event } from './entities/event.entity';

@Controller('events')
export class EventsController {
  private readonly logger = new Logger(EventsController.name);

  constructor(private readonly eventsService: EventsService) {}

  @Post()
  async create(@Body() dto: CreateEventDto): Promise<Event> {
    this.logger.log(`POST /events — title: "${dto.title}"`);
    return this.eventsService.create(dto);
  }

  @Get()
  async findAll(): Promise<Event[]> {
    return this.eventsService.findAll();
  }

  @Get('search')
  async search(@Query() dto: SearchEventDto): Promise<SearchResponseDto> {
    this.logger.log(`GET /events/search — query: "${dto.query}"`);
    return this.eventsService.search(dto);
  }

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<Event> {
    return this.eventsService.findOne(id);
  }
}

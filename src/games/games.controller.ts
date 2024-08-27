import {
  BadRequestException,
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { GamesService } from './games.service';
import { GameStatus } from './entities';
import { GameDto } from './dtos/game.dto';
import { validate as isUUID } from 'uuid';

@Controller('games')
export class GamesController {
  constructor(private readonly gameService: GamesService) {}

  @Get(':id')
  async findOne(@Param('id') id: string) {
    // check if the id is valid uuid
    if (!isUUID(id)) {
      throw new BadRequestException('Invalid UUID format');
    }
    // Find the game by id and throw NotFoundException if not found
    const game = await this.gameService.findOneGame(id);
    if (!game) {
      throw new NotFoundException(`Game with id "${id}" not found`);
    }

    return game;
  }

  @Get()
  async findAll(@Query() query: { status?: GameStatus }): Promise<GameDto[]> {
    // Check game status
    if (
      query.status &&
      !Object.values(GameStatus).includes(query.status as GameStatus)
    ) {
      throw new BadRequestException('Invalid game status');
    }

    // Pass the filter to the service method
    const games = await this.gameService.findAll(
      query.status ? { status: query.status } : undefined,
    );

    // Map entities to DTOs
    return games.map((game) => ({
      id: game.id,
      status: game.status,
      rows: game.rows,
      columns: game.columns,
    }));
  }

  @Post()
  async create(@Body() body: { rows: number; columns: number }) {
    const { rows, columns } = body;
    if (rows <= 0 || columns <= 0) {
      throw new BadRequestException('Invalid grid size');
    }

    const game = await this.gameService.createGame(rows, columns);
    return { success: true, gameId: game.id };
  }
}

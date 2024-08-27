import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { GamesController } from './games.controller';
import { GamesService } from './games.service';
import { Game, GameCell } from './entities';

@Module({
  imports: [TypeOrmModule.forFeature([Game, GameCell])],
  controllers: [GamesController],
  providers: [GamesService],
  exports: [GamesService],
})
export class GamesModule {}

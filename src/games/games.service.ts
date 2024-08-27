import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { BadRequestException, Injectable } from '@nestjs/common';
import { Game, GameCell, GameStatus } from './entities';

@Injectable()
export class GamesService {
  constructor(
    @InjectRepository(Game)
    private gamesRepository: Repository<Game>,

    @InjectRepository(GameCell)
    private gameCellsRepository: Repository<GameCell>,
  ) {}

  async findOneGame(id: string) {
    return this.gamesRepository.findOneBy({ id });
  }
  async findAll(filter?: { status?: GameStatus }): Promise<Game[]> {
    return this.gamesRepository.find(filter ? { where: filter } : {});
  }

  async createGame(rows: number, columns: number): Promise<Game> {
    if (rows <= 0 || columns <= 0) {
      throw new BadRequestException('Invalid grid size');
    }

    const game = new Game();
    game.rows = rows;
    game.columns = columns;
    game.status = GameStatus.Pending;
    const savedGame = await this.gamesRepository.save(game);

    // Generate cells
    const totalCells = rows * columns;
    const bombCount = Math.floor(totalCells * 0.2); // 20% bombs

    // Create cells
    const cells: GameCell[] = [];
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < columns; col++) {
        const cell = new GameCell();
        cell.xCoordinate = col;
        cell.yCoordinate = row;
        cell.isMine = Math.random() < bombCount / totalCells;
        cell.game = savedGame;
        cells.push(cell);
      }
    }

    // Save cells
    await this.gameCellsRepository.save(cells);

    // Compute neighboring bomb counts
    await this.updateNeighboringBombCounts(savedGame);

    return savedGame;
  }

  private async updateNeighboringBombCounts(game: Game) {
    const cells = await this.gameCellsRepository.find({ where: { game } });

    for (const cell of cells) {
      const neighbors = this.getNeighbors(cell, game.rows, game.columns);
      const bombCount = (await Promise.all(neighbors)).filter(
        (neighbor) => neighbor.isMine,
      ).length;
      cell.neighboringBombCount = bombCount;
      await this.gameCellsRepository.save(cell);
    }
  }

  private getNeighbors(cell: GameCell, rows: number, columns: number) {
    const neighbors = [];
    const directions = [
      [-1, -1],
      [-1, 0],
      [-1, 1],
      [0, -1],
      [0, 1],
      [1, -1],
      [1, 0],
      [1, 1],
    ];

    for (const [dx, dy] of directions) {
      const newRow = cell.yCoordinate + dy;
      const newCol = cell.xCoordinate + dx;
      if (newRow >= 0 && newRow < rows && newCol >= 0 && newCol < columns) {
        neighbors.push(
          this.gameCellsRepository.findOne({
            where: {
              xCoordinate: newCol,
              yCoordinate: newRow,
              game: cell.game,
            },
          }),
        );
      }
    }

    return neighbors;
  }
}

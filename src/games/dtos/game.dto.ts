import { GameStatus } from '../entities';

export class GameDto {
  id: string;
  status: GameStatus;
  rows: number;
  columns: number;
}

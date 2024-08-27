import { Test, TestingModule } from '@nestjs/testing';
import { GamesController } from './games.controller';
import { GamesService } from './games.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Game, GameCell, GameStatus } from './entities';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('GamesController', () => {
  let gamesController: GamesController;
  let gamesService: GamesService;

  const mockGamesRepository = {
    find: jest.fn(),
    findOneBy: jest.fn(),
    save: jest.fn(),
  };

  const mockGameCellsRepository = {
    findOneBy: jest.fn(),
    find: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [GamesController],
      providers: [
        GamesService,
        {
          provide: getRepositoryToken(Game),
          useValue: mockGamesRepository,
        },
        {
          provide: getRepositoryToken(GameCell),
          useValue: mockGameCellsRepository,
        },
      ],
    }).compile();

    gamesController = app.get<GamesController>(GamesController);
    gamesService = app.get<GamesService>(GamesService);
  });

  describe('findAll', () => {
    it('should return a list of games filtered by status', async () => {
      const statusFilter = GameStatus.Pending;
      const mockGames: Game[] = [
        { id: '1', status: GameStatus.Pending, rows: 5, columns: 5, cells: [] },
      ];

      // Mock the behavior for filtering
      mockGamesRepository.find.mockImplementation(({ where }) => {
        if (where?.status === statusFilter) {
          return Promise.resolve(mockGames);
        }
        return Promise.resolve([]);
      });

      const result = await gamesController.findAll({ status: statusFilter });

      expect(result).toEqual([
        { id: '1', status: GameStatus.Pending, rows: 5, columns: 5 },
      ]);
      expect(mockGamesRepository.find).toHaveBeenCalledWith({
        where: { status: statusFilter },
      });
    });
  });

  describe('findOne', () => {
    it('should return a game by id', async () => {
      const validUUID = '123e4567-e89b-12d3-a456-426614174000'; // Updated to use a valid UUID format
      const mockGame: Game = {
        id: validUUID,
        status: GameStatus.Pending,
        rows: 5,
        columns: 5,
        cells: [],
      };
      mockGamesRepository.findOneBy.mockResolvedValue(mockGame);

      const result = await gamesController.findOne(validUUID);

      expect(result).toEqual(mockGame);
      expect(mockGamesRepository.findOneBy).toHaveBeenCalledWith({
        id: validUUID,
      });
    });

    it('should throw NotFoundException if game not found', async () => {
      const validUUID = '123e4567-e89b-12d3-a456-426614174000'; // Updated to use a valid UUID format
      mockGamesRepository.findOneBy.mockResolvedValue(null);

      await expect(gamesController.findOne(validUUID)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException if UUID is invalid', async () => {
      await expect(gamesController.findOne('invalid-uuid')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('create', () => {
    it('should create and return a new game', async () => {
      const createGameDto = { rows: 5, columns: 5 };
      const mockGame: Game = {
        id: '1',
        status: GameStatus.Pending,
        rows: 5,
        columns: 5,
        cells: [],
      };
      const mockCells: GameCell[] = []; // Ensure this is an array

      mockGamesRepository.save.mockResolvedValue(mockGame);
      mockGameCellsRepository.save.mockResolvedValue(mockCells);

      // Mock behavior of find (to return cells)
      mockGameCellsRepository.find.mockResolvedValue(mockCells);

      const result = await gamesController.create(createGameDto);

      expect(result).toEqual({ success: true, gameId: '1' });
      expect(mockGamesRepository.save).toHaveBeenCalledWith(
        expect.objectContaining(createGameDto),
      );
      expect(mockGameCellsRepository.save).toHaveBeenCalled();
    });

    it('should throw BadRequestException for invalid grid size', async () => {
      const createGameDto = { rows: -1, columns: 5 };

      await expect(gamesController.create(createGameDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});

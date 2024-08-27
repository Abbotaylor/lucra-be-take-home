# Implementation Notes

## Overview

This project involves creating a game management system using NestJS and TypeORM. The system includes game creation, management of game cells, and filtering of games by status.

## Directory Structure

- There can be more improvements to the directory structure in the future
- **`src/`**
  - **`games/`**
    - **`games.controller.ts`** - Handles HTTP requests for game operations.
    - **`games.service.ts`** - Contains business logic for managing games and cells.
    - **`games.module.ts`** - Defines the game module.
  - **`games/dto/`**
    - **`game.dto.ts`** - Contains Data Transfer Objects for game data.
  - **`games/entities/`**
    - **`game.entity.ts`** - Defines the `Game` entity.
    - **`game-cell.entity.ts`** - Defines the `GameCell` entity.

**Recommendations**:

- Ensure consistency in naming conventions.
- Consider modularizing the `games` folder further as the project grows.
- Use a `utils/` or `common/` folder for shared functions.
- Organize tests to match the main code structure.

## Shuffling Algorithms

For distributing mines in the grid, use:

- **`cell.isMine = Math.random() < bombCount / totalCells`**: Randomly assigns mines based on the proportion of bombs.
- **Shuffling Logic**: Implement more sophisticated algorithms for even mine distribution, avoiding bias in random assignment.

## Test Cases

- **GamesController Tests**:

  - **`getAll()`**:
    - **Description**: Verifies that we can retrieve and filter games by status correctly.
    - **Tests**:
      - Checks if games are returned based on a provided status filter.
      - Ensures the `find` method of the repository is called with the correct parameters.
  - **`findOne()`**:
    - **Description**: Verifies that we can retrieve a game by its ID and handle cases where the game is not found.
    - **Tests**:
      - Returns a game when it exists.
      - Throws `NotFoundException` if the game does not exist.
  - **`create()`**:
    - **Description**: Ensures that a new game is created and returned correctly and handles invalid grid sizes.
    - **Tests**:
      - Creates a new game and returns a success response.
      - Throws `BadRequestException` if provided grid size is invalid.

- **GamesService Tests**:
  - **`createGame()`**: Validates that game and cell creation work as expected and that neighboring bomb counts are correctly calculated.
  - **`updateNeighboringBombCounts()`**: Checks that the count of neighboring bombs is updated accurately.

## Conclusion

The system is designed for managing grid-based games with features for creating games, managing cells, and filtering by status. The structure supports future growth, and testing ensures functionality for game management and cell operations.

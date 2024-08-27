import 'reflect-metadata';
import { join } from 'node:path';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Game, GameCell } from './games/entities';
import { GamesModule } from './games/games.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.POSTGRES_HOST,
      port: +process.env.POSTGRES_PORT,
      username: process.env.POSTGRES_USERNAME,
      password: process.env.POSTGRES_PASSWORD,
      database: process.env.POSTGRES_DBNAME,
      entities: [join(__dirname, './games/entities/*')],
      synchronize: true,
    }),
    TypeOrmModule.forFeature([Game, GameCell]),
    GamesModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}

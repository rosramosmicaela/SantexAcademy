import {
  Body,
  Controller,
  DefaultValuePipe,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Response } from 'express';
import { PlayersService } from './players.service';
import { PlayerDto } from './dto/player.dto';
import { CreatePlayerDto } from './dto/create-player.dto';
import { UpdatePlayerDto } from './dto/update-player.dto';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('players')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/players')
export class PlayersController {
  constructor(private readonly playersService: PlayersService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async getPlayers(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query('name') name?: string,
    @Query('club') club?: string,
    @Query('position') position?: string,
    @Query('fifaVersion') fifaVersion?: string,
  ) {
    const result = await this.playersService.getPlayers(
      { name, club, position, fifaVersion },
      page,
      limit,
    );
    return { ...result, items: result.items.map((p) => new PlayerDto(p)) };
  }

  // IMPORTANTE: esta ruta tiene que ir ANTES de ':id',
  // si no, Nest interpreta "export" como un id y da error.
  @Get('export')
  async exportPlayers(
    @Res() res: Response,
    @Query('name') name?: string,
    @Query('club') club?: string,
    @Query('position') position?: string,
    @Query('fifaVersion') fifaVersion?: string,
  ) {
    const players = await this.playersService.getAllFiltered({
      name,
      club,
      position,
      fifaVersion,
    });

    const escape = (value: unknown): string => {
      const text = String(value ?? '');
      return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
    };

    const header = [
      'id',
      'name',
      'club',
      'position',
      'nationality',
      'rating',
      'speed',
      'shooting',
      'dribbling',
      'passing',
    ];

    const lines = players.map((p) =>
      [
        p.id,
        p.name,
        p.club,
        p.position,
        p.nationality,
        p.rating,
        p.speed,
        p.shooting,
        p.dribbling,
        p.passing,
      ]
        .map(escape)
        .join(','),
    );

    // \uFEFF hace que Excel muestre bien los acentos
    const csv = '\uFEFF' + [header.join(','), ...lines].join('\n');

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="players.csv"');
    res.send(csv);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async getPlayerById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<PlayerDto | undefined> {
    const player = await this.playersService.getPlayerById(id);
    if (!player) {
      throw new NotFoundException(`Player with ID ${id} not found.`);
    }

    return new PlayerDto(player);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createPlayer(@Body() dto: CreatePlayerDto): Promise<PlayerDto> {
    const player = await this.playersService.createPlayer(dto);
    return new PlayerDto(player);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  async updatePlayer(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePlayerDto,
  ): Promise<PlayerDto> {
    const player = await this.playersService.updatePlayer(id, dto);
    if (!player) {
      throw new NotFoundException(`Player with ID ${id} not found.`);
    }
    return new PlayerDto(player);
  }
}
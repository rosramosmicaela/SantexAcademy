import { Inject, Injectable } from '@nestjs/common';
import {
  IPlayerRepository,
  PlayerFilters,
} from './interfaces/player-repository.interface';
import { Player } from './entities/player.entity';

@Injectable()
export class PlayersService {
  constructor(
    @Inject('IPlayerRepository')
    private readonly playerRepository: IPlayerRepository,
  ) {}

  getPlayerById(id: number): Promise<Player | undefined> {
    return this.playerRepository.findOneById(id);
  }

  async getPlayers(filters: PlayerFilters, page: number, limit: number) {
    const safePage = Math.max(1, page);
    const safeLimit = Math.min(Math.max(1, limit), 100);

    const { rows, total } = await this.playerRepository.findPaginated(
      filters,
      safePage,
      safeLimit,
    );

    return {
      items: rows,
      total,
      page: safePage,
      limit: safeLimit,
      totalPages: Math.ceil(total / safeLimit),
    };
  }

  // Trae TODOS los jugadores que cumplen los filtros (sin paginar),
    createPlayer(data: Partial<Player>): Promise<Player> {
    return this.playerRepository.create(data);
  }

  updatePlayer(id: number, data: Partial<Player>): Promise<Player | undefined> {
    return this.playerRepository.update(id, data);
  }
  // pidiendo de a 100 hasta completar. Tope de seguridad: 20000.
  async getAllFiltered(filters: PlayerFilters): Promise<Player[]> {
    const MAX_ROWS = 20000;
    const PAGE_SIZE = 100;
    const all: Player[] = [];
    let page = 1;

    while (all.length < MAX_ROWS) {
      const { rows, total } = await this.playerRepository.findPaginated(
        filters,
        page,
        PAGE_SIZE,
      );
      all.push(...rows);
      if (rows.length === 0 || all.length >= total) break;
      page++;
    }

    return all;
  }
}
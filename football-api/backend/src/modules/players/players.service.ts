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
}
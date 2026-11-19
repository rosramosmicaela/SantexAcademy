import { Player } from '../entities/player.entity';

export interface PlayerFilters {
  name?: string;
  club?: string;
  position?: string;
  fifaVersion?: string;
}

export interface PlayersPage {
  rows: Player[];
  total: number;
}

export interface IPlayerRepository {
  findAll(): Promise<Player[]>;
  findOneById(id: number): Promise<Player | undefined>;
    create(data: Partial<Player>): Promise<Player>;
  update(id: number, data: Partial<Player>): Promise<Player | undefined>;
  findPaginated(
    filters: PlayerFilters,
    page: number,
    limit: number,
  ): Promise<PlayersPage>;
}
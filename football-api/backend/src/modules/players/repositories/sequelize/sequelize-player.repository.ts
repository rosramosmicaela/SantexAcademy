import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { PlayerModel } from './player.model'; // Sequelize model
import { Op, WhereOptions } from 'sequelize';
import {
  IPlayerRepository,
  PlayerFilters,
  PlayersPage,
} from '../../interfaces/player-repository.interface';
import { Player } from '../../entities/player.entity';

@Injectable()
export class SequelizePlayerRepository implements IPlayerRepository {
  constructor(
    @InjectModel(PlayerModel)
    private readonly playerModel: typeof PlayerModel,
  ) {}

  async findAll(): Promise<Player[]> {
    const playerList = await this.playerModel.findAll();
    return playerList.map((x) => this.mapToEntity(x));
  }
  async findPaginated(
    filters: PlayerFilters,
    page: number,
    limit: number,
  ): Promise<PlayersPage> {
    const conditions: WhereOptions[] = [];

    if (filters.name) {
      conditions.push({ longName: { [Op.like]: `%${filters.name}%` } });
    }
    if (filters.club) {
      conditions.push({ clubName: { [Op.like]: `%${filters.club}%` } });
    }
    if (filters.position) {
      conditions.push({
        playerPositions: { [Op.like]: `%${filters.position}%` },
      });
    }
    if (filters.fifaVersion) {
      conditions.push({ fifaVersion: filters.fifaVersion });
    }

    const { rows, count } = await this.playerModel.findAndCountAll({
      where: { [Op.and]: conditions },
      limit,
      offset: (page - 1) * limit,
      order: [
        ['overall', 'DESC'],
        ['id', 'ASC'],
      ],
    });

    return { rows: rows.map((x) => this.mapToEntity(x)), total: count };
  }
  async findOneById(id: number): Promise<Player | undefined> {
    const model = await this.playerModel.findByPk(id);
    if (!model) {
      return undefined;
    }
    return this.mapToEntity(model);
  }

  private mapToEntity(model: PlayerModel): Player {
    if (!model) {
      throw new Error('Attempted to map null model to Player entity');
    }
    const player = new Player();
    player.id = model.id;
    player.name = model.longName;
    player.club = model.clubName || 'Unknown Club';
    player.position = model.playerPositions?.split(',')[0].trim() ?? 'Unknown';
    player.nationality = model.nationalityName || 'Unknown Nationality';
    player.rating = model.overall;
    player.speed = model.pace ?? 0;
    player.shooting = model.shooting ?? 0;
    player.dribbling = model.dribbling ?? 0;
    player.passing = model.passing ?? 0;
    player.defending = model.defending ?? 0;
    player.physic = model.physic ?? 0;
    player.fifaVersion = model.fifaVersion;

    return player;
  }
}

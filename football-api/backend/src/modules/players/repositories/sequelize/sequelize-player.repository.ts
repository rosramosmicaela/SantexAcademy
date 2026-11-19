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
    async create(data: Partial<Player>): Promise<Player> {
    const rating = data.rating ?? 50;
    const created = await this.playerModel.create({
      fifaVersion: data.fifaVersion ?? '23',
      fifaUpdate: '1',
      playerFaceUrl: '',
      longName: data.name,
      playerPositions: data.position,
      clubName: data.club,
      nationalityName: data.nationality,
      overall: rating,
      potential: rating,
      age: 25,
      pace: data.speed ?? 0,
      shooting: data.shooting ?? 0,
      dribbling: data.dribbling ?? 0,
      passing: data.passing ?? 0,
      defending: data.defending ?? 0,
      physic: data.physic ?? 0,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);
    return this.mapToEntity(created);
  }

  async update(
    id: number,
    data: Partial<Player>,
  ): Promise<Player | undefined> {
    const model = await this.playerModel.findByPk(id);
    if (!model) {
      return undefined;
    }
    if (data.name !== undefined) model.longName = data.name;
    if (data.club !== undefined) model.clubName = data.club;
    if (data.position !== undefined) model.playerPositions = data.position;
    if (data.nationality !== undefined)
      model.nationalityName = data.nationality;
    if (data.rating !== undefined) model.overall = data.rating;
    if (data.speed !== undefined) model.pace = data.speed;
    if (data.shooting !== undefined) model.shooting = data.shooting;
    if (data.dribbling !== undefined) model.dribbling = data.dribbling;
    if (data.passing !== undefined) model.passing = data.passing;
    if (data.defending !== undefined) model.defending = data.defending;
    if (data.physic !== undefined) model.physic = data.physic;
    await model.save();
    return this.mapToEntity(model);
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

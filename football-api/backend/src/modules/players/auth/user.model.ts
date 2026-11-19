import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  AutoIncrement,
  Unique,
} from 'sequelize-typescript';

@Table({ tableName: 'users', timestamps: false })
export class UserModel extends Model<UserModel> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare id: number;

  @Unique
  @Column({ type: DataType.STRING(100), allowNull: false })
  declare username: string;

  @Column({ field: 'password_hash', type: DataType.STRING, allowNull: false })
  declare passwordHash: string;
}
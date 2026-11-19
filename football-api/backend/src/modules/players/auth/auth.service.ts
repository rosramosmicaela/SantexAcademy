import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { JwtService } from '@nestjs/jwt';
import { randomBytes, scryptSync, timingSafeEqual } from 'crypto';
import { UserModel } from './user.model';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(UserModel)
    private readonly userModel: typeof UserModel,
    private readonly jwtService: JwtService,
  ) {}

  private hash(password: string): string {
    const salt = randomBytes(16).toString('hex');
    const hash = scryptSync(password, salt, 64).toString('hex');
    return `${salt}:${hash}`;
  }

  private verify(password: string, stored: string): boolean {
    const [salt, hash] = stored.split(':');
    const candidate = scryptSync(password, salt, 64);
    return timingSafeEqual(candidate, Buffer.from(hash, 'hex'));
  }

  async register(username: string, password: string) {
    const exists = await this.userModel.findOne({ where: { username } });
    if (exists) {
      throw new ConflictException('El usuario ya existe');
    }
    const user = await this.userModel.create({
      username,
      passwordHash: this.hash(password),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);
    return { id: user.id, username: user.username };
  }

  async login(username: string, password: string) {
    const user = await this.userModel.findOne({ where: { username } });
    if (!user || !this.verify(password, user.passwordHash)) {
      throw new UnauthorizedException('Usuario o contraseña incorrectos');
    }
    const accessToken = await this.jwtService.signAsync({
      sub: user.id,
      username: user.username,
    });
    return { accessToken };
  }
}
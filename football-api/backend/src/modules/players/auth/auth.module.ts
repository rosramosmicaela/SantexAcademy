import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { SequelizeModule } from '@nestjs/sequelize';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserModel } from './user.model';

@Module({
  imports: [
    SequelizeModule.forFeature([UserModel]),
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET || 'dev-secret-cambiar',
      signOptions: { expiresIn: 60 * 60 * 8 },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
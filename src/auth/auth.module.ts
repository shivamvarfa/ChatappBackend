import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { UserModule } from '../user/user.module';
import { UserService } from 'src/user/user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/user/user.entity';
import { JwtStrategy } from './jwt.strategy';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: 'secretkey', 
      signOptions: { expiresIn: '1h' }, 
    }),
    UserModule,
    TypeOrmModule.forFeature([User])
  ],
  providers: [AuthService,UserService,JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}


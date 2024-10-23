import { Module } from "@nestjs/common";
import { PassportModule } from "@nestjs/passport";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "./user.entity";
import { JwtModule } from "@nestjs/jwt";
import { UserService } from "./user.service";
import { UserResolver } from "./user.resolver";
import { AuthService } from "src/auth/auth.service";


@Module({
  imports: [TypeOrmModule.forFeature([User]), PassportModule.register({ defaultStrategy: 'jwt' }),
  JwtModule.register({
    secret: 'secretkey', 
    signOptions: { expiresIn: '1h' }, 
  }),],
  providers: [UserService,UserResolver,AuthService],
  exports:[UserService,UserResolver]
})
export class UserModule {}

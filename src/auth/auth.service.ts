import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '../user/user.entity';
import * as bcrypt from 'bcrypt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as jwt from 'jsonwebtoken';
import { LoginResponse } from 'src/user/user.resolver';

@Injectable()
export class AuthService {
  private readonly JWT_SECRET='secretkey';
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.userRepository.findOne({
        where: { email }
      });
    if (user && await bcrypt.compare(password, user.password)) {
      return user;
    }
    return null;
  }

  async login(id:string,user: User):Promise<LoginResponse> {
    await this.userRepository.update(id, {
      isLogin:true,
    });
    const payload = { id:user.id,email:user.email };
    return {
      access_token: this.jwtService.sign(payload),
      id:payload.id,
    };
  }

  async verifyTokenMutation(token: string): Promise<{ valid: boolean}> {
    try {
      // Verify the token and decode its payload
      const decoded = jwt.verify(token, this.JWT_SECRET);
      return { valid: true };
    } catch (error) {
      console.error('Token verification failed:', error);
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}

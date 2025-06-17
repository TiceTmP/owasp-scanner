import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}
  googleLogin(req: any) {
    if (!req.user) {
      return 'No user from google';
    }
    return {
      message: 'User info from google',
      user: req.user,
    };
  }

  lineLogin(req: any) {
    if (!req.user) {
      return 'No user from LINE';
    }
    return {
      message: 'User info from LINE',
      user: req.user,
    };
  }

  microsoftLogin(req: any) {
    if (!req.user) {
      return 'No user from Microsoft';
    }
    return {
      message: 'User from Microsoft',
      user: req.user,
    };
  }

  async login(body: { email: string; password: string }) {
    const { email, password } = body;
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      return 'User not found';
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return 'Invalid credentials';
    }
    return {
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
      },
    };
  }

  async createAdminUser() {
    const isExist = await this.userRepository.findOne({
      where: { email: 'admin@mail.com' },
    });

    if (isExist) {
      return 'Admin user already exists';
    }
    const password = await bcrypt.hash('password', 10);
    await this.userRepository.insert({
      email: 'admin@mail.com',
      password,
    });

    return 'Admin user created successfully';
  }
}

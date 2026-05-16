import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import * as bcrypt from 'bcrypt';
import { PrismaService } from 'src/prisma/prisma.service';
import { Role } from 'src/generated/prisma/enums';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(registerDto: RegisterDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: registerDto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email already in use');
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 12);

    const user = await this.prisma.user.create({
      data: {
        email: registerDto.email,
        password: hashedPassword,
        firstname: registerDto.firstname,
        lastname: registerDto.lastname,
      },
    });

    return user;
  }

  // This method is used by the LocalStrategy to validate user credentials
  async validateUser(email: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        email: email,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordMatched = await bcrypt.compare(password, user.password);

    if (!isPasswordMatched) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return {
      userId: user.id,
      role: user.role,
    };
  }

  async generateTokens(userId: string, role: Role) {
    const accessToken = await this.jwtService.signAsync({
      sub: userId,
      role,
    });

    const refreshToken = await this.jwtService.signAsync(
      {
        sub: userId,
      },
      {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
        expiresIn: this.configService.get('REFRESH_TOKEN_EXPIRES'),
      },
    );

    // store refresh token in database
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 12);
    await this.prisma.refreshToken.create({
      data: {
        userId: userId,
        tokenHash: hashedRefreshToken,
        expiresAt: new Date(
          Date.now() + this.configService.get('REFRESH_TOKEN_EXPIRES') * 1000,
        ),
      },
    });

    return {
      accessToken,
      refreshToken,
    };
  }

  async refreshTokens(userId: string, refreshToken: string) {
    const userTokens = await this.prisma.refreshToken.findMany({
      where: {
        userId: userId,
        revoked: false,
        expiresAt: { gte: new Date() }, // unexpired tokens only
      },
    });

    let validTokenRecord: any = null;
    for (const tokenRecord of userTokens) {
      const isMatched = await bcrypt.compare(
        refreshToken,
        tokenRecord.tokenHash,
      );
      if (isMatched) {
        validTokenRecord = tokenRecord;
        break;
      }
    }

    if (!validTokenRecord) {
      throw new UnauthorizedException('Access Denied / Invalid Refresh Token');
    }

    // revoke the used refresh token (refresh token rotation)
    await this.prisma.refreshToken.update({
      where: { id: validTokenRecord.id },
      data: { revoked: true },
    });

    // generate new tokens
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    
    return this.generateTokens(user.id, user.role);
  }
}

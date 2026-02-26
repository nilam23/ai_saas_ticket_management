import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from 'src/modules/user/types/user.type';

@Injectable()
export class JwtApplicationService {
  constructor(private readonly jwtService: JwtService) {}

  public generateToken(payload: JwtPayload): string {
    return this.jwtService.sign(payload);
  }

  public verifyToken(token: string): JwtPayload {
    return this.jwtService.verify(token);
  }
}

import * as jwt from 'jsonwebtoken';
import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, Inject, forwardRef } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Socket } from 'socket.io';
import { Client, getClient } from 'src/common/utils/get-client';
import { AuthService } from '../auth.service';
import { ERROR_MESSAGES } from 'src/common/constants/errorMessage';

export interface Token {
  sub: string;
  provider: string;
  providerId: string;
  timestamp: number;
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  reflector: Reflector;

  constructor(private readonly authService: AuthService) {
    this.reflector = new Reflector();
  }

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const client = this.getRequest(ctx);
    const allowAny = this.reflector.get<boolean>('allow-any', ctx.getHandler());
    try {
      client.user = await this.handleRequest(ctx, client);
    } catch (e) {
      if (allowAny) {
        return true;
      }

      throw e;
    }

    return client.user != null;
  }

  private async handleRequest(ctx: ExecutionContext, client: Client) {
    const token = this.getToken(ctx, client);

    const decodedToken = jwt.decode(token) as Token;
    const isExistedToken = await this.authService.checkIsExistedToken(token);

    if (!isExistedToken) {
      this.throwException(ctx, ERROR_MESSAGES.auth.INVALID_CREDENTIALS.message);
    }
    if (!decodedToken) {
      this.throwException(ctx, ERROR_MESSAGES.auth.INVALID_CREDENTIALS.message);
    }

    try {
      const user = await this.validate(decodedToken);
      // Verifying authorization token
      await jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

      return user;
    } catch (e) {
      this.throwException(ctx, ERROR_MESSAGES.common.INTERNAL_SERVER_ERROR.message);
    }
  }

  private validate({ sub }: Token) {
    return this.authService.findUserById(sub);
  }

  private getToken(ctx: ExecutionContext, client: Client): string {
    const authorization = client.headers.authorization?.split(' ');

    if (!authorization) {
      this.throwException(ctx, ERROR_MESSAGES.auth.INVALID_CREDENTIALS.message);
    }

    if (authorization[0].toLowerCase() !== 'bearer') {
      this.throwException(ctx, ERROR_MESSAGES.auth.INVALID_CREDENTIALS.message);
    }

    if (!authorization[1]) {
      this.throwException(ctx, ERROR_MESSAGES.auth.INVALID_CREDENTIALS.message);
    }
    return authorization[1];
  }

  throwException(ctx: ExecutionContext, message: string) {
    if (ctx.getType() === 'ws') {
      ctx.switchToWs().getClient<Socket>().disconnect(true);
    }

    throw new UnauthorizedException(message);
  }

  private getRequest(ctx: ExecutionContext) {
    return getClient(ctx);
  }
}

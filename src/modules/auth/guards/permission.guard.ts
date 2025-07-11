import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';

@Injectable()
export class SelfOrAdminGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const req = context.switchToHttp().getRequest();
    const user = req.user;
    const selfKey = this.reflector.get<string>('selfKey', context.getHandler()) || 'user';
    const userId = req.params.userId || req.body[selfKey];
    const hasPermission = user.roles.some((role) => role == 'ADMIN') || user.roles.some((role) => role == 'MANAGER') || user._id.toString() == userId;

    return hasPermission;
  }
}

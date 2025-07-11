import { Controller, Get, UseGuards, VERSION_NEUTRAL } from '@nestjs/common';
import { AppService } from './app.service';
import { JwtAuthGuard } from './modules/auth/guards/jwt-auth.guard';

@Controller({
  path: '/',
  version: VERSION_NEUTRAL
})
@UseGuards(JwtAuthGuard)
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getWelcome(): string {
    return this.appService.getWelcome();
  }
}

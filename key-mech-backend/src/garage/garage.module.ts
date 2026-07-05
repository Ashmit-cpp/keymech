import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { GarageController } from './garage.controller.js';
import { GarageService } from './garage.service.js';

@Module({
  imports: [AuthModule],
  controllers: [GarageController],
  providers: [GarageService],
  exports: [GarageService],
})
export class GarageModule {}

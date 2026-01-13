import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { TripsService } from './trips.service';
import { CreateTripDto } from './dto/create-trip.dto';
import { ClerkAuthGuard } from '../auth/clerk-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { ZodValidationPipe } from 'nestjs-zod';

@Controller('trips')
@UseGuards(ClerkAuthGuard)
export class TripsController {
  constructor(private readonly tripsService: TripsService) {}

  @Post()
  @UsePipes(ZodValidationPipe)
  create(@Body() createTripDto: CreateTripDto, @CurrentUser() user: any) {
    return this.tripsService.create(user.id, createTripDto);
  }

  @Get()
  findAll(@CurrentUser() user: any) {
    return this.tripsService.findAll(user.id);
  }
}

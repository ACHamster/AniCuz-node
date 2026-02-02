import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { Public } from '../../common/decorators/public.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { StoreService } from './store.service';

@Controller('store')
@UseGuards(JwtAuthGuard)
export class StoreController {
  constructor(private readonly storeService: StoreService) {}

  @Public()
  @Get('items')
  async getItemsOnSale(@Query('type') type: string) {
    return this.storeService.getItemsOnSale(type);
  }
}

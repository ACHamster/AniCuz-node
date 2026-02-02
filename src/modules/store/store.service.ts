import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class StoreService {
  constructor(private prisma: PrismaService) {}

  async getItemsOnSale(type?: string) {
    const where: Record<string, unknown> = { isOnSale: true };
    if (type) {
      where.type = type;
    }
    return this.prisma.item.findMany({ where });
  }
}

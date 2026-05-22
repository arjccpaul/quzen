import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBusinessDto } from './dto/create-business.dto';
import { CreateCategoryDto } from './dto/create-category.dto';
import { Sector } from '@prisma/client';
import { SECTOR_DEFAULT_CATEGORIES } from './sector-defaults';

@Injectable()
export class BusinessService {
  constructor(private prisma: PrismaService) {}

  async create(ownerId: string, dto: CreateBusinessDto) {
    const business = await this.prisma.business.create({
      data: { ...dto, ownerId },
    });

    const defaults = SECTOR_DEFAULT_CATEGORIES[dto.sector] ?? [];
    if (defaults.length > 0) {
      await this.prisma.serviceCategory.createMany({
        data: defaults.map((c) => ({
          businessId: business.id,
          name: c.name,
          avgDurationMinutes: c.avgDurationMinutes,
          isActive: true,
        })),
      });
    }

    return this.prisma.business.findUnique({
      where: { id: business.id },
      include: { categories: true },
    });
  }

  async findAll(sector?: Sector, city?: string) {
    return this.prisma.business.findMany({
      where: {
        isActive: true,
        ...(sector && { sector }),
        ...(city && { city: { contains: city, mode: 'insensitive' } }),
      },
      include: { categories: { where: { isActive: true } } },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    const business = await this.prisma.business.findUnique({
      where: { id },
      include: { categories: { orderBy: [{ isActive: 'desc' }, { name: 'asc' }] } },
    });
    if (!business) throw new NotFoundException('Business not found');
    return business;
  }

  async addCategory(businessId: string, ownerId: string, dto: CreateCategoryDto) {
    const business = await this.prisma.business.findUnique({ where: { id: businessId } });
    if (!business) throw new NotFoundException('Business not found');
    if (business.ownerId !== ownerId) throw new ForbiddenException();

    return this.prisma.serviceCategory.create({
      data: { businessId, name: dto.name, avgDurationMinutes: dto.avgDurationMinutes ?? 10 },
    });
  }

  async getMyBusinesses(ownerId: string) {
    return this.prisma.business.findMany({
      where: { ownerId },
      include: { categories: true },
    });
  }

  async toggleCategory(categoryId: string, ownerId: string) {
    const category = await this.prisma.serviceCategory.findUnique({
      where: { id: categoryId },
      include: { business: true },
    });
    if (!category) throw new NotFoundException('Category not found');
    if (category.business.ownerId !== ownerId) throw new ForbiddenException();

    return this.prisma.serviceCategory.update({
      where: { id: categoryId },
      data: { isActive: !category.isActive },
    });
  }
}

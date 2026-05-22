import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { BusinessService } from './business.service';
import { CreateBusinessDto } from './dto/create-business.dto';
import { CreateCategoryDto } from './dto/create-category.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Sector } from '@prisma/client';

@Controller('businesses')
export class BusinessController {
  constructor(private businessService: BusinessService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('BUSINESS_OWNER')
  @Post()
  create(@CurrentUser() user: any, @Body() dto: CreateBusinessDto) {
    return this.businessService.create(user.id, dto);
  }

  @Get()
  findAll(@Query('sector') sector?: Sector, @Query('city') city?: string) {
    return this.businessService.findAll(sector, city);
  }

  @Get('my')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('BUSINESS_OWNER')
  getMyBusinesses(@CurrentUser() user: any) {
    return this.businessService.getMyBusinesses(user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.businessService.findOne(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('BUSINESS_OWNER')
  @Post(':id/categories')
  addCategory(
    @Param('id') businessId: string,
    @CurrentUser() user: any,
    @Body() dto: CreateCategoryDto,
  ) {
    return this.businessService.addCategory(businessId, user.id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('BUSINESS_OWNER')
  @Patch('categories/:categoryId/toggle')
  toggleCategory(@Param('categoryId') categoryId: string, @CurrentUser() user: any) {
    return this.businessService.toggleCategory(categoryId, user.id);
  }
}

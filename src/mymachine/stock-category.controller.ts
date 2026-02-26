import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { CreateStockCategoryDto, UpdateStockCategoryDto } from './dto/stock-category.dto';
import { StockCategoryService } from './stock-category.service';

@Controller('mymachine/categories')
export class StockCategoryController {
    constructor(private readonly stockCategoryService: StockCategoryService) { }

    @Get()
    findAll() {
        return this.stockCategoryService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.stockCategoryService.findOne(id);
    }

    @Post()
    create(@Body() dto: CreateStockCategoryDto) {
        return this.stockCategoryService.create(dto);
    }

    @Put(':id')
    update(@Param('id') id: string, @Body() dto: UpdateStockCategoryDto) {
        return this.stockCategoryService.update(id, dto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.stockCategoryService.remove(id);
    }
}

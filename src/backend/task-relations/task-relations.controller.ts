import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Post,
    UseGuards,
} from '@nestjs/common';
import { TaskRelationsService } from './task-relations.service';
import { Roles } from '@backend/auth/roles-auth.decorator';
import { CreateTaskRelationDto } from './dto/create-task-relation.dto';
import { RolesGuard } from '@backend/auth/guards/roles.guard';
import { AccessTokenGuard } from '@backend/auth/guards/accessToken.guard';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { TaskRelation } from './task-relations.model';

@ApiTags('Task relations')
@Controller('task-relations')
@Roles('admin')
@UseGuards(RolesGuard, AccessTokenGuard)
export class TaskRelationsController {
    constructor(private taskRelationsService: TaskRelationsService) { }

    @ApiOperation({ summary: 'Create task relation' })
    @ApiResponse({ status: 200, type: TaskRelation })
    @ApiBody({ type: CreateTaskRelationDto })
    
    @Post()
    create(@Body() dto: CreateTaskRelationDto): Promise<TaskRelation> {
        return this.taskRelationsService.createTaskRelation(dto);
    }

    @ApiOperation({ summary: 'Delete task relation' })
    @ApiResponse({ status: 200, type: Number })
    @Roles('admin')
    @UseGuards(RolesGuard)
    @Delete('/:id')
    delete(@Param('id') id: number): Promise<number> {
        return this.taskRelationsService.deleteTaskRelation(id);
    }

    @ApiOperation({ summary: 'Get all task relations' })
    @ApiResponse({ status: 200, type: [TaskRelation] })
    @Get()
    getAll(): Promise<TaskRelation[]> {
        return this.taskRelationsService.getAllTaskCategories();
    }

    @ApiOperation({ summary: 'Update task relation' })
    @ApiResponse({ status: 200, type: Number })
    @Patch('/:id')
    update(
        @Param('id') id: number,
        @Body() taskRelationDto: CreateTaskRelationDto,
    ): Promise<number> {
        return this.taskRelationsService.updateTaskRelation(id, taskRelationDto);
    }
}

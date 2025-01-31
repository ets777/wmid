import { User } from '@backend/users/users.model';
import { ApiProperty } from '@nestjs/swagger';
import { BelongsToMany, Column, DataType, Model, Table } from 'sequelize-typescript';
import { UserRole } from './user-roles.model';
import { CreateRoleDto } from './dto/create-role.dto';

@Table({ tableName: 'roles', createdAt: false, updatedAt: false })
export class Role extends Model<Role, CreateRoleDto> {
    @ApiProperty({ example: 'admin', description: 'Код роли' })
    @Column({
        type: DataType.STRING,
        unique: true,
        allowNull: false,
    })
    declare code: string;
    
    @ApiProperty({ example: 'Админ', description: 'Название роли' })
    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    declare name: string;

    @BelongsToMany(() => User, () => UserRole)
    declare users: User[];
}
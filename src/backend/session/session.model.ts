import { User } from '@backend/users/users.model';
import { BelongsTo, Column, DataType, Table, Model, ForeignKey } from 'sequelize-typescript';
import { ISession } from './session.interface';
import { ApiProperty } from '@nestjs/swagger';

@Table({ tableName: 'user_sessions' })
export class Session extends Model<Session> implements ISession {
    @ApiProperty({
        example: 'Заправить кровать',
        description: 'Текст задания',
    })
    @Column({
        type: DataType.UUID,
        allowNull: false,
    })
    declare sessionId: string;

    @ApiProperty({
        example: '2026-01-01',
        description: 'Expire date',
    })
    @Column({
        type: DataType.DATE,
        allowNull: false,
    })
    declare expiresAt: Date;

    @ApiProperty({
        example: false,
        description: 'Is session valid',
    })
    @Column({
        type: DataType.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    })
    declare isValid: boolean;

    @ForeignKey(() => User)
    declare userId: number;

    @BelongsTo(() => User)
    declare user: User;
}

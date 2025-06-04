import { User } from '@backend/users/users.model';
import { BelongsTo, Column, DataType, Table, Model, ForeignKey } from 'sequelize-typescript';
import { ISession } from './session.interface';

@Table({ tableName: 'user_sessions' })
export class Session extends Model<Session> implements ISession {
    @Column({
        type: DataType.UUID,
        allowNull: false,
    })
    declare sessionId: string;

    @Column({
        type: DataType.DATE,
        allowNull: false,
    })
    declare expiresAt: Date;

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

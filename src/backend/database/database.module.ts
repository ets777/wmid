import { Module, Provider } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { createPool } from 'mysql2/promise';

export const DB_CONNECTION = 'DB_CONNECTION';

const getDatabaseProvider = (): Provider => ({
  provide: DB_CONNECTION,
  useValue: createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    timezone: process.env.DB_TIMEZONE,
  }),
});

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: `.${process.env.NODE_ENV}.env`,
    }),
  ],
  providers: [getDatabaseProvider()],
  exports: [getDatabaseProvider()],
})
export class DatabaseModule {}

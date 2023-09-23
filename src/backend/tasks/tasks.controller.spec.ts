import { Test, TestingModule } from '@nestjs/testing';
import { TasksService } from './tasks.service';
import { ConfigModule } from '@nestjs/config';
import { TasksController } from './tasks.controller';
import { TaskAppointmentService } from '../task-appointments/task-appointments.service';
import { TaskPeriodsService } from '../task-periods/task-periods.service';
import { TaskCategoriesService } from '../task-categories/task-categories.service';
import { AppointTaskParamsDto } from './dto/apointed-task-params.dto';
import { createPool } from 'mysql2/promise';
import { DB_CONNECTION } from '@backend/database/database.module';
import { appointNextTaskCases } from './tests/appoint-next-task';
import { appointDatedTaskCases } from './tests/appoint-dated-task';

const pool = createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME_TEST,
  timezone: process.env.DB_TIMEZONE,
});

describe('TasksController', () => {
  let controller: TasksController;
  let module: TestingModule;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          envFilePath: `.${process.env.NODE_ENV}.env`,
        }),
      ],
      providers: [
        TasksService,
        TaskAppointmentService,
        TaskPeriodsService,
        TaskCategoriesService,
        {
          provide: DB_CONNECTION,
          useValue: pool,
        },
      ],
      controllers: [TasksController],
    }).compile();

    controller = module.get<TasksController>(TasksController);
  });

  afterAll(async () => {
    await pool.end();
    await module.close();
  });

  describe('appoint', () => {
    describe('1. Цепочки заданий', () => {
      appointNextTaskCases.forEach((testCase) => {
        it(testCase.description, async () => {
          const dto: AppointTaskParamsDto = {
            currentTime: testCase.time,
            currentDate: testCase.date,
            testMode: true,
            lastAppointmentId: testCase.lastAppointmentId,
          };

          const result = await controller.appoint(dto);
          expect(result?.taskId).toEqual(testCase.expectedTaskId);
        });
      });
    });

    describe('2. Задания на время', () => {
      appointDatedTaskCases.forEach((testCase) => {
        it(testCase.description, async () => {
          const dto: AppointTaskParamsDto = {
            currentTime: testCase.time,
            currentDate: testCase.date,
            testMode: true,
          };

          const result = await controller.appoint(dto);
          expect(result?.taskId).toEqual(testCase.expectedTaskId);
        });
      });
    });
  });
});

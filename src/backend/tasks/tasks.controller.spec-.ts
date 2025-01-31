import { Test, TestingModule } from '@nestjs/testing';
import { TasksService } from './tasks.service';
import { ConfigModule } from '@nestjs/config';
import { TasksController } from './tasks.controller';
import { TaskAppointmentsService } from '../task-appointments/task-appointments.service';
import { TaskPeriodsService } from '../task-periods/task-periods.service';
import { TaskCategoriesService } from '../task-categories/task-categories.service';
import { appointNextTaskCases } from './tests/appoint-next-task';
import { appointDatedTaskCases } from './tests/appoint-dated-task';
import { appointRandomTaskCases } from './tests/appoint-random-task';

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
                TaskAppointmentsService,
                TaskPeriodsService,
                TaskCategoriesService,
            ],
            controllers: [TasksController],
        }).compile();

        controller = module.get<TasksController>(TasksController);
    });

    describe('appoint', () => {
        describe('1. Цепочки заданий', () => {
            appointNextTaskCases.forEach((testCase) => {
                it(testCase.description, async () => {
                    const result = await controller.appoint();
                    expect(result?.id).toEqual(testCase.expectedTaskId);
                });
            });
        });

        // describe('2. Задания на время', () => {
        //     appointDatedTaskCases.forEach((testCase) => {
        //         it(testCase.description, async () => {
        //             const result = await controller.appoint();
        //             expect(result?.id).toEqual(testCase.expectedTaskId);
        //         });
        //     });
        // });

        // describe('3. Случайные задания', () => {
        //     appointRandomTaskCases.forEach((testCase) => {
        //         it(testCase.description, async () => {
        //             const result = await controller.appoint(dto);
        //             expect(result?.id).toEqual(testCase.expectedTaskId);
        //         });
        //     });
        // });
    });
});

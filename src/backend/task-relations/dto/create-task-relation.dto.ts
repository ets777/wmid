import { TaskRelationType } from '@backend/task-relations/task-relations.enum';

export class CreateTaskRelationDto {
    mainTaskId: number;
    relatedTaskId: number;
    relationType: TaskRelationType;
}

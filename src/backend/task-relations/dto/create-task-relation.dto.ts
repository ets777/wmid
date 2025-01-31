import { TaskRelationType } from '../task-relations.enum';

export class CreateTaskRelationDto {
    mainTaskId: number;
    relatedTaskId: number;
    relationType: TaskRelationType;
}

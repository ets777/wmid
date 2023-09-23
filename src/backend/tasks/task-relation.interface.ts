import { TaskRelationType } from './tasks.enum';

export interface ITaskRelation {
  relatedTaskId: number;
  mainTaskId: number;
  relationType: TaskRelationType;
}

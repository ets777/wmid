export class AppointedTaskDto {
    taskId: number;
    text: string;
    appointmentId?: number;
    isCompleted?: boolean;
    additionalTasks?: {
        taskId: number;
        text: string;
        appointmentId?: number;
        isCompleted?: boolean;
    }[];
}

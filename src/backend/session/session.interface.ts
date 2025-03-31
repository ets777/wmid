export interface ISession {
    id?: number;
    sessionId: string;
    userId: number;
    expiresAt: Date;
    isValid: boolean;
}
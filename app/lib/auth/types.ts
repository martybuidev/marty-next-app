export type EUserRole = 'ADMIN' | 'USER';

export interface AuthUser {
    id: number;
    email: string;
    role: EUserRole;
}


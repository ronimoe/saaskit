interface User {
    id: string;
    email: string;
    full_name?: string;
    created_at: string;
    updated_at: string;
}
interface ApiResponse<T = unknown> {
    data?: T;
    error?: string;
    message?: string;
}

export type { ApiResponse, User };

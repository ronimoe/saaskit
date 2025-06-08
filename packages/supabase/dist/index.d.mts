import * as _supabase_supabase_js from '@supabase/supabase-js';
import { User, Session } from '@supabase/supabase-js';
import { CookieOptions } from '@supabase/ssr';

/**
 * Create a Supabase client for browser use
 * This client is used in Client Components and browser-side operations
 */
declare function createClient(): _supabase_supabase_js.SupabaseClient<any, "public", any>;
/**
 * Create a Supabase client for server use
 * This client is used in Server Components, API routes, and server-side operations
 * Requires Next.js cookies() function to be passed in
 */
declare function createServerClient(cookieStore: {
    getAll: () => {
        name: string;
        value: string;
    }[];
    set: (name: string, value: string, options?: CookieOptions) => void;
}): _supabase_supabase_js.SupabaseClient<any, "public", any>;
/**
 * Create a Supabase client with service role key for admin operations
 * Use with caution - only for server-side admin operations
 */
declare function createAdminClient(): _supabase_supabase_js.SupabaseClient<any, "public", any>;

/**
 * Database tables interface
 * This will be automatically generated from Supabase once schema is created
 */
interface Database {
    public: {
        Tables: {
            users: {
                Row: {
                    id: string;
                    email: string;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    email: string;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    email?: string;
                    created_at?: string;
                    updated_at?: string;
                };
            };
            products: {
                Row: {
                    id: string;
                    name: string;
                    description: string | null;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    name: string;
                    description?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    name?: string;
                    description?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
            };
            user_products: {
                Row: {
                    id: string;
                    user_id: string;
                    product_id: string;
                    role: string;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    user_id: string;
                    product_id: string;
                    role: string;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    user_id?: string;
                    product_id?: string;
                    role?: string;
                    created_at?: string;
                    updated_at?: string;
                };
            };
            subscriptions: {
                Row: {
                    id: string;
                    user_id: string;
                    product_id: string;
                    status: string;
                    current_period_start: string;
                    current_period_end: string;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    user_id: string;
                    product_id: string;
                    status: string;
                    current_period_start: string;
                    current_period_end: string;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    user_id?: string;
                    product_id?: string;
                    status?: string;
                    current_period_start?: string;
                    current_period_end?: string;
                    created_at?: string;
                    updated_at?: string;
                };
            };
        };
        Views: {
            [_ in never]: never;
        };
        Functions: {
            [_ in never]: never;
        };
        Enums: {
            [_ in never]: never;
        };
        CompositeTypes: {
            [_ in never]: never;
        };
    };
}
/**
 * Supabase client type with Database types
 */
type TypedSupabaseClient = ReturnType<typeof createClient>;
/**
 * Common user role types for multi-tenant architecture
 */
type UserRole = 'owner' | 'admin' | 'member' | 'viewer';
/**
 * Subscription status types
 */
type SubscriptionStatus = 'active' | 'canceled' | 'incomplete' | 'incomplete_expired' | 'past_due' | 'trialing' | 'unpaid';
/**
 * Utility type for table rows
 */
type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
/**
 * Utility type for table inserts
 */
type Inserts<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert'];
/**
 * Utility type for table updates
 */
type Updates<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update'];

/**
 * Authentication helper functions for Supabase
 */
/**
 * Get the current user from the Supabase client
 */
declare function getCurrentUser(supabase: TypedSupabaseClient): Promise<User | null>;
/**
 * Get the current session from the Supabase client
 */
declare function getCurrentSession(supabase: TypedSupabaseClient): Promise<Session | null>;
/**
 * Sign in with email and password
 */
declare function signInWithPassword(supabase: TypedSupabaseClient, email: string, password: string): Promise<{
    data: {
        user: User;
        session: Session;
        weakPassword?: _supabase_supabase_js.WeakPassword;
    } | {
        user: null;
        session: null;
        weakPassword?: null;
    };
    error: _supabase_supabase_js.AuthError | null;
}>;
/**
 * Sign up with email and password
 */
declare function signUpWithPassword(supabase: TypedSupabaseClient, email: string, password: string, options?: {
    emailRedirectTo?: string;
    data?: Record<string, any>;
}): Promise<{
    data: {
        user: User | null;
        session: Session | null;
    } | {
        user: null;
        session: null;
    };
    error: _supabase_supabase_js.AuthError | null;
}>;
/**
 * Sign in with OAuth provider
 */
declare function signInWithOAuth(supabase: TypedSupabaseClient, provider: 'google' | 'github' | 'apple' | 'azure' | 'bitbucket' | 'discord' | 'facebook' | 'figma' | 'gitlab' | 'linkedin' | 'notion' | 'slack' | 'spotify' | 'twitch' | 'twitter' | 'workos', options?: {
    redirectTo?: string;
    scopes?: string;
    queryParams?: Record<string, string>;
}): Promise<{
    data: {
        provider: _supabase_supabase_js.Provider;
        url: string;
    } | {
        provider: _supabase_supabase_js.Provider;
        url: null;
    };
    error: _supabase_supabase_js.AuthError | null;
}>;
/**
 * Sign out the current user
 */
declare function signOut(supabase: TypedSupabaseClient): Promise<{
    error: _supabase_supabase_js.AuthError | null;
}>;
/**
 * Reset password via email
 */
declare function resetPassword(supabase: TypedSupabaseClient, email: string, redirectTo?: string): Promise<{
    data: {} | null;
    error: _supabase_supabase_js.AuthError | null;
}>;
/**
 * Update user password
 */
declare function updatePassword(supabase: TypedSupabaseClient, password: string): Promise<{
    data: {
        user: User;
    } | {
        user: null;
    };
    error: _supabase_supabase_js.AuthError | null;
}>;
/**
 * Update user metadata
 */
declare function updateUserMetadata(supabase: TypedSupabaseClient, data: Record<string, any>): Promise<{
    data: {
        user: User;
    } | {
        user: null;
    };
    error: _supabase_supabase_js.AuthError | null;
}>;
/**
 * Check if user is authenticated
 */
declare function isAuthenticated(supabase: TypedSupabaseClient): Promise<boolean>;
/**
 * Get user ID if authenticated
 */
declare function getUserId(supabase: TypedSupabaseClient): Promise<string | null>;

/**
 * Storage utility functions for Supabase Storage
 */
/**
 * Upload a file to Supabase Storage
 */
declare function uploadFile(supabase: TypedSupabaseClient, bucket: string, path: string, file: File | Blob | ArrayBuffer | FormData, options?: {
    cacheControl?: string;
    contentType?: string;
    duplex?: string;
    upsert?: boolean;
}): Promise<{
    data: any;
    error: any;
}>;
/**
 * Download a file from Supabase Storage
 */
declare function downloadFile(supabase: TypedSupabaseClient, bucket: string, path: string): Promise<{
    data: any;
    error: any;
}>;
/**
 * Get a public URL for a file in Supabase Storage
 */
declare function getPublicUrl(supabase: TypedSupabaseClient, bucket: string, path: string, options?: {
    download?: boolean | string;
}): {
    publicUrl: string;
};
/**
 * Create a signed URL for a file with expiration
 */
declare function createSignedUrl(supabase: TypedSupabaseClient, bucket: string, path: string, expiresIn: number, options?: {
    download?: boolean | string;
}): Promise<{
    data: any;
    error: any;
}>;
/**
 * Create multiple signed URLs
 */
declare function createSignedUrls(supabase: TypedSupabaseClient, bucket: string, paths: string[], expiresIn: number, options?: {
    download: boolean | string;
}): Promise<{
    data: any;
    error: any;
}>;
/**
 * Delete a file from Supabase Storage
 */
declare function deleteFile(supabase: TypedSupabaseClient, bucket: string, paths: string[]): Promise<{
    data: any;
    error: any;
}>;
/**
 * List files in a bucket
 */
declare function listFiles(supabase: TypedSupabaseClient, bucket: string, path?: string, options?: {
    limit?: number;
    offset?: number;
    sortBy?: {
        column: 'name' | 'id' | 'updated_at' | 'created_at' | 'last_accessed_at';
        order: 'asc' | 'desc';
    };
    search?: string;
}): Promise<{
    data: any;
    error: any;
}>;
/**
 * Move a file within Supabase Storage
 */
declare function moveFile(supabase: TypedSupabaseClient, bucket: string, fromPath: string, toPath: string): Promise<{
    data: any;
    error: any;
}>;
/**
 * Copy a file within Supabase Storage
 */
declare function copyFile(supabase: TypedSupabaseClient, bucket: string, fromPath: string, toPath: string): Promise<{
    data: any;
    error: any;
}>;
/**
 * Get file metadata
 */
declare function getFileInfo(supabase: TypedSupabaseClient, bucket: string, path: string): Promise<{
    data: any;
    error: any;
}>;
/**
 * Create a bucket
 */
declare function createBucket(supabase: TypedSupabaseClient, id: string, options: {
    public: boolean;
    allowedMimeTypes?: string[];
    fileSizeLimit?: number;
}): Promise<{
    data: any;
    error: any;
}>;
/**
 * List all buckets
 */
declare function listBuckets(supabase: TypedSupabaseClient): Promise<{
    data: any;
    error: any;
}>;
/**
 * Delete a bucket
 */
declare function deleteBucket(supabase: TypedSupabaseClient, id: string): Promise<{
    data: any;
    error: any;
}>;

/**
 * Realtime utility functions for Supabase Realtime
 * Simplified version that works with the current Supabase client
 */
type DatabaseChangeEvent = 'INSERT' | 'UPDATE' | 'DELETE' | '*';
interface DatabaseChangePayload {
    schema: string;
    table: string;
    commit_timestamp: string;
    eventType: DatabaseChangeEvent;
    new?: Record<string, any>;
    old?: Record<string, any>;
    errors?: string[];
}
/**
 * Subscribe to database changes for a specific table
 * Returns a channel that can be unsubscribed from
 */
declare function subscribeToTable(supabase: TypedSupabaseClient, table: string, event: DatabaseChangeEvent | undefined, callback: (payload: any) => void, options?: {
    schema?: string;
    filter?: string;
}): _supabase_supabase_js.RealtimeChannel | null;
/**
 * Subscribe to row-level changes for a specific record
 */
declare function subscribeToRow(supabase: TypedSupabaseClient, table: string, rowId: string, callback: (payload: any) => void, options?: {
    schema?: string;
    event?: DatabaseChangeEvent;
}): _supabase_supabase_js.RealtimeChannel | null;
/**
 * Subscribe to user-specific changes across multiple tables
 */
declare function subscribeToUserChanges(supabase: TypedSupabaseClient, userId: string, tables: string[], callback: (payload: any) => void, options?: {
    schema?: string;
}): (_supabase_supabase_js.RealtimeChannel | null)[];
/**
 * Create a channel for custom realtime operations
 */
declare function createChannel(supabase: TypedSupabaseClient, channelName: string): _supabase_supabase_js.RealtimeChannel;
/**
 * Unsubscribe from a channel
 */
declare function unsubscribeChannel(supabase: TypedSupabaseClient, channel: any): Promise<"error" | "ok" | "timed out">;
/**
 * Clean up multiple channels
 */
declare function unsubscribeMultipleChannels(supabase: TypedSupabaseClient, channels: any[]): Promise<void>;
/**
 * Helper to check if realtime is available
 */
declare function isRealtimeAvailable(supabase: TypedSupabaseClient): boolean;
/**
 * Get the current realtime connection status
 */
declare function getRealtimeStatus(supabase: TypedSupabaseClient): string;

declare const SUPABASE_VERSION = "0.1.0";

export { type Database, type DatabaseChangeEvent, type DatabaseChangePayload, type Inserts, SUPABASE_VERSION, type SubscriptionStatus, type Tables, type TypedSupabaseClient, type Updates, type UserRole, copyFile, createAdminClient, createBucket, createChannel, createClient, createServerClient, createSignedUrl, createSignedUrls, deleteBucket, deleteFile, downloadFile, getCurrentSession, getCurrentUser, getFileInfo, getPublicUrl, getRealtimeStatus, getUserId, isAuthenticated, isRealtimeAvailable, listBuckets, listFiles, moveFile, resetPassword, signInWithOAuth, signInWithPassword, signOut, signUpWithPassword, subscribeToRow, subscribeToTable, subscribeToUserChanges, unsubscribeChannel, unsubscribeMultipleChannels, updatePassword, updateUserMetadata, uploadFile };

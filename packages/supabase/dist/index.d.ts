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

type Json = string | number | boolean | null | {
    [key: string]: Json | undefined;
} | Json[];
type Database = {
    public: {
        Tables: {
            products: {
                Row: {
                    created_at: string;
                    description: string | null;
                    id: string;
                    name: string;
                    updated_at: string;
                };
                Insert: {
                    created_at?: string;
                    description?: string | null;
                    id?: string;
                    name: string;
                    updated_at?: string;
                };
                Update: {
                    created_at?: string;
                    description?: string | null;
                    id?: string;
                    name?: string;
                    updated_at?: string;
                };
                Relationships: [];
            };
            subscriptions: {
                Row: {
                    created_at: string;
                    current_period_end: string;
                    current_period_start: string;
                    id: string;
                    product_id: string;
                    status: Database["public"]["Enums"]["subscription_status"];
                    updated_at: string;
                    user_id: string;
                };
                Insert: {
                    created_at?: string;
                    current_period_end: string;
                    current_period_start: string;
                    id?: string;
                    product_id: string;
                    status?: Database["public"]["Enums"]["subscription_status"];
                    updated_at?: string;
                    user_id: string;
                };
                Update: {
                    created_at?: string;
                    current_period_end?: string;
                    current_period_start?: string;
                    id?: string;
                    product_id?: string;
                    status?: Database["public"]["Enums"]["subscription_status"];
                    updated_at?: string;
                    user_id?: string;
                };
                Relationships: [
                    {
                        foreignKeyName: "subscriptions_product_id_fkey";
                        columns: ["product_id"];
                        isOneToOne: false;
                        referencedRelation: "products";
                        referencedColumns: ["id"];
                    },
                    {
                        foreignKeyName: "subscriptions_user_id_fkey";
                        columns: ["user_id"];
                        isOneToOne: false;
                        referencedRelation: "users";
                        referencedColumns: ["id"];
                    }
                ];
            };
            user_products: {
                Row: {
                    created_at: string;
                    id: string;
                    product_id: string;
                    role: Database["public"]["Enums"]["user_role"];
                    updated_at: string;
                    user_id: string;
                };
                Insert: {
                    created_at?: string;
                    id?: string;
                    product_id: string;
                    role?: Database["public"]["Enums"]["user_role"];
                    updated_at?: string;
                    user_id: string;
                };
                Update: {
                    created_at?: string;
                    id?: string;
                    product_id?: string;
                    role?: Database["public"]["Enums"]["user_role"];
                    updated_at?: string;
                    user_id?: string;
                };
                Relationships: [
                    {
                        foreignKeyName: "user_products_product_id_fkey";
                        columns: ["product_id"];
                        isOneToOne: false;
                        referencedRelation: "products";
                        referencedColumns: ["id"];
                    },
                    {
                        foreignKeyName: "user_products_user_id_fkey";
                        columns: ["user_id"];
                        isOneToOne: false;
                        referencedRelation: "users";
                        referencedColumns: ["id"];
                    }
                ];
            };
            users: {
                Row: {
                    created_at: string;
                    email: string;
                    id: string;
                    updated_at: string;
                };
                Insert: {
                    created_at?: string;
                    email: string;
                    id: string;
                    updated_at?: string;
                };
                Update: {
                    created_at?: string;
                    email?: string;
                    id?: string;
                    updated_at?: string;
                };
                Relationships: [];
            };
        };
        Views: {
            [_ in never]: never;
        };
        Functions: {
            [_ in never]: never;
        };
        Enums: {
            subscription_status: "active" | "canceled" | "incomplete" | "incomplete_expired" | "past_due" | "trialing" | "unpaid";
            user_role: "owner" | "admin" | "member" | "viewer";
        };
        CompositeTypes: {
            [_ in never]: never;
        };
    };
};
type DefaultSchema = Database[Extract<keyof Database, "public">];
type Tables<DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"]) | {
    schema: keyof Database;
}, TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
} ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] & Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"]) : never = never> = DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
} ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] & Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
    Row: infer R;
} ? R : never : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"]) ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
    Row: infer R;
} ? R : never : never;
type TablesInsert<DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"] | {
    schema: keyof Database;
}, TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
} ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] : never = never> = DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
} ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
    Insert: infer I;
} ? I : never : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"] ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
    Insert: infer I;
} ? I : never : never;
type TablesUpdate<DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"] | {
    schema: keyof Database;
}, TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
} ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] : never = never> = DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
} ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
    Update: infer U;
} ? U : never : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"] ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
    Update: infer U;
} ? U : never : never;
type Enums<DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"] | {
    schema: keyof Database;
}, EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database;
} ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"] : never = never> = DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database;
} ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName] : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"] ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions] : never;
type CompositeTypes<PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"] | {
    schema: keyof Database;
}, CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database;
} ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"] : never = never> = PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database;
} ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName] : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"] ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions] : never;

/**
 * Supabase client type with Database types
 */
type TypedSupabaseClient = ReturnType<typeof createClient>;
/**
 * Common user role types for multi-tenant architecture
 */
type UserRole = Database["public"]["Enums"]["user_role"];
/**
 * Subscription status types
 */
type SubscriptionStatus = Database["public"]["Enums"]["subscription_status"];
/**
 * Utility type for table rows
 */
type TableRows<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
/**
 * Utility type for table inserts
 */
type TableInserts<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert'];
/**
 * Utility type for table updates
 */
type TableUpdates<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update'];
/**
 * Type constants for enums (useful for forms, dropdowns, etc.)
 */
declare const Constants: {
    readonly public: {
        readonly Enums: {
            readonly subscription_status: readonly ["active", "canceled", "incomplete", "incomplete_expired", "past_due", "trialing", "unpaid"];
            readonly user_role: readonly ["owner", "admin", "member", "viewer"];
        };
    };
};

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

/**
 * Database operation utilities for Supabase
 */
type UserRow = Tables<'users'>;
type ProductRow = Tables<'products'>;
type SubscriptionRow = Tables<'subscriptions'>;
type UserProductRow = Tables<'user_products'>;
type UserInsert = TablesInsert<'users'>;
type ProductInsert = TablesInsert<'products'>;
type SubscriptionInsert = TablesInsert<'subscriptions'>;
type UserProductInsert = TablesInsert<'user_products'>;
type UserUpdate = TablesUpdate<'users'>;
type ProductUpdate = TablesUpdate<'products'>;
type SubscriptionUpdate = TablesUpdate<'subscriptions'>;
type UserProductUpdate = TablesUpdate<'user_products'>;
/**
 * Database operation result type
 */
interface DatabaseResult<T = any> {
    data: T | null;
    error: string | null;
    success: boolean;
}
/**
 * Database query options
 */
interface QueryOptions {
    limit?: number;
    offset?: number;
    orderBy?: {
        column: string;
        ascending?: boolean;
    };
    filters?: Record<string, any>;
}
/**
 * Users table operations
 */
declare const users: {
    /**
     * Get all users with optional filtering and pagination
     */
    getAll(supabase: TypedSupabaseClient, options?: QueryOptions): Promise<DatabaseResult<UserRow[]>>;
    /**
     * Get a user by ID
     */
    getById(supabase: TypedSupabaseClient, id: string): Promise<DatabaseResult<UserRow>>;
    /**
     * Get a user by email
     */
    getByEmail(supabase: TypedSupabaseClient, email: string): Promise<DatabaseResult<UserRow>>;
    /**
     * Create a new user
     */
    create(supabase: TypedSupabaseClient, userData: UserInsert): Promise<DatabaseResult<UserRow>>;
    /**
     * Update a user
     */
    update(supabase: TypedSupabaseClient, id: string, updates: UserUpdate): Promise<DatabaseResult<UserRow>>;
    /**
     * Delete a user
     */
    delete(supabase: TypedSupabaseClient, id: string): Promise<DatabaseResult<void>>;
};
/**
 * Products table operations
 */
declare const products: {
    /**
     * Get all products with optional filtering and pagination
     */
    getAll(supabase: TypedSupabaseClient, options?: QueryOptions): Promise<DatabaseResult<ProductRow[]>>;
    /**
     * Get a product by ID
     */
    getById(supabase: TypedSupabaseClient, id: string): Promise<DatabaseResult<ProductRow>>;
    /**
     * Create a new product
     */
    create(supabase: TypedSupabaseClient, productData: ProductInsert): Promise<DatabaseResult<ProductRow>>;
    /**
     * Update a product
     */
    update(supabase: TypedSupabaseClient, id: string, updates: ProductUpdate): Promise<DatabaseResult<ProductRow>>;
    /**
     * Delete a product
     */
    delete(supabase: TypedSupabaseClient, id: string): Promise<DatabaseResult<void>>;
};
/**
 * Subscriptions table operations
 */
declare const subscriptions: {
    /**
     * Get all subscriptions with optional filtering and pagination
     */
    getAll(supabase: TypedSupabaseClient, options?: QueryOptions): Promise<DatabaseResult<SubscriptionRow[]>>;
    /**
     * Get subscriptions by user ID
     */
    getByUserId(supabase: TypedSupabaseClient, userId: string, options?: QueryOptions): Promise<DatabaseResult<SubscriptionRow[]>>;
    /**
     * Get a subscription by ID
     */
    getById(supabase: TypedSupabaseClient, id: string): Promise<DatabaseResult<SubscriptionRow>>;
    /**
     * Create a new subscription
     */
    create(supabase: TypedSupabaseClient, subscriptionData: SubscriptionInsert): Promise<DatabaseResult<SubscriptionRow>>;
    /**
     * Update a subscription
     */
    update(supabase: TypedSupabaseClient, id: string, updates: SubscriptionUpdate): Promise<DatabaseResult<SubscriptionRow>>;
    /**
     * Delete a subscription
     */
    delete(supabase: TypedSupabaseClient, id: string): Promise<DatabaseResult<void>>;
};
/**
 * User Products table operations (for multi-tenant functionality)
 */
declare const userProducts: {
    /**
     * Get all user-product relationships with optional filtering
     */
    getAll(supabase: TypedSupabaseClient, options?: QueryOptions): Promise<DatabaseResult<UserProductRow[]>>;
    /**
     * Get user-product relationships by user ID
     */
    getByUserId(supabase: TypedSupabaseClient, userId: string): Promise<DatabaseResult<UserProductRow[]>>;
    /**
     * Get user-product relationships by product ID
     */
    getByProductId(supabase: TypedSupabaseClient, productId: string): Promise<DatabaseResult<UserProductRow[]>>;
    /**
     * Get a specific user-product relationship
     */
    getByUserAndProduct(supabase: TypedSupabaseClient, userId: string, productId: string): Promise<DatabaseResult<UserProductRow>>;
    /**
     * Create a new user-product relationship
     */
    create(supabase: TypedSupabaseClient, userProductData: UserProductInsert): Promise<DatabaseResult<UserProductRow>>;
    /**
     * Update a user-product relationship
     */
    update(supabase: TypedSupabaseClient, id: string, updates: UserProductUpdate): Promise<DatabaseResult<UserProductRow>>;
    /**
     * Delete a user-product relationship
     */
    delete(supabase: TypedSupabaseClient, id: string): Promise<DatabaseResult<void>>;
};
/**
 * Database health check and utility functions
 */
declare const database: {
    /**
     * Check database connection health
     */
    healthCheck(supabase: TypedSupabaseClient): Promise<DatabaseResult<{
        status: string;
    }>>;
    /**
     * Get table information
     */
    getTableInfo(supabase: TypedSupabaseClient, tableName: string): Promise<DatabaseResult<{
        count: number;
    }>>;
};
/**
 * Utility function to validate required fields
 */
declare function validateRequired<T extends Record<string, any>>(data: T, requiredFields: (keyof T)[]): {
    isValid: boolean;
    missingFields: string[];
};
/**
 * Utility function to sanitize email addresses
 */
declare function sanitizeEmail(email: string): string;
/**
 * Utility function to generate database error responses
 */
declare function createErrorResponse<T = any>(error: string, data?: T | null): DatabaseResult<T>;
/**
 * Utility function to generate successful database responses
 */
declare function createSuccessResponse<T = any>(data: T): DatabaseResult<T>;

declare const SUPABASE_VERSION = "0.1.0";

export { type CompositeTypes, Constants, type Database, type DatabaseChangeEvent, type DatabaseChangePayload, type DatabaseResult, type Enums, type Json, type ProductInsert, type ProductRow, type ProductUpdate, type QueryOptions, SUPABASE_VERSION, type SubscriptionInsert, type SubscriptionRow, type SubscriptionStatus, type SubscriptionUpdate, type TableInserts, type TableRows, type TableUpdates, type Tables, type TablesInsert, type TablesUpdate, type TypedSupabaseClient, type UserInsert, type UserProductInsert, type UserProductRow, type UserProductUpdate, type UserRole, type UserRow, type UserUpdate, copyFile, createAdminClient, createBucket, createChannel, createClient, createErrorResponse, createServerClient, createSignedUrl, createSignedUrls, createSuccessResponse, database, deleteBucket, deleteFile, downloadFile, getCurrentSession, getCurrentUser, getFileInfo, getPublicUrl, getRealtimeStatus, getUserId, isAuthenticated, isRealtimeAvailable, listBuckets, listFiles, moveFile, products, resetPassword, sanitizeEmail, signInWithOAuth, signInWithPassword, signOut, signUpWithPassword, subscribeToRow, subscribeToTable, subscribeToUserChanges, subscriptions, unsubscribeChannel, unsubscribeMultipleChannels, updatePassword, updateUserMetadata, uploadFile, userProducts, users, validateRequired };

import type { TypedSupabaseClient } from './types'

/**
 * Storage utility functions for Supabase Storage
 */

/**
 * Upload a file to Supabase Storage
 */
export async function uploadFile(
  supabase: TypedSupabaseClient,
  bucket: string,
  path: string,
  file: File | Blob | ArrayBuffer | FormData,
  options?: {
    cacheControl?: string
    contentType?: string
    duplex?: string
    upsert?: boolean
  }
): Promise<{ data: any; error: any }> {
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file, options)

  return { data, error }
}

/**
 * Download a file from Supabase Storage
 */
export async function downloadFile(
  supabase: TypedSupabaseClient,
  bucket: string,
  path: string
): Promise<{ data: any; error: any }> {
  const { data, error } = await supabase.storage
    .from(bucket)
    .download(path)

  return { data, error }
}

/**
 * Get a public URL for a file in Supabase Storage
 */
export function getPublicUrl(
  supabase: TypedSupabaseClient,
  bucket: string,
  path: string,
  options?: {
    download?: boolean | string
  }
): { publicUrl: string } {
  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(path, options)

  return data
}

/**
 * Create a signed URL for a file with expiration
 */
export async function createSignedUrl(
  supabase: TypedSupabaseClient,
  bucket: string,
  path: string,
  expiresIn: number,
  options?: {
    download?: boolean | string
  }
): Promise<{ data: any; error: any }> {
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, expiresIn, options)

  return { data, error }
}

/**
 * Create multiple signed URLs
 */
export async function createSignedUrls(
  supabase: TypedSupabaseClient,
  bucket: string,
  paths: string[],
  expiresIn: number,
  options?: {
    download: boolean | string
  }
): Promise<{ data: any; error: any }> {
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrls(paths, expiresIn, options)

  return { data, error }
}

/**
 * Delete a file from Supabase Storage
 */
export async function deleteFile(
  supabase: TypedSupabaseClient,
  bucket: string,
  paths: string[]
): Promise<{ data: any; error: any }> {
  const { data, error } = await supabase.storage
    .from(bucket)
    .remove(paths)

  return { data, error }
}

/**
 * List files in a bucket
 */
export async function listFiles(
  supabase: TypedSupabaseClient,
  bucket: string,
  path?: string,
  options?: {
    limit?: number
    offset?: number
    sortBy?: {
      column: 'name' | 'id' | 'updated_at' | 'created_at' | 'last_accessed_at'
      order: 'asc' | 'desc'
    }
    search?: string
  }
): Promise<{ data: any; error: any }> {
  const { data, error } = await supabase.storage
    .from(bucket)
    .list(path, options)

  return { data, error }
}

/**
 * Move a file within Supabase Storage
 */
export async function moveFile(
  supabase: TypedSupabaseClient,
  bucket: string,
  fromPath: string,
  toPath: string
): Promise<{ data: any; error: any }> {
  const { data, error } = await supabase.storage
    .from(bucket)
    .move(fromPath, toPath)

  return { data, error }
}

/**
 * Copy a file within Supabase Storage
 */
export async function copyFile(
  supabase: TypedSupabaseClient,
  bucket: string,
  fromPath: string,
  toPath: string
): Promise<{ data: any; error: any }> {
  const { data, error } = await supabase.storage
    .from(bucket)
    .copy(fromPath, toPath)

  return { data, error }
}

/**
 * Get file metadata
 */
export async function getFileInfo(
  supabase: TypedSupabaseClient,
  bucket: string,
  path: string
): Promise<{ data: any; error: any }> {
  const { data, error } = await supabase.storage
    .from(bucket)
    .list(undefined, {
      search: path.split('/').pop(),
    })

  if (error) return { data: null, error }

  const file = data?.find(f => f.name === path.split('/').pop())
  return { data: file || null, error: file ? null : new Error('File not found') }
}

/**
 * Create a bucket
 */
export async function createBucket(
  supabase: TypedSupabaseClient,
  id: string,
  options: {
    public: boolean
    allowedMimeTypes?: string[]
    fileSizeLimit?: number
  }
): Promise<{ data: any; error: any }> {
  const { data, error } = await supabase.storage
    .createBucket(id, options)

  return { data, error }
}

/**
 * List all buckets
 */
export async function listBuckets(supabase: TypedSupabaseClient): Promise<{ data: any; error: any }> {
  const { data, error } = await supabase.storage.listBuckets()
  return { data, error }
}

/**
 * Delete a bucket
 */
export async function deleteBucket(
  supabase: TypedSupabaseClient,
  id: string
): Promise<{ data: any; error: any }> {
  const { data, error } = await supabase.storage.deleteBucket(id)
  return { data, error }
} 
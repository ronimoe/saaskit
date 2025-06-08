import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'
import {
  uploadFile,
  downloadFile,
  deleteFile,
  listFiles,
  getPublicUrl,
  createSignedUrl,
  createSignedUrls,
  copyFile,
  moveFile,
  getFileInfo,
  createBucket,
  listBuckets,
  deleteBucket,
} from '../storage'
import { createMockSupabaseClient, createMockStorageResponse } from '../test/mocks'

describe('Storage Operations', () => {
  let mockSupabase: ReturnType<typeof createMockSupabaseClient>
  let mockStorageBucket: any

  beforeEach(() => {
    mockSupabase = createMockSupabaseClient()
    mockStorageBucket = mockSupabase.storage.from()
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('uploadFile', () => {
    it('uploads file successfully', async () => {
      const mockFile = new File(['test content'], 'test.txt', { type: 'text/plain' })
      const mockResponse = createMockStorageResponse({ path: 'test.txt' })
      mockStorageBucket.upload.mockResolvedValue(mockResponse)

      const result = await uploadFile(mockSupabase, 'test-bucket', 'test.txt', mockFile)

      expect(result.data?.path).toBe('test.txt')
      expect(result.error).toBeNull()
      expect(mockSupabase.storage.from).toHaveBeenCalledWith('test-bucket')
      expect(mockStorageBucket.upload).toHaveBeenCalledWith('test.txt', mockFile, undefined)
    })

    it('handles upload errors', async () => {
      const mockFile = new File(['test content'], 'test.txt', { type: 'text/plain' })
      const mockError = { message: 'Upload failed' }
      const mockResponse = { data: null, error: mockError }
      mockStorageBucket.upload.mockResolvedValue(mockResponse)

      const result = await uploadFile(mockSupabase, 'test-bucket', 'test.txt', mockFile)

      expect(result.data).toBeNull()
      expect(result.error).toEqual(mockError)
    })

    it('passes upload options correctly', async () => {
      const mockFile = new File(['test content'], 'test.txt', { type: 'text/plain' })
      const mockResponse = createMockStorageResponse({ path: 'test.txt' })
      const options = { upsert: true, contentType: 'text/plain' }
      mockStorageBucket.upload.mockResolvedValue(mockResponse)

      await uploadFile(mockSupabase, 'test-bucket', 'test.txt', mockFile, options)

      expect(mockStorageBucket.upload).toHaveBeenCalledWith('test.txt', mockFile, options)
    })
  })

  describe('downloadFile', () => {
    it('downloads file successfully', async () => {
      const mockBlob = new Blob(['file content'], { type: 'text/plain' })
      const mockResponse = createMockStorageResponse(mockBlob)
      mockStorageBucket.download.mockResolvedValue(mockResponse)

      const result = await downloadFile(mockSupabase, 'test-bucket', 'test.txt')

      expect(result.data).toEqual(mockBlob)
      expect(result.error).toBeNull()
      expect(mockSupabase.storage.from).toHaveBeenCalledWith('test-bucket')
      expect(mockStorageBucket.download).toHaveBeenCalledWith('test.txt')
    })

    it('handles download errors', async () => {
      const mockError = { message: 'File not found' }
      const mockResponse = { data: null, error: mockError }
      mockStorageBucket.download.mockResolvedValue(mockResponse)

      const result = await downloadFile(mockSupabase, 'test-bucket', 'nonexistent.txt')

      expect(result.data).toBeNull()
      expect(result.error).toEqual(mockError)
    })
  })

  describe('deleteFile', () => {
    it('deletes single file successfully', async () => {
      const mockResponse = createMockStorageResponse([{ name: 'test.txt' }])
      mockStorageBucket.remove.mockResolvedValue(mockResponse)

      const result = await deleteFile(mockSupabase, 'test-bucket', ['test.txt'])

      expect(result.data).toEqual([{ name: 'test.txt' }])
      expect(result.error).toBeNull()
      expect(mockStorageBucket.remove).toHaveBeenCalledWith(['test.txt'])
    })

    it('deletes multiple files successfully', async () => {
      const files = ['file1.txt', 'file2.txt']
      const mockResponse = createMockStorageResponse([
        { name: 'file1.txt' },
        { name: 'file2.txt' },
      ])
      mockStorageBucket.remove.mockResolvedValue(mockResponse)

      const result = await deleteFile(mockSupabase, 'test-bucket', files)

      expect(result.data).toEqual([{ name: 'file1.txt' }, { name: 'file2.txt' }])
      expect(result.error).toBeNull()
      expect(mockStorageBucket.remove).toHaveBeenCalledWith(files)
    })

    it('handles delete errors', async () => {
      const mockError = { message: 'Delete failed' }
      const mockResponse = { data: null, error: mockError }
      mockStorageBucket.remove.mockResolvedValue(mockResponse)

      const result = await deleteFile(mockSupabase, 'test-bucket', ['test.txt'])

      expect(result.data).toBeNull()
      expect(result.error).toEqual(mockError)
    })
  })

  describe('listFiles', () => {
    it('lists files in folder successfully', async () => {
      const mockFiles = [
        { name: 'file1.txt', id: '1', updated_at: '2023-01-01', created_at: '2023-01-01', last_accessed_at: '2023-01-01', metadata: {} },
        { name: 'file2.txt', id: '2', updated_at: '2023-01-01', created_at: '2023-01-01', last_accessed_at: '2023-01-01', metadata: {} },
      ]
      const mockResponse = createMockStorageResponse(mockFiles)
      mockStorageBucket.list.mockResolvedValue(mockResponse)

      const result = await listFiles(mockSupabase, 'test-bucket', 'folder')

      expect(result.data).toEqual(mockFiles)
      expect(result.error).toBeNull()
      expect(mockStorageBucket.list).toHaveBeenCalledWith('folder', undefined)
    })

    it('lists files with options', async () => {
      const mockFiles = [{ name: 'file1.txt', id: '1', updated_at: '2023-01-01', created_at: '2023-01-01', last_accessed_at: '2023-01-01', metadata: {} }]
      const mockResponse = createMockStorageResponse(mockFiles)
      const options = { 
        limit: 10, 
        offset: 0, 
        sortBy: { column: 'name' as const, order: 'asc' as const }
      }
      mockStorageBucket.list.mockResolvedValue(mockResponse)

      const result = await listFiles(mockSupabase, 'test-bucket', 'folder', options)

      expect(result.data).toEqual(mockFiles)
      expect(mockStorageBucket.list).toHaveBeenCalledWith('folder', options)
    })

    it('handles list errors', async () => {
      const mockError = { message: 'Folder not found' }
      const mockResponse = { data: null, error: mockError }
      mockStorageBucket.list.mockResolvedValue(mockResponse)

      const result = await listFiles(mockSupabase, 'test-bucket', 'nonexistent')

      expect(result.data).toBeNull()
      expect(result.error).toEqual(mockError)
    })
  })

  describe('getPublicUrl', () => {
    it('generates public URL successfully', () => {
      const mockUrl = 'https://example.com/storage/test.txt'
      const mockData = { publicUrl: mockUrl }
      mockStorageBucket.getPublicUrl.mockReturnValue({ data: mockData })

      const result = getPublicUrl(mockSupabase, 'test-bucket', 'test.txt')

      expect(result.publicUrl).toBe(mockUrl)
      expect(mockStorageBucket.getPublicUrl).toHaveBeenCalledWith('test.txt', undefined)
    })

    it('generates public URL with download option', () => {
      const mockUrl = 'https://example.com/storage/test.jpg'
      const options = { download: true }
      const mockData = { publicUrl: mockUrl }
      mockStorageBucket.getPublicUrl.mockReturnValue({ data: mockData })

      const result = getPublicUrl(mockSupabase, 'test-bucket', 'test.jpg', options)

      expect(result.publicUrl).toBe(mockUrl)
      expect(mockStorageBucket.getPublicUrl).toHaveBeenCalledWith('test.jpg', options)
    })
  })

  describe('createSignedUrl', () => {
    it('creates signed URL successfully', async () => {
      const mockUrl = 'https://example.com/storage/signed/test.txt'
      const mockResponse = createMockStorageResponse({ signedUrl: mockUrl })
      mockStorageBucket.createSignedUrl.mockResolvedValue(mockResponse)

      const result = await createSignedUrl(mockSupabase, 'test-bucket', 'test.txt', 3600)

      expect(result.data?.signedUrl).toBe(mockUrl)
      expect(result.error).toBeNull()
      expect(mockStorageBucket.createSignedUrl).toHaveBeenCalledWith('test.txt', 3600, undefined)
    })

    it('creates signed URL with options', async () => {
      const mockUrl = 'https://example.com/storage/signed/test.jpg'
      const mockResponse = createMockStorageResponse({ signedUrl: mockUrl })
      const options = { download: true }
      mockStorageBucket.createSignedUrl.mockResolvedValue(mockResponse)

      const result = await createSignedUrl(mockSupabase, 'test-bucket', 'test.jpg', 3600, options)

      expect(result.data?.signedUrl).toBe(mockUrl)
      expect(mockStorageBucket.createSignedUrl).toHaveBeenCalledWith('test.jpg', 3600, options)
    })

    it('handles signed URL errors', async () => {
      const mockError = { message: 'File not found' }
      const mockResponse = { data: null, error: mockError }
      mockStorageBucket.createSignedUrl.mockResolvedValue(mockResponse)

      const result = await createSignedUrl(mockSupabase, 'test-bucket', 'nonexistent.txt', 3600)

      expect(result.data).toBeNull()
      expect(result.error).toEqual(mockError)
    })
  })

  describe('copyFile', () => {
    it('copies file successfully', async () => {
      const mockResponse = createMockStorageResponse({ path: 'destination.txt' })
      mockStorageBucket.copy.mockResolvedValue(mockResponse)

      const result = await copyFile(mockSupabase, 'test-bucket', 'source.txt', 'destination.txt')

      expect(result.data?.path).toBe('destination.txt')
      expect(result.error).toBeNull()
      expect(mockStorageBucket.copy).toHaveBeenCalledWith('source.txt', 'destination.txt')
    })

    it('handles copy errors', async () => {
      const mockError = { message: 'Source file not found' }
      const mockResponse = { data: null, error: mockError }
      mockStorageBucket.copy.mockResolvedValue(mockResponse)

      const result = await copyFile(mockSupabase, 'test-bucket', 'nonexistent.txt', 'destination.txt')

      expect(result.data).toBeNull()
      expect(result.error).toEqual(mockError)
    })
  })

  describe('moveFile', () => {
    it('moves file successfully', async () => {
      const mockResponse = createMockStorageResponse({ message: 'Successfully moved' })
      mockStorageBucket.move.mockResolvedValue(mockResponse)

      const result = await moveFile(mockSupabase, 'test-bucket', 'oldpath.txt', 'newpath.txt')

      expect(result.data?.message).toBe('Successfully moved')
      expect(result.error).toBeNull()
      expect(mockStorageBucket.move).toHaveBeenCalledWith('oldpath.txt', 'newpath.txt')
    })

    it('handles move errors', async () => {
      const mockError = { message: 'Source file not found' }
      const mockResponse = { data: null, error: mockError }
      mockStorageBucket.move.mockResolvedValue(mockResponse)

      const result = await moveFile(mockSupabase, 'test-bucket', 'nonexistent.txt', 'newpath.txt')

      expect(result.data).toBeNull()
      expect(result.error).toEqual(mockError)
    })
  })

  describe('createSignedUrls', () => {
    it('creates multiple signed URLs successfully', async () => {
      const mockUrls = [
        { path: 'file1.txt', signedUrl: 'https://example.com/signed/file1.txt' },
        { path: 'file2.txt', signedUrl: 'https://example.com/signed/file2.txt' }
      ]
      const mockResponse = createMockStorageResponse(mockUrls)
      mockStorageBucket.createSignedUrls.mockResolvedValue(mockResponse)

      const result = await createSignedUrls(mockSupabase, 'test-bucket', ['file1.txt', 'file2.txt'], 3600)

      expect(result.data).toEqual(mockUrls)
      expect(result.error).toBeNull()
      expect(mockStorageBucket.createSignedUrls).toHaveBeenCalledWith(['file1.txt', 'file2.txt'], 3600, undefined)
    })

    it('creates signed URLs with options', async () => {
      const mockUrls = [{ path: 'file1.txt', signedUrl: 'https://example.com/signed/file1.txt' }]
      const mockResponse = createMockStorageResponse(mockUrls)
      const options = { download: true }
      mockStorageBucket.createSignedUrls.mockResolvedValue(mockResponse)

      const result = await createSignedUrls(mockSupabase, 'test-bucket', ['file1.txt'], 3600, options)

      expect(result.data).toEqual(mockUrls)
      expect(mockStorageBucket.createSignedUrls).toHaveBeenCalledWith(['file1.txt'], 3600, options)
    })

    it('handles signed URLs errors', async () => {
      const mockError = { message: 'Some files not found' }
      const mockResponse = { data: null, error: mockError }
      mockStorageBucket.createSignedUrls.mockResolvedValue(mockResponse)

      const result = await createSignedUrls(mockSupabase, 'test-bucket', ['nonexistent.txt'], 3600)

      expect(result.data).toBeNull()
      expect(result.error).toEqual(mockError)
    })
  })

  describe('getFileInfo', () => {
    it('gets file info successfully', async () => {
      const mockFiles = [
        { name: 'test.txt', id: '1', size: 1024, updated_at: '2023-01-01', created_at: '2023-01-01' }
      ]
      const mockResponse = createMockStorageResponse(mockFiles)
      mockStorageBucket.list.mockResolvedValue(mockResponse)

      const result = await getFileInfo(mockSupabase, 'test-bucket', 'folder/test.txt')

      expect(result.data).toEqual(mockFiles[0])
      expect(result.error).toBeNull()
      expect(mockStorageBucket.list).toHaveBeenCalledWith(undefined, { search: 'test.txt' })
    })

    it('handles file not found', async () => {
      const mockResponse = createMockStorageResponse([])
      mockStorageBucket.list.mockResolvedValue(mockResponse)

      const result = await getFileInfo(mockSupabase, 'test-bucket', 'folder/nonexistent.txt')

      expect(result.data).toBeNull()
      expect(result.error).toEqual(new Error('File not found'))
    })

    it('handles list errors', async () => {
      const mockError = { message: 'Access denied' }
      const mockResponse = { data: null, error: mockError }
      mockStorageBucket.list.mockResolvedValue(mockResponse)

      const result = await getFileInfo(mockSupabase, 'test-bucket', 'folder/test.txt')

      expect(result.data).toBeNull()
      expect(result.error).toEqual(mockError)
    })
  })

  describe('createBucket', () => {
    it('creates bucket successfully', async () => {
      const mockResponse = createMockStorageResponse({ name: 'new-bucket' })
      mockSupabase.storage.createBucket.mockResolvedValue(mockResponse)

      const result = await createBucket(mockSupabase, 'new-bucket', { public: true })

      expect(result.data?.name).toBe('new-bucket')
      expect(result.error).toBeNull()
      expect(mockSupabase.storage.createBucket).toHaveBeenCalledWith('new-bucket', { public: true })
    })

    it('creates private bucket with options', async () => {
      const mockResponse = createMockStorageResponse({ name: 'private-bucket' })
      const options = { public: false, fileSizeLimit: 1024 }
      mockSupabase.storage.createBucket.mockResolvedValue(mockResponse)

      const result = await createBucket(mockSupabase, 'private-bucket', options)

      expect(result.data?.name).toBe('private-bucket')
      expect(mockSupabase.storage.createBucket).toHaveBeenCalledWith('private-bucket', options)
    })

    it('handles bucket creation errors', async () => {
      const mockError = { message: 'Bucket already exists' }
      const mockResponse = { data: null, error: mockError }
      mockSupabase.storage.createBucket.mockResolvedValue(mockResponse)

      const result = await createBucket(mockSupabase, 'existing-bucket', { public: true })

      expect(result.data).toBeNull()
      expect(result.error).toEqual(mockError)
    })
  })

  describe('listBuckets', () => {
    it('lists buckets successfully', async () => {
      const mockBuckets = [
        { id: 'bucket1', name: 'bucket1', public: true },
        { id: 'bucket2', name: 'bucket2', public: false }
      ]
      const mockResponse = createMockStorageResponse(mockBuckets)
      mockSupabase.storage.listBuckets.mockResolvedValue(mockResponse)

      const result = await listBuckets(mockSupabase)

      expect(result.data).toEqual(mockBuckets)
      expect(result.error).toBeNull()
      expect(mockSupabase.storage.listBuckets).toHaveBeenCalled()
    })

    it('handles list buckets errors', async () => {
      const mockError = { message: 'Access denied' }
      const mockResponse = { data: null, error: mockError }
      mockSupabase.storage.listBuckets.mockResolvedValue(mockResponse)

      const result = await listBuckets(mockSupabase)

      expect(result.data).toBeNull()
      expect(result.error).toEqual(mockError)
    })
  })

  describe('deleteBucket', () => {
    it('deletes bucket successfully', async () => {
      const mockResponse = createMockStorageResponse({ message: 'Successfully deleted' })
      mockSupabase.storage.deleteBucket.mockResolvedValue(mockResponse)

      const result = await deleteBucket(mockSupabase, 'test-bucket')

      expect(result.data?.message).toBe('Successfully deleted')
      expect(result.error).toBeNull()
      expect(mockSupabase.storage.deleteBucket).toHaveBeenCalledWith('test-bucket')
    })

    it('handles delete bucket errors', async () => {
      const mockError = { message: 'Bucket not empty' }
      const mockResponse = { data: null, error: mockError }
      mockSupabase.storage.deleteBucket.mockResolvedValue(mockResponse)

      const result = await deleteBucket(mockSupabase, 'test-bucket')

      expect(result.data).toBeNull()
      expect(result.error).toEqual(mockError)
    })
  })
}) 
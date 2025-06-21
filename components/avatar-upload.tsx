'use client'

import { useState, useRef, useCallback } from 'react'
import { Upload, Loader2, X, Camera, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { createClient } from '@/utils/supabase/client'
import { useNotifications } from '@/components/providers/notification-provider'
import { cn } from '@/lib/utils'

interface AvatarUploadProps {
  currentAvatarUrl?: string | null
  userDisplayName: string
  userId: string
  onAvatarUpdate?: (newAvatarUrl: string) => void
  className?: string
}

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']

function getInitials(name: string): string {
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function AvatarUpload({ 
  currentAvatarUrl, 
  userDisplayName, 
  userId, 
  onAvatarUpdate,
  className 
}: AvatarUploadProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const notifications = useNotifications()

  const validateFile = (file: File): string | null => {
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      return 'Please select a valid image file (JPEG, PNG, or WebP)'
    }
    
    if (file.size > MAX_FILE_SIZE) {
      return 'File size must be less than 5MB'
    }
    
    return null
  }

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const validationError = validateFile(file)
    if (validationError) {
      notifications.formError(validationError)
      return
    }

    setSelectedFile(file)
    
    // Create preview URL
    const url = URL.createObjectURL(file)
    setPreviewUrl(url)
  }, [notifications])

  const handleUpload = async () => {
    if (!selectedFile) return

    setIsUploading(true)
    setUploadProgress(0)

    try {
      const supabase = createClient()
      
      // Create unique filename
      const fileExt = selectedFile.name.split('.').pop()
      const fileName = `${userId}_${Date.now()}.${fileExt}`
      const filePath = `avatars/${fileName}`

      // Upload file to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, selectedFile, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) {
        console.error('Upload error:', uploadError)
        notifications.formError(`Upload failed: ${uploadError.message}`)
        return
      }

      setUploadProgress(50)

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)

      if (!urlData.publicUrl) {
        notifications.formError('Failed to get avatar URL')
        return
      }

      setUploadProgress(75)

      // Update profile in database
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: urlData.publicUrl })
        .eq('user_id', userId)
        .select()

      if (updateError) {
        console.error('Profile update error:', updateError)
        notifications.formError(`Failed to update profile: ${updateError.message}`)
        return
      }

      setUploadProgress(100)

      // Success!
      notifications.formSuccess('Avatar updated successfully!')
      onAvatarUpdate?.(urlData.publicUrl)
      
      // Clean up and close
      setTimeout(() => {
        setIsOpen(false)
        setSelectedFile(null)
        setPreviewUrl(null)
        setUploadProgress(0)
      }, 1000)

    } catch (error) {
      console.error('Avatar upload error:', error)
      notifications.formError('An unexpected error occurred during upload')
    } finally {
      setIsUploading(false)
    }
  }

  const clearSelection = () => {
    setSelectedFile(null)
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
      setPreviewUrl(null)
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const triggerFileSelect = () => {
    fileInputRef.current?.click()
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className={cn("w-full sm:w-auto", className)}>
          <Camera className="mr-2 h-4 w-4" />
          Edit Avatar
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Update Avatar</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Current Avatar Display */}
          <div className="flex flex-col items-center space-y-4">
            <Avatar className="h-24 w-24">
              <AvatarImage 
                src={previewUrl || currentAvatarUrl || undefined} 
                alt={userDisplayName} 
              />
              <AvatarFallback className="text-lg font-semibold bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                {getInitials(userDisplayName)}
              </AvatarFallback>
            </Avatar>
            
            {selectedFile && (
              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                </p>
              </div>
            )}
          </div>

          {/* File Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept={ALLOWED_FILE_TYPES.join(',')}
            onChange={handleFileSelect}
            className="hidden"
          />

          {/* Upload Progress */}
          {isUploading && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Uploading...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            {!selectedFile ? (
              <Button 
                onClick={triggerFileSelect}
                className="flex-1"
                disabled={isUploading}
              >
                <Upload className="mr-2 h-4 w-4" />
                Choose Image
              </Button>
            ) : (
              <>
                <Button 
                  onClick={handleUpload}
                  disabled={isUploading}
                  className="flex-1"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Uploading...
                    </>
                  ) : uploadProgress === 100 ? (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      Complete!
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Upload
                    </>
                  )}
                </Button>
                
                <Button 
                  variant="outline" 
                  onClick={clearSelection}
                  disabled={isUploading}
                  className="sm:w-auto"
                >
                  <X className="mr-2 h-4 w-4" />
                  Clear
                </Button>
              </>
            )}
          </div>

          {/* Help Text */}
          <div className="text-center">
            <p className="text-xs text-muted-foreground">
              Supported formats: JPEG, PNG, WebP • Max size: 5MB
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 
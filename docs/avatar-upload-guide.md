# Avatar Upload Component Guide

## Overview

The `AvatarUpload` component provides a complete solution for user avatar management with file upload to Supabase Storage, real-time preview, and comprehensive error handling.

## Features

✅ **File Upload to Supabase Storage**
- Secure upload to dedicated `avatars` bucket
- Automatic file naming with timestamps
- User-specific folder organization

✅ **File Validation**
- Supported formats: JPEG, PNG, WebP
- Maximum file size: 5MB
- Real-time validation feedback

✅ **User Experience**
- Drag & drop file selection
- Real-time image preview
- Upload progress tracking
- Success/error notifications

✅ **Security**
- Row Level Security (RLS) policies
- User-specific access controls
- Secure file organization

## Usage

### Basic Implementation

```tsx
import { AvatarUpload } from '@/components/avatar-upload';

function ProfilePage({ profile }: { profile: Profile }) {
  const handleAvatarUpdate = (newAvatarUrl: string) => {
    // Handle the avatar update (e.g., update local state)
    console.log('Avatar updated:', newAvatarUrl);
  };

  return (
    <AvatarUpload
      currentAvatarUrl={profile.avatar_url}
      userDisplayName={profile.full_name || 'User'}
      userId={profile.user_id}
      onAvatarUpdate={handleAvatarUpdate}
    />
  );
}
```

### Props Interface

```typescript
interface AvatarUploadProps {
  currentAvatarUrl: string | null;    // Current avatar URL
  userDisplayName: string;            // User's display name for fallback
  userId: string;                     // User ID for file organization
  onAvatarUpdate: (url: string) => void; // Callback when avatar updates
}
```

## Component Behavior

### File Selection Process

1. **User clicks "Change Avatar"** → Opens file selection dialog
2. **File selected** → Validates file type and size
3. **Validation passes** → Shows preview and upload button
4. **Upload initiated** → Displays progress bar
5. **Upload completes** → Updates avatar immediately
6. **Success** → Shows success notification and closes dialog

### Error Handling

- **Invalid file type**: Shows error message with supported formats
- **File too large**: Shows error message with size limit
- **Upload failure**: Shows error message with retry option
- **Network issues**: Graceful error handling with user feedback

### File Organization

Files are organized in Supabase Storage as:
```
avatars/
├── {user_id}/
│   └── avatar-{timestamp}.{extension}
```

## Styling & Customization

### Default Appearance

- **Avatar Display**: Circular with 96px diameter
- **Fallback**: User initials with brand colors
- **Upload Button**: Positioned in bottom-right corner
- **Dialog**: Centered modal with glass card effect

### Custom Styling

```tsx
// Custom avatar size
<div className="w-32 h-32"> {/* 128px */}
  <AvatarUpload {...props} />
</div>

// Custom button styling
<AvatarUpload 
  {...props}
  className="custom-avatar-upload"
/>
```

### CSS Customization

```css
/* Custom avatar upload styling */
.custom-avatar-upload .avatar-container {
  width: 120px;
  height: 120px;
}

.custom-avatar-upload .upload-button {
  background: linear-gradient(45deg, #667eea, #764ba2);
}
```

## Integration Examples

### With Profile Header

```tsx
function ProfileHeader({ profile }: { profile: Profile }) {
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url);

  return (
    <div className="flex items-center space-x-6">
      <AvatarUpload
        currentAvatarUrl={avatarUrl}
        userDisplayName={profile.full_name || 'User'}
        userId={profile.user_id}
        onAvatarUpdate={setAvatarUrl}
      />
      <div>
        <h1>{profile.full_name}</h1>
        <p>{profile.email}</p>
      </div>
    </div>
  );
}
```

### With Form Integration

```tsx
function ProfileForm({ profile }: { profile: Profile }) {
  const [formData, setFormData] = useState(profile);

  const handleAvatarUpdate = (newAvatarUrl: string) => {
    setFormData(prev => ({
      ...prev,
      avatar_url: newAvatarUrl
    }));
  };

  return (
    <form>
      <div className="mb-6">
        <label>Profile Picture</label>
        <AvatarUpload
          currentAvatarUrl={formData.avatar_url}
          userDisplayName={formData.full_name || 'User'}
          userId={formData.user_id}
          onAvatarUpdate={handleAvatarUpdate}
        />
      </div>
      {/* Other form fields */}
    </form>
  );
}
```

## Supabase Configuration

### Storage Bucket Setup

```sql
-- Create avatars bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true,
  5242880, -- 5MB
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
);
```

### RLS Policies

```sql
-- Users can upload their own avatars
CREATE POLICY "Users can upload their own avatars" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'avatars' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Users can update their own avatars
CREATE POLICY "Users can update their own avatars" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'avatars' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Users can delete their own avatars
CREATE POLICY "Users can delete their own avatars" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'avatars' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Public read access for avatar display
CREATE POLICY "Anyone can view avatars" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');
```

## Troubleshooting

### Common Issues

1. **Upload fails with "Access denied"**
   - Check RLS policies are correctly configured
   - Verify user is authenticated
   - Ensure bucket exists and is accessible

2. **File validation errors**
   - Check file format (must be JPEG, PNG, or WebP)
   - Verify file size is under 5MB
   - Ensure file is not corrupted

3. **Avatar doesn't update immediately**
   - Check `onAvatarUpdate` callback is properly implemented
   - Verify state management in parent component
   - Check for console errors

### Debug Steps

1. **Check browser console** for JavaScript errors
2. **Verify Supabase configuration** in project settings
3. **Test file upload manually** in Supabase dashboard
4. **Check network requests** in browser dev tools
5. **Validate RLS policies** with different user accounts

## Performance Considerations

### Optimization Tips

1. **Image Compression**: Consider client-side compression before upload
2. **File Size Limits**: 5MB limit balances quality and performance
3. **Caching**: Supabase Storage provides CDN caching automatically
4. **Lazy Loading**: Avatar images load only when needed

### Future Enhancements

- **Image Cropping**: Add image editing capabilities
- **Multiple Formats**: Support for additional image formats
- **Batch Upload**: Support for multiple avatar options
- **AI Enhancement**: Automatic image enhancement features

## Testing

### Manual Testing Checklist

- [ ] File selection works with drag & drop
- [ ] File validation prevents invalid uploads
- [ ] Upload progress displays correctly
- [ ] Avatar updates immediately after upload
- [ ] Error messages display for failed uploads
- [ ] Success notifications appear
- [ ] Dialog closes after successful upload
- [ ] Avatar fallback displays correctly
- [ ] Works on mobile devices

### Automated Testing

```typescript
// Example test cases
describe('AvatarUpload', () => {
  it('should display current avatar', () => {
    // Test avatar display
  });

  it('should validate file types', () => {
    // Test file validation
  });

  it('should handle upload progress', () => {
    // Test progress tracking
  });

  it('should call onAvatarUpdate on success', () => {
    // Test callback execution
  });
});
```

## Related Documentation

- [Profile Management System](./profile-management-system.md)
- [Supabase Storage Configuration](./database-schema.md#supabase-storage)
- [Authentication Utils](./auth-utils-usage.md)
- [UI System Overview](./ui-system-overview.md)

---

**Last Updated**: June 2025  
**Version**: 1.0.0  
**Compatibility**: Next.js 15, Supabase, TypeScript 5+ 
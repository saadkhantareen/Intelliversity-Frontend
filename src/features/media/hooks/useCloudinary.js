import { useState } from 'react';
import { cloudinaryService } from '../api/cloudinary.service';
import toast from 'react-hot-toast';

export function useCloudinary() {
  const [isUploading, setIsUploading] = useState(false);
  const [isFetchingUrl, setIsFetchingUrl] = useState(false);

  const uploadToCloudinary = async (file, assetCategory) => {
    setIsUploading(true);
    try {
      const result = await cloudinaryService.uploadFile(file, assetCategory);
      return result;
    } catch (err) {
      console.error('Cloudinary Upload Error:', err);
      toast.error('Failed to upload file to storage.');
      throw err; // Re-throw so the component can stop its execution
    } finally {
      setIsUploading(false);
    }
  };

  return {
    uploadToCloudinary,
    isUploading,
    isFetchingUrl,
  };
}

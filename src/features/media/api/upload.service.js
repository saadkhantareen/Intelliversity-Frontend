import axios from 'axios';
import api from '@/shared/api/client';
import { ProfileService } from '@/features/profile';

const uploadService = {
  uploadToCloudinary: async (file, assetCategory) => {
    const { data: sigData } = await api.get(`/api/v1/storage/uploads/signature/${assetCategory}/`);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('api_key', sigData.api_key);
    formData.append('timestamp', String(sigData.timestamp));
    formData.append('signature', sigData.signature);
    formData.append('public_id', sigData.public_id);
    formData.append('type', sigData.type);
    formData.append('asset_folder', sigData.asset_folder);
    formData.append('context', sigData.context);

    const resourceType = sigData.resource_type || 'image';
    const cloudRes = await axios.post(
      `https://api.cloudinary.com/v1_1/${sigData.cloud_name}/${resourceType}/upload`,
      formData
    );

    return {
      public_id: cloudRes.data.public_id,
      resource_type: cloudRes.data.resource_type,
      secure_url: cloudRes.data.secure_url,
    };
  },

  getPrivateUrl: async (publicId, resourceType) => {
    const { data } = await api.post('/api/v1/storage/uploads/private-url/', {
      public_id: publicId,
      resource_type: resourceType,
    });
    return data.url;
  },

  uploadProfilePicture: async (file) => {
    const { public_id } = await uploadService.uploadToCloudinary(file, 'profile');
    await ProfileService.updateMyProfile({
      base_profile: { profile_picture_public_id: public_id },
    });
    return public_id;
  },

  uploadDocument: async (file, { document_type, title, description }) => {
    const { public_id, resource_type } = await uploadService.uploadToCloudinary(file, 'document');
    await ProfileService.uploadDocument({
      document_type,
      title,
      description,
      public_id,
      resource_type,
    });
    return { public_id, resource_type };
  },
};

export default uploadService;

import axios from 'axios';
import api from '@/shared/api/client';

export const cloudinaryService = {
  /**
   * Step 1 & 2: Get signature from Django and upload directly to Cloudinary
   */
  uploadFile: async (file, assetCategory) => {
    // Step 1 – get signed params from Django (authenticated)
    const { data: sigData } = await api.get(`/api/v1/storage/uploads/signature/${assetCategory}/`);

    // Step 2 – upload directly to Cloudinary
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

  /**
   * Get a signed private URL from Django
   */
  //   getPrivateUrl: async (publicId, resourceType) => {
  //     const { data } = await api.post(`/api/v1/storage/uploads/private-url/`, {
  //       public_id: publicId,
  //       resource_type: resourceType,
  //     });
  //     return data.url;
  //   }
};

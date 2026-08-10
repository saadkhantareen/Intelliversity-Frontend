import api from './api';

const userService = {
  bulkUpload(file) {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/api/v1/profiles/bulk-upload/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  downloadTemplate() {
    return api.get('/api/v1/profiles/bulk-upload/template/', {
      responseType: 'blob',
    });
  },
};

export default userService;

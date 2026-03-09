import { useState } from 'react';
import { lectureService } from '../services/lectureService';
import toast from 'react-hot-toast';

export const useUpload = () => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const uploadFile = async (file, options = {}) => {
    console.log('useUpload.uploadFile called with file:', file?.name);

    if (!file) {
      toast.error('No file selected');
      return { success: false, error: 'No file' };
    }

    setUploading(true);
    setProgress(0);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', options.title || file.name);
      formData.append('language', options.language || 'english');
      formData.append('extractTasks', options.extractTasks !== undefined ? options.extractTasks : true);
      formData.append('generateSummary', options.generateSummary !== undefined ? options.generateSummary : true);

      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 5, 90));
      }, 500);

      console.log('Calling lectureService.uploadLecture...');
      const response = await lectureService.uploadLecture(formData);
      
      clearInterval(progressInterval);
      setProgress(100);
      
      console.log('Upload successful, response:', response.data);
      toast.success('Lecture uploaded successfully! Processing started.');
      
      return { 
        success: true, 
        data: response.data 
      };
    } catch (error) {
      console.error('Upload error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Upload failed';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setUploading(false);
    }
  };

  return { uploadFile, uploading, progress };
};
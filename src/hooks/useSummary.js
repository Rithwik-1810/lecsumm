import { useState } from 'react';
import toast from 'react-hot-toast';

export const useSummary = () => {
  const [generating, setGenerating] = useState(false);
  const [summary, setSummary] = useState(null);

  const generateSummary = async (lectureId) => {
    setGenerating(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      setSummary({
        id: lectureId,
        summary: 'This lecture covers the fundamentals of machine learning...',
        topics: ['Supervised Learning', 'Neural Networks'],
        tasks: []
      });
      toast.success('Summary generated successfully!');
      return { success: true, data: summary };
    } catch (error) {
      toast.error('Failed to generate summary');
      return { success: false, error: error.message };
    } finally {
      setGenerating(false);
    }
  };

  return { generateSummary, generating, summary };
};
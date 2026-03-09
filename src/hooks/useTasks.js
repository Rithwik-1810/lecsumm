import { useState, useEffect } from 'react';

export const useTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setTasks([
        { id: 1, title: 'ML Assignment', deadline: '2024-03-01', status: 'pending', priority: 'high' },
        { id: 2, title: 'Read Chapter 5', deadline: '2024-02-28', status: 'pending', priority: 'medium' },
        { id: 3, title: 'Submit Project', deadline: '2024-03-05', status: 'completed', priority: 'high' }
      ]);
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateTaskStatus = (taskId, status) => {
    setTasks(tasks.map(task => 
      task.id === taskId ? { ...task, status } : task
    ));
  };

  return { tasks, loading, updateTaskStatus, refreshTasks: fetchTasks };
};
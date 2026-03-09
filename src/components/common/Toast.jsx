import toast from 'react-hot-toast';

export const showToast = {
  success: (message) => toast.success(message, {
    duration: 4000,
    position: 'top-right',
    style: {
      background: '#14B8A6',
      color: '#fff',
    },
  }),
  error: (message) => toast.error(message, {
    duration: 4000,
    position: 'top-right',
    style: {
      background: '#F97316',
      color: '#fff',
    },
  }),
  loading: (message) => toast.loading(message, {
    position: 'top-right',
  }),
  promise: (promise, messages) => toast.promise(promise, messages, {
    success: {
      duration: 4000,
      style: {
        background: '#14B8A6',
        color: '#fff',
      },
    },
    error: {
      duration: 4000,
      style: {
        background: '#F97316',
        color: '#fff',
      },
    },
  }),
};
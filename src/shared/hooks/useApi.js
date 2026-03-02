import { useState } from 'react';

export const useApi = (apiFunc) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = async (...args) => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiFunc(...args);
      setData(result.data);
      return { success: true, data: result.data };
    } catch (err) {
      setError(err.message || 'Error en la petición');
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, execute };
};
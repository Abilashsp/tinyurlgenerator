import { useEffect } from 'react';
import { useParams } from 'react-router-dom';

export const Redirect = () => {
  const { code } = useParams<{ code: string }>();

  useEffect(() => {
    if (code) {
      // Get the backend URL from environment or default to localhost:5000
      const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const baseUrl = backendUrl.replace('/api', '');
      const redirectUrl = `${baseUrl}/${code}`;
      
      // Redirect to the backend redirect endpoint
      window.location.href = redirectUrl;
    }
  }, [code]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <p className="text-lg text-gray-600">Redirecting...</p>
      </div>
    </div>
  );
};

import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useEffect } from 'react';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  useEffect(() => {
    console.log("PrivateRoute - User:", user, "Loading:", loading);
  }, [user, loading]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user) {
    console.log("No user found, redirecting to login");
    return <Navigate to="/login" />;
  }

  console.log("User authenticated, rendering protected content");
  return children;
};

export default PrivateRoute; 
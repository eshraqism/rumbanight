
import { Navigate } from 'react-router-dom';

const Index = () => {
  // Redirect to Dashboard
  return <Navigate to="/dashboard" replace />;
};

export default Index;

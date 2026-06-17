import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, allowedRoles }) => {
  // Retrieves logged-in user details from LocalStorage
  const userJson = localStorage.getItem('userInfo') || localStorage.getItem('user');
  const user = userJson ? JSON.parse(userJson) : null;

  // If no user is logged in, redirect to the login page
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // 2. If the logged-in user's role is not in the allowed roles, redirect to the home page
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
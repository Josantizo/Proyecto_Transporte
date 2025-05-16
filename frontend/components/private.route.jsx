// components/PrivateRoute.jsx
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ children, roleRequired }) => {
    const userRole = localStorage.getItem('rol');

    if (userRole !== roleRequired) {
        return <Navigate to="/" />;
    }

    return children;
};

export default PrivateRoute;

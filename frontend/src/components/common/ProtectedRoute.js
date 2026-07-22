import React from 'react';
import { Route, Redirect } from 'react-router-dom';
import { getUser } from '../../utils/auth';

function ProtectedRoute({ component: Component, role, ...rest }) {
  return (
    <Route
      {...rest}
      render={(props) => {
        const user = getUser();

        if (!user) {
          return <Redirect to="/login" />;
        }

        if (role && user.role !== role) {
          return <Redirect to="/login" />;
        }

        return <Component {...props} />;
      }}
    />
  );
}

export default ProtectedRoute;

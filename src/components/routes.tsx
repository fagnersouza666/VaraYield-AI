import { Routes as RouterRoutes, Route, Navigate } from 'react-router-dom';
import { Dashboard } from '@/pages/dashboard';
import { Stake } from '@/pages/stake';
import { Farm } from '@/pages/farm';
import { Analytics } from '@/pages/analytics';
import { Login } from '@/pages/auth/login';
import { SignUp } from '@/pages/auth/signup';
import { useAuth } from '@/hooks/use-auth';

export function Routes() {
  const { isAuthenticated } = useAuth();

  return (
    <RouterRoutes>
      <Route
        path="/"
        element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />}
      />
      <Route
        path="/stake"
        element={isAuthenticated ? <Stake /> : <Navigate to="/login" />}
      />
      <Route
        path="/farm"
        element={isAuthenticated ? <Farm /> : <Navigate to="/login" />}
      />
      <Route
        path="/analytics"
        element={isAuthenticated ? <Analytics /> : <Navigate to="/login" />}
      />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<SignUp />} />
    </RouterRoutes>
  );
}
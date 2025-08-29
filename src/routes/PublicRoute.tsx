import { Navigate } from "react-router-dom";
import type { RootState } from "../store/store";
import { useSelector } from "react-redux";

const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isAuthenticated = useSelector(
    (state: RootState) => state.auth.isAuthenticated
  );

  return !isAuthenticated ? <>{children}</> : <Navigate to="/books" />;
};

export default PublicRoute;

import { Outlet, Navigate } from "react-router-dom";
import { useAuth } from "../context/authContext";
import Navbar from "./navbar";

export default function ProtectedLayout() {
  const { user, token } = useAuth();

  if (!token) {
    return <Navigate to="/" replace />;
  }

  return (
    <>
      <Navbar/>
      <Outlet /> 
    </>
  );
}

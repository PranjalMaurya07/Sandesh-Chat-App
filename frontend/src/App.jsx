import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/login";
import Register from "./pages/register";
import NewChat from "./pages/newChat";
import Chat from "./pages/chatRoom";
import ProtectedLayout from "./pages/protectedLayout";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected routes (Navbar + auth check) */}
        <Route element={<ProtectedLayout/>}>
          <Route path="/chat" element={<Chat/>} />
          <Route path="/new-chat" element={<NewChat />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

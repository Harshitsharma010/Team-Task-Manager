import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import AppShell     from "./components/AppShell";
import Dashboard    from "./pages/Dashboard";
import Projects     from "./pages/Projects";
import ProjectDetail from "./pages/ProjectDetail";
import MyTasks      from "./pages/MyTasks";
import Login        from "./pages/Login";
import Signup       from "./pages/Signup";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login"        element={<Login />} />
          <Route path="/signup"       element={<Signup />} />

          <Route element={<AppShell />}>
            <Route path="/dashboard"    element={<Dashboard />} />
            <Route path="/projects"     element={<Projects />} />
            <Route path="/projects/:id" element={<ProjectDetail />} />
            <Route path="/tasks"        element={<MyTasks />} />
          </Route>

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

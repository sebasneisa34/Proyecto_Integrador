import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

import PublicLayout from './layouts/PublicLayout';
import AdminLayout from './layouts/AdminLayout';

import ProtectedRoute from './routes/ProtectedRoute';
import RoleRoute from './routes/RoleRoute';

import HomePage from './pages/public/HomePage';
import PublicNoticiasPage from './pages/public/PublicNoticiasPage';
import PublicNoticiaDetailPage from './pages/public/PublicNoticiaDetailPage';
import PublicTestimoniosPage from './pages/public/PublicTestimoniosPage';
import ContactoPage from './pages/public/ContactoPage';

import LoginPage from './pages/admin/LoginPage';
import ForgotPasswordPage from './pages/admin/ForgotPasswordPage';

import DashboardPage from './pages/admin/DashboardPage';
import ProfilePage from './pages/admin/ProfilePage';
import ChangePasswordPage from './pages/admin/ChangePasswordPage';
import SecurityQuestionPage from './pages/admin/SecurityQuestionPage';

import NoticiasPage from './pages/admin/NoticiasPage';
import NoticiaFormPage from './pages/admin/NoticiaFormPage';

import TestimoniosPage from './pages/admin/TestimoniosPage';
import TestimonioFormPage from './pages/admin/TestimonioFormPage';

import SolicitudesPage from './pages/admin/SolicitudesPage';
import SolicitudFormPage from './pages/admin/SolicitudFormPage';

import UsersPage from './pages/admin/UsersPage';
import UserFormPage from './pages/admin/UserFormPage';

import AuditoriaPage from './pages/admin/AuditoriaPage';

import PublicTestimonioDetailPage from './pages/public/PublicTestimonioDetailPage';


const ALL_ADMIN_ROLES = ['superadmin', 'admin_pais', 'editor'];
const SUPERADMIN_ONLY = ['superadmin'];
const REQUEST_ROLES = ['superadmin', 'admin_pais'];

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* =========================
            RUTAS PÚBLICAS
        ========================== */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<HomePage />} />

          {/* Redirects públicos */}
          <Route
            path="/noticias"
            element={
              <Navigate
                to="/paises/argentina/noticias"
                replace
              />
            }
          />

          <Route
            path="/testimonios"
            element={
              <Navigate
                to="/paises/argentina/testimonios"
                replace
              />
            }
          />

          <Route
            path="/solicitudes"
            element={
              <Navigate
                to="/paises/argentina/solicitudes"
                replace
              />
            }
          />

          {/* Noticias públicas */}
          <Route
            path="/paises/:paisSlug/noticias"
            element={<PublicNoticiasPage />}
          />

          {/* Detalle noticia pública */}
          <Route
            path="/paises/:paisSlug/noticias/:noticiaSlug"
            element={<PublicNoticiaDetailPage />}
          />

          {/* Testimonios públicos */}
          <Route
            path="/paises/:paisSlug/testimonios"
            element={<PublicTestimoniosPage />}
          />

          <Route
            path="/paises/:paisSlug/testimonios/:id"
            element={<PublicTestimonioDetailPage />}
          />

          {/* Solicitudes públicas */}
          <Route
            path="/paises/:paisSlug/solicitudes"
            element={<ContactoPage />}
          />
        </Route>

        {/* =========================
            AUTENTICACIÓN
        ========================== */}
        <Route
          path="/admin/login"
          element={<LoginPage />}
        />

        <Route
          path="/admin/forgot-password"
          element={<ForgotPasswordPage />}
        />

        {/* =========================
            PANEL ADMINISTRATIVO
        ========================== */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route
            index
            element={
              <Navigate
                to="/admin/dashboard"
                replace
              />
            }
          />

          {/* Dashboard */}
          <Route
            path="dashboard"
            element={<DashboardPage />}
          />

          {/* =========================
              USUARIOS
          ========================== */}
          <Route
            path="users"
            element={
              <RoleRoute allowedRoles={SUPERADMIN_ONLY}>
                <UsersPage />
              </RoleRoute>
            }
          />

          <Route
            path="users/create"
            element={
              <RoleRoute allowedRoles={SUPERADMIN_ONLY}>
                <UserFormPage />
              </RoleRoute>
            }
          />

          <Route
            path="users/:id/edit"
            element={
              <RoleRoute allowedRoles={SUPERADMIN_ONLY}>
                <UserFormPage />
              </RoleRoute>
            }
          />

          {/* =========================
              AUDITORÍA
          ========================== */}
          <Route
            path="auditoria"
            element={
              <RoleRoute allowedRoles={SUPERADMIN_ONLY}>
                <AuditoriaPage />
              </RoleRoute>
            }
          />

          {/* =========================
              NOTICIAS
          ========================== */}
          <Route
            path="noticias"
            element={
              <RoleRoute allowedRoles={ALL_ADMIN_ROLES}>
                <NoticiasPage />
              </RoleRoute>
            }
          />

          <Route
            path="noticias/create"
            element={
              <RoleRoute allowedRoles={ALL_ADMIN_ROLES}>
                <NoticiaFormPage />
              </RoleRoute>
            }
          />

          <Route
            path="noticias/:id/edit"
            element={
              <RoleRoute allowedRoles={ALL_ADMIN_ROLES}>
                <NoticiaFormPage />
              </RoleRoute>
            }
          />

          {/* =========================
              TESTIMONIOS
          ========================== */}
          <Route
            path="testimonios"
            element={
              <RoleRoute allowedRoles={ALL_ADMIN_ROLES}>
                <TestimoniosPage />
              </RoleRoute>
            }
          />

          <Route
            path="testimonios/create"
            element={
              <RoleRoute allowedRoles={ALL_ADMIN_ROLES}>
                <TestimonioFormPage />
              </RoleRoute>
            }
          />

          <Route
            path="testimonios/:id/edit"
            element={
              <RoleRoute allowedRoles={ALL_ADMIN_ROLES}>
                <TestimonioFormPage />
              </RoleRoute>
            }
          />

          {/* =========================
              SOLICITUDES
          ========================== */}
          <Route
            path="solicitudes"
            element={
              <RoleRoute allowedRoles={REQUEST_ROLES}>
                <SolicitudesPage />
              </RoleRoute>
            }
          />

          <Route
            path="solicitudes/:id/edit"
            element={
              <RoleRoute allowedRoles={REQUEST_ROLES}>
                <SolicitudFormPage />
              </RoleRoute>
            }
          />

          {/* =========================
              PERFIL
          ========================== */}
          <Route
            path="profile"
            element={<ProfilePage />}
          />

          <Route
            path="change-password"
            element={<ChangePasswordPage />}
          />

          <Route
            path="security-question"
            element={<SecurityQuestionPage />}
          />
        </Route>

        {/* =========================
            RUTA NO ENCONTRADA
        ========================== */}
        <Route
          path="*"
          element={<Navigate to="/" replace />}
        />
      </Routes>
    </BrowserRouter>
  );
}
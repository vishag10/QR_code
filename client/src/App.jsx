import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import ExhibitionForm    from './components/ExhibitionForm.jsx';
import AdminLogin        from './components/AdminLogin.jsx';
import AdminDashboard    from './components/AdminDashboard.jsx';
import PrintableQRCode   from './components/PrintableQRCode.jsx';

/**
 * PrivateRoute — Redirects to /admin/login if no JWT token is present.
 */
function PrivateRoute({ children }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/admin/login" replace />;
}

/**
 * App — Root router.
 *
 * Route map:
 *   /                    → redirect to /q/exhibition
 *   /q/exhibition        → ExhibitionForm  (the QR code target — always public)
 *   /admin/login         → AdminLogin
 *   /admin/dashboard     → AdminDashboard  (protected)
 *   /admin/qr            → PrintableQRCode (protected)
 *   *                    → redirect to /q/exhibition
 */
export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* ── Public Routes ─────────────────────────────────────── */}
          <Route path="/"               element={<Navigate to="/q/exhibition" replace />} />
          <Route path="/q/exhibition"   element={<ExhibitionForm />} />
          <Route path="/admin/login"    element={<AdminLogin />} />

          {/* ── Protected Admin Routes ────────────────────────────── */}
          <Route
            path="/admin/dashboard"
            element={
              <PrivateRoute>
                <AdminDashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/qr"
            element={
              <PrivateRoute>
                <PrintableQRCode />
              </PrivateRoute>
            }
          />

          {/* ── Fallback ──────────────────────────────────────────── */}
          <Route path="*" element={<Navigate to="/q/exhibition" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

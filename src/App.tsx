import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { Layout } from './components/Layout';
import { ManufOrderProvider } from './hooks/useManufOrders';
import { BomDetail } from './pages/BomDetail';
import { BomList } from './pages/BomList';
import { Config } from './pages/Config';
import { Dashboard } from './pages/Dashboard';
import { Login } from './pages/Login';
import { ManufOrderDetail } from './pages/ManufOrderDetail';
import { ManufOrderList } from './pages/ManufOrderList';
import { OperationList } from './pages/OperationList';
import { ProdProcessDetail } from './pages/ProdProcessDetail';
import { ProdProcessList } from './pages/ProdProcessList';
import type { ReactNode } from 'react';

function RequireAuth({ children }: { children: ReactNode }) {
  const location = useLocation();
  const authed = sessionStorage.getItem('mes.auth') === '1';
  if (!authed) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return <>{children}</>;
}

function ProtectedLayout({ children }: { children: ReactNode }) {
  return (
    <RequireAuth>
      <Layout>{children}</Layout>
    </RequireAuth>
  );
}

export default function App() {
  return (
    <ManufOrderProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<ProtectedLayout><Dashboard /></ProtectedLayout>} />
        <Route path="/manuf-orders" element={<ProtectedLayout><ManufOrderList /></ProtectedLayout>} />
        <Route path="/manuf-orders/:id" element={<ProtectedLayout><ManufOrderDetail /></ProtectedLayout>} />
        <Route path="/operations" element={<ProtectedLayout><OperationList /></ProtectedLayout>} />
        <Route path="/bom" element={<ProtectedLayout><BomList /></ProtectedLayout>} />
        <Route path="/bom/:id" element={<ProtectedLayout><BomDetail /></ProtectedLayout>} />
        <Route path="/prod-process" element={<ProtectedLayout><ProdProcessList /></ProtectedLayout>} />
        <Route path="/prod-process/:id" element={<ProtectedLayout><ProdProcessDetail /></ProtectedLayout>} />
        <Route path="/config" element={<ProtectedLayout><Config /></ProtectedLayout>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </ManufOrderProvider>
  );
}

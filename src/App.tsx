import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { Layout } from './components/Layout';
import { ManufOrderProvider } from './hooks/useManufOrders';
import { ShopProvider } from './hooks/useShop';
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
import { SpecDocument } from './pages/SpecDocument';
import { ConceptLook } from './pages/shop/ConceptLook';
import { ShopFloor } from './pages/shop/ShopFloor';
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
      <ShopProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/shop" element={<ShopFloor mode="split" />} />
          <Route path="/shop/terminal" element={<ShopFloor mode="terminal" />} />
          <Route path="/shop/board" element={<ShopFloor mode="board" />} />
          <Route path="/shop/trace" element={<ShopFloor mode="trace" />} />
          <Route path="/shop/review" element={<ShopFloor mode="review" />} />
          <Route path="/shop/settings" element={<ShopFloor mode="settings" />} />
          <Route path="/shop/concept" element={<ConceptLook />} />
          <Route path="/spec" element={<SpecDocument />} />
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
      </ShopProvider>
    </ManufOrderProvider>
  );
}

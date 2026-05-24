import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Login from './pages/Login';
import Pedidos from './pages/Pedidos';
import NovoPedido from './pages/NovoPedido';
import Cadastro from './pages/Cadastro';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/cadastro" element={<Cadastro />} />
          <Route
            path="/pedidos"
            element={<PrivateRoute><Pedidos /></PrivateRoute>}
          />
          <Route
            path="/pedidos/novo"
            element={<PrivateRoute><NovoPedido /></PrivateRoute>}
          />
          <Route path="*" element={<Navigate to="/pedidos" />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
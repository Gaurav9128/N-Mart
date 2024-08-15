import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Home from './pages/Home.jsx';
import NotFound from './pages/NotFound.jsx';
import Product from './pages/Product.jsx';
import Search from './pages/Search.jsx';
import Shop from './pages/Shop.jsx';
import Cart from './pages/Cart.jsx';
import RegisterModal from './components/RegisterModal.jsx';
import Admin from './pages/Admin.jsx';
import { RecoilRoot } from 'recoil';
import ScrollTopArrow from './components/ScrollTopArrow.jsx';
import WhatsappChat from './components/WhatsappChat.jsx';
import  AuthProvider from './hooks/useAuth.jsx';
import VerificationPending from './pages/VerificationPending.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';



const router = createBrowserRouter([
  {
    path: "/",
    element : <Home />,
    errorElement : <NotFound />,
  },
  {
    path : "/product/:id",
    element : <Product />
  },
    {
    path : "/category/:category",
    element : <Shop />
  },
  {
    path : "/search",
    element: <Search />
  },
  {
    path : "/cart",
    element : <ProtectedRoute>
      <Cart/>
    </ProtectedRoute>
  },
  {
    path : "/register",
    element : <RegisterModal />
  },
  {
    path : "/admin",
    element : <Admin />
  }
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
  <RecoilRoot>
  <AuthProvider>
    <RouterProvider router={router} />
    {window.location.pathname !== '/admin' && <>
    <WhatsappChat />
    <ScrollTopArrow />
    </>}
    <div id='recaptcha-container'></div>
  </AuthProvider>
  </RecoilRoot>
  </React.StrictMode>,
)

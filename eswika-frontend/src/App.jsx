import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './context/AuthContext';

// Import your components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Products from './pages/Products';
import AddProduct from './pages/AddProduct';
import MyProducts from './pages/MyProducts';
import AdminPendingProducts  from './pages/AdminPendingProducts';
import Cart from './pages/Cart';
import Login from './pages/Login';
import Register from './pages/Register';
import Admin from './pages/Admin';
import Orders from './pages/Orders';
import FarmerOrders from './pages/FarmerOrders';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (allowedRoles && !allowedRoles.includes(user.type)) {
    return <Navigate to="/" />;
  }

  return children;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/products" element={<Products />} />
              <Route 
                path="/cart" 
                element={
                  <ProtectedRoute allowedRoles={['customer']}>
                    <Cart />
                  </ProtectedRoute>
                } 
              />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route 
                path="/admin" 
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <Admin />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/validate" 
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminPendingProducts  />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/add-product" 
                element={
                  <ProtectedRoute allowedRoles={['farmer']}>
                    <AddProduct />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/my-products"  
                element={
                  <ProtectedRoute allowedRoles={['farmer']}>
                    <MyProducts />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/farmer-orders"  
                element={
                  <ProtectedRoute allowedRoles={['farmer']}>
                    <FarmerOrders />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/orders" 
                element={
                  <ProtectedRoute allowedRoles={['customer', 'merchant', 'farmer']}>
                    <Orders />
                  </ProtectedRoute>
                } 
              />
            </Routes>
            
          </main>
          <Footer />
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
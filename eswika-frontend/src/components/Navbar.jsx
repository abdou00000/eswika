// // src/components/Navbar.jsx
// import { Link } from 'react-router-dom';
// import { useAuth } from '../context/AuthContext';
// import { ShoppingCart, User, LogOut } from 'lucide-react';
// import Orders from '../pages/Orders';

// const Navbar = () => {
//   const { user, logout } = useAuth();

//   return (
//     <nav className="bg-green-600 text-white">
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//         <div className="flex items-center justify-between h-16">
//           {/* Logo */}
//           <Link to="/" className="flex-shrink-0">
//             <span className="text-2xl font-bold">Eswika</span>
//           </Link>

//           {/* Navigation Links */}
//           <div className="hidden md:flex items-center space-x-4">
//             <Link to="/" className="px-3 py-2 rounded-md hover:bg-green-700">
//               Accueil
//             </Link>
//             <Link to="/products" className="px-3 py-2 rounded-md hover:bg-green-700">
//               Produits
//             </Link>
//             {user && (
//               <Link to="/cart" className="relative px-3 py-2 rounded-md hover:bg-green-700">
//                 <ShoppingCart className="h-6 w-6" />
//               </Link>
//             )}
//             {user && (
//               <Link to="/orders" className="px-3 py-2 rounded-md hover:bg-green-700">
//                 Orders
//               </Link>
//             )}
//             {user && (
//               <Link to="/admin" className="px-3 py-2 rounded-md hover:bg-green-700">
//                 Admin page
//               </Link>
//             )}
//           </div>

//           {/* Auth Links */}
//           <div className="flex items-center space-x-4">
//             {user ? (
//               <div className="flex items-center space-x-4">
//                 <span className="text-sm">{user.name}</span>
//                 <button
//                   onClick={logout}
//                   className="flex items-center px-3 py-2 rounded-md hover:bg-green-700"
//                 >
//                   <LogOut className="h-5 w-5" />
//                 </button>
//               </div>
//             ) : (
//               <div className="flex items-center space-x-4">
//                 <Link to="/login" className="flex items-center px-3 py-2 rounded-md hover:bg-green-700">
//                   <User className="h-5 w-5 mr-1" />
//                   Connexion
//                 </Link>
//                 <Link 
//                   to="/register"
//                   className="bg-white text-green-600 px-4 py-2 rounded-md hover:bg-gray-100"
//                 >
//                   S'inscrire
//                 </Link>
//               </div>
//             )}
//           </div>
//         </div>
//       </div>
//     </nav>
//   );
// };
// 
// export default Navbar;

import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShoppingCart, User, LogOut } from 'lucide-react';
import Orders from '../pages/Orders';

const Navbar = () => {
  const { user, logout } = useAuth();
  
  // Get user type from localStorage
  const getUserType = () => {
    const userData = localStorage.getItem('userData');
    if (userData) {
      const { type } = JSON.parse(userData);
      return type;
    }
    return null;
  };

  const userType = getUserType();

  return (
    <nav className="bg-green-600 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex-shrink-0">
            <span className="text-2xl font-bold">Eswika</span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-4">
            <Link to="/" className="px-3 py-2 rounded-md hover:bg-green-700">
              Accueil
            </Link>
            
            {/* Show Products link to all users */}
            <Link to="/products" className="px-3 py-2 rounded-md hover:bg-green-700">
              Produits
            </Link>

            {/* Admin-specific links */}
            {user && userType === 'admin' && (
              <>
                <Link to="/admin" className="px-3 py-2 rounded-md hover:bg-green-700">
                  Dashboard Admin
                </Link>
                {/* <Link to="/livraison" className="px-3 py-2 rounded-md hover:bg-green-700">
                  Status Livraison
                </Link> */}
                <Link to="/validate" className="px-3 py-2 rounded-md hover:bg-green-700">
                  Produits en attente
                </Link>
                {/* <Link to="/manage-users" className="px-3 py-2 rounded-md hover:bg-green-700">
                  Gérer Utilisateurs
                </Link> */}
              </>
            )}

            {/* Farmer-specific links */}
            {user && userType === 'farmer' && (
              <>
                <Link to="/my-products" className="px-3 py-2 rounded-md hover:bg-green-700">
                  Mes Produits
                </Link>
                <Link to="/add-product" className="px-3 py-2 rounded-md hover:bg-green-700">
                  Ajouter Produit
                </Link>
                <Link to="/farmer-orders" className="px-3 py-2 rounded-md hover:bg-green-700">
                  Commandes Reçues
                </Link>
                {/* <Link to="/farmer-orders" className="px-3 py-2 rounded-md hover:bg-green-700">
                  Commandes Reçues
                </Link> */}
              </>
            )}

            {/* Customer-specific links */}
            {user && userType === 'customer' && (
              <>
                <Link to="/cart" className="relative px-3 py-2 rounded-md hover:bg-green-700">
                  <ShoppingCart className="h-6 w-6" />
                </Link>
                <Link to="/orders" className="px-3 py-2 rounded-md hover:bg-green-700">
                  Mes Commandes
                </Link>
              </>
            )}
          </div>

          {/* Auth Links */}
          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm">{user.name}</span>
                <button
                  onClick={logout}
                  className="flex items-center px-3 py-2 rounded-md hover:bg-green-700"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link to="/login" className="flex items-center px-3 py-2 rounded-md hover:bg-green-700">
                  <User className="h-5 w-5 mr-1" />
                  Connexion
                </Link>
                <Link 
                  to="/register"
                  className="bg-white text-green-600 px-4 py-2 rounded-md hover:bg-gray-100"
                >
                  S'inscrire
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
// // src/pages/Cart.jsx
// import React, { useState, useEffect } from 'react';
// import { api } from '../services/api';
// import { useNavigate } from 'react-router-dom';
// import { useAuth } from '../context/AuthContext';
// import { Trash2, CreditCard, Truck, PlusCircle, MinusCircle } from 'lucide-react';

// const Cart = () => {
//   const [cartItems, setCartItems] = useState([]);
//   const [products, setProducts] = useState({});
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [paymentMethod, setPaymentMethod] = useState('delivery');
//   const [address, setAddress] = useState('');
//   const { user } = useAuth();
//   const navigate = useNavigate();

//   useEffect(() => {
//     fetchCartItems();
//     fetchProducts();
//   }, []);

//   const fetchCartItems = async () => {
//     try {
//       const response = await api.getOrders();
//       setCartItems(response.data);
//     } catch (error) {
//       console.error('Error fetching cart:', error);
//       setError('Erreur lors du chargement du panier');
//     }
//   };

//   const fetchProducts = async () => {
//     try {
//       const response = await api.getProducts();
//       const productsMap = {};
//       response.data.forEach(product => {
//         productsMap[product.id] = product;
//       });
//       setProducts(productsMap);
//     } catch (error) {
//       console.error('Error fetching products:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleQuantityChange = async (orderId, currentQuantity, change) => {
//     const newQuantity = Math.max(1, currentQuantity + change);
//     if (newQuantity === currentQuantity) return;

//     try {
//       await api.updateCartQuantity(orderId, newQuantity);
//       fetchCartItems(); // Refresh cart
//     } catch (error) {
//       console.error('Error updating quantity:', error);
//       alert('Erreur lors de la mise à jour de la quantité');
//     }
//   };

//   const handlePeelingToggle = async (orderId, currentPeeling) => {
//     try {
//       await api.updatePeelingOption(orderId, !currentPeeling);
//       fetchCartItems(); // Refresh cart
//     } catch (error) {
//       console.error('Error updating peeling option:', error);
//       alert('Erreur lors de la mise à jour de l\'option d\'épluchage');
//     }
//   };

//   const handleRemoveItem = async (orderId) => {
//     try {
//       await api.removeFromCart(orderId);
//       fetchCartItems(); // Refresh cart
//     } catch (error) {
//       console.error('Error removing item:', error);
//       alert('Erreur lors de la suppression de l\'article');
//     }
//   };

//   const calculateTotal = () => {
//     return cartItems.reduce((total, item) => total + item.total_price, 0);
//   };

//   const handleCheckout = async () => {
//     if (!address.trim()) {
//       alert('Veuillez entrer une adresse de livraison');
//       return;
//     }

//     try {
//       // Implement checkout logic here
//       alert('Commande passée avec succès!');
//       navigate('/orders'); // Redirect to orders page
//     } catch (error) {
//       console.error('Error during checkout:', error);
//       alert('Erreur lors de la commande');
//     }
//   };

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center min-h-screen">
//         <div className="text-xl text-gray-600">Chargement...</div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="flex items-center justify-center min-h-screen">
//         <div className="text-xl text-red-600">{error}</div>
//       </div>
//     );
//   }

//   return (
//     <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//       <h1 className="text-3xl font-bold mb-8">Votre Panier</h1>

//       {cartItems.length === 0 ? (
//         <div className="bg-white rounded-lg shadow-lg p-8 text-center">
//           <div className="text-gray-500 text-lg mb-4">Votre panier est vide</div>
//           <a href="/products" className="text-green-600 hover:text-green-700 font-medium">
//             Continuer vos achats
//           </a>
//         </div>
//       ) : (
//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
//           {/* Cart Items */}
//           <div className="lg:col-span-2 space-y-4">
//             {cartItems.map((item) => {
//               const product = products[item.product_id];
//               if (!product) return null;

//               return (
//                 <div key={item.id} className="bg-white rounded-lg shadow-lg p-6">
//                   <div className="flex items-center space-x-4">
//                   <img 
//                     src={`http://localhost:5000${product.image_url}`} 
//                     alt={product.name}
//                     className="w-full h-48 object-cover"
//                     onError={(e) => {
//                       e.target.onerror = null; 
//                       e.target.src = '/api/placeholder/400/300'
//                     }}
//                   />
//                     <div className="flex-1">
//                       <h3 className="font-semibold text-lg">{product.name}</h3>
//                       <p className="text-gray-600">{product.description}</p>
//                       <div className="mt-4 flex items-center justify-between">
//                         <div className="flex items-center space-x-2">
//                           <button
//                             onClick={() => handleQuantityChange(item.id, item.quantity, -1)}
//                             className="p-1 hover:bg-gray-100 rounded"
//                           >
//                             <MinusCircle size={20} />
//                           </button>
//                           <span className="w-8 text-center">{item.quantity}</span>
//                           <button
//                             onClick={() => handleQuantityChange(item.id, item.quantity, 1)}
//                             className="p-1 hover:bg-gray-100 rounded"
//                           >
//                             <PlusCircle size={20} />
//                           </button>
//                         </div>
//                         <span className="font-bold text-green-600">
//                           {item.total_price} MAD
//                         </span>
//                       </div>

//                       {product.peeling_available && (
//                         <div className="mt-2">
//                           <label className="flex items-center space-x-2">
//                             <input
//                               type="checkbox"
//                               checked={item.peeling_requested}
//                               onChange={() => handlePeelingToggle(item.id, item.peeling_requested)}
//                               className="form-checkbox h-4 w-4 text-green-600"
//                             />
//                             <span className="text-sm">
//                               Option d'épluchage (+{product.peeling_price} MAD)
//                             </span>
//                           </label>
//                         </div>
//                       )}
//                     </div>
//                     <button
//                       onClick={() => handleRemoveItem(item.id)}
//                       className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full"
//                     >
//                       <Trash2 size={20} />
//                     </button>
//                   </div>
//                 </div>
//               );
//             })}
//           </div>

//           {/* Order Summary */}
//           <div className="lg:col-span-1">
//             <div className="bg-white rounded-lg shadow-lg p-6 sticky top-4">
//               <h2 className="text-xl font-semibold mb-6">Résumé de la commande</h2>
              
//               <div className="space-y-4 mb-6">
//                 <div className="flex justify-between">
//                   <span>Total</span>
//                   <span className="font-bold">{calculateTotal()} MAD</span>
//                 </div>
//               </div>

//               <div className="space-y-4 mb-6">
//                 <h3 className="font-medium">Mode de paiement</h3>
//                 <div className="space-y-2">
//                   <label className="flex items-center space-x-2">
//                     <input
//                       type="radio"
//                       value="delivery"
//                       checked={paymentMethod === 'delivery'}
//                       onChange={(e) => setPaymentMethod(e.target.value)}
//                       className="form-radio text-green-600"
//                     />
//                     <Truck size={20} />
//                     <span>Paiement à la livraison</span>
//                   </label>
//                   <label className="flex items-center space-x-2">
//                     <input
//                       type="radio"
//                       value="card"
//                       checked={paymentMethod === 'card'}
//                       onChange={(e) => setPaymentMethod(e.target.value)}
//                       className="form-radio text-green-600"
//                     />
//                     <CreditCard size={20} />
//                     <span>Paiement par carte</span>
//                   </label>
//                 </div>
//               </div>

//               <div className="mb-6">
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Adresse de livraison
//                 </label>
//                 <textarea
//                   value={address}
//                   onChange={(e) => setAddress(e.target.value)}
//                   className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
//                   rows="3"
//                   placeholder="Entrez votre adresse de livraison"
//                   required
//                 />
//               </div>

//               <button
//                 onClick={handleCheckout}
//                 className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors duration-300 flex items-center justify-center space-x-2"
//               >
//                 <CreditCard size={20} />
//                 <span>Procéder au paiement</span>
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default Cart;

/////////////////////////////////////////////////////

// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { 
//   ShoppingCart, 
//   Trash2, 
//   CreditCard, 
//   Truck, 
//   ChevronUp, 
//   ChevronDown,
//   AlertCircle
// } from 'lucide-react';

// const Cart = () => {
//   const [cartItems, setCartItems] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [paymentMethod, setPaymentMethod] = useState('CASH_ON_DELIVERY');
//   const [address, setAddress] = useState('');
//   const navigate = useNavigate();

//   useEffect(() => {
//     fetchCart();
//   }, []);

//   const fetchCart = async () => {
//     try {
//       const response = await fetch('http://localhost:5000localhost:5000/api/cart', {
//         headers: {
//           'Authorization': `Bearer ${localStorage.getItem('token')}`
//         }
//       });
//       if (!response.ok) throw new Error('Failed to fetch cart');
//       const data = await response.json();
//       setCartItems(data);
//     } catch (err) {
//       setError('Unable to load your cart. Please try again later.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const updateQuantity = async (itemId, newQuantity) => {
//     try {
//       const response = await fetch(`http://localhost:5000/api/cart/${itemId}`, {
//         method: 'PUT',
//         headers: {
//           'Content-Type': 'application/json',
//           'Authorization': `Bearer ${localStorage.getItem('token')}`
//         },
//         body: JSON.stringify({ quantity: newQuantity })
//       });
      
//       if (response.status === 400) {
//         throw new Error('Insufficient stock');
//       }
      
//       if (!response.ok) throw new Error('Failed to update quantity');
      
//       fetchCart();
//     } catch (err) {
//       setError(err.message);
//     }
//   };

//   const removeItem = async (itemId) => {
//     try {
//       const response = await fetch(`http://localhost:5000/api/cart/${itemId}`, {
//         method: 'DELETE',
//         headers: {
//           'Authorization': `Bearer ${localStorage.getItem('token')}`
//         }
//       });
      
//       if (!response.ok) throw new Error('Failed to remove item');
      
//       fetchCart();
//     } catch (err) {
//       setError('Failed to remove item. Please try again.');
//     }
//   };

//   const handleCheckout = async () => {
//     if (!address.trim()) {
//       setError('Please enter a delivery address');
//       return;
//     }

//     try {
//       // Process payment
//       const paymentResponse = await fetch('http://localhost:5000/api/payment/process', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           'Authorization': `Bearer ${localStorage.getItem('token')}`
//         },
//         body: JSON.stringify({
//           payment_method: paymentMethod,
//           delivery_address: address
//         })
//       });

//       if (!paymentResponse.ok) {
//         throw new Error('Payment processing failed');
//       }

//       // Create order
//       const orderResponse = await fetch('http://localhost:5000/api/cart/checkout', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           'Authorization': `Bearer ${localStorage.getItem('token')}`
//         },
//         body: JSON.stringify({
//           delivery_address: address
//         })
//       });

//       if (!orderResponse.ok) {
//         throw new Error('Order creation failed');
//       }

//       navigate('/orders', { state: { success: true } });
//     } catch (err) {
//       setError('Checkout failed. Please try again.');
//     }
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
//       </div>
//     );
//   }

//   const totalAmount = cartItems.reduce((sum, item) => sum + item.total_price, 0);

//   return (
//     <div className="min-h-screen bg-gray-50 py-8">
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//         <div className="flex items-center justify-between mb-8">
//           <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
//             <ShoppingCart className="h-8 w-8 text-green-600" />
//             Shopping Cart
//           </h1>
//           <span className="text-sm text-gray-500">
//             {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'}
//           </span>
//         </div>

//         {error && (
//           <div className="bg-red-100 border border-red-400 text-red-700 p-4 rounded-lg mb-6 flex items-center">
//             <AlertCircle className="h-4 w-4 mr-2" />
//             <span>{error}</span>
//           </div>
//         )}

//         {cartItems.length === 0 ? (
//           <div className="bg-white rounded-lg shadow-sm p-8 text-center">
//             <div className="text-gray-500 mb-4">Your cart is empty</div>
//             <button 
//               onClick={() => navigate('/products')}
//               className="text-green-600 hover:text-green-700 font-medium"
//             >
//               Continue Shopping
//             </button>
//           </div>
//         ) : (
//           <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
//             {/* Cart Items */}
//             <div className="lg:col-span-2">
//               <div className="bg-white rounded-lg shadow-sm overflow-hidden">
//                 {cartItems.map((item, index) => (
//                   <div key={item.id} className={`p-6 ${index !== 0 ? 'border-t' : ''}`}>
//                     <div className="flex justify-between">
//                       <div className="flex-1">
//                         <h3 className="font-medium text-gray-900">{item.product_name}</h3>
//                         <p className="text-sm text-gray-500">Sold by {item.seller_name}</p>
//                         <div className="mt-4 flex items-center gap-4">
//                           <div className="flex items-center border rounded-lg">
//                             <button
//                               onClick={() => updateQuantity(item.id, item.quantity - 1)}
//                               className="p-2 hover:bg-gray-50"
//                               disabled={item.quantity <= 1}
//                             >
//                               <ChevronDown className="h-4 w-4" />
//                             </button>
//                             <span className="px-4 py-2 text-sm">{item.quantity}</span>
//                             <button
//                               onClick={() => updateQuantity(item.id, item.quantity + 1)}
//                               className="p-2 hover:bg-gray-50"
//                             >
//                               <ChevronUp className="h-4 w-4" />
//                             </button>
//                           </div>
//                           <span className="text-green-600 font-medium">
//                             {item.price_per_unit} MAD per unit
//                           </span>
//                         </div>
//                       </div>
//                       <div className="flex flex-col items-end justify-between">
//                         <button
//                           onClick={() => removeItem(item.id)}
//                           className="text-red-500 hover:text-red-600 p-2"
//                         >
//                           <Trash2 className="h-5 w-5" />
//                         </button>
//                         <span className="font-medium text-gray-900">
//                           {item.total_price} MAD
//                         </span>
//                       </div>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default Cart;

//////////////////////////////////////////////////////////////////////////

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShoppingCart, 
  Trash2, 
  CreditCard, 
  Truck, 
  ChevronUp, 
  ChevronDown,
  AlertCircle,
  MapPin,
  Wallet
} from 'lucide-react';

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('CASH_ON_DELIVERY');
  const [address, setAddress] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/cart', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch cart');
      const data = await response.json();
      setCartItems(data);
    } catch (err) {
      setError('Unable to load your cart. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (itemId, newQuantity) => {
    try {
      const response = await fetch(`http://localhost:5000/api/cart/${itemId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ quantity: newQuantity })
      });
      
      if (response.status === 400) {
        throw new Error('Insufficient stock');
      }
      
      if (!response.ok) throw new Error('Failed to update quantity');
      
      fetchCart();
    } catch (err) {
      setError(err.message);
    }
  };

  const removeItem = async (itemId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/cart/${itemId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to remove item');
      
      fetchCart();
    } catch (err) {
      setError('Failed to remove item. Please try again.');
    }
  };

  const handleCheckout = async () => {
    if (!address.trim()) {
      setError('Please enter a delivery address');
      return;
    }

    try {
      // Process payment
      // const paymentResponse = await fetch('http://localhost:5000/api/payment/process', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     'Authorization': `Bearer ${localStorage.getItem('token')}`
      //   },
      //   body: JSON.stringify({
      //     payment_method: paymentMethod,
      //     delivery_address: address
      //   })
      // });

      // if (!paymentResponse.ok) {
      //   const errorData = await paymentResponse.json();
      //   throw new Error(errorData.error || 'Payment processing failed');
      // }

      // Create order
      const orderResponse = await fetch('http://localhost:5000/api/cart/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          delivery_address: address
        })
      });

      if (!orderResponse.ok) {
        throw new Error('Order creation failed');
      }

      navigate('/orders', { state: { success: true } });
    } catch (err) {
      setError(err.message || 'Checkout failed. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  const totalAmount = cartItems.reduce((sum, item) => sum + item.total_price, 0);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <ShoppingCart className="h-8 w-8 text-green-600" />
            Shopping Cart
          </h1>
          <span className="text-sm text-gray-500">
            {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'}
          </span>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 p-4 rounded-lg mb-6 flex items-center">
            <AlertCircle className="h-4 w-4 mr-2" />
            <span>{error}</span>
          </div>
        )}

        {cartItems.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <div className="text-gray-500 mb-4">Your cart is empty</div>
            <button 
              onClick={() => navigate('/products')}
              className="text-green-600 hover:text-green-700 font-medium"
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                {cartItems.map((item, index) => (
                  <div key={item.id} className={`p-6 ${index !== 0 ? 'border-t' : ''}`}>
                    <div className="flex justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{item.product_name}</h3>
                        <p className="text-sm text-gray-500">Sold by {item.seller_name}</p>
                        <div className="mt-4 flex items-center gap-4">
                          <div className="flex items-center border rounded-lg">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="p-2 hover:bg-gray-50"
                              disabled={item.quantity <= 1}
                            >
                              <ChevronDown className="h-4 w-4" />
                            </button>
                            <span className="px-4 py-2 text-sm">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="p-2 hover:bg-gray-50"
                            >
                              <ChevronUp className="h-4 w-4" />
                            </button>
                          </div>
                          <span className="text-green-600 font-medium">
                            {item.price_per_unit} MAD per unit
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end justify-between">
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-red-500 hover:text-red-600 p-2"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                        <span className="font-medium text-gray-900">
                          {item.total_price} MAD
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Checkout Section */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-6">Order Summary</h2>
                
                {/* Payment Method Selection */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Wallet className="inline-block h-4 w-4 mr-2" />
                    Payment Method
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center space-x-3">
                      <input
                        type="radio"
                        value="CASH_ON_DELIVERY"
                        checked={paymentMethod === 'CASH_ON_DELIVERY'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="h-4 w-4 text-green-600"
                      />
                      <span className="text-sm text-gray-700">Cash on Delivery</span>
                    </label>
                    <label className="flex items-center space-x-3">
                      <input
                        type="radio"
                        value="CREDIT_CARD"
                        checked={paymentMethod === 'CREDIT_CARD'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="h-4 w-4 text-green-600"
                      />
                      <span className="text-sm text-gray-700">Credit Card</span>
                    </label>
                  </div>
                </div>

                {/* Delivery Address */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <MapPin className="inline-block h-4 w-4 mr-2" />
                    Delivery Address
                  </label>
                  <textarea
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-green-500 focus:border-green-500"
                    rows="3"
                    placeholder="Enter your delivery address"
                  />
                </div>

                {/* Order Total */}
                <div className="border-t pt-4 mb-6">
                  <div className="flex justify-between items-center text-lg font-medium">
                    <span>Total Amount</span>
                    <span className="text-green-600">{totalAmount} MAD</span>
                  </div>
                </div>

                {/* Checkout Button */}
                <button
                  onClick={handleCheckout}
                  className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 flex items-center justify-center gap-2"
                >
                  <CreditCard className="h-5 w-5" />
                  Proceed to Checkout
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;

//////////////////////////////////////////////////////////////////////////


// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom'; // For navigation

// const Cart = () => {
//   const [cartItems, setCartItems] = useState([]);
//   const [total, setTotal] = useState(0);
//   const navigate = useNavigate(); // For navigation to payment page

//   // Fetch cart items from the backend
//   useEffect(() => {
//     const fetchCartItems = async () => {
//       const response = await fetch('http://localhost:5000/api/cart', {
//         method: 'GET',
//         headers: {
//           'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
//         },
//       });

//       const data = await response.json();

//       if (response.ok) {
//         setCartItems(data);
//         const totalAmount = data.reduce((acc, item) => acc + item.total_price, 0);
//         setTotal(totalAmount);
//       } else {
//         alert(data.error || 'Error fetching cart items');
//       }
//     };

//     fetchCartItems();
//   }, []);

//   // Checkout function
//   const handleCheckout = async () => {
//     const deliveryAddress = prompt('Please enter your delivery address:'); // Request delivery address

//     if (!deliveryAddress) {
//       alert('Delivery address is required!');
//       return;
//     }

//     const response = await fetch('http://localhost:5000/api/cart/checkout', {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//         'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
//       },
//       body: JSON.stringify({ delivery_address: deliveryAddress }),
//     });

//     const data = await response.json();

//     if (response.ok) {
//       alert('Checkout successful!');
//       navigate('/payment'); // Navigate to payment page
//     } else {
//       alert(data.error || 'Error during checkout');
//     }
//   };

//   return (
//     <div>
//       <h2>Your Cart</h2>
//       <ul>
//         {cartItems.length === 0 ? (
//           <li>Your cart is empty</li>
//         ) : (
//           cartItems.map((item) => (
//             <li key={item.id}>
//               {item.product_name} - {item.quantity} x ${item.price_per_unit} = ${item.total_price} (Seller: {item.seller_name})
//             </li>
//           ))
//         )}
//       </ul>
//       <div>
//         <h3>Total: ${total}</h3>
//         <button onClick={handleCheckout} disabled={cartItems.length === 0}>
//           Checkout
//         </button>
//       </div>
//     </div>
//   );
// };

// export default Cart;

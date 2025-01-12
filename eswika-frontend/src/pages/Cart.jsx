// src/pages/Cart.jsx
import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Trash2, CreditCard, Truck, PlusCircle, MinusCircle } from 'lucide-react';

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [products, setProducts] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('delivery');
  const [address, setAddress] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchCartItems();
    fetchProducts();
  }, []);

  const fetchCartItems = async () => {
    try {
      const response = await api.getOrders();
      setCartItems(response.data);
    } catch (error) {
      console.error('Error fetching cart:', error);
      setError('Erreur lors du chargement du panier');
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await api.getProducts();
      const productsMap = {};
      response.data.forEach(product => {
        productsMap[product.id] = product;
      });
      setProducts(productsMap);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleQuantityChange = async (orderId, currentQuantity, change) => {
    const newQuantity = Math.max(1, currentQuantity + change);
    if (newQuantity === currentQuantity) return;

    try {
      await api.updateCartQuantity(orderId, newQuantity);
      fetchCartItems(); // Refresh cart
    } catch (error) {
      console.error('Error updating quantity:', error);
      alert('Erreur lors de la mise à jour de la quantité');
    }
  };

  const handlePeelingToggle = async (orderId, currentPeeling) => {
    try {
      await api.updatePeelingOption(orderId, !currentPeeling);
      fetchCartItems(); // Refresh cart
    } catch (error) {
      console.error('Error updating peeling option:', error);
      alert('Erreur lors de la mise à jour de l\'option d\'épluchage');
    }
  };

  const handleRemoveItem = async (orderId) => {
    try {
      await api.removeFromCart(orderId);
      fetchCartItems(); // Refresh cart
    } catch (error) {
      console.error('Error removing item:', error);
      alert('Erreur lors de la suppression de l\'article');
    }
  };

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => total + item.total_price, 0);
  };

  const handleCheckout = async () => {
    if (!address.trim()) {
      alert('Veuillez entrer une adresse de livraison');
      return;
    }

    try {
      // Implement checkout logic here
      alert('Commande passée avec succès!');
      navigate('/orders'); // Redirect to orders page
    } catch (error) {
      console.error('Error during checkout:', error);
      alert('Erreur lors de la commande');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-gray-600">Chargement...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-8">Votre Panier</h1>

      {cartItems.length === 0 ? (
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="text-gray-500 text-lg mb-4">Votre panier est vide</div>
          <a href="/products" className="text-green-600 hover:text-green-700 font-medium">
            Continuer vos achats
          </a>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => {
              const product = products[item.product_id];
              if (!product) return null;

              return (
                <div key={item.id} className="bg-white rounded-lg shadow-lg p-6">
                  <div className="flex items-center space-x-4">
                  <img 
                    src={`http://localhost:5000${product.image_url}`} 
                    alt={product.name}
                    className="w-full h-48 object-cover"
                    onError={(e) => {
                      e.target.onerror = null; 
                      e.target.src = '/api/placeholder/400/300'
                    }}
                  />
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{product.name}</h3>
                      <p className="text-gray-600">{product.description}</p>
                      <div className="mt-4 flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleQuantityChange(item.id, item.quantity, -1)}
                            className="p-1 hover:bg-gray-100 rounded"
                          >
                            <MinusCircle size={20} />
                          </button>
                          <span className="w-8 text-center">{item.quantity}</span>
                          <button
                            onClick={() => handleQuantityChange(item.id, item.quantity, 1)}
                            className="p-1 hover:bg-gray-100 rounded"
                          >
                            <PlusCircle size={20} />
                          </button>
                        </div>
                        <span className="font-bold text-green-600">
                          {item.total_price} MAD
                        </span>
                      </div>

                      {product.peeling_available && (
                        <div className="mt-2">
                          <label className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={item.peeling_requested}
                              onChange={() => handlePeelingToggle(item.id, item.peeling_requested)}
                              className="form-checkbox h-4 w-4 text-green-600"
                            />
                            <span className="text-sm">
                              Option d'épluchage (+{product.peeling_price} MAD)
                            </span>
                          </label>
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => handleRemoveItem(item.id)}
                      className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-lg p-6 sticky top-4">
              <h2 className="text-xl font-semibold mb-6">Résumé de la commande</h2>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between">
                  <span>Total</span>
                  <span className="font-bold">{calculateTotal()} MAD</span>
                </div>
              </div>

              <div className="space-y-4 mb-6">
                <h3 className="font-medium">Mode de paiement</h3>
                <div className="space-y-2">
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      value="delivery"
                      checked={paymentMethod === 'delivery'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="form-radio text-green-600"
                    />
                    <Truck size={20} />
                    <span>Paiement à la livraison</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      value="card"
                      checked={paymentMethod === 'card'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="form-radio text-green-600"
                    />
                    <CreditCard size={20} />
                    <span>Paiement par carte</span>
                  </label>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Adresse de livraison
                </label>
                <textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  rows="3"
                  placeholder="Entrez votre adresse de livraison"
                  required
                />
              </div>

              <button
                onClick={handleCheckout}
                className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors duration-300 flex items-center justify-center space-x-2"
              >
                <CreditCard size={20} />
                <span>Procéder au paiement</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
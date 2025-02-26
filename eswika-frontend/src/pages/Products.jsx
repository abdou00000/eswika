import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { PlusCircle, MinusCircle, ShoppingCart } from 'lucide-react';
import axios from 'axios';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [quantities, setQuantities] = useState({});
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await api.getProducts();
      setProducts(response.data);
      // Initialize quantities
      const initialQuantities = {};
      response.data.forEach(product => {
        initialQuantities[product.id] = 1;
      });
      setQuantities(initialQuantities);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching products:', error);
      setLoading(false);
    }
  };

  const handleQuantityChange = (productId, change) => {
    setQuantities(prev => ({
      ...prev,
      [productId]: Math.max(1, prev[productId] + change)
    }));
  };

  const handleAddToCart = async (productId, quantity) => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      const response = await axios.post('http://localhost:5000/api/cart/add', {
        product_id: productId,
        quantity: quantity
      }, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      // Refresh products to get updated quantities
      await fetchProducts();
      alert('Produit ajouté au panier!');
    } catch (error) {
      console.error('Error adding to cart:', error);
      if (error.response?.status === 401) {
        alert('Session expirée. Veuillez vous reconnecter.');
        navigate('/login');
      } else if (error.response?.status === 400) {
        alert(error.response.data.error || 'Quantité insuffisante en stock');
      } else {
        alert('Erreur lors de l\'ajout au panier. Veuillez réessayer.');
      }
    }
  };

  if (loading) return <div className="text-center py-8">Chargement...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-8">Nos Produits</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <div key={product.id} className="border rounded-lg overflow-hidden shadow-lg">
            
            <img 
              src={`http://localhost:5000${product.image_url}`}
              alt={product.name}
              className="w-full h-48 object-cover"
              onError={(e) => {
                e.target.onerror = null; 
                e.target.src = '/api/placeholder/400/300'
              }}
            />
            <div className="p-4">
              <h3 className="text-xl font-semibold mb-2">{product.name}</h3>
              <p className="text-gray-600 mb-2">{product.description}</p>
              <p className="text-green-600 font-bold mb-2">{product.price} MAD / {product.unit}</p>
              <p className="text-sm text-gray-500 mb-4">En stock: {product.quantity} {product.unit}</p>
              
              {/* Quantity Selector */}
              <div className="flex items-center justify-between mb-4">
                <button 
                  onClick={() => handleQuantityChange(product.id, -1)}
                  className="text-green-600 hover:text-green-700 disabled:opacity-50"
                  disabled={quantities[product.id] <= 1}
                >
                  <MinusCircle size={24} />
                </button>
                <span className="text-lg font-semibold">{quantities[product.id]}</span>
                <button 
                  onClick={() => handleQuantityChange(product.id, 1)}
                  className="text-green-600 hover:text-green-700 disabled:opacity-50"
                  disabled={quantities[product.id] >= product.quantity}
                >
                  <PlusCircle size={24} />
                </button>
              </div>

              {/* Add to Cart Button */}
              <button
                onClick={() => handleAddToCart(product.id, quantities[product.id])}
                className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={product.quantity === 0}
              >
                <ShoppingCart size={20} />
                {product.quantity === 0 ? 'Rupture de stock' : 'Ajouter au panier'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Products;
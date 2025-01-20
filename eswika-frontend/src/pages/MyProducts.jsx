import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Edit, Trash2 } from 'lucide-react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const MyProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/farmer/products', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        setProducts(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch products. Please try again later.');
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen p-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Mes Produits</h1>
          <Link
            to="/add-product"
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
          >
            Ajouter un Produit
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <div 
              key={product.id} 
              className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200"
            >
              {/* Header */}
              <div className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-xl font-semibold mb-1">{product.name}</h2>
                    <p className="text-gray-600 text-sm">{product.description}</p>
                  </div>
                  <div className={`flex items-center rounded-full px-3 py-1 text-sm ${
                    product.validated_by_admin 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {product.validated_by_admin ? (
                      <>
                        <CheckCircle className="h-4 w-4 mr-1" />
                        <span>Validé</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="h-4 w-4 mr-1" />
                        <span>En attente</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Image and Content */}
              <div className="p-4 pt-0">
                {product.image_data && (
                  <img
                    src={`data:image/jpeg;base64,${product.image_data}`}
                    alt={product.name}
                    className="w-full h-48 object-cover mb-4 rounded-md"
                  />
                )}
                <div className="space-y-2">
                  <p className="text-lg font-semibold">{product.price} €/{product.unit}</p>
                  <p className="text-gray-600">
                    Quantité disponible: {product.quantity} {product.unit}
                  </p>
                  {product.peeling_available && (
                    <p className="text-gray-600">
                      Service d'épluchage: {product.peeling_price} €/{product.unit}
                    </p>
                  )}
                  {product.validation_date && (
                    <p className="text-sm text-gray-500">
                      Validé le: {new Date(product.validation_date).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="bg-gray-50 px-4 py-3 flex justify-end gap-2 border-t border-gray-200">
                <button 
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                  aria-label="Modifier"
                >
                  <Edit className="h-5 w-5" />
                </button>
                <button 
                  className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                  aria-label="Supprimer"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {products.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              Vous n'avez pas encore ajouté de produits.
            </p>
            <Link
              to="/add-product"
              className="text-green-600 hover:text-green-700 font-medium mt-2 inline-block"
            >
              Commencer à ajouter des produits
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyProducts;
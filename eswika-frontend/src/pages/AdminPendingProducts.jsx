import React, { useState, useEffect } from 'react';
import { Check, ChevronLeft, ChevronRight } from 'lucide-react';
import axios from 'axios';

const AdminPendingProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);

  const fetchPendingProducts = async (page) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/admin/products/pending?page=${page}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      setProducts(response.data.products);
      setTotalPages(response.data.total_pages);
      setCurrentPage(response.data.current_page);
      setTotalProducts(response.data.total_products);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch pending products. Please try again later.');
      setLoading(false);
    }
  };

  const handleValidate = async (productId) => {
    try {
      await axios.post(`http://localhost:5000/api/admin/products/${productId}/validate`, {}, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      // Remove the validated product from the list
      setProducts(products.filter(p => p.id !== productId));
      setTotalProducts(prev => prev - 1);
      
      // If page becomes empty and it's not the first page, go to previous page
      if (products.length === 1 && currentPage > 1) {
        setCurrentPage(prev => prev - 1);
      }
    } catch (err) {
      alert('Failed to validate product. Please try again.');
    }
  };

  useEffect(() => {
    fetchPendingProducts(currentPage);
  }, [currentPage]);

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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Produits en Attente de Validation</h1>
          <p className="text-gray-600 mt-2">
            Total: {totalProducts} produit{totalProducts !== 1 ? 's' : ''} en attente
          </p>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-500 text-lg">
              Aucun produit en attente de validation.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {products.map(product => (
              <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
                <div className="p-6">
                  <div className="lg:flex lg:items-start lg:justify-between">
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h2 className="text-xl font-semibold text-gray-900">{product.name}</h2>
                        <span className="text-sm text-gray-500">
                          Ajouté le {new Date(product.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="mt-2 text-gray-600">{product.description}</p>
                      <div className="mt-4 space-y-2">
                        <p className="text-gray-700">Vendeur: {product.seller_name}</p>
                        <p className="text-gray-700">Prix: {product.price} €/{product.unit}</p>
                        <p className="text-gray-700">Quantité: {product.quantity} {product.unit}</p>
                        {product.peeling_available && (
                          <p className="text-gray-700">
                            Service d'épluchage: {product.peeling_price} €/{product.unit}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    {product.image_data && (
                      <div className="lg:ml-6 mt-4 lg:mt-0">
                        <img
                          src={`data:image/jpeg;base64,${product.image_data}`}
                          alt={product.name}
                          className="w-full lg:w-64 h-48 object-cover rounded-md"
                        />
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-6 flex justify-end">
                    <button
                      onClick={() => handleValidate(product.id)}
                      className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                    >
                      <Check className="h-5 w-5 mr-2" />
                      Valider
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center space-x-4 mt-8">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className={`p-2 rounded-md ${
                    currentPage === 1 
                      ? 'text-gray-400 cursor-not-allowed' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                
                <span className="text-gray-700">
                  Page {currentPage} sur {totalPages}
                </span>
                
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className={`p-2 rounded-md ${
                    currentPage === totalPages 
                      ? 'text-gray-400 cursor-not-allowed' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPendingProducts;
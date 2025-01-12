// src/pages/AddProduct.jsx
import React, { useState } from 'react';
import { api } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AddProduct = () => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('');
  const [peelingAvailable, setPeelingAvailable] = useState(false);
  const [peelingPrice, setPeelingPrice] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const productData = {
        name,
        description,
        price: parseFloat(price),
        quantity: parseInt(quantity),
        unit,
        peeling_available: peelingAvailable,
        peeling_price: parseFloat(peelingPrice),
        image_url: imageUrl,
      };

      await api.createProduct(productData);
      alert('Produit ajouté avec succès!');
      navigate('/products');
    } catch (error) {
      console.error('Error adding product:', error);
      alert('Erreur lors de l\'ajout du produit. Veuillez réessayer.');
    }
  };

  if (user?.user_type !== 'farmer') {
    return <div className="text-center py-8">Accès non autorisé.</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-8">Ajouter un produit</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Add form fields for name, description, price, quantity, unit, peeling options, and image URL */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Nom
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
          />
        </div>
        {/* Add similar fields for other product details */}
        <button
          type="submit"
          className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700"
        >
          Ajouter le produit
        </button>
      </form>
    </div>
  );
};

export default AddProduct;
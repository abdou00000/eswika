import React, { useState } from 'react';
import { api } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const AddProduct = () => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('');
  const [peelingAvailable, setPeelingAvailable] = useState(false);
  const [peelingPrice, setPeelingPrice] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [productImage, setProductImage] = useState(null); // New state to store the image file
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleImageChange = (e) => {
    setProductImage(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!productImage) {
      alert('Veuillez télécharger une image du certificat');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('description', description);
      formData.append('price', parseFloat(price));
      formData.append('quantity', parseInt(quantity));
      formData.append('unit', unit);
      formData.append('peeling_available', peelingAvailable);
      formData.append('peeling_price', parseFloat(peelingPrice));
      formData.append('image_url', imageUrl);
      formData.append('product_image', productImage); // Append the image file

      const response = await axios.post('http://localhost:5000/api/products', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${localStorage.getItem('token')}`, // Add the JWT token for authentication
        },
      });

      alert('Produit ajouté avec succès! en attente de validation de l\'admin');
      navigate('/products');
    } catch (error) {
      console.error('Error adding product:', error);
      alert('Erreur lors de l\'ajout du produit. Veuillez réessayer.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-8">Ajouter un produit</h1>
      <form onSubmit={handleSubmit} className="space-y-6" encType="multipart/form-data">
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

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
          />
        </div>

        <div>
          <label htmlFor="price" className="block text-sm font-medium text-gray-700">
            Prix
          </label>
          <input
            type="number"
            id="price"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
          />
        </div>

        <div>
          <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">
            Quantité
          </label>
          <input
            type="number"
            id="quantity"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            required
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
          />
        </div>

        <div>
          <label htmlFor="unit" className="block text-sm font-medium text-gray-700">
            Unité
          </label>
          <input
            type="text"
            id="unit"
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
            required
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
          />
        </div>

        <div>
          <label htmlFor="peeling_available" className="block text-sm font-medium text-gray-700">
            Peeling disponible
          </label>
          <input
            type="checkbox"
            id="peeling_available"
            checked={peelingAvailable}
            onChange={(e) => setPeelingAvailable(e.target.checked)}
            className="mt-1"
          />
        </div>

        <div>
          <label htmlFor="peeling_price" className="block text-sm font-medium text-gray-700">
            Prix du peeling
          </label>
          <input
            type="number"
            id="peeling_price"
            value={peelingPrice}
            onChange={(e) => setPeelingPrice(e.target.value)}
            required={peelingAvailable}
            disabled={!peelingAvailable}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
          />
        </div>

        <div>
          <label htmlFor="product_image" className="block text-sm font-medium text-gray-700">
            Image du certificat
          </label>
          <input
            type="file"
            id="product_image"
            onChange={handleImageChange}
            required
            className="mt-1 block w-full"
          />
        </div>

        <div>
          <label htmlFor="image_url" className="block text-sm font-medium text-gray-700">
            URL de l'image du produit
          </label>
          <input
            type="url"
            id="image_url"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
          />
        </div>

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

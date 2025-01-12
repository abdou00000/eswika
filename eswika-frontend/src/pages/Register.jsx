// src/pages/Register.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api'; // Import api instead of useAuth
import backgroundImage from './back.jpg';

const Register = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    phone: '',
    address: '',
    user_type: 'customer'
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      console.log('Sending registration data:', formData);
      const response = await api.register(formData);
      console.log('Registration successful:', response);
      alert('Inscription réussie! Veuillez vous connecter.');
      navigate('/login');
    } catch (error) {
      console.error('Registration error:', error);
      if (error.response?.data?.error) {
        setError(error.response.data.error);
      } else if (error.message === 'Network Error') {
        setError('Erreur de connexion au serveur');
      } else {
        setError('Erreur lors de l\'inscription');
      }
    }
  };

  // Rest of your JSX remains the same
  return (
    <div className="relative w-full h-screen flex items-center justify-center overflow-hidden bg-black">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 w-full h-full"
        style={{
          backgroundImage: `url(${backgroundImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      />
      
      {/* Form Container */}
      <div className="relative z-10 bg-white/20 backdrop-blur-lg rounded-2xl shadow-lg w-[90%] max-w-sm mx-4">
        {/* Form Content */}
        <div className="p-6 space-y-4">
          {/* Header */}
          <div className="text-center mb-4">
            <h1 className="text-3xl font-bold text-white">Eswika</h1>
            <p className="text-white/90 text-sm mt-1">Créer un compte</p>
          </div>
          
          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded text-sm">
                {error}
              </div>
            )}
            
            <input
              name="name"
              type="text"
              required
              value={formData.name}
              onChange={handleChange}
              className="w-full bg-white/90 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Nom complet"
            />
            
            <input
              name="email"
              type="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="w-full bg-white/90 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Email"
            />
            
            <input
              name="password"
              type="password"
              required
              value={formData.password}
              onChange={handleChange}
              className="w-full bg-white/90 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Mot de passe"
            />
            
            <input
              name="phone"
              type="tel"
              required
              value={formData.phone}
              onChange={handleChange}
              className="w-full bg-white/90 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Téléphone"
            />
            
            <input
              name="address"
              type="text"
              required
              value={formData.address}
              onChange={handleChange}
              className="w-full bg-white/90 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Adresse"
            />

            <select
              name="user_type"
              value={formData.user_type}
              onChange={handleChange}
              className="w-full bg-white/90 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="customer">Client</option>
              <option value="farmer">Agriculteur</option>
            </select>

            <button
              type="submit"
              className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors duration-300 text-sm font-medium mt-2"
            >
              S'inscrire
            </button>
          </form>
          
          {/* Login Link */}
          <div className="text-center pt-2">
            <Link 
              to="/login" 
              className="text-white/90 hover:text-white text-sm transition-colors duration-300"
            >
              Déjà un compte ? Se connecter
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
// src/pages/Home.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Slider from 'react-slick';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { api } from '../services/api';

// Import your images
import slide1 from './S1.jpg';
import slide2 from './S2.jpg';
import slide3 from './S3.png';
import vegetablesBox from './box.jpg'; 

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await api.getProducts();
        setFeaturedProducts(response.data.slice(0, 4));
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };

    fetchProducts();
  }, []);

  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero Section with Slideshow */}
      <div className="mb-16">
        <Slider {...sliderSettings}>
          <div className="relative h-[500px] rounded-xl overflow-hidden">
            <img 
              src={slide1} 
              alt="Slide 1" 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40">
              <div className="text-center text-white">
                <h1 className="text-5xl font-bold mb-4">Bienvenue chez Eswika</h1>
                <p className="text-xl mb-8">Des produits frais, directement des producteurs</p>
                <Link 
                  to="/products" 
                  className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700"
                >
                  Découvrir nos produits
                </Link>
              </div>
            </div>
          </div>
          <div className="relative h-[500px] rounded-xl overflow-hidden">
            <img 
              src={slide2} 
              alt="Slide 2" 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40">
              <div className="text-center text-white">
                <h1 className="text-5xl font-bold mb-4">Produits Locaux</h1>
                <p className="text-xl mb-8">Soutenez les agriculteurs de votre région</p>
              </div>
            </div>
          </div>
          <div className="relative h-[500px] rounded-xl overflow-hidden">
            <img 
              src={slide3} 
              alt="Slide 3" 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40">
              <div className="text-center text-white">
                <h1 className="text-5xl font-bold mb-4">Service d'Épluchage</h1>
                <p className="text-xl mb-8">Gagnez du temps avec notre service de préparation</p>
              </div>
            </div>
          </div>
        </Slider>
      </div>

      {/* Special Offer Section */}
      

      {/* Featured Products */}
      <section className="mb-16">
        <h2 className="text-3xl font-bold mb-8">Produits Vedettes</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProducts.map((product) => (
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
                <p className="text-green-600 font-bold">{product.price}€ / {product.unit}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="text-center mt-8">
          <Link 
            to="/products" 
            className="inline-block bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
          >
            Voir tous les produits
          </Link>
        </div>
      </section>
      <section className="mb-16">
  <div className="flex flex-col md:flex-row items-center">
    {/* Image Side */}
    <div className="md:w-1/2">
      <img 
        src={vegetablesBox}
        alt="Fresh vegetables in wooden box"
        className="w-full h-full object-cover"
      />
    </div>
    
    {/* Content Side */}
    <div className="md:w-1/2 p-8 md:p-12">
      <div className="text-center md:text-left">
        <h3 className="text-gray-600 text-xl mb-2">Special Offers</h3>
        <h2 className="text-4xl md:text-6xl font-bold text-green-600 mb-4">
          GET 30% OFF
        </h2>
        <p className="text-gray-700 text-lg md:text-xl mb-6">
          YOUR ORDER OF 100MAD OR MORE
        </p>
        <div className="space-y-4">
          <div className="text-gray-600">
            Expire le: 11/01/2025
          </div>
          <Link 
            to="/products" 
            className="inline-block bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition-colors duration-200"
          >
            SHOP NOW
          </Link>
        </div>
      </div>
    </div>
  </div>
</section>
      {/* About Section */}
      <section className="mb-16">
        <h2 className="text-3xl font-bold mb-8">À Propos d'Eswika</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div>
            <h3 className="text-2xl font-semibold mb-4">Notre Mission</h3>
            <p className="text-lg text-gray-600 mb-4">
              Eswika connecte directement les consommateurs aux agriculteurs locaux, 
              garantissant des produits frais et de qualité tout en soutenant 
              l'économie locale.
            </p>
            <p className="text-lg text-gray-600">
              Notre service unique d'épluchage vous fait gagner du temps tout en 
              maintenant la fraîcheur de vos produits.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div className="text-center p-6 bg-green-50 rounded-lg">
              <h4 className="text-xl font-bold mb-2">Fraîcheur</h4>
              <p>Des produits cueillis à la commande</p>
            </div>
            <div className="text-center p-6 bg-green-50 rounded-lg">
              <h4 className="text-xl font-bold mb-2">Local</h4>
              <p>Soutien aux agriculteurs locaux</p>
            </div>
            <div className="text-center p-6 bg-green-50 rounded-lg">
              <h4 className="text-xl font-bold mb-2">Qualité</h4>
              <p>Produits soigneusement sélectionnés</p>
            </div>
            <div className="text-center p-6 bg-green-50 rounded-lg">
              <h4 className="text-xl font-bold mb-2">Service</h4>
              <p>Épluchage et préparation disponibles</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
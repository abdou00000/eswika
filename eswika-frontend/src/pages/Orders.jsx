// src/pages/Orders.jsx
import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await api.getOrders();
      setOrders(response.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Chargement...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-8">Mes Commandes</h1>
      {orders.map((order) => (
        <div key={order.id} className="border rounded-lg p-4 mb-4">
          <p>ID de commande : {order.id}</p>
          <p>Produit : {order.product_id}</p>
          <p>Quantité : {order.quantity}</p>
          <p>Prix total : {order.total_price} MAD</p>
          <p>Statut : {order.status}</p>
          <p>Adresse de livraison : {order.delivery_address}</p>
          <p>Date de commande : {new Date(order.created_at).toLocaleDateString()}</p>
        </div>
      ))}
    </div>
  );
};

export default Orders;
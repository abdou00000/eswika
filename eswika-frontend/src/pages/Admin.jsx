// src/pages/Admin.jsx
import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { UserPlus, X, ChevronDown, Users, ShoppingBag, ChartBar } from 'lucide-react';

const Admin = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddUser, setShowAddUser] = useState(false);

  // État pour le formulaire d'ajout d'utilisateur
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    user_type: 'customer',
    address: ''
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await api.getAdminStats();
      setStats(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching stats:', error);
      setError('Erreur lors du chargement des statistiques');
      setLoading(false);
    }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    try {
      await api.register(newUser);
      alert('Utilisateur ajouté avec succès');
      setShowAddUser(false);
      fetchStats(); // Rafraîchir les stats
    } catch (error) {
      alert('Erreur lors de l\'ajout de l\'utilisateur');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
      try {
        await api.deleteUser(userId);
        alert('Utilisateur supprimé avec succès');
        fetchStats(); // Rafraîchir les stats
      } catch (error) {
        alert('Erreur lors de la suppression de l\'utilisateur');
      }
    }
  };

  if (loading) return <div className="text-center py-8">Chargement...</div>;
  if (error) return <div className="text-center py-8 text-red-600">{error}</div>;
  if (!stats) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Tableau de bord Admin</h1>
        <button
          onClick={() => setShowAddUser(true)}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2"
        >
          <UserPlus size={20} />
          Ajouter un utilisateur
        </button>
      </div>

      {/* Statistiques générales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center gap-4">
            <Users className="text-green-600" size={24} />
            <div>
              <h3 className="text-gray-500 text-sm">Nombre de comptes</h3>
              <p className="text-2xl font-bold">{stats.users.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center gap-4">
            <ShoppingBag className="text-green-600" size={24} />
            <div>
              <h3 className="text-gray-500 text-sm">Nombre de commandes</h3>
              <p className="text-2xl font-bold">{stats.sales.total_orders}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center gap-4">
            <ChartBar className="text-green-600" size={24} />
            <div>
              <h3 className="text-gray-500 text-sm">Revenu total</h3>
              <p className="text-2xl font-bold">{stats.sales.total_revenue} MAD</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tableau des meilleurs vendeurs */}
      <div className="bg-white rounded-lg shadow-lg mb-8">
        <div className="px-6 py-4 border-b">
          <h2 className="text-xl font-semibold">Top Vendeurs</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nom
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nombre de ventes
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total des ventes
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {stats.top_sellers.map((seller, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">{seller.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{seller.total_orders}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{seller.total_sales} MAD</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal d'ajout d'utilisateur */}
      {showAddUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Ajouter un utilisateur</h2>
              <button
                onClick={() => setShowAddUser(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom complet
                </label>
                <input
                  type="text"
                  required
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mot de passe
                </label>
                <input
                  type="password"
                  required
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Téléphone
                </label>
                <input
                  type="tel"
                  value={newUser.phone}
                  onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type d'utilisateur
                </label>
                <select
                  value={newUser.user_type}
                  onChange={(e) => setNewUser({ ...newUser, user_type: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                >
                  <option value="customer">Client</option>
                  <option value="farmer">Agriculteur</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Adresse
                </label>
                <textarea
                  value={newUser.address}
                  onChange={(e) => setNewUser({ ...newUser, address: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                  rows="3"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700"
              >
                Ajouter l'utilisateur
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;
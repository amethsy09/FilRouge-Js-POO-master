import { BoutiquierService } from "../../domain/boutiquier/boutiquier.service.js";
import { BoutiquierRepository } from "../../data/api/boutiquierRepository.js";
import { Modal } from "../components/Modal.js";
import { AuthService } from "../../domain/auth/auth.service.js";
import { AuthRepository } from "../../data/api/authRepository.js";
import { ClientService } from "../../domain/client/client.service.js";
import { ClientRepository } from "../../data/api/clientRepository.js";

export default class BoutiquierDashboardScreen {
  constructor(root) {
    this.root = root;
    this.boutiquierSvc = new BoutiquierService(new BoutiquierRepository());
    this.authSvc = new AuthService(new AuthRepository());
    this.clientSvc = new ClientService(new ClientRepository());
    this.state = {
      currentUser: null,
      clients: [],
      stats: {
        totalClients: 0,
        totalProducts: 0,
        totalSales: 0
      }
    };
  }

  async render() {
    this.state.currentUser = await this.authSvc.getCurrentUser();
    await this._loadData();

    this.root.innerHTML = `
      <div class="container mx-auto p-4 md:p-6">
        <!-- Header -->
        <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h1 class="text-2xl font-bold text-gray-800">Bonjour, ${this.state.currentUser?.prenom || 'Boutiquier'}</h1>
            <p class="text-gray-600">Votre tableau de bord</p>
          </div>
          <div class="flex flex-wrap gap-2 w-full md:w-auto">
            <button id="btn-add-client" class="flex items-center bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors">
              <i class="fas fa-user-plus mr-2"></i> Nouveau client
            </button>
            <button id="btn-logout" class="flex items-center bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg transition-colors">
              <i class="fas fa-sign-out-alt mr-2"></i> Déconnexion
            </button>
          </div>
        </div>

        <!-- Stats Cards -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <div class="bg-white p-4 rounded-lg shadow border-l-4 border-indigo-500">
            <div class="flex justify-between items-start">
              <div>
                <p class="text-sm font-medium text-gray-500">Clients</p>
                <p class="text-2xl font-bold">${this.state.stats.totalClients}</p>
              </div>
              <div class="bg-indigo-100 p-2 rounded-full">
                <i class="fas fa-users text-indigo-600"></i>
              </div>
            </div>
            <p class="text-xs text-gray-500 mt-2">+${Math.floor(Math.random() * 10)}% ce mois</p>
          </div>

          <div class="bg-white p-4 rounded-lg shadow border-l-4 border-blue-500">
            <div class="flex justify-between items-start">
              <div>
                <p class="text-sm font-medium text-gray-500">Produits</p>
                <p class="text-2xl font-bold">${this.state.stats.totalProducts}</p>
              </div>
              <div class="bg-blue-100 p-2 rounded-full">
                <i class="fas fa-boxes text-blue-600"></i>
              </div>
            </div>
            <p class="text-xs text-gray-500 mt-2">+${Math.floor(Math.random() * 5)}% ce mois</p>
          </div>

          <div class="bg-white p-4 rounded-lg shadow border-l-4 border-green-500">
            <div class="flex justify-between items-start">
              <div>
                <p class="text-sm font-medium text-gray-500">Ventes</p>
                <p class="text-2xl font-bold">${this.state.stats.totalSales}</p>
              </div>
              <div class="bg-green-100 p-2 rounded-full">
                <i class="fas fa-shopping-cart text-green-600"></i>
              </div>
            </div>
            <p class="text-xs text-gray-500 mt-2">+${Math.floor(Math.random() * 15)}% ce mois</p>
          </div>
        </div>

        <!-- Recent Clients -->
        <div class="bg-white rounded-lg shadow overflow-hidden mb-6">
          <div class="p-4 border-b flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <h2 class="text-lg font-semibold text-gray-800">Clients récents</h2>
            <div class="flex gap-2">
              <a href="#clients" class="text-sm text-indigo-600 hover:text-indigo-800 flex items-center">
                Voir tous <i class="fas fa-arrow-right ml-1"></i>
              </a>
            </div>
          </div>
          
          <div class="overflow-x-auto">
            ${this.state.clients.length > 0 ? `
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Inscription</th>
                    <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  ${this._renderClientsRows()}
                </tbody>
              </table>
            ` : `
              <div class="p-8 text-center">
                <i class="fas fa-users text-4xl text-gray-300 mb-3"></i>
                <p class="text-gray-500">Aucun client enregistré</p>
                <button id="btn-add-client-empty" class="mt-4 text-indigo-600 hover:text-indigo-800 font-medium">
                  Ajouter votre premier client
                </button>
              </div>
            `}
          </div>
        </div>
      </div>
    `;

    this.setUpEventListeners();
  }

  async _loadData() {
    try {
      // Charger les clients associés à ce boutiquier
      this.state.clients = await this.clientSvc.list();
      
      // Mettre à jour les statistiques
      this.state.stats = {
        totalClients: this.state.clients.length,
        totalProducts: 0, // À remplacer par votre logique métier
        totalSales: 0    // À remplacer par votre logique métier
      };
      
    } catch (error) {
      console.error("Erreur de chargement des données:", error);
    }
  }

  _renderClientsRows() {
    return this.state.clients
      .slice(0, 5)
      .map(client => `
        <tr class="hover:bg-gray-50">
          <td class="px-6 py-4 whitespace-nowrap">
            <div class="flex items-center">
              <div class="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                ${client.photo ? 
                  `<img src="${client.photo}" alt="${client.nom}" class="h-full w-full object-cover">` : 
                  `<i class="fas fa-user text-gray-400"></i>`
                }
              </div>
              <div class="ml-4">
                <div class="font-medium text-gray-900">${client.nom} ${client.prenom}</div>
                ${client.telephone ? `<div class="text-sm text-gray-500">${client.telephone}</div>` : ''}
              </div>
            </div>
          </td>
          <td class="px-6 py-4 whitespace-nowrap">
            <div class="text-gray-900">${client.email}</div>
          </td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
            ${new Date(client.createdAt || new Date()).toLocaleDateString()}
          </td>
          <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
            <a href="#client/${client.id}" class="text-indigo-600 hover:text-indigo-900 mr-3" title="Voir">
              <i class="fas fa-eye"></i>
            </a>
            <button class="text-gray-500 hover:text-gray-700 mr-3" data-action="edit" data-id="${client.id}" title="Éditer">
              <i class="fas fa-edit"></i>
            </button>
            <button class="text-red-500 hover:text-red-700" data-action="delete" data-id="${client.id}" title="Supprimer">
              <i class="fas fa-trash"></i>
            </button>
          </td>
        </tr>
      `).join('');
  }

  _renderAddClientForm() {
    const form = document.createElement('form');
    form.className = 'space-y-4';
    form.innerHTML = `
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Nom *</label>
          <input type="text" name="nom" required 
                 class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Prénom *</label>
          <input type="text" name="prenom" required 
                 class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
        </div>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Email *</label>
        <input type="email" name="email" required 
               class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
          <input type="tel" name="telephone" 
                 class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Mot de passe *</label>
          <input type="password" name="password" required minlength="6"
                 class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
        </div>
      </div>

      <div class="pt-4 flex justify-end space-x-3">
        <button type="button" id="btn-cancel" class="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
          Annuler
        </button>
        <button type="submit" class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
          Enregistrer
        </button>
      </div>
    `;

    const modal = new Modal('Ajouter un nouveau client', form);
    modal.open();

    form.querySelector('#btn-cancel').addEventListener('click', () => modal.close());

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(form);
      const clientData = {
        nom: formData.get('nom'),
        prenom: formData.get('prenom'),
        email: formData.get('email'),
        telephone: formData.get('telephone'),
        password: formData.get('password'),
        id_role: '2'
      };

      try {
        await this.clientSvc.create(clientData);
        modal.close();
        await this.render();
      } catch (error) {
        alert(`Erreur: ${error.message}`);
      }
    });
  }

  setUpEventListeners() {
    // Bouton d'ajout de client
    this.root.querySelector('#btn-add-client')?.addEventListener('click', () => this._renderAddClientForm());
    this.root.querySelector('#btn-add-client-empty')?.addEventListener('click', () => this._renderAddClientForm());

    // Bouton de déconnexion
    this.root.querySelector('#btn-logout')?.addEventListener('click', async () => {
      try {
        await this.authSvc.logout();
        window.location.hash = "#auth/login"; // Redirige vers la page de connexion
      } catch (error) {
        console.error("Erreur lors de la déconnexion:", error);
      }
    });

    // Actions sur les clients
    this.root.querySelectorAll('[data-action="delete"]').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const clientId = e.currentTarget.dataset.id;
        if (confirm('Êtes-vous sûr de vouloir supprimer ce client ?')) {
          try {
            await this.clientSvc.delete(clientId);
            await this.render();
          } catch (error) {
            alert(`Erreur lors de la suppression: ${error.message}`);
          }
        }
      });
    });

    this.root.querySelectorAll('[data-action="edit"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const clientId = e.currentTarget.dataset.id;
        window.location.hash = `#client/${clientId}/edit`;
      });
    });
  }
}
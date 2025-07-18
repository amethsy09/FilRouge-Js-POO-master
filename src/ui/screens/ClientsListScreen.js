// ClientsListScreen.js
import { ClientService } from "../domain/client/client.service.js";
import { ClientRepository } from "../data/api/clientRepository.js";

export default class ClientsListScreen {
  constructor(root) {
    this.root = root;
    this.clientSvc = new ClientService(new ClientRepository());
    this.state = {
      clients: []
    };
  }

  async render() {
    await this._loadClients();

    this.root.innerHTML = `
      <div class="container mx-auto p-6">
        <div class="flex justify-between items-center mb-6">
          <h1 class="text-2xl font-bold">Liste des clients</h1>
          <button id="btn-add-client" class="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700">
            Ajouter un client
          </button>
        </div>

        <div class="bg-white rounded-lg shadow overflow-hidden">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prénom</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              ${this.state.clients.map(client => `
                <tr>
                  <td class="px-6 py-4 whitespace-nowrap">${client.nom}</td>
                  <td class="px-6 py-4 whitespace-nowrap">${client.prenom}</td>
                  <td class="px-6 py-4 whitespace-nowrap">${client.email}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;

    this.setUpEventListeners();
  }

  async _loadClients() {
    try {
      this.state.clients = await this.clientSvc.list();
    } catch (error) {
      console.error("Erreur de chargement:", error);
      this.root.innerHTML = `<p class="text-red-500">Erreur lors du chargement des clients</p>`;
    }
  }

  setUpEventListeners() {
    this.root.querySelector("#btn-add-client")?.addEventListener("click", () => {
      window.location.hash = "#add-client";
    });
  }
}
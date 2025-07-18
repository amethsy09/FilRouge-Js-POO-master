// AddClientScreen.js
import { ClientService } from "../domain/client/client.service.js";
import { ClientRepository } from "../data/api/clientRepository.js";

export default class AddClientScreen {
  constructor(root) {
    this.root = root;
    this.clientSvc = new ClientService(new ClientRepository());
  }

  render() {
    this.root.innerHTML = `
      <div class="container mx-auto p-6">
        <button id="btn-back" class="mb-4 text-indigo-600 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clip-rule="evenodd" />
          </svg>
          Retour
        </button>

        <div class="bg-white rounded-xl shadow-lg p-6 max-w-md mx-auto">
          <h1 class="text-2xl font-bold mb-6">Ajouter un nouveau client</h1>
          
          <form id="client-form" class="space-y-4">
            <div>
              <label for="nom" class="block text-sm font-medium text-gray-700">Nom</label>
              <input type="text" id="nom" name="nom" required class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
            </div>

            <div>
              <label for="prenom" class="block text-sm font-medium text-gray-700">Prénom</label>
              <input type="text" id="prenom" name="prenom" required class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
            </div>

            <div>
              <label for="email" class="block text-sm font-medium text-gray-700">Email</label>
              <input type="email" id="email" name="email" required class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
            </div>

            <div>
              <label for="password" class="block text-sm font-medium text-gray-700">Mot de passe</label>
              <input type="password" id="password" name="password" required class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
            </div>

            <div>
              <button type="submit" class="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                Créer le client
              </button>
            </div>
          </form>
        </div>
      </div>
    `;

    this.setUpEventListeners();
  }

  setUpEventListeners() {
    this.root.querySelector("#btn-back")?.addEventListener("click", () => {
      window.location.hash = "#clients";
    });

    this.root.querySelector("#client-form")?.addEventListener("submit", async (e) => {
      e.preventDefault();
      
      const formData = new FormData(e.target);
      const client = {
        nom: formData.get("nom"),
        prenom: formData.get("prenom"),
        email: formData.get("email"),
        password: formData.get("password")
      };

      try {
        await this.clientSvc.create(client);
        alert("Client créé avec succès!");
        window.location.hash = "#clients";
      } catch (error) {
        alert(`Erreur: ${error.message}`);
      }
    });
  }
}
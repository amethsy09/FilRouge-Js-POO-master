import { BoutiquierService } from "../../domain/boutiquier/boutiquier.service.js";
import { BoutiquierRepository } from "../../data/api/boutiquierRepository.js";
import { AuthService } from "../../domain/auth/auth.service.js";
import { AuthRepository } from "../../data/api/authRepository.js";

export default class BoutiquierDetailsScreen {
  constructor(root, params) {
    this.root = root;
    this.authSvc = new AuthService(new AuthRepository());
    
    // Gestion de l'ID (support de 'me' pour l'utilisateur courant)
    if (params.id === 'me') {
      const user = this.authSvc.getCurrentUserSync();
      this.boutiquierId = user?.id;
    } else {
      this.boutiquierId = params.id || params[0]; // Support ancien et nouveau routeur
    }

    if (!this.boutiquierId) {
      console.error("ID boutiquier manquant dans les params:", params);
      window.location.hash = "#boutiquier";
      return;
    }

    this.boutiquierSvc = new BoutiquierService(new BoutiquierRepository());
    this.state = {
      boutiquier: null,
      isCurrentUser: params.id === 'me'
    };
  }

  async render() {
    await this._loadBoutiquier();

    if (!this.state.boutiquier) {
      this.root.innerHTML = `
        <div class="p-4 bg-red-100 text-red-700 rounded">
          <p>Boutiquier non trouvé</p>
          <button onclick="window.location.hash='#boutiquier'" 
                  class="mt-2 px-4 py-2 bg-gray-200 rounded">
            Retour au tableau de bord
          </button>
        </div>
      `;
      return;
    }

    const b = this.state.boutiquier;
    const currentUser = this.authSvc.getCurrentUserSync();

    this.root.innerHTML = `
      <div class="container mx-auto p-6">
        <div class="flex justify-between items-center mb-4">
          <button id="btn-back" class="text-indigo-600 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clip-rule="evenodd" />
            </svg>
            Retour
          </button>
          
          ${this.state.isCurrentUser ? `
            <a href="#clients/add" class="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors">
              <i class="fas fa-user-plus mr-2"></i> Ajouter un client
            </a>
          ` : ''}
        </div>
        
        <div class="bg-white rounded-xl shadow-lg overflow-hidden">
          <div class="md:flex">
            <div class="md:w-1/3 p-6">
              <div class="h-64 bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
                ${
                  b.photo
                    ? `<img src="${b.photo}" alt="${b.nom}" class="h-full w-full object-cover">`
                    : '<span class="text-gray-500">Pas de photo</span>'
                }
              </div>
              
              ${this.state.isCurrentUser ? `
                <div class="mt-4 text-center">
                  <a href="#boutiquiers/me/edit" class="text-indigo-600 hover:text-indigo-800">
                    <i class="fas fa-edit mr-1"></i> Modifier mon profil
                  </a>
                </div>
              ` : ''}
            </div>
            
            <div class="md:w-2/3 p-6">
              <h1 class="text-3xl font-bold">${b.nom} ${b.prenom}</h1>
              <p class="text-gray-600 mt-2">${b.email}</p>
              
              <div class="mt-6 space-y-4">
                <div>
                  <h3 class="text-lg font-semibold">Informations</h3>
                  <p>Role: ${this._getRoleName(b.id_role)}</p>
                  ${b.telephone ? `<p>Téléphone: ${b.telephone}</p>` : ''}
                </div>
                
                <div>
                  <a href="#clients" class="inline-flex items-center text-indigo-600 hover:text-indigo-800">
                    <i class="fas fa-users mr-2"></i> Voir la liste des clients
                  </a>
                </div>
              </div>
            </div>
          </div>
          
          ${b.localisation ? `
            <div class="p-6 border-t">
              <h2 class="text-xl font-semibold mb-4">Localisation de la boutique</h2>
              <div id="map" class="h-96 bg-gray-200 rounded-lg"></div>
            </div>
          ` : ''}
        </div>
      </div>
    `;

    if (b.localisation) {
      this._initMap(b.localisation);
    }

    this.setUpEventListeners();
  }

  _getRoleName(roleId) {
    const roles = {
      "1": "Admin",
      "2": "Client",
      "3": "Boutiquier"
    };
    return roles[roleId] || "Inconnu";
  }

  _initMap(localisation) {
    const { lat, lng } = localisation;
    const mapEl = this.root.querySelector("#map");

    if (mapEl) {
      mapEl.innerHTML = `
        <iframe 
          width="100%" 
          height="100%" 
          frameborder="0" 
          scrolling="no" 
          marginheight="0" 
          marginwidth="0" 
          src="https://maps.google.com/maps?q=${lat},${lng}&z=15&output=embed">
        </iframe>
      `;
    }
  }

  async _loadBoutiquier() {
    if (!this.boutiquierId) return;

    try {
      this.state.boutiquier = await this.boutiquierSvc.get(this.boutiquierId);
    } catch (error) {
      console.error("Erreur de chargement:", error);
      this.state.error = error.message;
    }
  }

  setUpEventListeners() {
    this.root.querySelector("#btn-back")?.addEventListener("click", () => {
      window.location.hash = this.state.isCurrentUser ? "#boutiquier" : "#boutiquiers";
    });
  }
}
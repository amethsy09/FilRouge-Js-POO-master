import { BoutiquierService } from "../../domain/boutiquier/boutiquier.service.js";
import { BoutiquierRepository } from "../../data/api/boutiquierRepository.js";
import { Modal } from "../components/Modal.js";

export default class BoutiquierDetailsScreen {
  constructor(root, params) {
    this.root = root;
    this.boutiquierId = params.id;
    this.boutiquierSvc = new BoutiquierService(new BoutiquierRepository());
  }

  async render() {
    try {
      this.boutiquier = await this.boutiquierSvc.get(this.boutiquierId);
      
      this.root.innerHTML = `
        <div class="container mx-auto p-6">
          <div class="flex justify-between items-center mb-6">
            <h1 class="text-2xl font-bold">${this.boutiquier.nom} ${this.boutiquier.prenom}</h1>
            <div class="flex space-x-2">
              <button id="btn-edit" class="btn-primary">
                <i class="fas fa-edit mr-2"></i> Modifier
              </button>
              ${this.boutiquier.deletedAt ? `
                <button id="btn-restore" class="btn-success">
                  <i class="fas fa-trash-restore mr-2"></i> Restaurer
                </button>
              ` : `
                <button id="btn-delete" class="btn-danger">
                  <i class="fas fa-trash mr-2"></i> Supprimer
                </button>
              `}
            </div>
          </div>
          
          <div class="bg-white rounded-lg shadow p-6">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div class="col-span-1">
                ${this.boutiquier.photo ? `
                  <img src="${this.boutiquier.photo}" alt="Photo" class="w-full rounded-lg">
                ` : `
                  <div class="bg-gray-200 rounded-lg h-64 flex items-center justify-center">
                    <i class="fas fa-user text-4xl text-gray-400"></i>
                  </div>
                `}
              </div>
              
              <div class="col-span-2">
                <div class="space-y-4">
                  <div>
                    <h3 class="text-sm font-medium text-gray-500">Email</h3>
                    <p>${this.boutiquier.email}</p>
                  </div>
                  
                  ${this.boutiquier.localisation ? `
                    <div>
                      <h3 class="text-sm font-medium text-gray-500">Localisation</h3>
                      <p>
                        <i class="fas fa-map-marker-alt text-red-500"></i>
                        Latitude: ${this.boutiquier.localisation.lat}, 
                        Longitude: ${this.boutiquier.localisation.lng}
                      </p>
                    </div>
                  ` : ''}
                  
                  ${this.boutiquier.deletedAt ? `
                    <div class="bg-red-50 p-3 rounded-lg">
                      <h3 class="text-sm font-medium text-red-800">Statut</h3>
                      <p class="text-red-600">
                        Supprimé le ${new Date(this.boutiquier.deletedAt).toLocaleDateString()}
                      </p>
                    </div>
                  ` : ''}
                </div>
              </div>
            </div>
          </div>
        </div>
      `;

      this.setUpEventListeners();
    } catch (error) {
      this.root.innerHTML = `
        <div class="container mx-auto p-6">
          <div class="bg-red-50 border-l-4 border-red-500 p-4">
            <div class="flex">
              <div class="flex-shrink-0">
                <i class="fas fa-exclamation-circle text-red-500"></i>
              </div>
              <div class="ml-3">
                <p class="text-sm text-red-700">
                  Erreur: ${error.message}
                </p>
              </div>
            </div>
          </div>
          <a href="#boutiquier" class="mt-4 inline-block text-indigo-600">
            <i class="fas fa-arrow-left mr-1"></i> Retour à la liste
          </a>
        </div>
      `;
    }
  }

  setUpEventListeners() {
    this.root.querySelector('#btn-edit')?.addEventListener('click', () => {
      window.location.hash = `#boutiquier/${this.boutiquierId}/edit`;
    });

    this.root.querySelector('#btn-delete')?.addEventListener('click', async () => {
      if (confirm('Êtes-vous sûr de vouloir supprimer ce boutiquier ?')) {
        try {
          await this.boutiquierSvc.delete(this.boutiquierId);
          window.location.hash = '#boutiquier';
        } catch (error) {
          alert(`Erreur: ${error.message}`);
        }
      }
    });

    this.root.querySelector('#btn-restore')?.addEventListener('click', async () => {
      try {
        await this.boutiquierSvc.restore(this.boutiquierId);
        window.location.hash = '#boutiquier';
      } catch (error) {
        alert(`Erreur: ${error.message}`);
      }
    });
  }
}
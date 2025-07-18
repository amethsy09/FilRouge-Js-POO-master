import { AuthService } from "../../../domain/auth/auth.service.js";
import { AuthRepository } from "../../../data/api/authRepository.js";
import { DetteService } from "../../../domain/client/dette.service.js";
import { DetteRepository } from "../../../data/api/detteRepository.js";
import { Modal } from "../../../ui/components/Modal.js";

export default class ClientDashboardScreen {
  constructor(root) {
    this.root = root;
    this.authSvc = new AuthService(new AuthRepository());
    this.detteSvc = new DetteService(new DetteRepository());
    this.state = {
      user: null,
      dettes: []
    };
  }

  async render() {
    this.state.user = await this.authSvc.getCurrentUser();
    this.state.dettes = await this.detteSvc.getDettesByClient(this.state.user.id);

    this.root.innerHTML = `
      <div class="container mx-auto p-6">
        <div class="flex justify-between items-center mb-6">
          <h1 class="text-2xl font-bold">Bienvenue, ${this.state.user?.prenom || 'Client'}</h1>
          <button id="btn-logout" class="btn-secondary">
            <i class="fas fa-sign-out-alt mr-2"></i> Déconnexion
          </button>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div class="bg-white rounded-lg shadow p-6">
            <h2 class="text-xl font-semibold mb-4">Demande de dette</h2>
            <button id="btn-request-debt" class="btn-primary w-full">
              <i class="fas fa-hand-holding-usd mr-2"></i> Faire une demande
            </button>
          </div>

          <div class="bg-white rounded-lg shadow p-6">
            <h2 class="text-xl font-semibold mb-4">Vos dettes</h2>
            ${this._renderDettesList()}
          </div>
        </div>
      </div>
    `;

    this.setUpEventListeners();
  }

  _renderDettesList() {
    if (this.state.dettes.length === 0) {
      return `<p class="text-gray-500">Aucune dette enregistrée</p>`;
    }

    return `
      <ul class="divide-y divide-gray-200">
        ${this.state.dettes.map(dette => `
          <li class="py-3">
            <div class="flex justify-between">
              <div>
                <p class="font-medium">Montant: ${dette.montant} €</p>
                <p class="text-sm text-gray-500">Statut: ${this._getStatusBadge(dette.statut)}</p>
              </div>
              <p class="text-sm text-gray-500">
                ${new Date(dette.createdAt).toLocaleDateString()}
              </p>
            </div>
            ${dette.motif ? `<p class="text-sm mt-1">Motif: ${dette.motif}</p>` : ''}
          </li>
        `).join('')}
      </ul>
    `;
  }

  _getStatusBadge(status) {
    const statusClasses = {
      en_attente: 'bg-yellow-100 text-yellow-800',
      approuvee: 'bg-green-100 text-green-800',
      rejetee: 'bg-red-100 text-red-800'
    };
    return `
      <span class="px-2 py-1 text-xs rounded-full ${statusClasses[status] || 'bg-gray-100 text-gray-800'}">
        ${status.replace('_', ' ')}
      </span>
    `;
  }

  _renderDebtRequestForm() {
    const form = document.createElement('form');
    form.className = 'space-y-4';
    form.innerHTML = `
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Montant (€) *</label>
        <input type="number" name="montant" required min="1" step="0.01"
               class="w-full px-3 py-2 border border-gray-300 rounded-md">
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Motif</label>
        <textarea name="motif" rows="3"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md"></textarea>
      </div>

      <div class="flex justify-end space-x-3 pt-2">
        <button type="button" id="btn-cancel" class="btn-secondary">
          Annuler
        </button>
        <button type="submit" class="btn-primary">
          Envoyer la demande
        </button>
      </div>
    `;

    const modal = new Modal('Demande de dette', form);
    modal.open();

    form.querySelector('#btn-cancel').addEventListener('click', () => modal.close());

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(form);

      try {
        await this.detteSvc.createDette({
          id_client: this.state.user.id,
          montant: parseFloat(formData.get('montant')),
          motif: formData.get('motif'),
          boutique_id: this.state.user.boutique_id // Si applicable
        });

        modal.close();
        await this.render(); // Rafraîchir l'affichage
      } catch (error) {
        alert(`Erreur: ${error.message}`);
      }
    });
  }

  setUpEventListeners() {
    this.root.querySelector('#btn-logout')?.addEventListener('click', async () => {
      await this.authSvc.logout();
      window.location.hash = "#auth/login";
    });

    this.root.querySelector('#btn-request-debt')?.addEventListener('click', () => {
      this._renderDebtRequestForm();
    });
  }
}
import { AuthService } from "../../domain/auth/auth.service.js";
import { AuthRepository } from "../../data/api/authRepository.js";
import { DetteService } from "../../domain/client/dette.service.js";
import { DetteRepository } from "../../data/api/detteRepository.js";
import { Modal } from "../components/Modal.js";

export default class ClientDashboardScreen {
  constructor(root) {
    this.root = root;
    this.authSvc = new AuthService(new AuthRepository());
    this.detteSvc = new DetteService(new DetteRepository());
    this.state = {
      user: null,
      dettes: [],
      demandes: []
    };
  }

  async render() {
    try {
      this.state.user = await this.authSvc.getCurrentUser();
      [this.state.dettes, this.state.demandes] = await Promise.all([
        this.detteSvc.getByClientId(this.state.user.id),
        this.detteSvc.getDemandesByClient(this.state.user.id)
      ]);
    } catch (error) {
      console.error("Erreur:", error);
      this.state.dettes = [];
      this.state.demandes = [];
    }

    this.root.innerHTML = `
      <div class="container mx-auto p-6 max-w-6xl">
        <div class="flex justify-between items-center mb-8">
          <h1 class="text-3xl font-light text-slate-700">Bonjour, ${this.state.user?.prenom || ''}</h1>
          <div class="flex gap-4">
            <button id="btn-articles" class="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition-all">
              <i class="fas fa-store mr-2"></i> Voir les articles
            </button>
            <button id="btn-logout" class="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-all">
              <i class="fas fa-sign-out-alt mr-2"></i> Déconnexion
            </button>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div class="bg-white rounded-xl shadow-sm p-6 border border-slate-100">
            <h2 class="text-xl font-normal text-slate-700 mb-4">Demande de crédit</h2>
            
            <button id="btn-request-debt" class="w-full py-3 px-4 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg transition-all mb-6">
              <i class="far fa-plus-circle mr-2"></i> Nouvelle demande
            </button>
            
            <h3 class="font-medium text-slate-600 mb-3">Vos demandes</h3>
            ${this._renderDemandesList()}
          </div>

          <div class="bg-white rounded-xl shadow-sm p-6 border border-slate-100">
            <div class="flex justify-between items-center mb-4">
              <h2 class="text-xl font-normal text-slate-700">Vos dettes</h2>
              <span class="text-lg font-medium text-slate-700">
                ${this._calculateTotalDettes()} €
              </span>
            </div>
            ${this._renderDettesList()}
          </div>
        </div>
      </div>
    `;

    this.setUpEventListeners();
  }

  _renderDemandesList() {
    if (this.state.demandes.length === 0) {
      return `<p class="text-slate-400 italic">Aucune demande en cours</p>`;
    }

    return `
      <ul class="space-y-3">
        ${this.state.demandes.map(demande => `
          <li class="p-3 rounded-lg ${this._getStatusBgColor(demande.statut)}">
            <div class="flex justify-between items-center">
              <div>
                <p class="font-medium">${demande.montant} €</p>
                <p class="text-sm text-slate-500">${demande.raison || 'Sans motif'}</p>
                ${demande.articleId ? `<p class="text-xs text-slate-400">Article: ${demande.articleLibelle || demande.articleId}</p>` : ''}
              </div>
              ${this._getStatusBadge(demande.statut)}
            </div>
          </li>
        `).join('')}
      </ul>
    `;
  }

  _renderDettesList() {
    if (this.state.dettes.length === 0) {
      return `<p class="text-slate-400 italic">Aucune dette active</p>`;
    }

    return `
      <ul class="space-y-3 max-h-96 overflow-y-auto pr-2">
        ${this.state.dettes.map(dette => `
          <li class="p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-all">
            <div class="flex justify-between">
              <div>
                <p class="font-medium">${dette.montant} €</p>
                <p class="text-sm text-slate-500">${dette.raison || 'Sans motif'}</p>
                ${dette.articleId ? `<p class="text-xs text-slate-400">Article: ${dette.articleLibelle || dette.articleId}</p>` : ''}
              </div>
              <div class="text-right">
                <p class="text-sm ${this._isOverdue(dette.dateEcheance) ? 'text-rose-500' : 'text-slate-500'}">
                  ${new Date(dette.dateEcheance).toLocaleDateString()}
                </p>
                ${this._getStatusBadge(dette.statut)}
              </div>
            </div>
          </li>
        `).join('')}
      </ul>
    `;
  }

  _getStatusBgColor(status) {
    const colors = {
      pending: 'bg-amber-50',
      approved: 'bg-emerald-50',
      rejected: 'bg-rose-50',
      active: 'bg-blue-50'
    };
    return colors[status] || 'bg-slate-50';
  }

  _getStatusBadge(status) {
    const statusMap = {
      pending: { text: 'En attente', color: 'bg-amber-100 text-amber-800' },
      approved: { text: 'Validée', color: 'bg-emerald-100 text-emerald-800' },
      rejected: { text: 'Rejetée', color: 'bg-rose-100 text-rose-800' },
      active: { text: 'Active', color: 'bg-blue-100 text-blue-800' }
    };

    const statusInfo = statusMap[status] || { text: status, color: 'bg-slate-100 text-slate-800' };
    return `<span class="text-xs px-2.5 py-1 rounded-full ${statusInfo.color}">${statusInfo.text}</span>`;
  }

  _isOverdue(date) {
    return new Date(date) < new Date();
  }

  _calculateTotalDettes() {
    return this.state.dettes
      .filter(d => d.statut === 'active')
      .reduce((total, d) => total + parseFloat(d.montant), 0)
      .toFixed(2);
  }

  _renderDebtRequestModal() {
    const form = document.createElement('form');
    form.className = 'space-y-4';
    form.innerHTML = `
      <div>
        <label class="block text-sm font-medium text-slate-600 mb-1">Montant (€)</label>
        <input type="number" name="montant" required min="1" step="0.01"
               class="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-rose-200 focus:border-rose-300">
      </div>

      <div>
        <label class="block text-sm font-medium text-slate-600 mb-1">Motif</label>
        <textarea name="raison" rows="3" required
                  class="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-rose-200 focus:border-rose-300"
                  placeholder="Décrivez l'utilisation prévue..."></textarea>
      </div>

      <div class="flex justify-end space-x-3 pt-2">
        <button type="button" id="btn-cancel" class="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600">
          Annuler
        </button>
        <button type="submit" class="px-4 py-2 rounded-lg bg-rose-500 hover:bg-rose-600 text-white">
          <i class="far fa-paper-plane mr-2"></i> Envoyer
        </button>
      </div>
    `;

    const modal = new Modal('Nouvelle demande', form);
    modal.open();

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(form);

      try {
        await this.detteSvc.createDemande({
          clientId: this.state.user.id,
          montant: formData.get('montant'),
          raison: formData.get('raison')
        });
        
        modal.close();
        await this.render();
      } catch (error) {
        alert(`Erreur: ${error.message}`);
      }
    });

    form.querySelector('#btn-cancel').addEventListener('click', () => modal.close());
  }

  setUpEventListeners() {
    this.root.querySelector('#btn-logout')?.addEventListener('click', async () => {
      await this.authSvc.logout();
      window.location.hash = "#auth/login";
    });

    this.root.querySelector('#btn-request-debt')?.addEventListener('click', () => {
      this._renderDebtRequestModal();
    });

    this.root.querySelector('#btn-articles')?.addEventListener('click', () => {
      window.location.hash = "#client/articles";
    });
  }
}
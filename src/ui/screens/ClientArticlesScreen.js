import { ArticleService } from "../../domain/article/article.service.js";
import { ArticleRepository } from "../../data/api/articleRepository.js";
import { CategoryRepository } from "../../data/api/categoryRepository.js";
import { DetteService } from "../../domain/client/dette.service.js";
import { DetteRepository } from "../../data/api/detteRepository.js";
import { Modal } from "../components/Modal.js";

export default class ClientArticlesScreen {
  constructor(root) {
    this.root = root;
    this.articleSvc = new ArticleService(new ArticleRepository());
    this.categoryRepo = new CategoryRepository();
    this.detteSvc = new DetteService(new DetteRepository());
    this.state = {
      articles: [],
      categories: [],
      selectedArticle: null
    };
  }

  async render() {
    await this._loadData();
    
    this.root.innerHTML = `
      <div class="container mx-auto p-6">
        <div class="flex justify-between items-center mb-6">
          <h1 class="text-2xl font-bold">Articles disponibles</h1>
          <button id="btn-back" class="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300">
            <i class="fas fa-arrow-left mr-2"></i> Retour
          </button>
        </div>

        <div class="mb-6">
          <select id="category-filter" class="w-full md:w-64 px-4 py-2 border border-gray-300 rounded-lg">
            <option value="">Toutes les catégories</option>
            ${this.state.categories.map(category => `
              <option value="${category.id}">${category.libelle}</option>
            `).join('')}
          </select>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          ${this.state.articles.map(article => `
            <div class="bg-white rounded-lg shadow-md overflow-hidden">
              <div class="h-48 bg-gray-200 flex items-center justify-center">
                ${article.image 
                  ? `<img src="${article.image}" alt="${article.libelle}" class="object-cover h-full w-full">` 
                  : '<span class="text-gray-500">Aucune image</span>'}
              </div>
              <div class="p-4">
                <h3 class="font-bold text-lg">${article.libelle}</h3>
                <p class="text-gray-500 text-sm">${this._getCategoryName(article.categoryId)}</p>
                <p class="font-bold mt-2">${article.prix.toFixed(2)} €</p>
                
                <div class="flex justify-between mt-4">
                  <button data-id="${article.id}" class="btn-detail bg-indigo-600 text-white px-3 py-1 rounded text-sm">
                    <i class="fas fa-info-circle mr-1"></i> Détails
                  </button>
                  <button data-id="${article.id}" class="btn-request bg-rose-500 text-white px-3 py-1 rounded text-sm">
                    <i class="fas fa-hand-holding-usd mr-1"></i> Crédit
                  </button>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;

    this.setUpEventListeners();
  }

  async _loadData() {
    try {
      const [articlesRes, categoriesRes] = await Promise.all([
        this.articleSvc.list(),
        this.categoryRepo.list()
      ]);
      
      this.state.articles = articlesRes.data.filter(a => !a.deleted);
      this.state.categories = categoriesRes.data.filter(c => !c.deleted);
    } catch (error) {
      console.error("Erreur de chargement:", error);
      this.root.innerHTML = `<p class="text-red-500">Erreur lors du chargement des articles</p>`;
    }
  }

  _getCategoryName(categoryId) {
    const category = this.state.categories.find(c => c.id === categoryId);
    return category ? category.libelle : "Inconnue";
  }

  _renderRequestModal(article) {
    const form = document.createElement('form');
    form.className = 'space-y-4';
    form.innerHTML = `
      <div class="flex items-center space-x-4">
        <div class="h-20 w-20 bg-gray-200 flex items-center justify-center rounded-lg">
          ${article.image 
            ? `<img src="${article.image}" alt="${article.libelle}" class="object-cover h-full w-full rounded-lg">` 
            : '<span class="text-gray-500 text-xs">Aucune image</span>'}
        </div>
        <div>
          <h3 class="font-bold">${article.libelle}</h3>
          <p class="text-gray-600">${article.prix.toFixed(2)} €</p>
        </div>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Montant (€)</label>
        <input type="number" name="montant" required min="1" step="0.01" max="${article.prix}"
               value="${article.prix}" 
               class="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-rose-200 focus:border-rose-300">
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Motif</label>
        <textarea name="raison" rows="3" required
                  class="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-rose-200 focus:border-rose-300"
                  placeholder="Pourquoi avez-vous besoin de ce crédit?"></textarea>
      </div>

      <div class="flex justify-end space-x-3 pt-2">
        <button type="button" id="btn-cancel" class="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600">
          Annuler
        </button>
        <button type="submit" class="px-4 py-2 rounded-lg bg-rose-500 hover:bg-rose-600 text-white">
          <i class="far fa-paper-plane mr-2"></i> Envoyer demande
        </button>
      </div>
    `;

    const modal = new Modal(`Demande de crédit pour ${article.libelle}`, form);
    modal.open();

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(form);
      const montant = parseFloat(formData.get('montant'));

      if (montant > article.prix) {
        alert("Le montant demandé ne peut pas dépasser le prix de l'article");
        return;
      }

      try {
        await this.detteSvc.createDemande({
          clientId: this.state.user?.id,
          articleId: article.id,
          articleLibelle: article.libelle,
          montant: montant,
          raison: formData.get('raison')
        });
        
        modal.close();
        alert("Votre demande a été envoyée avec succès!");
      } catch (error) {
        console.error("Erreur:", error);
        alert(`Erreur: ${error.message}`);
      }
    });

    form.querySelector('#btn-cancel').addEventListener('click', () => modal.close());
  }

  setUpEventListeners() {
    // Bouton retour
    this.root.querySelector('#btn-back')?.addEventListener('click', () => {
      window.location.hash = "#client";
    });

    // Filtre par catégorie
    this.root.querySelector('#category-filter')?.addEventListener('change', (e) => {
      const categoryId = e.target.value;
      if (categoryId) {
        this.root.querySelectorAll('.bg-white').forEach(card => {
          const articleId = card.querySelector('.btn-detail').dataset.id;
          const article = this.state.articles.find(a => a.id === articleId);
          card.style.display = article.categoryId === categoryId ? '' : 'none';
        });
      } else {
        this.root.querySelectorAll('.bg-white').forEach(card => {
          card.style.display = '';
        });
      }
    });

    // Boutons détails
    this.root.querySelectorAll('.btn-detail').forEach(btn => {
      btn.addEventListener('click', () => {
        const articleId = btn.dataset.id;
        const article = this.state.articles.find(a => a.id === articleId);
        if (article) this._showArticleDetail(article);
      });
    });

    // Boutons demande de crédit
    this.root.querySelectorAll('.btn-request').forEach(btn => {
      btn.addEventListener('click', () => {
        const articleId = btn.dataset.id;
        const article = this.state.articles.find(a => a.id === articleId);
        if (article) this._renderRequestModal(article);
      });
    });
  }

  _showArticleDetail(article) {
    const categoryName = this._getCategoryName(article.categoryId);
    const content = document.createElement('div');
    content.className = 'space-y-4';
    content.innerHTML = `
      <div class="h-64 bg-gray-200 flex items-center justify-center rounded-lg">
        ${article.image 
          ? `<img src="${article.image}" alt="${article.libelle}" class="object-cover h-full w-full rounded-lg">` 
          : '<span class="text-gray-500">Aucune image</span>'}
      </div>
      <div>
        <h3 class="font-bold text-xl">${article.libelle}</h3>
        <p class="text-gray-600 mt-2">${article.description || "Pas de description"}</p>
      </div>
      <div class="grid grid-cols-2 gap-4">
        <div>
          <p class="font-bold">Catégorie</p>
          <p>${categoryName}</p>
        </div>
        <div>
          <p class="font-bold">Prix</p>
          <p>${article.prix.toFixed(2)} €</p>
        </div>
      </div>
      <div class="pt-4">
        <button id="btn-request-from-detail" class="w-full py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-lg">
          <i class="fas fa-hand-holding-usd mr-2"></i> Demander un crédit pour cet article
        </button>
      </div>
    `;

    const modal = new Modal(`Détails: ${article.libelle}`, content);
    modal.open();

    content.querySelector('#btn-request-from-detail')?.addEventListener('click', () => {
      modal.close();
      this._renderRequestModal(article);
    });
  }
}
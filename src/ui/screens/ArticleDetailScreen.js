import { ArticleService } from "../../domain/article/article.service.js";
import { ArticleRepository } from "../../data/api/articleRepository.js";
import { CategoryRepository } from "../../data/api/categoryRepository.js";

export default class ArticleDetailScreen {
  constructor(root, params) {
    this.root = root;
    this.articleId = params.id; // Récupère l'ID de l'URL
    this.articleSvc = new ArticleService(new ArticleRepository());
    this.categoryRepo = new CategoryRepository();
    this.state = {
      article: null,
      category: null,
      similarArticles: [],
    };
  }

  async render() {
    this.root.innerHTML = `<div class="p-4">Chargement...</div>`;
    await this._loadData();
    this._render();
  }

  async _loadData() {
    try {
      // Charger l'article principal
      this.state.article = await this.articleSvc.get(this.articleId);

      // Charger la catégorie de l'article
      this.state.category = await this.categoryRepo.get(
        this.state.article.categoryId
      );

      // Charger les articles similaires (même catégorie)
      this.state.similarArticles = await this.articleSvc.listByCategory(
        this.state.article.categoryId,
        this.articleId, // Exclure l'article courant
        4 // Limite à 4 articles similaires
      );
    } catch (error) {
      console.error("Erreur de chargement:", error);
      this.root.innerHTML = `<div class="p-4 text-red-600">Article non trouvé</div>`;
    }
  }

  _render() {
    if (!this.state.article) return;

    const art = this.state.article;
    const cat = this.state.category;

    this.root.innerHTML = `
      <div class="max-w-6xl mx-auto">
        <!-- Bouton retour -->
        <button id="btn-back" class="mb-4 text-indigo-600 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clip-rule="evenodd" />
          </svg>
          Retour aux articles
        </button>

        <!-- Détail de l'article -->
        <div class="bg-white rounded-xl shadow-lg overflow-hidden">
          <div class="md:flex">
            <div class="md:flex-shrink-0 md:w-1/2">
              <div class="h-96 bg-gray-100 flex items-center justify-center">
                ${
                  art.image
                    ? `<img src="${art.image}" alt="${art.libelle}" class="object-cover h-full w-full">`
                    : '<span class="text-gray-500 text-lg">Aucune image disponible</span>'
                }
              </div>
            </div>
            <div class="p-8 md:w-1/2">
              <div class="flex justify-between items-start">
                <div>
                  <h1 class="text-3xl font-bold text-gray-900">${
                    art.libelle
                  }</h1>
                  ${
                    cat
                      ? `<p class="text-indigo-600 font-medium mt-1">${cat.libelle}</p>`
                      : ""
                  }
                </div>
                <p class="text-3xl font-bold text-gray-900">${art.prix.toFixed(
                  2
                )} €</p>
              </div>

              <div class="mt-8">
                <h2 class="text-lg font-semibold text-gray-800">Description</h2>
                <p class="mt-2 text-gray-600">${
                  art.description || "Aucune description disponible"
                }</p>
              </div>

              <div class="mt-8 grid grid-cols-2 gap-4">
                <div>
                  <h3 class="text-sm font-medium text-gray-500">Quantité en stock</h3>
                  <p class="text-xl font-bold ${
                    art.stock > 0 ? "text-green-600" : "text-red-600"
                  }">
                    ${art.stock} unité${art.stock !== 1 ? "s" : ""}
                  </p>
                </div>
                <div>
                ${
                  art.stock > 0
                    ? `<h3 class="text-sm font-medium text-gray-500">Statut</h3>`
                    : ``
                }
                  
                  <p class="text-xl font-bold ${
                    art.stock > 0 ? "text-green-600" : ""
                  }">
                    ${art.stock > 0 ? "Disponible" : ""}
                  </p>
                </div>
              </div>
              <div class="flex items-center gap-4 mt-6 justify-end">
                <button class="btn-edit bg-amber-500 text-white px-2 py-1 rounded text-sm">Edit</button>
                <button class="btn-delete bg-red-600 text-white px-2 py-1 rounded text-sm">Del</button>
            </div>
            </div>
          </div>
        </div>

        <!-- Articles similaires -->
        <div class="mt-12">
          <h2 class="text-2xl font-bold text-gray-900 mb-6">Articles similaires</h2>
          <div id="similar-articles" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"></div>
        </div>
      </div>`;

    // Rendre les articles similaires
    this._renderSimilarArticles();

    // Écouteurs d'événements
    this.setUpEventListeners();
  }

  _renderSimilarArticles() {
    const container = this.root.querySelector("#similar-articles");
    if (!container) return;

    if (this.state.similarArticles.length === 0) {
      container.innerHTML =
        '<p class="text-gray-500">Aucun article similaire trouvé</p>';
      return;
    }

    container.innerHTML = "";

    this.state.similarArticles.forEach((article) => {
      const card = document.createElement("div");
      card.className =
        "bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer";
      card.innerHTML = `
        <div class="h-48 bg-gray-100 flex items-center justify-center">
          ${
            article.image
              ? `<img src="${article.image}" alt="${article.libelle}" class="object-cover h-full w-full">`
              : '<span class="text-gray-500">Aucune image</span>'
          }
        </div>
        <div class="p-4">
          <h3 class="font-bold truncate">${article.libelle}</h3>
          <p class="text-indigo-600 font-bold mt-2">${article.prix.toFixed(
            2
          )} €</p>
          <button class="mt-3 w-full bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 px-4 rounded text-sm transition-colors">
            Voir détails
          </button>
        </div>`;

      card.onclick = () => {
        window.location.hash = `#articles/${article.id}`;
      };

      container.appendChild(card);
    });
  }

  setUpEventListeners() {
    // Bouton retour
    const backBtn = this.root.querySelector("#btn-back");
    if (backBtn) {
      backBtn.onclick = () => {
        window.location.hash = "#articles";
      };
    }

    // Bouton ajouter au panier
    const addToCartBtn = this.root.querySelector("#btn-add-to-cart");
    if (addToCartBtn) {
      addToCartBtn.onclick = () => {
        // Ici vous implémenteriez la logique d'ajout au panier
        alert(`${this.state.article.libelle} ajouté au panier!`);
      };
    }
  }
}

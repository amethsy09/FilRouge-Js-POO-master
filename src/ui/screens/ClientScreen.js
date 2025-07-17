import { Modal } from "../components/Modal.js";
import { Article } from "../../domain/article/Article.js";
import { ArticleService } from "../../domain/article/article.service.js";
import { ArticleRepository } from "../../data/api/articleRepository.js";
import { CategoryRepository } from "../../data/api/categoryRepository.js";
export default class ClientScreen {
  constructor(root) {
    this.root = root;
    this.articleSvc = new ArticleService(new ArticleRepository());
    this.categoryRepo = new CategoryRepository();
    this.state = {
      page: 1,
      perPage: 12,
      total: 0,
      view: "active",
      articles: [],
      categories: [],
    };
  }

  /* ----------- RENDER ----------- */
  async render() {
    this.root.innerHTML = `

      <div id="articles-grid" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"></div>
      <div id="paginator" class="flex justify-center mt-6 gap-2"></div>`;

    await this._load();
    await this._loadCategories();
    this._renderCards();
    this._pager();
    this._tabs();
    this.setUpEventListeners();
    return this;
  }

  setUpEventListeners() {
    const btn = this.root.querySelector("#btn-add");
    if (btn) btn.onclick = () => this._form();
  }

  /* ----------- DATA ----------- */
  async _load() {
    const { data, headers } = await this.articleSvc.list(
      this.state.page,
      this.state.perPage
    );
    this.state.articles = data.filter(
      (a) => a.deleted === (this.state.view === "deleted")
    );
    this.state.total =
      +headers.get("X-Total-Count") || this.state.articles.length;
  }

  async _loadCategories() {
    const { data } = await this.categoryRepo.list(1, 1000); // Charger toutes les catégories
    this.state.categories = data.filter((c) => !c.deleted);
  }

  /* ----------- TABS ----------- */
  _tabs() {
    const view = this.state.view;
    this.root.querySelectorAll("[data-v]").forEach((btn) => {
      const active = btn.dataset.v === view;
      btn.classList.toggle("bg-indigo-600", active);
      btn.classList.toggle("text-white", active);
      btn.classList.toggle("bg-gray-200", !active);
      btn.onclick = () => {
        this.state.view = btn.dataset.v;
        this.state.page = 1;
        this.render();
      };
    });
  }

  /* ----------- CARDS RENDERING ----------- */
  _renderCards() {
    const container = this.root.querySelector("#articles-grid");
    container.innerHTML = "";
    const start = (this.state.page - 1) * this.state.perPage;

    this.state.articles.forEach((article, idx) => {
      console.log(article);

      const category = this.state.categories.find(
        (c) => c.id === article.categoryId
      );
      const categoryName = category ? category.libelle : "Inconnue";

      const card = document.createElement("div");
      card.className = `bg-white rounded-lg shadow-md overflow-hidden ${
        article.deleted ? "opacity-50" : ""
      }`;
      card.innerHTML = `
        <div class="h-48 bg-gray-200 flex items-center justify-center">
          ${
            article.image
              ? `<img src="${article.image}" alt="${article.libelle}" class="object-cover h-full w-full">`
              : '<span class="text-gray-500">Aucune image</span>'
          }
        </div>
        <div class="p-4">
          <h3 class="font-bold text-lg truncate">${article.libelle}</h3>
          <p class="text-gray-500 text-sm">${categoryName}</p>
          <p class="font-bold mt-2">${article.prix.toFixed(2)} €</p>
          
          <div class="flex justify-end mt-4">
            <button class="btn-detail bg-indigo-600 text-white px-3 py-1 rounded text-sm">
              Voir détail
            </button>
          </div>
        </div>`;

      // Bouton Voir détail
      card.querySelector(".btn-detail").onclick = () => {
        window.location.hash = `#articles/${article.id}`;
      };

      container.appendChild(card);
    });
  }

  /* ----------- DETAIL MODAL ----------- */
  _showDetail(article, categoryName) {
    const content = document.createElement("div");
    content.className = "grid gap-4";
    content.innerHTML = `
      <div class="h-64 bg-gray-200 flex items-center justify-center rounded-lg">
        ${
          article.image
            ? `<img src="${article.image}" alt="${article.libelle}" class="object-cover h-full w-full rounded-lg">`
            : '<span class="text-gray-500">Aucune image</span>'
        }
      </div>
      <div>
        <h3 class="font-bold text-xl">${article.libelle}</h3>
        <p class="text-gray-600 mt-2">${
          article.description || "Pas de description"
        }</p>
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
      </div>`;

    const modal = new Modal(`Détail: ${article.libelle}`, content);
    modal.open();
  }

  /* ----------- PAGINATION ----------- */
  _pager() {
    const n = Math.ceil(this.state.total / this.state.perPage);
    const pag = this.root.querySelector("#paginator");
    pag.innerHTML = "";

    for (let i = 1; i <= n; i++) {
      const b = document.createElement("button");
      b.textContent = i;
      b.className = `px-3 py-1 rounded ${
        i === this.state.page ? "bg-indigo-600 text-white" : "bg-gray-200"
      }`;
      b.onclick = () => {
        this.state.page = i;
        this.render();
      };
      pag.append(b);
    }
  }
}

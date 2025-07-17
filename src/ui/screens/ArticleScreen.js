import { Modal } from "../components/Modal.js";
import { confirm } from "../components/Confirm.js";
import { Article } from "../../domain/article/Article.js";
import { ArticleService } from "../../domain/article/article.service.js";
import { ArticleRepository } from "../../data/api/articleRepository.js";
import { CategoryRepository } from "../../data/api/categoryRepository.js";
export default class ArticleScreen {
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
      categories: [], // Pour stocker les catégories
    };
  }

  /* ----------- RENDER ----------- */
  async render() {
    this.root.innerHTML = `
      <div class="flex justify-between mb-4">
        <button id="btn-add" class="bg-indigo-600 text-white px-4 py-2 rounded"
                ${this.state.view === "deleted" ? "disabled" : ""}>
          + Ajouter
        </button>
        <div class="flex gap-2">
          <button data-v="active" class="tab px-3 py-1 rounded bg-gray-200">Actifs</button>
          <button data-v="deleted" class="tab px-3 py-1 rounded bg-gray-200">Corbeille</button>
        </div>
      </div>

      <div id="articles-grid" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"></div>

      <div id="paginator" class="flex justify-center mt-6 gap-2"></div>`;

    await this._load();
    await this._loadCategories(); // Charger les catégories
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

  /* ----------- FORM MODAL ----------- */
  _form(
    article = new Article({
      libelle: "",
      description: "",
      prix: 0,
      image: "",
      categoryId: "",
    })
  ) {
    const f = document.createElement("form");
    f.className = "grid gap-4";
    f.innerHTML = `
      <div>
        <label class="block text-sm font-medium mb-1">Libellé *</label>
        <input name="libelle" class="border rounded px-3 py-2 w-full"
               placeholder="Nom de l'article" value="${article.libelle}">
        <p data-error="libelle" class="text-red-600 text-sm mt-1 hidden"></p>
      </div>

      <div>
        <label class="block text-sm font-medium mb-1">Description</label>
        <textarea name="description" class="border rounded px-3 py-2 w-full h-24"
                  placeholder="Description de l'article">${
                    article.description || ""
                  }</textarea>
        <p data-error="description" class="text-red-600 text-sm mt-1 hidden"></p>
      </div>

      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium mb-1">Prix *</label>
          <input name="prix" type="number" step="0.01" min="0" class="border rounded px-3 py-2 w-full"
                 placeholder="0.00" value="${article.prix}">
          <p data-error="prix" class="text-red-600 text-sm mt-1 hidden"></p>
        </div>

        <div>
          <label class="block text-sm font-medium mb-1">Catégorie *</label>
          <select name="categoryId" class="border rounded px-3 py-2 w-full">
            <option value="">Sélectionnez...</option>
            ${this.state.categories
              .map(
                (c) => `
              <option value="${c.id}" ${
                  c.id === article.categoryId ? "selected" : ""
                }>
                ${c.libelle}
              </option>
            `
              )
              .join("")}
          </select>
          <p data-error="categoryId" class="text-red-600 text-sm mt-1 hidden"></p>
        </div>
      </div>

      <div>
        <label class="block text-sm font-medium mb-1">Image URL</label>
        <input type="file" name="image" />
      </div>

      <div class="flex justify-end mt-4">
        <button type="submit" class="bg-indigo-600 text-white px-4 py-2 rounded">
          Enregistrer
        </button>
      </div>`;

    const dlg = new Modal(
      article.id ? "Modifier article" : "Nouvel article",
      f
    );
    dlg.open();

    f.onsubmit = async (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      let isValid = true;

      // Validation
      const errors = {
        libelle: !formData.get("libelle")?.trim(),
        prix: !formData.get("prix") || parseFloat(formData.get("prix")) <= 0,
        categoryId: !formData.get("categoryId"),
      };

      // Affichage des erreurs
      Object.keys(errors).forEach((key) => {
        const errorEl = f.querySelector(`[data-error="${key}"]`);
        if (errors[key]) {
          errorEl.textContent = "Ce champ est obligatoire";
          errorEl.classList.remove("hidden");
          isValid = false;
        } else {
          errorEl.classList.add("hidden");
        }
      });

      if (!isValid) return;

      // Mise à jour de l'objet
      article.libelle = formData.get("libelle").trim();
      article.description = formData.get("description").trim();
      article.prix = parseFloat(formData.get("prix"));
      article.categoryId = formData.get("categoryId");
      article.image = formData.get("image").trim();

      try {
        if (article.id) {
          await this.articleSvc.update(article);
        } else {
          await this.articleSvc.create(article);
        }
        dlg.close();
        this.render();
      } catch (error) {
        alert("Erreur lors de la sauvegarde");
        console.error(error);
      }
    };
  }
}

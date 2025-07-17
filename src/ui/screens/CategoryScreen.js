import { Modal } from "../components/Modal.js";
import { confirm } from "../components/Confirm.js";
import { Category } from "../../domain/category/Category.js";
import { CategoryService } from "../../domain/category/category.service.js";
import { CategoryRepository } from "../../data/api/categoryRepository.js";

export default class CategoryScreen {
  constructor(root) {
    this.root = root;
    this.catSvc = new CategoryService(new CategoryRepository());
    this.state = { page: 1, perPage: 10, total: 0, view: "active", list: [] };
  }

  /* ----------- helpers ----------- */
  /** Vérifie qu’aucun autre libellé identique n’existe (hors id courant) */
  _exists(libelle, excludeId = null) {
    const norm = libelle.trim().toLowerCase();
    return this.state.list.some(
      (c) => c.id !== excludeId && c.libelle.trim().toLowerCase() === norm
    );
  }

  /* ----------- RENDER ----------- */
  async render() {
    this.root.innerHTML = `
    <div class="flex justify-between items-center mb-6">
</div>
      <div class="flex justify-between mb-4">
        <button id="btn-add" class="bg-indigo-600 text-white px-4 py-2 rounded"
                ${this.state.view === "deleted" ? "disabled" : ""}>
          + Ajouter
        </button>
        <div class="flex gap-2">
          <button data-v="active"  class="tab px-3 py-1 rounded bg-gray-200">Actifs</button>
          <button data-v="deleted" class="tab px-3 py-1 rounded bg-gray-200">Corbeille</button>
        </div>
      </div>

      <table class="w-full bg-white shadow-sm rounded text-left">
        <thead>
          <tr class="border-b">
            <th class="p-2 w-12">#</th>
            <th class="p-2">Libellé</th>
            <th class="p-2 w-32"></th>
          </tr>
        </thead>
        <tbody id="tbody"></tbody>
      </table>

      <div id="paginator" class="flex justify-center mt-6 gap-2"></div>`;

    await this._load();
    this._rows();
    this._pager();
    this._tabs();
    this.setUpEventListeners(); // ré-attache après chaque render
    return this;
  }

  setUpEventListeners() {
    const btn = this.root.querySelector("#btn-add");
    if (btn) btn.onclick = () => this._form();
  }

  /* ----------- DATA ----------- */
  async _load() {
    const { data, headers } = await this.catSvc.list(
      this.state.page,
      this.state.perPage
    );
    this.state.list = data.filter(
      (c) => c.deleted === (this.state.view === "deleted")
    );
    this.state.total = +headers.get("X-Total-Count") || this.state.list.length;
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
        this.render();
      };
    });
  }

  /* ----------- ROWS ----------- */
  _rows() {
    const tbody = this.root.querySelector("#tbody");
    tbody.innerHTML = "";
    const start = (this.state.page - 1) * this.state.perPage;

    this.state.list.forEach((c, idx) => {
      const tr = document.createElement("tr");
      tr.className = `border-b hover:bg-gray-50 ${
        c.deleted ? "opacity-50 line-through" : ""
      }`;
      tr.innerHTML = `
        <td class="p-2">${start + idx + 1}</td>
        <td class="p-2">${c.libelle}</td>
        <td class="p-2 flex gap-2"></td>`;
      const cell = tr.lastElementChild;

      if (!c.deleted) {
        cell.innerHTML = `
          <button class="bg-amber-500 text-white px-2 py-1 rounded">Edit</button>
          <button class="bg-red-600   text-white px-2 py-1 rounded">Del</button>`;
        cell.children[0].onclick = () => this._form(c);
        cell.children[1].onclick = async () => {
          if (await confirm("Mettre à la corbeille ?")) {
            await this.catSvc.trash(c.id);
            this.render();
          }
        };
      } else {
        const btn = document.createElement("button");
        btn.textContent = "Restaurer";
        btn.className = "bg-green-600 text-white px-2 py-1 rounded";
        btn.onclick = () => this.catSvc.restore(c.id).then(() => this.render());
        cell.append(btn);
      }

      tbody.append(tr);
    });
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
  _form(cat = new Category({ libelle: "" })) {
    const f = document.createElement("form");
    f.className = "grid gap-2";
    f.innerHTML = `
      <div>
        <input name="libelle" class="border rounded px-2 py-1 w-full"
               placeholder="Libellé" value="${cat.libelle}">
        <p data-error class="text-red-600 text-sm mt-1 hidden"></p>
      </div>

      <div class="flex justify-end mt-4">
        <button class="bg-indigo-600 text-white px-4 py-2 rounded">
          Enregistrer
        </button>
      </div>`;

    const dlg = new Modal(
      cat.id ? "Modifier catégorie" : "Nouvelle catégorie",
      f
    );
    dlg.open();

    const errorEl = f.querySelector("[data-error]");

    f.onsubmit = async (e) => {
      e.preventDefault();
      cat.libelle = e.target.libelle.value.trim();

      /* Validation longueur */
      if (!cat.isValid()) {
        errorEl.textContent = "Le libellé doit contenir au moins 2 caractères";
        errorEl.classList.remove("hidden");
        return;
      }

      /* Validation doublon */
      if (this._exists(cat.libelle, cat.id)) {
        errorEl.textContent = "Ce libellé existe déjà";
        errorEl.classList.remove("hidden");
        return;
      }

      errorEl.classList.add("hidden"); // tout est ok

      if (cat.id) {
        await this.catSvc.update(cat);
      } else {
        const created = await this.catSvc.create(cat); // récupère id généré
        cat.id = created.id;
      }

      dlg.close();
      this.render();
    };
  }
}

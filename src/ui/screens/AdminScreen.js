export default class AdminScreen {
  constructor(root) {
    this.root = root;
  }

  async render() {
    this.root.innerHTML = `
      <div class="p-8">
        <h1 class="text-4xl font-bold mb-6 text-center text-indigo-700">
          Dashboard Administrateur
        </h1>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <!-- Gestion des articles -->
          <div class="bg-white shadow rounded p-6 hover:bg-indigo-50 transition">
            <h2 class="text-xl font-semibold mb-2">Gestion des Articles</h2>
            <p class="text-gray-600 mb-4">Créer, modifier, supprimer et restaurer les articles.</p>
            <a href="#articles" class="inline-block bg-indigo-600 text-white px-4 py-2 rounded">
              Accéder
            </a>
          </div>

          <!-- Gestion des catégories -->
          <div class="bg-white shadow rounded p-6 hover:bg-indigo-50 transition">
            <h2 class="text-xl font-semibold mb-2">Gestion des Catégories</h2>
            <p class="text-gray-600 mb-4">Créer et organiser vos catégories de produits.</p>
            <a href="#categories" class="inline-block bg-indigo-600 text-white px-4 py-2 rounded">
              Accéder
            </a>
          </div>

          <!-- Statistiques (placeholder) -->
          <div class="bg-white shadow rounded p-6 hover:bg-indigo-50 transition">
            <h2 class="text-xl font-semibold mb-2">Statistiques</h2>
            <p class="text-gray-600 mb-4">Voir les statistiques de ventes et d'utilisation.</p>
            <button class="bg-gray-400 text-white px-4 py-2 rounded cursor-not-allowed" disabled>
              En cours...
            </button>
          </div>
        </div>
      </div>
    `;
  }


}

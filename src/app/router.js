import { AuthService } from "../domain/auth/auth.service.js";
import { AuthRepository } from "../data/api/authRepository.js";

export function startRouter(root, routes, fallback = "#auth") {
  const authSvc = new AuthService(new AuthRepository());
  const headerRoot = document.getElementById("header");

  async function load() {
    try {
      const user = await authSvc.getCurrentUser();
      const hash = window.location.hash || fallback;

      // Routes protégées
      const protectedRoutes = [
        "#categories", 
        "#articles",
        "#clients",
        "#boutiquier",
        "#admin",
        "#client"
      ];

      // Rediriger vers l'authentification si non connecté
      const isProtectedRoute = protectedRoutes.some(route => hash.startsWith(route));
      
      if (!user && isProtectedRoute) {
        window.location.hash = "#auth/login";
        return;
      }

      // Vérifier les permissions selon le rôle
      if (user) {
        const isClient = user.id_role === "2";
        const isBoutiquier = user.id_role === "3";
        const isAdmin = user.id_role === "1";
        
        if (hash.startsWith("#admin") && !isAdmin) {
          window.location.hash = fallback;
          return;
        }
        
        if (hash.startsWith("#boutiquier") && !isBoutiquier) {
          window.location.hash = fallback;
          return;
        }
        
        if (hash.startsWith("#client") && !isClient) {
          window.location.hash = fallback;
          return;
        }
      }

      let matchedRoute = null;
      let params = {};

      // Trouver la route correspondante
      for (const [pattern, loader] of Object.entries(routes)) {
        const regex = new RegExp(`^${pattern.replace(/:\w+/g, "([^/]+)")}$`);
        const match = hash.match(regex);
        
        if (match) {
          matchedRoute = loader;
          params = match.groups || { id: match[1] };
          break;
        }
      }

      // Fallback si route non trouvée
      if (!matchedRoute) {
        matchedRoute = routes[fallback];
        if (!matchedRoute) {
          showError(root, "Page non trouvée");
          return;
        }
      }

      // Charger le module de la route
      const mod = await matchedRoute?.();
      if (!mod) {
        showError(root, "Module non trouvé");
        return;
      }

      // Render l'écran
      root.innerHTML = "";
      const Screen = mod.default;
      const screen = new Screen(root, params);
      await screen.render();
      
      // Initialiser les event listeners
      if (typeof screen.setUpEventListeners === "function") {
        screen.setUpEventListeners();
      }

    } catch (error) {
      console.error("Router error:", error);
      showError(root, "Une erreur est survenue");
    }
  }

  function showError(element, message) {
    element.innerHTML = `
      <div class="p-4 bg-red-100 text-red-700 rounded">
        <p>${message}</p>
        <button onclick="window.location.hash='${fallback}'" 
                class="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">
          Retour
        </button>
      </div>
    `;
  }

  window.addEventListener("hashchange", load);
  load();
}
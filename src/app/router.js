import { AuthService } from "../domain/auth/auth.service.js";
import { AuthRepository } from "../data/api/authRepository.js";

export function startRouter(root, routes, fallback = "#auth") {
  const authSvc = new AuthService(new AuthRepository());
  let isNavigating = false; // Pour éviter les boucles de redirection

  async function load() {
    if (isNavigating) return;
    isNavigating = true;

    try {
      const user = await authSvc.getCurrentUser();
      let hash = window.location.hash || fallback;

       // console.log("Current user role:", user?.id_role, "Requested hash:", hash);

      // Protection des routes
      const routeAccess = {
        "#admin": "1",
        "#boutiquier": "3", 
        "#client": "2"
      };

      const protectedRoutes = Object.keys(routeAccess);
      const isProtected = protectedRoutes.some(route => hash.startsWith(route));

      // Redirection si non authentifié sur une route protégée
      if (!user && isProtected) {
        window.location.hash = "#auth/login";
        isNavigating = false;
        return;
      }

      // Vérification des rôles
      if (user) {
        // Redirection forcée pour les admins
        if (user.id_role === "1" && !hash.startsWith("#admin")) {
          window.location.hash = "#admin";
          isNavigating = false;
          return;
        }

        // Vérification des permissions
        for (const [route, requiredRole] of Object.entries(routeAccess)) {
          if (hash.startsWith(route) && user.id_role !== requiredRole) {
            window.location.hash = fallback;
            isNavigating = false;
            return;
          }
        }
      }

      // Extraction des paramètres de route
      let matchedRoute = null;
      let params = {};

      for (const [pattern, loader] of Object.entries(routes)) {
        // Conversion du pattern en regex
        const paramNames = [];
        const regexPattern = pattern.replace(/:\w+/g, (match) => {
          paramNames.push(match.substring(1));
          return "([^/]+)";
        });

        const regex = new RegExp(`^${regexPattern}$`);
        const match = hash.match(regex);

        if (match) {
          matchedRoute = loader;
          // Extraction des paramètres
          paramNames.forEach((name, index) => {
            params[name] = match[index + 1];
          });
          break;
        }
      }

      // Fallback si aucune route ne correspond
      if (!matchedRoute) {
        if (routes[fallback]) {
          matchedRoute = routes[fallback];
        } else {
          showError(root, "Page non trouvée");
          isNavigating = false;
          return;
        }
      }

      // Chargement dynamique du module
      let mod;
      try {
        mod = await matchedRoute();
        if (!mod?.default) {
          throw new Error("Module invalide");
        }
      } catch (error) {
        console.error("Erreur de chargement du module:", error);
        showError(root, "Module non trouvé");
        isNavigating = false;
        return;
      }

      // Rendu de l'écran
      root.innerHTML = "";
      const Screen = mod.default;
      const screen = new Screen(root, params);
      
      try {
        await screen.render();
        if (typeof screen.setUpEventListeners === "function") {
          screen.setUpEventListeners();
        }
      } catch (error) {
        console.error("Erreur de rendu:", error);
        showError(root, "Erreur d'affichage");
      }

    } catch (error) {
      console.error("Erreur du routeur:", error);
      showError(root, "Une erreur est survenue");
    } finally {
      isNavigating = false;
    }
  }

  function showError(element, message) {
    element.innerHTML = `
      <div class="p-4 bg-red-100 text-red-700 rounded">
        <p>${message}</p>
        <button onclick="window.location.hash='#auth'" 
                class="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">
          Retour à l'accueil
        </button>
      </div>
    `;
  }

  window.addEventListener("hashchange", load);
  load();
}
// src/app/router.js
import { AuthService } from "../domain/auth/auth.service.js";
import { AuthRepository } from "../data/api/authRepository.js";

export function startRouter(root, routes, fallback = "#categories") {
  const authSvc = new AuthService(new AuthRepository());
  const headerRoot = document.getElementById("header");

  async function load() {
    // Render le header à chaque changement de route

    const user = await authSvc.getCurrentUser();
    const hash = location.hash || fallback;

    // Rediriger vers l'authentification si non connecté
    if (!user && !hash.startsWith("#auth")) {
      window.location.hash = "#auth";
      return;
    }

    let matchedRoute = null;
    let params = {};

    for (const [pattern, loader] of Object.entries(routes)) {
      const regex = new RegExp(`^${pattern}$`);
      const match = hash.match(regex);
      if (match) {
        matchedRoute = loader;
        params = { id: match[1] };
        break;
      }
    }

    if (!matchedRoute) {
      matchedRoute = routes[fallback];
      if (!matchedRoute) {
        root.textContent = "404";
        return;
      }
    }

    const mod = await matchedRoute?.();
    if (!mod) {
      root.textContent = "404";
      return;
    }

    root.innerHTML = "";
    const Screen = mod.default;
    const screen = new Screen(root, params);
    await screen.render();
    screen.setUpEventListeners?.();
  }

  window.addEventListener("hashchange", load);
  load();
}

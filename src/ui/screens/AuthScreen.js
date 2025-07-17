import { AuthService } from "../../domain/auth/auth.service.js";
import { AuthRepository } from "../../data/api/authRepository.js";
import { Modal } from "../components/Modal.js";

export default class AuthScreen {
  constructor(root) {
    this.root = root;
    this.authSvc = new AuthService(new AuthRepository());
    this.state = {
      isAuthenticated: false,
      user: null,
    };
  }

  async render() {
    await this._checkAuth();

    if (this.state.isAuthenticated) {
      this._renderLoggedIn();
    } else {
      this._renderAuthOptions();
    }

    this.setUpEventListeners();
  }

  async _checkAuth() {
    try {
      const user = await this.authSvc.getCurrentUser();
      if (user) {
        this.state.isAuthenticated = true;
        this.state.user = user;
      }
    } catch (error) {
      console.error("Erreur de vérification auth:", error);
    }
  }

  _renderAuthOptions() {
    this.root.innerHTML = `
      <div class="flex flex-col items-center justify-center min-h-screen bg-gray-100">
        <div class="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow">
          <h2 class="text-2xl font-bold text-center">Bienvenue</h2>
          <div class="flex flex-col space-y-4">
            <button id="btn-login" class="px-4 py-2 text-white bg-indigo-600 rounded hover:bg-indigo-700">
              Se connecter
            </button>
            <button id="btn-register" class="px-4 py-2 text-indigo-600 border border-indigo-600 rounded hover:bg-indigo-50">
              Créer un compte
            </button>
          </div>
        </div>
      </div>`;
  }

  _renderLoggedIn() {
    this.root.innerHTML = `
      <div class="flex flex-col items-center justify-center min-h-screen bg-gray-100">
        <div class="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow">
          <h2 class="text-2xl font-bold text-center">Bienvenue, ${this.state.user.name}</h2>
          <p class="text-center">Vous êtes connecté avec: ${this.state.user.email}</p>
          <button id="btn-logout" class="w-full px-4 py-2 text-white bg-red-600 rounded hover:bg-red-700">
            Se déconnecter
          </button>
          <button id="btn-continue" class="w-full px-4 py-2 text-white bg-indigo-600 rounded hover:bg-indigo-700">
            Accéder à l'application
          </button>
        </div>
      </div>`;
  }

  // Fonction de validation pour le formulaire de connexion
  _validateLoginForm(formData) {
    const errors = {};
    const email = formData.get("email") || "";
    const password = formData.get("password") || "";

    // Validation de l'email
    if (!email.trim()) {
      errors.email = "L'email est requis";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = "L'email n'est pas valide";
    }

    // Validation du mot de passe
    if (!password) {
      errors.password = "Le mot de passe est requis";
    }

    return errors;
  }

  // Fonction de validation pour le formulaire d'inscription
  _validateRegisterForm(formData) {
    const errors = {};
    const name = formData.get("name") || "";
    const email = formData.get("email") || "";
    const password = formData.get("password") || "";

    // Validation du nom
    if (!name.trim()) {
      errors.name = "Le nom est requis";
    } else if (name.trim().length < 2) {
      errors.name = "Le nom doit contenir au moins 2 caractères";
    }

    // Validation de l'email
    if (!email.trim()) {
      errors.email = "L'email est requis";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = "L'email n'est pas valide";
    }

    // Validation du mot de passe
    if (!password) {
      errors.password = "Le mot de passe est requis";
    } else if (password.length < 6) {
      errors.password = "Le mot de passe doit contenir au moins 6 caractères";
    }

    return errors;
  }

  // Afficher les erreurs sous les champs
  _displayFieldErrors(form, errors) {
    // Réinitialiser toutes les erreurs
    form.querySelectorAll(".error-message").forEach((el) => el.remove());

    // Afficher les nouvelles erreurs
    Object.entries(errors).forEach(([field, message]) => {
      const input = form.querySelector(`[name="${field}"]`);
      if (input) {
        const errorEl = document.createElement("p");
        errorEl.className = "error-message text-red-600 text-sm mt-1";
        errorEl.textContent = message;
        input.parentNode.appendChild(errorEl);
      }
    });
  }

  _renderLoginForm() {
    const form = document.createElement("form");
    form.className = "space-y-4";
    form.innerHTML = `
      <div>
        <label class="block text-sm font-medium text-gray-700">Email</label>
        <input name="email" type="email" class="w-full px-3 py-2 border rounded-md">
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700">Mot de passe</label>
        <input name="password" type="password" class="w-full px-3 py-2 border rounded-md">
      </div>
      <button type="submit" class="w-full px-4 py-2 text-white bg-indigo-600 rounded-md hover:bg-indigo-700">
        Se connecter
      </button>
      <p id="login-error" class="text-red-600 text-sm hidden"></p>`;

    const modal = new Modal("Connexion", form);
    modal.open();

    form.onsubmit = async (e) => {
      e.preventDefault();
      const formData = new FormData(form);

      // Validation
      const errors = this._validateLoginForm(formData);

      if (Object.keys(errors).length > 0) {
        this._displayFieldErrors(form, errors);
        return;
      }

      const email = formData.get("email");
      const password = formData.get("password");

      try {
        await this.authSvc.login(email, password);
        modal.close();
        this.render();
      } catch (error) {
        const errorEl = form.querySelector("#login-error");
        errorEl.textContent = error.message;
        errorEl.classList.remove("hidden");
      }
    };
  }

  _renderRegisterForm() {
    const form = document.createElement("form");
    form.className = "space-y-4";
    form.innerHTML = `
      <div>
        <label class="block text-sm font-medium text-gray-700">Nom</label>
        <input name="name" class="w-full px-3 py-2 border rounded-md">
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700">Email</label>
        <input name="email" type="email" class="w-full px-3 py-2 border rounded-md">
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700">Mot de passe</label>
        <input name="password" type="password" minlength="6" class="w-full px-3 py-2 border rounded-md">
      </div>
      <button type="submit" class="w-full px-4 py-2 text-white bg-indigo-600 rounded-md hover:bg-indigo-700">
        S'inscrire
      </button>
      <p id="register-error" class="text-red-600 text-sm hidden"></p>`;

    const modal = new Modal("Inscription", form);
    modal.open();

    form.onsubmit = async (e) => {
      e.preventDefault();
      const formData = new FormData(form);

      // Validation
      const errors = this._validateRegisterForm(formData);

      if (Object.keys(errors).length > 0) {
        this._displayFieldErrors(form, errors);
        return;
      }

      const user = {
        name: formData.get("name"),
        email: formData.get("email"),
        password: formData.get("password"),
      };

      try {
        await this.authSvc.register(user);
        modal.close();
        this.render();
      } catch (error) {
        const errorEl = form.querySelector("#register-error");
        errorEl.textContent = error.message;
        errorEl.classList.remove("hidden");
      }
    };
  }

  setUpEventListeners() {
    if (!this.state.isAuthenticated) {
      const loginBtn = this.root.querySelector("#btn-login");
      const registerBtn = this.root.querySelector("#btn-register");

      if (loginBtn) loginBtn.onclick = () => this._renderLoginForm();
      if (registerBtn) registerBtn.onclick = () => this._renderRegisterForm();
    } else {
      const logoutBtn = this.root.querySelector("#btn-logout");
      const continueBtn = this.root.querySelector("#btn-continue");

      if (logoutBtn)
        logoutBtn.onclick = async () => {
          await this.authSvc.logout();
          this.state.isAuthenticated = false;
          this.state.user = null;
          this.render();
        };

      if (continueBtn)
        continueBtn.onclick = () => {
          window.location.hash = "#categories";
        };
    }
  }
}

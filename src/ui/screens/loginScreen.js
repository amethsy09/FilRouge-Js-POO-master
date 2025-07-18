// src/ui/screens/LoginScreen.js
import { AuthService } from "../../domain/auth/auth.service.js";
import { AuthRepository } from "../../data/api/authRepository.js";

export default class LoginScreen {
  constructor(root) {
    this.root = root;
    this.authSvc = new AuthService(new AuthRepository());
  }

  render() {
    this.root.innerHTML = `
      <div class="max-w-md mx-auto mt-10 bg-white p-8 rounded-lg shadow">
        <h1 class="text-2xl font-bold mb-6 text-center">Connexion</h1>
        <form id="login-form" class="space-y-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input name="email" type="email" class="w-full px-3 py-2 border rounded-md">
            <p id="email-error" class="text-red-600 text-sm mt-1 hidden"></p>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Mot de passe</label>
            <input name="password" type="password" class="w-full px-3 py-2 border rounded-md">
            <p id="password-error" class="text-red-600 text-sm mt-1 hidden"></p>
          </div>
          
          <button type="submit" class="w-full px-4 py-2 text-white bg-indigo-600 rounded-md hover:bg-indigo-700">
            Se connecter
          </button>
         
          
          <p id="form-error" class="text-red-600 text-center text-sm hidden"></p>
        </form>
      </div>`;

    this.setUpEventListeners();
  }

  _validateForm() {
    const form = this.root.querySelector("#login-form");
    const email = form.querySelector('[name="email"]').value;
    const password = form.querySelector('[name="password"]').value;
    let isValid = true;

    // Reset errors
    this.root.querySelectorAll('[id$="-error"]').forEach((el) => {
      el.classList.add("hidden");
    });

    // Email validation
    const emailError = this.root.querySelector("#email-error");
    if (!email) {
      emailError.textContent = "L'email est requis";
      emailError.classList.remove("hidden");
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      emailError.textContent = "L'email n'est pas valide";
      emailError.classList.remove("hidden");
      isValid = false;
    }

    // Password validation
    const passwordError = this.root.querySelector("#password-error");
    if (!password) {
      passwordError.textContent = "Le mot de passe est requis";
      passwordError.classList.remove("hidden");
      isValid = false;
    }

    return isValid;
  }

  setUpEventListeners() {
    const form = this.root.querySelector("#login-form");
    if (!form) return;

    form.onsubmit = async (e) => {
      e.preventDefault();

      if (!this._validateForm()) return;

      const formData = new FormData(form);
      const email = formData.get("email");
      const password = formData.get("password");

      try {
        const user = await this.authSvc.login(email, password);
        switch (user.roleId) {
          case "1":
            window.location.hash = "#admin";
            break;
          case "2":
            window.location.hash = "#client";
            break;
          case "3":
            window.location.hash = "#boutiquier";
            break;
          default:
            window.location.hash = "#categories";
        }
      } catch (error) {
        const errorEl = this.root.querySelector("#form-error");
        errorEl.textContent = error.message || "Erreur de connexion";
        errorEl.classList.remove("hidden");
      }
    };
  }
}

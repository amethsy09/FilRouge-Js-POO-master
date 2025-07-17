import { AuthService } from "../../domain/auth/auth.service.js";
import { AuthRepository } from "../../data/api/authRepository.js";
import { RoleService } from "../../domain/role/role.service.js";
import { RoleRepository } from "../../data/api/roleRepository.js";

export default class RegisterScreen {
  constructor(root) {
    this.root = root;
    this.authSvc = new AuthService(new AuthRepository());
    this.roleSvc = new RoleService(new RoleRepository());
    this.state = {
      roles: [],
      photoPreview: null,
    };
  }

  async render() {
    try {
      this.state.roles = await this.roleSvc.list();
    } catch (error) {
      console.error("Erreur lors du chargement des rôles:", error);
    }

    this.root.innerHTML = `
      <div class="max-w-md mx-auto mt-10 bg-white p-8 rounded-lg shadow">
        <h1 class="text-2xl font-bold mb-6 text-center">Créer un compte</h1>
        <form id="register-form" class="space-y-6">
          <!-- Champ Photo -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Photo de profil</label>
            <div class="flex items-center space-x-4">
              <!-- Aperçu de la photo -->
              <div id="photo-preview" class="w-16 h-16 rounded-full bg-gray-200 border-2 border-dashed flex items-center justify-center overflow-hidden">
                ${
                  this.state.photoPreview
                    ? `
                  <img src="${this.state.photoPreview}" class="w-full h-full object-cover">
                `
                    : `
                  <span class="text-gray-400 text-xs text-center">Aucune image</span>
                `
                }
              </div>
              <div class="flex-1">
                <input type="file" name="photo" accept="image/*" class="w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded file:border-0
                  file:text-sm file:font-semibold
                  file:bg-indigo-50 file:text-indigo-700
                  hover:file:bg-indigo-100">
                <p id="photo-error" class="text-red-600 text-sm mt-1 hidden"></p>
              </div>
            </div>
          </div>
          
          <!-- Autres champs... -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Nom</label>
            <input name="name" class="w-full px-3 py-2 border rounded-md">
            <p id="name-error" class="text-red-600 text-sm mt-1 hidden"></p>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input name="email" type="email" class="w-full px-3 py-2 border rounded-md">
            <p id="email-error" class="text-red-600 text-sm mt-1 hidden"></p>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Rôle</label>
            <select name="roleId" class="w-full px-3 py-2 border rounded-md">
              <option value="">Sélectionnez un rôle</option>
              ${this.state.roles
                .map(
                  (role) => `
                <option value="${role.id}">${role.libelle}</option>
              `
                )
                .join("")}
            </select>
            <p id="role-error" class="text-red-600 text-sm mt-1 hidden"></p>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Mot de passe</label>
            <input name="password" type="password" minlength="6" class="w-full px-3 py-2 border rounded-md">
            <p id="password-error" class="text-red-600 text-sm mt-1 hidden"></p>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Confirmer le mot de passe</label>
            <input name="confirmPassword" type="password" minlength="6" class="w-full px-3 py-2 border rounded-md">
            <p id="confirm-password-error" class="text-red-600 text-sm mt-1 hidden"></p>
          </div>
          
          <button type="submit" class="w-full px-4 py-2 text-white bg-indigo-600 rounded-md hover:bg-indigo-700">
            S'inscrire
          </button>
          
          <div class="text-center mt-4">
            <a href="#auth/login" class="text-indigo-600 hover:underline">
              Déjà un compte? Se connecter
            </a>
          </div>
          
          <p id="form-error" class="text-red-600 text-center text-sm hidden"></p>
        </form>
      </div>`;

    this.setUpEventListeners();
  }

  _validateForm() {
    const form = this.root.querySelector("#register-form");
    const name = form.querySelector('[name="name"]').value;
    const email = form.querySelector('[name="email"]').value;
    const roleId = form.querySelector('[name="roleId"]').value;
    const password = form.querySelector('[name="password"]').value;
    const confirmPassword = form.querySelector(
      '[name="confirmPassword"]'
    ).value;
    const photo = form.querySelector('[name="photo"]').files[0];

    let isValid = true;

    // Reset errors
    this.root.querySelectorAll('[id$="-error"]').forEach((el) => {
      el.classList.add("hidden");
    });

    // Name validation
    const nameError = this.root.querySelector("#name-error");
    if (!name.trim()) {
      nameError.textContent = "Le nom est requis";
      nameError.classList.remove("hidden");
      isValid = false;
    } else if (name.trim().length < 2) {
      nameError.textContent = "Le nom doit contenir au moins 2 caractères";
      nameError.classList.remove("hidden");
      isValid = false;
    }

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

    // Role validation
    const roleError = this.root.querySelector("#role-error");
    if (!roleId) {
      roleError.textContent = "Veuillez sélectionner un rôle";
      roleError.classList.remove("hidden");
      isValid = false;
    }

    // Password validation
    const passwordError = this.root.querySelector("#password-error");
    if (!password) {
      passwordError.textContent = "Le mot de passe est requis";
      passwordError.classList.remove("hidden");
      isValid = false;
    } else if (password.length < 6) {
      passwordError.textContent =
        "Le mot de passe doit contenir au moins 6 caractères";
      passwordError.classList.remove("hidden");
      isValid = false;
    }

    // Confirm password validation
    const confirmPasswordError = this.root.querySelector(
      "#confirm-password-error"
    );
    if (!confirmPassword) {
      confirmPasswordError.textContent =
        "Veuillez confirmer votre mot de passe";
      confirmPasswordError.classList.remove("hidden");
      isValid = false;
    } else if (password !== confirmPassword) {
      confirmPasswordError.textContent =
        "Les mots de passe ne correspondent pas";
      confirmPasswordError.classList.remove("hidden");
      isValid = false;
    }

    const photoError = this.root.querySelector("#photo-error");
    if (photo && photo.size > 2 * 1024 * 1024) {
      // 2MB max
      photoError.textContent = "L'image ne doit pas dépasser 2MB";
      photoError.classList.remove("hidden");
      isValid = false;
    }

    return isValid;
  }

  setUpEventListeners() {
    const form = this.root.querySelector("#register-form");
    if (!form) return;

    // Gestion de la prévisualisation de la photo
    const photoInput = form.querySelector('[name="photo"]');
    const photoPreview = this.root.querySelector("#photo-preview");

    photoInput.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          this.state.photoPreview = event.target.result;
          photoPreview.innerHTML = `<img src="${this.state.photoPreview}" class="w-full h-full object-cover">`;
        };
        reader.readAsDataURL(file);
      }
    });

    // Validation en temps réel pour la confirmation du mot de passe
    const passwordInput = form.querySelector('[name="password"]');
    const confirmPasswordInput = form.querySelector('[name="confirmPassword"]');

    const validatePasswordMatch = () => {
      const password = passwordInput.value;
      const confirmPassword = confirmPasswordInput.value;
      const errorEl = this.root.querySelector("#confirm-password-error");

      if (password && confirmPassword && password !== confirmPassword) {
        errorEl.textContent = "Les mots de passe ne correspondent pas";
        errorEl.classList.remove("hidden");
      } else {
        errorEl.classList.add("hidden");
      }
    };

    passwordInput.addEventListener("input", validatePasswordMatch);
    confirmPasswordInput.addEventListener("input", validatePasswordMatch);

    form.onsubmit = async (e) => {
      e.preventDefault();

      if (!this._validateForm()) return;

      const formData = new FormData(form);
      const photoFile = formData.get("photo");

      let photoBase64 = null;
      if (photoFile && photoFile.size > 0) {
        photoBase64 = await this._convertImageToBase64(photoFile);
      }
      const user = {
        name: formData.get("name"),
        email: formData.get("email"),
        password: formData.get("password"),
        roleId: formData.get("roleId"),
        photo: photoBase64,
      };

      try {
        await this.authSvc.register(user);
        window.location.hash = "#categories";
      } catch (error) {
        const errorEl = this.root.querySelector("#form-error");
        errorEl.textContent = error.message || "Erreur lors de l'inscription";
        errorEl.classList.remove("hidden");
      }
    };
  }

  _convertImageToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  }
}

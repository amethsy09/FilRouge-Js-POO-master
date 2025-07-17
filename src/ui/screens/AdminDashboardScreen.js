import { BoutiquierService } from "../../domain/boutiquier/boutiquier.service.js";
import { BoutiquierRepository } from "../../data/api/boutiquierRepository.js";
import { Modal } from "../components/Modal.js";

export default class AdminDashboardScreen {
  constructor(root) {
    this.root = root;
    this.boutiquierSvc = new BoutiquierService(new BoutiquierRepository());
    this.state = {
      boutiquiers: [],
    };
  }

  async render() {
    await this._loadBoutiquiers();

    this.root.innerHTML = `
      <div class="container mx-auto p-6">
        <div class="flex justify-between items-center mb-8">
          <h1 class="text-2xl font-bold">Tableau de bord Admin</h1>
          <button id="btn-add-boutiquier" class="bg-indigo-600 text-white px-4 py-2 rounded-lg">
            Ajouter un boutiquier
          </button>
        </div>
        
        <div id="boutiquiers-list" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          ${this._renderBoutiquiersCards()}
        </div>
      </div>
    `;

    this.setUpEventListeners();
  }

  async _loadBoutiquiers() {
    try {
      this.state.boutiquiers = await this.boutiquierSvc.list();
    } catch (error) {
      console.error("Erreur de chargement des boutiquiers:", error);
      this.root.innerHTML = `<p class="text-red-500">Erreur de chargement des boutiquiers</p>`;
    }
  }

  _renderBoutiquiersCards() {
    if (this.state.boutiquiers.length === 0) {
      return `<p class="text-gray-500">Aucun boutiquier enregistré</p>`;
    }

    return this.state.boutiquiers
      .map(
        (boutiquier) => `
    <div class="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-shadow" 
         data-id="${boutiquier.id}">
      <div class="h-48 bg-gray-200 flex items-center justify-center overflow-hidden">
        ${
          boutiquier.photo
            ? `<img src="${boutiquier.photo}" alt="${boutiquier.nom}" class="w-full h-full object-cover">`
            : `<span class="text-gray-500">Pas de photo</span>`
        }
      </div>
      <div class="p-4">
        <h3 class="font-bold text-lg">${boutiquier.nom} ${
          boutiquier.prenom
        }</h3>
        <p class="text-gray-600">${boutiquier.email}</p>
        ${
          boutiquier.localisation
            ? `<p class="mt-2 text-sm text-gray-500">
              Localisation: ${boutiquier.localisation.lat.toFixed(
                6
              )}, ${boutiquier.localisation.lng.toFixed(6)}
             </p>`
            : ""
        }
      </div>
    </div>
  `
      )
      .join("");
  }

  _renderAddBoutiquierForm() {
    const form = document.createElement("form");
    form.className = "space-y-4";
    form.innerHTML = `
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700">Nom</label>
          <input name="nom" class="w-full px-3 py-2 border rounded-md">
          <p id="nom-error" class="text-red-600 text-sm mt-1 hidden"></p>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700">Prénom</label>
          <input name="prenom" class="w-full px-3 py-2 border rounded-md">
          <p id="prenom-error" class="text-red-600 text-sm mt-1 hidden"></p>
        </div>
      </div>
      
      <div>
        <label class="block text-sm font-medium text-gray-700">Email</label>
        <input name="email" type="email" class="w-full px-3 py-2 border rounded-md">
        <p id="email-error" class="text-red-600 text-sm mt-1 hidden"></p>
      </div>
      
      <div>
        <label class="block text-sm font-medium text-gray-700">Mot de passe</label>
        <input name="password" type="password" minlength="6" class="w-full px-3 py-2 border rounded-md">
        <p id="password-error" class="text-red-600 text-sm mt-1 hidden"></p>
      </div>
      
      <div>
        <label class="block text-sm font-medium text-gray-700">Photo de profil</label>
        <div class="flex items-center space-x-4">
          <div id="photo-preview" class="w-16 h-16 rounded-full bg-gray-200 border-2 border-dashed flex items-center justify-center overflow-hidden">
            ${
              this.state.photoPreview
                ? `<img src="${this.state.photoPreview}" class="w-full h-full object-cover">`
                : `<span class="text-gray-400 text-xs text-center">Aucune image</span>`
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
      
      <h3 class="text-lg font-medium mt-6">Localisation de la boutique</h3>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700">Latitude</label>
          <input name="lat" type="number" step="0.000001" class="w-full px-3 py-2 border rounded-md">
          <p id="lat-error" class="text-red-600 text-sm mt-1 hidden"></p>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700">Longitude</label>
          <input name="lng" type="number" step="0.000001" class="w-full px-3 py-2 border rounded-md">
          <p id="lng-error" class="text-red-600 text-sm mt-1 hidden"></p>
        </div>
      </div>
      
      <div class="flex justify-end space-x-3 pt-4">
        <button type="button" id="btn-cancel" class="px-4 py-2 border border-gray-300 rounded-md">
          Annuler
        </button>
        <button type="submit" class="px-4 py-2 bg-indigo-600 text-white rounded-md">
          Enregistrer
        </button>
      </div>
      
      <p id="form-error" class="text-red-600 text-center text-sm hidden"></p>
    `;

    const modal = new Modal("Ajouter un boutiquier", form);
    modal.open();

    // Gestion de la photo
    const photoInput = form.querySelector('[name="photo"]');
    const photoPreview = form.querySelector("#photo-preview");

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

    // Annulation
    form.querySelector("#btn-cancel").onclick = () => modal.close();

    // Soumission
    form.onsubmit = async (e) => {
      e.preventDefault();

      if (!this._validateForm(form)) return;

      const formData = new FormData(form);
      const boutiquier = {
        nom: formData.get("nom"),
        prenom: formData.get("prenom"),
        email: formData.get("email"),
        password: formData.get("password"),
        photo: this.state.photoPreview || null,
        localisation: {
          lat: parseFloat(formData.get("lat")),
          lng: parseFloat(formData.get("lng")),
        },
      };

      try {
        await this.boutiquierSvc.create(boutiquier);
        modal.close();
        this.state.photoPreview = null; // Reset photo preview
        this.render();
      } catch (error) {
        const errorEl = form.querySelector("#form-error");
        errorEl.textContent = error.message || "Erreur lors de la création";
        errorEl.classList.remove("hidden");
      }
    };
  }

  _validateForm(form) {
    const nom = form.querySelector('[name="nom"]').value;
    const prenom = form.querySelector('[name="prenom"]').value;
    const email = form.querySelector('[name="email"]').value;
    const password = form.querySelector('[name="password"]').value;
    const lat = form.querySelector('[name="lat"]').value;
    const lng = form.querySelector('[name="lng"]').value;
    const photo = form.querySelector('[name="photo"]').files[0];

    let isValid = true;

    // Reset errors
    form.querySelectorAll('[id$="-error"]').forEach((el) => {
      el.classList.add("hidden");
    });

    // Nom validation
    const nomError = form.querySelector("#nom-error");
    if (!nom.trim()) {
      nomError.textContent = "Le nom est requis";
      nomError.classList.remove("hidden");
      isValid = false;
    } else if (nom.trim().length < 2) {
      nomError.textContent = "Le nom doit contenir au moins 2 caractères";
      nomError.classList.remove("hidden");
      isValid = false;
    }

    // Prénom validation
    const prenomError = form.querySelector("#prenom-error");
    if (!prenom.trim()) {
      prenomError.textContent = "Le prénom est requis";
      prenomError.classList.remove("hidden");
      isValid = false;
    } else if (prenom.trim().length < 2) {
      prenomError.textContent = "Le prénom doit contenir au moins 2 caractères";
      prenomError.classList.remove("hidden");
      isValid = false;
    }

    // Email validation
    const emailError = form.querySelector("#email-error");
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
    const passwordError = form.querySelector("#password-error");
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

    // Latitude validation
    const latError = form.querySelector("#lat-error");
    if (!lat) {
      latError.textContent = "La latitude est requise";
      latError.classList.remove("hidden");
      isValid = false;
    } else if (isNaN(lat) || lat < -90 || lat > 90) {
      latError.textContent = "La latitude doit être entre -90 et 90";
      latError.classList.remove("hidden");
      isValid = false;
    }

    // Longitude validation
    const lngError = form.querySelector("#lng-error");
    if (!lng) {
      lngError.textContent = "La longitude est requise";
      lngError.classList.remove("hidden");
      isValid = false;
    } else if (isNaN(lng) || lng < -180 || lng > 180) {
      lngError.textContent = "La longitude doit être entre -180 et 180";
      lngError.classList.remove("hidden");
      isValid = false;
    }

    // Photo validation (optionnelle mais avec restrictions si fournie)
    const photoError = form.querySelector("#photo-error");
    if (photo) {
      if (photo.size > 5 * 1024 * 1024) {
        // 2MB max
        photoError.textContent = "L'image ne doit pas dépasser 2MB";
        photoError.classList.remove("hidden");
        isValid = false;
      } else if (!photo.type.match("image.*")) {
        photoError.textContent = "Le fichier doit être une image";
        photoError.classList.remove("hidden");
        isValid = false;
      }
    }

    return isValid;
  }

  async _convertToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  }

  setUpEventListeners() {
    // Bouton d'ajout
    this.root
      .querySelector("#btn-add-boutiquier")
      ?.addEventListener("click", () => {
        this._renderAddBoutiquierForm();
      });

    // Clic sur une carte boutiquier
    this.root.querySelectorAll("#boutiquiers-list > div").forEach((card) => {
      card.addEventListener("click", () => {
        const id = card.dataset.id;
        window.location.hash = `#boutiquiers/${id}`;
      });
    });
  }
}

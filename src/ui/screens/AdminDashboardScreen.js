import { BoutiquierService } from "../../domain/boutiquier/boutiquier.service.js";
import { BoutiquierRepository } from "../../data/api/boutiquierRepository.js";
import { Modal } from "../components/Modal.js";

export default class AdminDashboardScreen {
  constructor(root) {
    this.root = root;
    this.boutiquierSvc = new BoutiquierService(new BoutiquierRepository());
    this.state = {
      boutiquiers: [],
      viewMode: "cards",
      showDeleted: false,
    };
  }

  async render() {
    await this._loadBoutiquiers();

    this.root.innerHTML = `
      <div class="container mx-auto p-6">
        <div class="flex justify-between items-center mb-8">
          <h1 class="text-2xl font-bold">Partie Admin</h1>
          <div class="flex items-center space-x-4">
            <button id="btn-toggle-view" class="flex items-center space-x-2 px-3 py-2 border rounded-md">
              <span>${
                this.state.viewMode === "cards" ? "Liste" : "Cartes"
              }</span>
              <i class="fas fa-${
                this.state.viewMode === "cards" ? "list" : "th-large"
              }"></i>
            </button>
            <button id="btn-toggle-deleted" class="flex items-center space-x-2 px-3 py-2 border rounded-md ${
              this.state.showDeleted ? "bg-gray-200" : ""
            }">
              <span>${
                this.state.showDeleted
                  ? "Masquer supprimés"
                  : "Afficher supprimés"
              }</span>
              <i class="fas fa-trash${
                this.state.showDeleted ? "-restore" : ""
              }"></i>
            </button>
            <button id="btn-add-boutiquier" class="bg-indigo-600 text-white px-4 py-2 rounded-lg">
              Ajouter un boutiquier
            </button>
            <button id="btn-logout" class="bg-red-600 text-white px-4 py-2 rounded-lg">
              Déconnexion
            </button>
          </div>
        </div>
        
        <div id="boutiquiers-container">
          ${
            this.state.viewMode === "cards"
              ? this._renderBoutiquiersCards()
              : this._renderBoutiquiersList()
          }
        </div>
      </div>
    `;

    this.setUpEventListeners();
  }

  async _loadBoutiquiers() {
    try {
      const allBoutiquiers = await this.boutiquierSvc.list();

      this.state.boutiquiers = allBoutiquiers.map((b) => ({
        id: b.id || "N/A",
        nom: b.nom || "",
        prenom: b.prenom || "",
        email: b.email || "",
        telephone: b.telephone || "",
        localisation: b.localisation || { lat: null, lng: null },
        boutiqueNom: b.boutiqueNom || "",
        id_utilisateur: b.id_utilisateur || null,
        deletedAt: b.deletedAt || null,
        createdAt: b.createdAt || new Date().toISOString(),
      }));

      if (!this.state.showDeleted) {
        this.state.boutiquiers = this.state.boutiquiers.filter(
          (b) => !b.deletedAt
        );
      }
    } catch (error) {
      console.error("Erreur:", error);
      this._showError(
        `Erreur lors du chargement des boutiquiers: ${error.message}`
      );
    }
  }

  _renderBoutiquiersCards() {
    if (this.state.boutiquiers.length === 0) {
      return `<p class="text-gray-500">Aucun boutiquier ${
        this.state.showDeleted ? "supprimé" : "enregistré"
      }</p>`;
    }

    return `
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        ${this.state.boutiquiers
          .map((boutiquier) => {
            const hasLocation =
              boutiquier.localisation &&
              boutiquier.localisation.lat !== null &&
              boutiquier.localisation.lng !== null;

            const locationText = hasLocation
              ? `${boutiquier.localisation.lat}, ${boutiquier.localisation.lng}`
              : "Localisation inconnue";

            return `
            <div class="bg-white rounded-lg shadow-md overflow-hidden ${
              boutiquier.deletedAt ? "opacity-60 border-2 border-red-200" : ""
            }">
              <div class="p-4">
                <div class="flex justify-between items-start">
                  <div>
                    <h3 class="font-bold text-lg">${boutiquier.prenom} ${
              boutiquier.nom
            }</h3>
                    <p class="text-indigo-600 font-medium">${
                      boutiquier.boutiqueNom || "Boutique sans nom"
                    }</p>
                  </div>
                  <div class="flex space-x-2">
                    <button class="btn-edit text-indigo-600" data-id="${
                      boutiquier.id
                    }">
                      <i class="fas fa-edit"></i>
                    </button>
                    <button class="${
                      boutiquier.deletedAt
                        ? "btn-restore text-green-600"
                        : "btn-delete text-red-600"
                    }" data-id="${boutiquier.id}">
                      <i class="fas ${
                        boutiquier.deletedAt ? "fa-trash-restore" : "fa-trash"
                      }"></i>
                    </button>
                  </div>
                </div>
                <div class="mt-2 space-y-1">
                  <p class="text-gray-600 flex items-center">
                    <i class="fas fa-envelope mr-2"></i>${boutiquier.email}
                  </p>
                  <p class="text-gray-600 flex items-center">
                    <i class="fas fa-phone mr-2"></i>${
                      boutiquier.telephone || "Non renseigné"
                    }
                  </p>
                  <p class="text-gray-600 flex items-center">
                    <i class="fas fa-user mr-2"></i>${
                      boutiquier.id_utilisateur
                        ? `ID Utilisateur: ${boutiquier.id_utilisateur}`
                        : "Non associé"
                    }
                  </p>
                  <p class="text-sm text-gray-500 flex items-center">
                    <i class="fas fa-map-marker-alt mr-2"></i> 
                    ${locationText}
                  </p>
                  <p class="text-sm text-gray-500">
                    <i class="fas fa-calendar-alt mr-2"></i>
                    Créé le: ${new Date(boutiquier.createdAt).toLocaleDateString()}
                  </p>
                </div>
                ${
                  boutiquier.deletedAt
                    ? `<p class="mt-2 text-xs text-red-500">
                        <i class="fas fa-trash mr-1"></i>
                        Supprimé le: ${new Date(
                          boutiquier.deletedAt
                        ).toLocaleDateString()}
                      </p>`
                    : ""
                }
              </div>
            </div>
          `;
          })
          .join("")}
      </div>
    `;
  }

  _renderBoutiquiersList() {
    if (!this.state.boutiquiers || this.state.boutiquiers.length === 0) {
      return `<p class="text-gray-500">Aucun boutiquier ${
        this.state.showDeleted ? "supprimé" : "enregistré"
      }</p>`;
    }

    try {
      return `
        <div class="bg-white shadow rounded-lg overflow-hidden">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Boutique</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Localisation</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date création</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              ${this.state.boutiquiers
                .map((boutiquier) => {
                  const hasLocation =
                    boutiquier.localisation &&
                    boutiquier.localisation.lat !== null &&
                    boutiquier.localisation.lng !== null;

                  const locationText = hasLocation
                    ? `${boutiquier.localisation.lat}, ${boutiquier.localisation.lng}`
                    : "Inconnue";

                  return `
                  <tr class="${
                    boutiquier.deletedAt ? "bg-red-50" : "hover:bg-gray-50"
                  }">
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="font-medium">${boutiquier.prenom || ""} ${
                    boutiquier.nom || ""
                  }</div>
                      <div class="text-sm text-gray-500">${
                        boutiquier.email || ""
                      }</div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="font-medium text-indigo-600">${
                        boutiquier.boutiqueNom || "Non renseigné"
                      }</div>
                      <div class="text-sm text-gray-500">${
                        boutiquier.telephone || "Non renseigné"
                      }</div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="text-sm text-gray-900">${
                        boutiquier.email || ""
                      }</div>
                      <div class="text-sm text-gray-500">${
                        boutiquier.telephone || "Non renseigné"
                      }</div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ${locationText}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ${new Date(boutiquier.createdAt).toLocaleDateString()}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      ${
                        boutiquier.deletedAt
                          ? `<span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                              Supprimé
                            </span>`
                          : `<span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                              Actif
                            </span>`
                      }
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button class="btn-edit text-indigo-600 hover:text-indigo-900 mr-3" data-id="${
                        boutiquier.id
                      }">
                        <i class="fas fa-edit"></i>
                      </button>
                      <button class="${
                        boutiquier.deletedAt
                          ? "btn-restore text-green-600 hover:text-green-900"
                          : "btn-delete text-red-600 hover:text-red-900"
                      }" data-id="${boutiquier.id}">
                        <i class="fas ${
                          boutiquier.deletedAt ? "fa-trash-restore" : "fa-trash"
                        }"></i>
                      </button>
                    </td>
                  </tr>
                `;
                })
                .join("")}
            </tbody>
          </table>
        </div>
      `;
    } catch (error) {
      console.error("Erreur lors du rendu de la liste des boutiquiers:", error);
      return `<p class="text-red-500">Erreur lors du chargement des boutiquiers</p>`;
    }
  }

  _renderBoutiquierForm(boutiquier = null) {
    const isEdit = !!boutiquier;
    const form = document.createElement("form");
    form.className = "space-y-4";
    form.innerHTML = `
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700">Nom*</label>
          <input name="nom" value="${
            boutiquier?.nom || ""
          }" class="w-full px-3 py-2 border rounded-md">
          <p id="nom-error" class="text-red-600 text-sm mt-1 hidden"></p>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700">Prénom*</label>
          <input name="prenom" value="${
            boutiquier?.prenom || ""
          }" class="w-full px-3 py-2 border rounded-md">
          <p id="prenom-error" class="text-red-600 text-sm mt-1 hidden"></p>
        </div>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700">Email*</label>
          <input name="email" type="email" value="${
            boutiquier?.email || ""
          }" class="w-full px-3 py-2 border rounded-md" ${
      isEdit ? "readonly" : ""
    }>
          <p id="email-error" class="text-red-600 text-sm mt-1 hidden"></p>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700">Téléphone*</label>
          <input name="telephone" type="tel" value="${
            boutiquier?.telephone || ""
          }" class="w-full px-3 py-2 border rounded-md">
          <p id="telephone-error" class="text-red-600 text-sm mt-1 hidden"></p>
        </div>
      </div>
      
      ${
        !isEdit
          ? `
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700">Mot de passe*</label>
              <input name="password" type="password" minlength="6" class="w-full px-3 py-2 border rounded-md">
              <p id="password-error" class="text-red-600 text-sm mt-1 hidden"></p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Confirmer mot de passe*</label>
              <input name="confirmPassword" type="password" minlength="6" class="w-full px-3 py-2 border rounded-md">
              <p id="confirmPassword-error" class="text-red-600 text-sm mt-1 hidden"></p>
            </div>
          </div>
        `
          : ""
      }
      
      <h3 class="text-lg font-medium mt-6">Informations de la boutique</h3>
      
      <div>
        <label class="block text-sm font-medium text-gray-700">Nom de la boutique*</label>
        <input name="boutiqueNom" value="${
          boutiquier?.boutiqueNom || ""
        }" class="w-full px-3 py-2 border rounded-md">
        <p id="boutiqueNom-error" class="text-red-600 text-sm mt-1 hidden"></p>
      </div>
      
      <h4 class="text-md font-medium">Localisation de la boutique</h4>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700">Latitude*</label>
          <input name="lat" type="number" step="0.000001" value="${
            boutiquier?.localisation?.lat || ""
          }" class="w-full px-3 py-2 border rounded-md">
          <p id="lat-error" class="text-red-600 text-sm mt-1 hidden"></p>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700">Longitude*</label>
          <input name="lng" type="number" step="0.000001" value="${
            boutiquier?.localisation?.lng || ""
          }" class="w-full px-3 py-2 border rounded-md">
          <p id="lng-error" class="text-red-600 text-sm mt-1 hidden"></p>
        </div>
      </div>
      
      <div class="flex justify-end space-x-3 pt-4">
        <button type="button" id="btn-cancel" class="px-4 py-2 border border-gray-300 rounded-md">
          Annuler
        </button>
        <button type="submit" class="px-4 py-2 bg-indigo-600 text-white rounded-md">
          ${isEdit ? "Mettre à jour" : "Enregistrer"}
        </button>
      </div>
      
      <p id="form-error" class="text-red-600 text-center text-sm hidden"></p>
    `;

    const modal = new Modal(
      isEdit ? "Modifier le boutiquier" : "Ajouter un boutiquier",
      form
    );
    modal.open();

    // Annulation
    form.querySelector("#btn-cancel").onclick = () => {
      modal.close();
    };

    // Soumission
    form.onsubmit = async (e) => {
      e.preventDefault();

      if (!this._validateForm(form, isEdit)) return;

      const formData = new FormData(form);

      try {
        const boutiquierData = {
          nom: formData.get("nom"),
          prenom: formData.get("prenom"),
          email: formData.get("email"),
          telephone: formData.get("telephone"),
          boutiqueNom: formData.get("boutiqueNom"),
          localisation: {
            lat: parseFloat(formData.get("lat")),
            lng: parseFloat(formData.get("lng")),
          },
        };

        if (!isEdit) {
          boutiquierData.password = formData.get("password");
        }

        if (isEdit) {
          await this.boutiquierSvc.update(boutiquier.id, boutiquierData);
          this._showSuccess("Boutiquier mis à jour avec succès");
        } else {
          await this.boutiquierSvc.create(boutiquierData);
          this._showSuccess("Boutiquier créé avec succès");
        }

        modal.close();
        await this.render();
      } catch (error) {
        console.error("Form submission error:", error);

        if (error.errors) {
          Object.entries(error.errors).forEach(([field, message]) => {
            const errorEl = form.querySelector(`#${field}-error`);
            if (errorEl) {
              errorEl.textContent = message;
              errorEl.classList.remove("hidden");
            }
          });
        } else {
          const errorEl = form.querySelector("#form-error");
          errorEl.textContent =
            error.message ||
            `Erreur lors de ${isEdit ? "la mise à jour" : "la création"}`;
          errorEl.classList.remove("hidden");
        }
      }
    };
  }

  _validateForm(form, isEdit = false) {
    const fields = [
      {
        name: "nom",
        label: "Nom",
        value: form.querySelector('[name="nom"]').value,
        validations: [
          { test: (val) => !!val.trim(), message: "Le nom est requis" },
          {
            test: (val) => val.trim().length >= 2,
            message: "Le nom doit contenir au moins 2 caractères",
          },
        ],
      },
      {
        name: "prenom",
        label: "Prénom",
        value: form.querySelector('[name="prenom"]').value,
        validations: [
          { test: (val) => !!val.trim(), message: "Le prénom est requis" },
          {
            test: (val) => val.trim().length >= 2,
            message: "Le prénom doit contenir au moins 2 caractères",
          },
        ],
      },
      {
        name: "email",
        label: "Email",
        value: form.querySelector('[name="email"]').value,
        validations: [
          { test: (val) => !!val, message: "L'email est requis" },
          {
            test: (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val),
            message: "L'email n'est pas valide",
          },
        ],
      },
      {
        name: "telephone",
        label: "Téléphone",
        value: form.querySelector('[name="telephone"]').value,
        validations: [
          { test: (val) => !!val, message: "Le téléphone est requis" },
          {
            test: (val) => /^[0-9]{9,15}$/.test(val),
            message: "Le téléphone doit contenir entre 9 et 15 chiffres",
          },
        ],
      },
      {
        name: "password",
        label: "Mot de passe",
        value: isEdit ? null : form.querySelector('[name="password"]')?.value,
        required: !isEdit,
        validations: [
          {
            test: (val) => !isEdit || !!val,
            message: "Le mot de passe est requis",
          },
          {
            test: (val) => !isEdit || val.length >= 6,
            message: "Le mot de passe doit contenir au moins 6 caractères",
          },
        ],
      },
      {
        name: "confirmPassword",
        label: "Confirmation mot de passe",
        value: isEdit ? null : form.querySelector('[name="confirmPassword"]')?.value,
        required: !isEdit,
        validations: [
          {
            test: (val) => !isEdit || val === form.querySelector('[name="password"]').value,
            message: "Les mots de passe ne correspondent pas",
          },
        ],
      },
      {
        name: "boutiqueNom",
        label: "Nom de la boutique",
        value: form.querySelector('[name="boutiqueNom"]').value,
        validations: [
          { test: (val) => !!val.trim(), message: "Le nom de la boutique est requis" },
          {
            test: (val) => val.trim().length >= 3,
            message: "Le nom de la boutique doit contenir au moins 3 caractères",
          },
        ],
      },
      {
        name: "lat",
        label: "Latitude",
        value: form.querySelector('[name="lat"]').value,
        validations: [
          { test: (val) => !!val, message: "La latitude est requise" },
          {
            test: (val) => !isNaN(parseFloat(val)),
            message: "La latitude doit être un nombre",
          },
          {
            test: (val) => parseFloat(val) >= -90 && parseFloat(val) <= 90,
            message: "La latitude doit être entre -90 et 90",
          },
        ],
      },
      {
        name: "lng",
        label: "Longitude",
        value: form.querySelector('[name="lng"]').value,
        validations: [
          { test: (val) => !!val, message: "La longitude est requise" },
          {
            test: (val) => !isNaN(parseFloat(val)),
            message: "La longitude doit être un nombre",
          },
          {
            test: (val) => parseFloat(val) >= -180 && parseFloat(val) <= 180,
            message: "La longitude doit être entre -180 et 180",
          },
        ],
      },
    ];

    // Reset errors
    form
      .querySelectorAll('[id$="-error"]')
      .forEach((el) => el.classList.add("hidden"));
    let isValid = true;

    fields.forEach((field) => {
      if (field.required === false) return;

      const errorElement = form.querySelector(`#${field.name}-error`);
      let fieldValid = true;

      for (const validation of field.validations) {
        if (!validation.test(field.value)) {
          errorElement.textContent = validation.message;
          errorElement.classList.remove("hidden");
          fieldValid = false;
          isValid = false;
          break;
        }
      }

      if (fieldValid && errorElement) {
        errorElement.classList.add("hidden");
      }
    });

    return isValid;
  }

  _showError(message) {
    const errorDiv = document.createElement("div");
    errorDiv.className =
      "fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-md shadow-lg z-50";
    errorDiv.textContent = message;
    document.body.appendChild(errorDiv);

    setTimeout(() => {
      errorDiv.remove();
    }, 5000);
  }

  _showSuccess(message) {
    const successDiv = document.createElement("div");
    successDiv.className =
      "fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-md shadow-lg z-50";
    successDiv.textContent = message;
    document.body.appendChild(successDiv);

    setTimeout(() => {
      successDiv.remove();
    }, 5000);
  }

  _showConfirmationModal(title, message, confirmCallback) {
    const modalContent = document.createElement("div");
    modalContent.className = "space-y-4";

    modalContent.innerHTML = `
      <p class="text-gray-700">${message}</p>
      <div class="flex justify-end space-x-3 pt-4">
        <button id="btn-confirm-cancel" class="px-4 py-2 border border-gray-300 rounded-md">
          Annuler
        </button>
        <button id="btn-confirm-ok" class="px-4 py-2 bg-indigo-600 text-white rounded-md">
          Confirmer
        </button>
      </div>
    `;

    const modal = new Modal(title, modalContent);
    modal.open();

    modalContent.querySelector("#btn-confirm-cancel").onclick = () => {
      modal.close();
    };

    modalContent.querySelector("#btn-confirm-ok").onclick = async () => {
      try {
        await confirmCallback();
        modal.close();
      } catch (error) {
        console.error("Confirmation error:", error);
        this._showError(error.message);
      }
    };
  }

  setUpEventListeners() {
    // Bouton d'ajout
    this.root
      .querySelector("#btn-add-boutiquier")
      ?.addEventListener("click", () => {
        this._renderBoutiquierForm();
      });

    // Bouton de changement de vue (cartes/liste)
    this.root
      .querySelector("#btn-toggle-view")
      ?.addEventListener("click", () => {
        this.state.viewMode =
          this.state.viewMode === "cards" ? "list" : "cards";
        this.render();
      });

    // Bouton d'affichage des supprimés
    this.root
      .querySelector("#btn-toggle-deleted")
      ?.addEventListener("click", async () => {
        this.state.showDeleted = !this.state.showDeleted;
        await this._loadBoutiquiers();
        this.render();
      });

    // Bouton de déconnexion
    this.root.querySelector("#btn-logout")?.addEventListener("click", () => {
      localStorage.removeItem("currentUser");
      localStorage.removeItem("token");
      window.location.hash = "#auth/login";
    });

    // Boutons d'édition
    this.root.querySelectorAll(".btn-edit").forEach((btn) => {
      btn.addEventListener("click", async (e) => {
        e.stopPropagation();
        const id = btn.dataset.id;
        try {
          const boutiquier = await this.boutiquierSvc.get(id);
          this._renderBoutiquierForm(boutiquier);
        } catch (error) {
          console.error("Error loading boutiquier:", error);
          this._showError(
            `Impossible de charger les données du boutiquier: ${error.message}`
          );
        }
      });
    });

    // Boutons de suppression/restauration
    this.root.querySelectorAll(".btn-delete, .btn-restore").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const id = btn.dataset.id;
        const isDelete = btn.classList.contains("btn-delete");

        this._showConfirmationModal(
          isDelete ? "Confirmer la suppression" : "Confirmer la restauration",
          `Êtes-vous sûr de vouloir ${
            isDelete ? "supprimer" : "restaurer"
          } ce boutiquier ?`,
          async () => {
            try {
              if (isDelete) {
                await this.boutiquierSvc.delete(id);
                this._showSuccess("Boutiquier supprimé avec succès");
              } else {
                await this.boutiquierSvc.restore(id);
                this._showSuccess("Boutiquier restauré avec succès");
              }
              await this._loadBoutiquiers();
              this.render();
            } catch (error) {
              console.error("Erreur:", error);
              throw new Error(
                `Erreur lors de ${
                  isDelete ? "la suppression" : "la restauration"
                }: ${error.message}`
              );
            }
          }
        );
      });
    });
  }
}
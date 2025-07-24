import { ClientService } from "../../domain/client/client.service.js";
import { ClientRepository } from "../../data/api/clientRepository.js";
import { Modal } from "../components/Modal.js";
import { config } from "../../utils/config.js";
import { AuthService } from "../../domain/auth/auth.service.js";
import { AuthRepository } from "../../data/api/authRepository.js";
import  {validateSenegalPhoneNumber}  from "../../utils/validation/phonevalidation.js";

export default class BoutiquierClientsScreen {
  constructor(root) {
    this.root = root;
    this.clientSvc = new ClientService(new ClientRepository());
    this.authSvc = new AuthService(new AuthRepository());
    this.state = {
      clients: [],
      viewMode: "cards",
      showDeleted: false,
      currentUser: null,
      isLoading: true,
      error: null,
      searchQuery: "",
    };

    this.buttonStyles = {
      base: "inline-flex items-center justify-center rounded-md font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200 ease-in-out",
      sizes: {
        sm: "px-3 py-1.5 text-sm",
        md: "px-4 py-2 text-base",
        lg: "px-6 py-3 text-lg",
      },
      variants: {
        primary:
          "bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500 shadow-sm",
        secondary:
          "bg-white text-gray-700 hover:bg-gray-50 focus:ring-gray-500 border border-gray-300 shadow-sm",
        danger:
          "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 shadow-sm",
        warning:
          "bg-yellow-500 text-white hover:bg-yellow-600 focus:ring-yellow-400 shadow-sm",
        success:
          "bg-green-600 text-white hover:bg-green-700 focus:ring-green-500 shadow-sm",
        ghost:
          "bg-transparent text-gray-600 hover:bg-gray-100 focus:ring-gray-300",
        link: "bg-transparent text-indigo-600 hover:text-indigo-800 underline",
      },
      icon: "mr-2 -ml-1",
    };
  }

  async render() {
    try {
      this.state.currentUser = await this.authSvc.getCurrentUser();
      await this._loadClients();

      this.root.innerHTML = `
        <div class="container mx-auto p-4">
          <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div>
              <h1 class="text-2xl font-bold text-gray-800">Gestion des Clients</h1>
              <p class="text-gray-600">${
                this.state.showDeleted
                  ? "Affichage des clients supprimés"
                  : "Affichage des clients actifs"
              }</p>
            </div>
            
            <div class="flex flex-wrap gap-3 items-center">
              <button id="btn-toggle-view" class="${this.buttonStyles.base} ${
        this.buttonStyles.sizes.md
      } ${this.buttonStyles.variants.secondary}">
                <i class="fas fa-${
                  this.state.viewMode === "cards" ? "list" : "th-large"
                } ${this.buttonStyles.icon}"></i>
                ${
                  this.state.viewMode === "cards" ? "Vue tableau" : "Vue cartes"
                }
              </button>
              
              <button id="btn-toggle-deleted" class="${
                this.buttonStyles.base
              } ${this.buttonStyles.sizes.md} ${
        this.state.showDeleted
          ? this.buttonStyles.variants.warning
          : this.buttonStyles.variants.secondary
      }">
                <i class="fas fa-${
                  this.state.showDeleted ? "eye-slash" : "trash"
                } ${this.buttonStyles.icon}"></i>
                ${
                  this.state.showDeleted
                    ? "Masquer supprimés"
                    : "Afficher supprimés"
                }
              </button>
              
              <button id="btn-add-client" class="${this.buttonStyles.base} ${
        this.buttonStyles.sizes.md
      } ${this.buttonStyles.variants.primary}">
                <i class="fas fa-plus ${this.buttonStyles.icon}"></i> Ajouter
              </button>
              
              <button id="btn-logout" class="${this.buttonStyles.base} ${
        this.buttonStyles.sizes.md
      } ${this.buttonStyles.variants.danger}">
                <i class="fas fa-sign-out-alt ${
                  this.buttonStyles.icon
                }"></i> Déconnexion
              </button>
            </div>
          </div>
          
          ${this.state.isLoading ? this._renderLoadingState() : ""}
          ${this.state.error ? this._renderErrorState() : ""}
          
          ${
            !this.state.isLoading && !this.state.error
              ? `
            ${this.state.clients.length === 0 ? this._renderEmptyState() : ""}
            ${
              this.state.viewMode === "cards"
                ? this._renderCardsView()
                : this._renderTableView()
            }
          `
              : ""
          }
        </div>
      `;

      this._setupEventListeners();
    } catch (error) {
      console.error("Render error:", error);
      this.state.error = error.message;
      this.render();
    }
  }

  async _loadClients() {
    try {
      this.state.isLoading = true;
      this.state.error = null;

      const response = await this.clientSvc.list(this.state.showDeleted);

      this.state.clients = response.map((item) => ({
        id: item.id || "N/A",
        nom: item.nom || "Non défini",
        prenom: item.prenom || "",
        telephone: item.telephone || "Non défini",
        solde: item.solde || 0,
        dette: item.dette || 0,
        deletedAt: item.deletedAt || null,
        createdAt: item.createdAt || new Date().toISOString(),
      }));
    } catch (error) {
      console.error("Load error:", error);
      this.state.error = error.message || "Erreur de chargement des données";
    } finally {
      this.state.isLoading = false;
    }
  }

  _renderLoadingState() {
    return `
      <div class="flex justify-center items-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
        <span class="ml-3">Chargement en cours...</span>
      </div>
    `;
  }

  _renderErrorState() {
    return `
      <div class="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <i class="fas fa-exclamation-circle text-red-500"></i>
          </div>
          <div class="ml-3">
            <p class="text-sm text-red-700">
              ${this.state.error}
            </p>
          </div>
        </div>
        <button id="btn-retry" class="${this.buttonStyles.base} ${this.buttonStyles.sizes.sm} ${this.buttonStyles.variants.ghost} text-red-600 hover:text-red-800">
          <i class="fas fa-sync-alt ${this.buttonStyles.icon}"></i> Réessayer
        </button>
      </div>
    `;
  }

  _renderEmptyState() {
    return `
      <div class="bg-white rounded-lg shadow p-8 text-center">
        <i class="fas fa-users text-4xl text-gray-300 mb-3"></i>
        <h3 class="text-lg font-medium text-gray-900 mb-1">Aucun client trouvé</h3>
        <p class="text-gray-500 mb-4">${
          this.state.showDeleted
            ? "Aucun client supprimé"
            : "Commencez par ajouter un client"
        }</p>
        <button id="btn-add-empty" class="${this.buttonStyles.base} ${
      this.buttonStyles.sizes.md
    } ${this.buttonStyles.variants.primary}">
          <i class="fas fa-plus ${
            this.buttonStyles.icon
          }"></i> Ajouter un client
        </button>
      </div>
    `;
  }

_renderCardsView() {
    return `
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        ${this.state.clients
          .map(
            (client) => `
          <div class="bg-white rounded-lg shadow overflow-hidden ${
            client.deletedAt
              ? "opacity-70 border-l-4 border-red-500"
              : "hover:shadow-md"
          }">
            <div class="bg-indigo-100 p-4 flex items-center">
              <div class="rounded-full h-12 w-12 flex items-center justify-center shadow-sm mr-3 overflow-hidden">
                ${
                  client.imageUrl
                    ? `<img src="${config.apiUrl}/${client.imageUrl}" alt="${client.prenom} ${client.nom}" class="h-full w-full object-cover">`
                    : `<div class="bg-white h-full w-full flex items-center justify-center">
                         <i class="fas fa-user text-indigo-600"></i>
                       </div>`                       
                }
                
              </div>
              <div>
                <h3 class="font-bold text-lg">${client.prenom} ${client.nom}</h3>
                <p class="text-gray-600">${client.telephone}</p>
              </div>
            </div>
            
            <div class="p-4">
              <div class="grid grid-cols-2 gap-4 mb-3">
                <div class="bg-green-50 p-2 rounded text-center">
                  <p class="text-xs text-gray-500">Solde</p>
                  <p class="font-bold text-green-600">${client.solde.toFixed(2)} €</p>
                </div>
                <div class="bg-red-50 p-2 rounded text-center">
                  <p class="text-xs text-gray-500">Dette</p>
                  <p class="font-bold text-red-600">${client.dette.toFixed(2)} €</p>
                </div>
              </div>
              
              <p class="text-xs text-gray-500 mt-2">
                <i class="fas fa-calendar-${
                  client.deletedAt ? "times" : "plus"
                } mr-1"></i>
                ${
                  client.deletedAt
                    ? `Supprimé le ${new Date(client.deletedAt).toLocaleDateString()}`
                    : `Créé le ${new Date(client.createdAt).toLocaleDateString()}`
                }
              </p>
              
              <div class="flex justify-end space-x-2 mt-4">
                <button class="btn-action ${this.buttonStyles.base} ${
      this.buttonStyles.sizes.sm
    } ${
      this.buttonStyles.variants.ghost
    } text-indigo-600 hover:text-indigo-900" 
                        data-action="view" data-id="${client.id}" title="Voir détails">
                  <i class="fas fa-eye"></i>
                </button>
                <button class="btn-action ${this.buttonStyles.base} ${
      this.buttonStyles.sizes.sm
    } ${
      this.buttonStyles.variants.ghost
    } text-gray-600 hover:text-gray-900" 
                        data-action="edit" data-id="${client.id}" title="Modifier">
                  <i class="fas fa-edit"></i>
                </button>
                ${
                  client.deletedAt
                    ? `
                  <button class="btn-action ${this.buttonStyles.base} ${
                        this.buttonStyles.sizes.sm
                      } ${
                        this.buttonStyles.variants.ghost
                      } text-green-600 hover:text-green-900" 
                          data-action="restore" data-id="${client.id}" title="Restaurer">
                    <i class="fas fa-trash-restore"></i>
                  </button>
                `
                    : `
                  <button class="btn-action ${this.buttonStyles.base} ${
                        this.buttonStyles.sizes.sm
                      } ${
                        this.buttonStyles.variants.ghost
                      } text-red-600 hover:text-red-900" 
                          data-action="delete" data-id="${client.id}" title="Supprimer">
                    <i class="fas fa-trash"></i>
                  </button>
                `
                }
                ${
                  !client.deletedAt
                    ? `
                  <button class="btn-action ${this.buttonStyles.base} ${
                        this.buttonStyles.sizes.sm
                      } ${
                        this.buttonStyles.variants.ghost
                      } text-yellow-600 hover:text-yellow-900" 
                          data-action="debt" data-id="${client.id}" title="Gérer dette">
                    <i class="fas fa-hand-holding-usd"></i>
                  </button>
                `
                    : ""
                }
              </div>
            </div>
          </div>
        `
          )
          .join("")}
      </div>
    `;
}
 _renderTableView() {
    return `
      <div class="bg-white shadow rounded-lg overflow-hidden">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Photo</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Téléphone</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Solde</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dette</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            ${this.state.clients
              .map(
                (client) => `
              <tr class="${client.deletedAt ? "bg-gray-50" : "hover:bg-gray-50"}">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex-shrink-0 h-10 w-10 rounded-full overflow-hidden">
                    ${
                      client.imageUrl
                        ? `<img src="${config.apiUrl}/${client.imageUrl}" alt="${client.prenom} ${client.nom}" class="h-full w-full object-cover">`
                        : `<div class="bg-indigo-100 h-full w-full flex items-center justify-center">
                             <i class="fas fa-user text-indigo-600"></i>
                           </div>`
                    }
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="font-medium text-gray-900">${client.prenom} ${client.nom}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  ${client.telephone}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium ${
                  client.solde >= 0 ? "text-green-600" : "text-red-600"
                }">
                  ${client.solde.toFixed(2)} €
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium ${
                  client.dette > 0 ? "text-red-600" : "text-gray-500"
                }">
                  ${client.dette.toFixed(2)} €
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  ${
                    client.deletedAt
                      ? `
                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                      Supprimé
                    </span>
                  `
                      : `
                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      Actif
                    </span>
                  `
                  }
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button class="btn-action ${this.buttonStyles.base} ${
                  this.buttonStyles.sizes.sm
                } ${
                  this.buttonStyles.variants.ghost
                } text-indigo-600 hover:text-indigo-900 mr-2" 
                          data-action="view" data-id="${client.id}" title="Voir détails">
                    <i class="fas fa-eye"></i>
                  </button>
                  <button class="btn-action ${this.buttonStyles.base} ${
                  this.buttonStyles.sizes.sm
                } ${
                  this.buttonStyles.variants.ghost
                } text-gray-600 hover:text-gray-900 mr-2" 
                          data-action="edit" data-id="${client.id}" title="Modifier">
                    <i class="fas fa-edit"></i>
                  </button>
                  ${
                    !client.deletedAt
                      ? `
                    <button class="btn-action ${this.buttonStyles.base} ${
                          this.buttonStyles.sizes.sm
                        } ${
                          this.buttonStyles.variants.ghost
                        } text-yellow-600 hover:text-yellow-900 mr-2" 
                            data-action="debt" data-id="${client.id}" title="Gérer dette">
                      <i class="fas fa-hand-holding-usd"></i>
                    </button>
                  `
                      : ""
                  }
                  ${
                    client.deletedAt
                      ? `
                    <button class="btn-action ${this.buttonStyles.base} ${
                          this.buttonStyles.sizes.sm
                        } ${
                          this.buttonStyles.variants.ghost
                        } text-green-600 hover:text-green-900" 
                            data-action="restore" data-id="${client.id}" title="Restaurer">
                      <i class="fas fa-trash-restore"></i>
                    </button>
                  `
                      : `
                    <button class="btn-action ${this.buttonStyles.base} ${
                          this.buttonStyles.sizes.sm
                        } ${
                          this.buttonStyles.variants.ghost
                        } text-red-600 hover:text-red-900" 
                            data-action="delete" data-id="${client.id}" title="Supprimer">
                      <i class="fas fa-trash"></i>
                    </button>
                  `
                  }
                </td>
              </tr>
            `
              )
              .join("")}
          </tbody>
        </table>
      </div>
    `;
}
_renderClientForm(client = null) {
    const isEdit = !!client;
    const form = document.createElement("form");
    form.className = "space-y-4";

    form.innerHTML = `
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Nom *</label>
          <input type="text" name="nom" value="${client?.nom || ''}" required
                 class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
          <p id="nom-error" class="error-message text-red-600 text-sm mt-1 hidden"></p>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Prénom *</label>
          <input type="text" name="prenom" value="${client?.prenom || ''}" required
                 class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
          <p id="prenom-error" class="error-message text-red-600 text-sm mt-1 hidden"></p>
        </div>
      </div>
      
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Téléphone *</label>
        <input type="tel" name="telephone" value="${client?.telephone || ''}" required
               class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
        <p id="telephone-error" class="error-message text-red-600 text-sm mt-1 hidden"></p>
      </div>
      
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Photo du client</label>
        <div class="flex items-center gap-4">
          <label for="client-image" class="cursor-pointer">
            <div class="relative">
              <div class="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border-2 border-dashed border-gray-300 hover:border-indigo-500 transition-colors">
                ${client?.imageUrl ? `
                  <img src="${client.imageUrl}" alt="Photo actuelle" class="w-full h-full object-cover">
                ` : `
                  <i class="fas fa-camera text-gray-400 text-xl"></i>
                `}
              </div>
              <input type="file" id="client-image" accept="image/*" class="absolute inset-0 w-full h-full opacity-0 cursor-pointer">
            </div>
          </label>
          <div class="flex-1">
            <p class="text-sm text-gray-500 mb-1">Formats acceptés : JPG, PNG (max 5MB)</p>
            <p id="image-error" class="error-message text-red-600 text-sm hidden"></p>
            ${client?.imageUrl ? `
              <button type="button" id="btn-remove-image" class="text-red-600 text-sm hover:text-red-800">
                <i class="fas fa-trash mr-1"></i> Supprimer la photo
              </button>
            ` : ''}
          </div>
        </div>
      </div>
      
      ${isEdit ? `
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Solde (€)</label>
            <input type="number" step="0.01" name="solde" value="${client?.solde || 0}"
                   class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Crédit max (€)</label>
            <input type="number" step="0.01" name="creditMax" value="${client?.creditMax || 0}"
                   class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
          </div>
        </div>
      ` : ''}
      
      <div class="pt-4 flex justify-end space-x-3">
        <button type="button" id="btn-cancel" 
                class="${this.buttonStyles.base} ${this.buttonStyles.sizes.md} ${this.buttonStyles.variants.secondary}">
          Annuler
        </button>
        <button type="submit" id="btn-submit"
                class="${this.buttonStyles.base} ${this.buttonStyles.sizes.md} ${this.buttonStyles.variants.primary}">
          ${isEdit ? "Mettre à jour" : "Enregistrer"}
        </button>
      </div>
      
      <div id="form-status" class="hidden"></div>
    `;

    const modal = new Modal(
      isEdit ? "Modifier le client" : "Ajouter un client",
      form
    );
    modal.open();

    // Gestion de l'annulation
    form.querySelector("#btn-cancel").addEventListener("click", () => modal.close());

    // Gestion de la suppression d'image
    if (client?.imageUrl) {
      form.querySelector("#btn-remove-image").addEventListener("click", () => {
        form.querySelector("#client-image").value = "";
        form.querySelector(".rounded-full img")?.remove();
        form.querySelector(".rounded-full").innerHTML = '<i class="fas fa-camera text-gray-400 text-xl"></i>';
        form.querySelector("#btn-remove-image").remove();
      });
    }

    // Soumission du formulaire
   // Dans votre méthode _renderClientForm, modifiez la partie submit:

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  
  const submitBtn = form.querySelector("#btn-submit");
  const statusDiv = form.querySelector("#form-status");
  statusDiv.classList.add("hidden");
  
  try {
    // Validation du formulaire
    if (!this._validateClientForm(form)) return;
    
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> En cours...';
    
    // Préparation des données de base
    const formData = {
      nom: form.querySelector('[name="nom"]').value.trim(),
      prenom: form.querySelector('[name="prenom"]').value.trim(),
      telephone: form.querySelector('[name="telephone"]').value.trim(),
    };
    
    if (isEdit) {
      formData.solde = parseFloat(form.querySelector('[name="solde"]').value) || 0;
      formData.creditMax = parseFloat(form.querySelector('[name="creditMax"]').value) || 0;
    }
    
    // Gestion de l'image
    const imageFile = form.querySelector("#client-image").files[0];
    const removeImage = form.querySelector("#btn-remove-image") && !imageFile;
    
    if (removeImage) {
      // Suppression de l'image existante
      formData.imageUrl = null;
    } else if (imageFile) {
      // Upload de la nouvelle image vers Cloudinary
      if (imageFile.size > 5 * 1024 * 1024) {
        throw new Error("La taille de l'image ne doit pas dépasser 5MB");
      }
      
      // Création d'un FormData pour l'upload
      const uploadData = new FormData();
      uploadData.append('file', imageFile);
      uploadData.append('upload_preset', 'filrouge'); 
      uploadData.append('cloud_name', 'dkwxpe2zf'); 
      
      // Upload vers Cloudinary
      const cloudinaryResponse = await fetch(
        `https://api.cloudinary.com/v1_1/dkwxpe2zf/image/upload`, 
        {
          method: 'POST',
          body: uploadData
        }
      );
      
      if (!cloudinaryResponse.ok) {
        throw new Error("Échec de l'upload de l'image");
      }
      
      const cloudinaryData = await cloudinaryResponse.json();
      formData.imageUrl = cloudinaryData.secure_url;
    }
    
    // Appel du service client
    let result;
    if (isEdit) {
      result = await this.clientSvc.update(client.id, formData);
    } else {
      result = await this.clientSvc.create(formData);
    }
    
    // Succès
    this._showSuccess(
      isEdit 
        ? "Client mis à jour avec succès" 
        : "Client créé avec succès"
    );
    modal.close();
    await this._loadClients();
    this.render();
    
  } catch (error) {
    console.error("Form submission error:", error);
    statusDiv.textContent = error.message;
    statusDiv.className = "text-red-600 text-sm text-center";
    statusDiv.classList.remove("hidden");
  } finally {
    submitBtn.disabled = false;
    submitBtn.innerHTML = isEdit ? "Mettre à jour" : "Enregistrer";
  }
});
}

_validateClientForm(form) {
    let isValid = true;

    // Reset errors
    form.querySelectorAll(".error-message").forEach((el) => {
      el.textContent = "";
      el.classList.add("hidden");
    });

    // Validate nom
    const nom = form.querySelector('[name="nom"]').value.trim();
    const nomError = form.querySelector("#nom-error");
    if (!nom) {
      nomError.textContent = "Le nom est obligatoire";
      nomError.classList.remove("hidden");
      isValid = false;
    } else if (nom.length < 2) {
      nomError.textContent = "Le nom doit avoir au moins 2 caractères";
      nomError.classList.remove("hidden");
      isValid = false;
    }

    // Validate prenom
    const prenom = form.querySelector('[name="prenom"]').value.trim();
    const prenomError = form.querySelector("#prenom-error");
    if (!prenom) {
      prenomError.textContent = "Le prénom est obligatoire";
      prenomError.classList.remove("hidden");
      isValid = false;
    } else if (prenom.length < 2) {
      prenomError.textContent = "Le prénom doit avoir au moins 2 caractères";
      prenomError.classList.remove("hidden");
      isValid = false;
    }

    // Validate telephone
    const telephoneInput = form.querySelector('[name="telephone"]');
    const telephone = telephoneInput.value.trim();
    const telephoneError = form.querySelector("#telephone-error");
    
    if (!telephone) {
      telephoneError.textContent = "Le numéro de téléphone est obligatoire";
      telephoneError.classList.remove("hidden");
      isValid = false;
    } else {
      const { 
        isValid: isPhoneValid, 
        formatted, 
        message 
      } = validateSenegalPhoneNumber(telephone);

      if (!isPhoneValid) {
        telephoneError.textContent = message;
        telephoneError.classList.remove("hidden");
        isValid = false;
      } else {
        telephoneInput.value = formatted;
      }
    }

    return isValid;
}

  _renderDebtModal(client) {
    const form = document.createElement("form");
    form.className = "space-y-4";

    form.innerHTML = `
      <div class="bg-blue-50 p-4 rounded-lg mb-4">
        <div class="flex justify-between items-center">
          <h3 class="font-medium text-blue-800">${client.prenom} ${
      client.nom
    }</h3>
          <p class="text-sm">Tél: ${client.telephone}</p>
        </div>
        <div class="grid grid-cols-2 gap-4 mt-3">
          <div class="bg-green-50 p-2 rounded text-center">
            <p class="text-xs text-gray-500">Solde actuel</p>
            <p class="font-bold ${
              client.solde >= 0 ? "text-green-600" : "text-red-600"
            }">${client.solde.toFixed(2)} €</p>
          </div>
          <div class="bg-red-50 p-2 rounded text-center">
            <p class="text-xs text-gray-500">Dette actuelle</p>
            <p class="font-bold ${
              client.dette > 0 ? "text-red-600" : "text-gray-500"
            }">${client.dette.toFixed(2)} €</p>
          </div>
        </div>
      </div>
      
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Type d'opération</label>
        <select name="operationType"
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
          <option value="">Sélectionnez une opération</option>
          <option value="credit">Créditer le compte</option>
          <option value="debit">Débiter le compte</option>
          <option value="debt">Ajouter une dette</option>
          <option value="payment">Paiement de dette</option>
        </select>
        <p id="operationType-error" class="error-message text-red-600 text-sm mt-1 hidden"></p>
      </div>
      
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Montant (€)</label>
        <input type="number" step="0.01" min="0.01" name="amount"
               class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
        <p id="amount-error" class="error-message text-red-600 text-sm mt-1 hidden"></p>
      </div>
      
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <textarea name="description" rows="2"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"></textarea>
      </div>
      
      <div class="pt-4 flex justify-end space-x-3">
        <button type="button" id="btn-cancel" 
                class="${this.buttonStyles.base} ${
      this.buttonStyles.sizes.md
    } ${this.buttonStyles.variants.secondary}">
          Annuler
        </button>
        <button type="submit" 
                class="${this.buttonStyles.base} ${
      this.buttonStyles.sizes.md
    } ${this.buttonStyles.variants.primary}">
          Enregistrer l'opération
        </button>
      </div>
      
      <p id="form-error" class="text-red-600 text-center text-sm hidden"></p>
    `;

    const modal = new Modal(
      `Gérer la dette de ${client.prenom} ${client.nom}`,
      form
    );
    modal.open();

    form
      .querySelector("#btn-cancel")
      .addEventListener("click", () => modal.close());

    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      if (!this._validateDebtForm(form)) {
        return;
      }

      const formData = new FormData(form);
      const operation = {
        type: formData.get("operationType"),
        amount: parseFloat(formData.get("amount")),
        description: formData.get("description") || "",
      };

      try {
        await this.clientSvc.manageDebt(client.id, operation);
        this._showSuccess("Opération effectuée avec succès");
        modal.close();
        await this._loadClients();
        this.render();
      } catch (error) {
        this._showFormError(form, error);
      }
    });
  }

  _validateDebtForm(form) {
    let isValid = true;

    // Reset errors
    form.querySelectorAll(".error-message").forEach((el) => {
      el.textContent = "";
      el.classList.add("hidden");
    });

    // Validate operation type
    const operationType = form.querySelector('[name="operationType"]').value;
    const operationTypeError = form.querySelector("#operationType-error");
    if (!operationType) {
      operationTypeError.textContent = "Le type d'opération est obligatoire";
      operationTypeError.classList.remove("hidden");
      isValid = false;
    }

    // Validate amount
    const amount = parseFloat(form.querySelector('[name="amount"]').value);
    const amountError = form.querySelector("#amount-error");
    if (isNaN(amount)) {
      amountError.textContent = "Le montant est obligatoire";
      amountError.classList.remove("hidden");
      isValid = false;
    } else if (amount <= 0) {
      amountError.textContent = "Le montant doit être positif";
      amountError.classList.remove("hidden");
      isValid = false;
    }

    return isValid;
  }

  _showFormError(form, error) {
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
      errorEl.textContent = error.message || "Une erreur est survenue";
      errorEl.classList.remove("hidden");
    }
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

  _showConfirmationModal(title, message, confirmCallback) {
    const modalContent = document.createElement("div");
    modalContent.className = "space-y-4";

    modalContent.innerHTML = `
      <p class="text-gray-700">${message}</p>
      <div class="flex justify-end space-x-3 pt-4">
        <button id="btn-confirm-cancel" class="${this.buttonStyles.base} ${this.buttonStyles.sizes.md} ${this.buttonStyles.variants.secondary}">
          Annuler
        </button>
        <button id="btn-confirm-ok" class="${this.buttonStyles.base} ${this.buttonStyles.sizes.md} ${this.buttonStyles.variants.primary}">
          Confirmer
        </button>
      </div>
    `;

    const modal = new Modal(title, modalContent);
    modal.open();

    modalContent
      .querySelector("#btn-confirm-cancel")
      .addEventListener("click", () => {
        modal.close();
      });

    modalContent
      .querySelector("#btn-confirm-ok")
      .addEventListener("click", async () => {
        try {
          await confirmCallback();
          modal.close();
        } catch (error) {
          this._showError(error.message);
        }
      });
  }

  _setupEventListeners() {
    // Toggle view mode
    this.root
      .querySelector("#btn-toggle-view")
      ?.addEventListener("click", () => {
        this.state.viewMode =
          this.state.viewMode === "cards" ? "table" : "cards";
        this.render();
      });

    // Toggle deleted items
    this.root
      .querySelector("#btn-toggle-deleted")
      ?.addEventListener("click", async () => {
        this.state.showDeleted = !this.state.showDeleted;
        await this._loadClients();
        this.render();
      });

    // Add client
    this.root
      .querySelector("#btn-add-client")
      ?.addEventListener("click", () => {
        this._renderClientForm();
      });
    this.root.querySelector("#btn-add-empty")?.addEventListener("click", () => {
      this._renderClientForm();
    });

    // Retry loading
    this.root
      .querySelector("#btn-retry")
      ?.addEventListener("click", async () => {
        this.state.error = null;
        await this._loadClients();
        this.render();
      });

    // Logout
    this.root
      .querySelector("#btn-logout")
      ?.addEventListener("click", async () => {
        try {
          await this.authSvc.logout();
          window.location.hash = "#auth/login";
        } catch (error) {
          this._showError("Échec de la déconnexion");
        }
      });

    // Handle all action buttons
    document.addEventListener("click", (e) => {
      const actionBtn = e.target.closest(".btn-action");
      if (actionBtn) {
        const action = actionBtn.dataset.action;
        const id = actionBtn.dataset.id;

        switch (action) {
          case "view":
            this._handleViewAction(id);
            break;
          case "edit":
            this._handleEditAction(id);
            break;
          case "delete":
            this._handleDeleteAction(id);
            break;
          case "restore":
            this._handleRestoreAction(id);
            break;
          case "debt":
            this._handleDebtAction(id);
            break;
        }
      }
    });
  }

  async _handleViewAction(id) {
    try {
      const client = await this.clientSvc.get(id);
      this._renderClientDetailsModal(client);
    } catch (error) {
      this._showError(`Erreur: ${error.message}`);
    }
  }

_renderClientDetailsModal(client) {
    const modalContent = document.createElement("div");
    modalContent.className = "space-y-4";

    modalContent.innerHTML = `
    <div class="bg-white rounded-lg shadow overflow-hidden">
      <div class="bg-indigo-100 p-6">
        <div class="flex items-center">
          <div class="rounded-full h-16 w-16 flex items-center justify-center shadow-sm mr-4 overflow-hidden">
            ${
              client.imageUrl
                ? `<img src="${config.apiUrl}/${client.imageUrl}" alt="${client.prenom} ${client.nom}" class="h-full w-full object-cover">`
                : `<div class="bg-white h-full w-full flex items-center justify-center">
                     <i class="fas fa-user text-indigo-600 text-2xl"></i>
                   </div>`
            }
          </div>
          <div>
            <h2 class="text-2xl font-bold">${client.prenom} ${client.nom}</h2>
            <p class="text-gray-600"><i class="fas fa-phone-alt mr-2"></i>${
              client.telephone
            }</p>
          </div>
        </div>
      </div>
      
      <div class="p-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div class="bg-gray-50 p-4 rounded-lg">
            <h3 class="font-medium text-gray-700 mb-3">Informations</h3>
            <div class="space-y-2">
              <p><span class="text-gray-500">Date création:</span> ${new Date(
                client.createdAt
              ).toLocaleDateString()}</p>
              ${
                client.deletedAt
                  ? `<p><span class="text-gray-500">Date suppression:</span> ${new Date(
                      client.deletedAt
                    ).toLocaleDateString()}</p>`
                  : ""
              }
            </div>
          </div>
          
          <div class="bg-gray-50 p-4 rounded-lg">
            <h3 class="font-medium text-gray-700 mb-3">Soldes</h3>
            <div class="grid grid-cols-2 gap-4">
              <div class="bg-green-50 p-3 rounded text-center">
                <p class="text-sm text-gray-500">Solde</p>
                <p class="font-bold text-green-600 text-xl">${client.solde.toFixed(
                  2
                )} €</p>
              </div>
              <div class="bg-red-50 p-3 rounded text-center">
                <p class="text-sm text-gray-500">Dette</p>
                <p class="font-bold text-red-600 text-xl">${client.dette.toFixed(
                  2
                )} €</p>
              </div>
            </div>
          </div>
        </div>
        
        <div class="border-t border-gray-200 pt-4">
          <button id="btn-close-details" class="${this.buttonStyles.base} ${
      this.buttonStyles.sizes.md
    } ${this.buttonStyles.variants.secondary}">
            Fermer
          </button>
        </div>
      </div>
    </div>
  `;

    const modal = new Modal(`Détails du client`, modalContent);
    modal.open();

    modalContent
      .querySelector("#btn-close-details")
      .addEventListener("click", () => {
        modal.close();
      });
}

  async _handleEditAction(id) {
    try {
      const client = await this.clientSvc.get(id);
      this._renderClientForm(client);
    } catch (error) {
      this._showError(`Erreur: ${error.message}`);
    }
  }

  async _handleDeleteAction(id) {
    this._showConfirmationModal(
      "Confirmer la suppression",
      "Êtes-vous sûr de vouloir supprimer ce client ?",
      async () => {
        try {
          await this.clientSvc.delete(id);
          this._showSuccess("Client supprimé avec succès");
          await this._loadClients();
          this.render();
        } catch (error) {
          throw new Error(`Erreur lors de la suppression: ${error.message}`);
        }
      }
    );
  }

  async _handleRestoreAction(id) {
    this._showConfirmationModal(
      "Confirmer la restauration",
      "Êtes-vous sûr de vouloir restaurer ce client ?",
      async () => {
        try {
          await this.clientSvc.restore(id);
          this._showSuccess("Client restauré avec succès");
          await this._loadClients();
          this.render();
        } catch (error) {
          throw new Error(`Erreur lors de la restauration: ${error.message}`);
        }
      }
    );
  }

  async _handleDebtAction(id) {
    try {
      const client = await this.clientSvc.get(id);
      this._renderDebtModal(client);
    } catch (error) {
      this._showError(`Erreur: ${error.message}`);
    }
  }
}

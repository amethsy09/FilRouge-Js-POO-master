import { config } from "../../utils/config.js";

export class BoutiquierRepository {
  constructor() {
    this.apiBaseUrl = config.apiBaseUrl;
    this.cloudinaryConfig = config.cloudinary;
    this.headers = {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
      "Content-Type": "application/json",
    };
  }

  /**
   * Méthode interne pour les appels API
   * @param {string} endpoint
   * @param {Object} options
   * @returns {Promise<any>}
   */
  async _fetchApi(endpoint, options = {}) {
    const url = `${this.apiBaseUrl}/${endpoint}`;
    const fetchOptions = {
      headers: { ...this.headers },
      ...options,
    };

    // Gestion spéciale pour FormData (upload)
    if (options.body && !(options.body instanceof FormData)) {
      fetchOptions.body = JSON.stringify(options.body);
    }

    try {
      const response = await fetch(url, fetchOptions);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Erreur HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API Error (${endpoint}):`, error);
      throw new Error(`Erreur réseau: ${error.message}`);
    }
  }

  /**
   * Upload une image vers Cloudinary
   * @param {File} imageFile
   * @returns {Promise<{secure_url: string, public_id: string}>}
   */
  async uploadImage(imageFile) {
    if (!imageFile) return null;

    // Validation du fichier
    if (imageFile.size > 5 * 1024 * 1024) {
      throw new Error("La taille de l'image ne doit pas dépasser 5MB");
    }

    const validTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!validTypes.includes(imageFile.type)) {
      throw new Error("Seuls les JPEG, PNG et WebP sont acceptés");
    }

    const formData = new FormData();
    formData.append("file", imageFile);
    formData.append("upload_preset", this.cloudinaryConfig.uploadPreset);
    formData.append("cloud_name", this.cloudinaryConfig.cloudName);

    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${this.cloudinaryConfig.cloudName}/image/upload`,
        { method: "POST", body: formData }
      );

      const data = await response.json();

      if (response.status === 400) {
        console.error("Détails de l'erreur Cloudinary:", data);
        throw new Error(data.error.message || "Erreur d'upload");
      }

      return data;
    } catch (error) {
      console.error("Erreur complète:", {
        error,
        file: imageFile.name,
        type: imageFile.type,
        size: imageFile.size,
      });
      throw new Error("Échec de l'upload: " + error.message);
    }
  }

  /**
   * Récupère la liste des utilisateurs
   * @returns {Promise<Array>}
   */
  async fetchUsers() {
    try {
      const response = await fetch('http://localhost:3000/utilisateurs');
      if (!response.ok) {
        throw new Error(`Erreur HTTP ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error("Fetch Users Error:", error);
      throw new Error("Impossible de charger les utilisateurs");
    }
  }

  /**
   * Crée un nouveau boutiquier
   * @param {Object} data
   * @param {File|null} imageFile
   * @returns {Promise<Object>}
   */
  async create(data, imageFile = null) {
    try {
      let imageUrl = null;
      if (imageFile) {
        const { secure_url } = await this.uploadImage(imageFile);
        imageUrl = secure_url;
      }

      return await this._fetchApi("boutiquiers", {
        method: "POST",
        body: {
          ...data,
          ...(imageUrl && { photoUrl: imageUrl }),
        },
      });
    } catch (error) {
      console.error("Create Error:", error);
      throw new Error(`Échec de la création: ${error.message}`);
    }
  }

  /**
   * Liste tous les boutiquiers
   * @param {boolean} includeDeleted
   * @returns {Promise<Array>}
   */
  async list(includeDeleted = false) {
    try {
      const boutiquiers = await this._fetchApi("boutiquiers");
      return includeDeleted
        ? boutiquiers
        : boutiquiers.filter((b) => !b.deletedAt);
    } catch (error) {
      console.error("List Error:", error);
      throw new Error("Impossible de charger les boutiquiers");
    }
  }

  /**
   * Récupère un boutiquier par son ID
   * @param {string} id
   * @returns {Promise<Object>}
   */
  async get(id) {
    try {
      return await this._fetchApi(`boutiquiers/${id}`);
    } catch (error) {
      console.error("Get Error:", error);
      throw new Error(`Boutiquier introuvable: ${error.message}`);
    }
  }

  /**
   * Met à jour un boutiquier
   * @param {string} id
   * @param {Object} updates
   * @param {File|null} newImage
   * @returns {Promise<Object>}
   */
  async update(id, updates, newImage = null) {
    try {
      if (newImage) {
        const { secure_url } = await this.uploadImage(newImage);
        updates.photoUrl = secure_url;
      }

      return await this._fetchApi(`boutiquiers/${id}`, {
        method: "PATCH",
        body: updates,
      });
    } catch (error) {
      console.error("Update Error:", error);
      throw new Error(`Échec de la mise à jour: ${error.message}`);
    }
  }

  /**
   * Suppression douce (soft delete)
   * @param {string} id
   * @returns {Promise<Object>}
   */
  async softDelete(id) {
    try {
      return await this._fetchApi(`boutiquiers/${id}`, {
        method: "PATCH",
        body: { 
          deletedAt: new Date().toISOString() 
        },
      });
    } catch (error) {
      console.error("SoftDelete Error:", error);
      throw new Error(`Échec de la suppression: ${error.message}`);
    }
  }

  /**
   * Restaure un boutiquier supprimé
   * @param {string} id
   * @returns {Promise<Object>}
   */
  async restore(id) {
    try {
      return await this._fetchApi(`boutiquiers/${id}`, {
        method: "PATCH",
        body: { 
          deletedAt: null 
        },
      });
    } catch (error) {
      console.error("Restore Error:", error);
      throw new Error(`Échec de la restauration: ${error.message}`);
    }
  }

  /**
   * Suppression définitive
   * @param {string} id
   * @returns {Promise<Object>}
   */
  async hardDelete(id) {
    try {
      return await this._fetchApi(`boutiquiers/${id}`, {
        method: "DELETE",
      });
    } catch (error) {
      console.error("HardDelete Error:", error);
      throw new Error(`Échec de la suppression définitive: ${error.message}`);
    }
  }
}
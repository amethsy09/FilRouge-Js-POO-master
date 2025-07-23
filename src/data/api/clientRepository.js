export class ClientRepository {
  constructor() {
    this.BASE_URL = "http://localhost:3000";
  }

  async _fetchWithAuth(endpoint, options = {}) {
    const token = localStorage.getItem("token");
    const headers = {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    };

    const response = await fetch(`${this.BASE_URL}/${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Erreur lors de la requête API");
    }

    return await response.json();
  }

  async list(includeDeleted = false) {
    try {
      const users = await this._fetchWithAuth("utilisateurs?id_role=2");
      const clients = await this._fetchWithAuth("clients");
      
      // Fusionner les données utilisateur et client
      return users.map(user => {
        const clientData = clients.find(c => c.id_utilisateur === user.id) || {};
        return { ...user, ...clientData };
      }).filter(client => includeDeleted || !client.deletedAt);
    } catch (error) {
      console.error("List clients error:", error);
      throw new Error("Impossible de charger les clients");
    }
  }

  async get(id) {
    try {
      const [user, client] = await Promise.all([
        this._fetchWithAuth(`utilisateurs/${id}`),
        this._fetchWithAuth(`clients?id_utilisateur=${id}`).then(data => data[0]),
      ]);
      return { ...user, ...client };
    } catch (error) {
      console.error("Get client error:", error);
      throw new Error("Client introuvable");
    }
  }

  async create(clientData) {
    try {
      // Créer l'utilisateur
      const user = await this._fetchWithAuth("utilisateurs", {
        method: "POST",
        body: JSON.stringify({
          ...clientData,
          id_role: "2" // Role client
        }),
      });

      // Créer l'entrée dans la table clients
      const client = await this._fetchWithAuth("clients", {
        method: "POST",
        body: JSON.stringify({
          id_utilisateur: user.id,
          solde: clientData.solde || 0,
          creditMax: clientData.creditMax || 0
        }),
      });

      return { ...user, ...client };
    } catch (error) {
      console.error("Create client error:", error);
      throw new Error("Échec de la création du client");
    }
  }

  async update(id, updates) {
    try {
      // Mettre à jour l'utilisateur
      const user = await this._fetchWithAuth(`utilisateurs/${id}`, {
        method: "PATCH",
        body: JSON.stringify({
          nom: updates.nom,
          prenom: updates.prenom,
          telephone: updates.telephone,
          email: updates.email
        }),
      });

      // Mettre à jour les infos client
      const client = await this._fetchWithAuth(`clients/${id}`, {
        method: "PATCH",
        body: JSON.stringify({
          solde: updates.solde,
          creditMax: updates.creditMax
        }),
      });

      return { ...user, ...client };
    } catch (error) {
      console.error("Update client error:", error);
      throw new Error("Échec de la mise à jour du client");
    }
  }

  async delete(id) {
    try {
      // Suppression douce (soft delete)
      return await this._fetchWithAuth(`clients/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ deletedAt: new Date().toISOString() }),
      });
    } catch (error) {
      console.error("Delete client error:", error);
      throw new Error("Échec de la suppression du client");
    }
  }

  async restore(id) {
    try {
      return await this._fetchWithAuth(`clients/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ deletedAt: null }),
      });
    } catch (error) {
      console.error("Restore client error:", error);
      throw new Error("Échec de la restauration du client");
    }
  }

  async manageDebt(clientId, operation) {
    try {
      return await this._fetchWithAuth(`clients/${clientId}/debt`, {
        method: "POST",
        body: JSON.stringify(operation),
      });
    } catch (error) {
      console.error("Manage debt error:", error);
      throw new Error("Échec de l'opération sur la dette");
    }
  }
}
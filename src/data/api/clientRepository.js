// clientRepository.js
export class ClientRepository {
  constructor() {
    this.BASE_URL = "http://localhost:3000";
  }

  async list() {
    const response = await fetch(`${this.BASE_URL}/utilisateurs?id_role=2`);
    if (!response.ok) {
      throw new Error("Erreur lors de la récupération des clients");
    }
    return await response.json();
  }

  async create(client) {
    const response = await fetch(`${this.BASE_URL}/utilisateurs`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...client,
        id_role: "2" // Role client
      }),
    });

    if (!response.ok) {
      throw new Error("Erreur lors de la création du client");
    }

    // Créer aussi dans la table clients
    const newUser = await response.json();
    await fetch(`${this.BASE_URL}/clients`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id_utilisateur: newUser.id
      }),
    });

    return newUser;
  }
}
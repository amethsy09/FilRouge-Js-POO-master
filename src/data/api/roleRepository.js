export class RoleRepository {
  constructor() {
    this.BASE_URL = "http://localhost:3000";
  }

  async list() {
    const response = await fetch(`${this.BASE_URL}/roles`);
    if (!response.ok) {
      throw new Error("Erreur lors de la récupération des rôles");
    }
    const roles = await response.json();
    return roles;
  }
}

import { ClientRepository } from "../../data/api/clientRepository.js";

export class ClientService {
  constructor(repository) {
    this.repo = repository = new ClientRepository();
  }

  async list(showDeleted = false) {
    try {
      return await this.repo.list(showDeleted);
    } catch (error) {
      console.error("ClientService.list error:", error);
      throw new Error("Échec du chargement des clients");
    }
  }

  async get(id) {
    if (!id) throw new Error("ID client requis");
    try {
      return await this.repo.get(id);
    } catch (error) {
      console.error("ClientService.get error:", error);
      throw new Error("Échec de la récupération du client");
    }
  }

  async create(client) {
    // Validation basique
    if (!client?.nom || !client?.telephone) {
      throw new Error("Nom et téléphone sont obligatoires");
    }
    try {
      return await this.repo.create(client);
    } catch (error) {
      console.error("ClientService.create error:", error);
      throw new Error("Échec de la création du client");
    }
  }

  async update(id, clientData) {
    try {
      return await this.repo.update(id, clientData);
    } catch (error) {
      console.error("ClientService.update error:", error);
      throw new Error("Échec de la mise à jour du client");
    }
  }

  async delete(id) {
    try {
      return await this.repo.softDelete(id);
    } catch (error) {
      console.error("ClientService.delete error:", error);
      throw new Error("Échec de la suppression du client");
    }
  }

  async restore(id) {
    try {
      return await this.repo.restore(id);
    } catch (error) {
      console.error("ClientService.restore error:", error);
      throw new Error("Échec de la restauration du client");
    }
  }

  async manageDebt(clientId, operation) {
    try {
      return await this.repo.manageDebt(clientId, operation);
    } catch (error) {
      console.error("ClientService.manageDebt error:", error);
      throw new Error("Échec de la gestion de la dette");
    }
  }
}
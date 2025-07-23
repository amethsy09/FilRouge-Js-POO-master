import { DetteRepository } from "../../data/api/detteRepository.js";

export class DetteService {
  constructor(repository) {
    this.repository = repository || new DetteRepository();
  }

  async getByClientId(clientId) {
    try {
      if (!clientId) throw new Error("ID client requis");
      return await this.repository.getByClientId(clientId);
    } catch (error) {
      console.error("DetteService.getByClientId:", error);
      throw error;
    }
  }

  async createDemande(data) {
    try {
      return await this.repository.createDemande(data);
    } catch (error) {
      console.error("DetteService.createDemande:", error);
      throw error;
    }
  }

  async getDemandesByClient(clientId) {
    try {
      return await this.repository.getDemandesByClient(clientId);
    } catch (error) {
      console.error("DetteService.getDemandesByClient:", error);
      throw error;
    }
  }

  async validerDemande(demandeId, data) {
    try {
      return await this.repository.validerDemande(demandeId, data);
    } catch (error) {
      console.error("DetteService.validerDemande:", error);
      throw error;
    }
  }

  async rembourser(detteId, montant) {
    try {
      return await this.repository.rembourser(detteId, montant);
    } catch (error) {
      console.error("DetteService.rembourser:", error);
      throw error;
    }
  }

  async getHistorique(clientId) {
    try {
      return await this.repository.getHistorique(clientId);
    } catch (error) {
      console.error("DetteService.getHistorique:", error);
      throw error;
    }
  }
}
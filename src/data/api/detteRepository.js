import { config } from '../../utils/config.js';

export class DetteRepository {
  constructor() {
    this.baseUrl = `${config.apiBaseUrl}`;
  }

  // Récupère les dettes d'un client
  async getByClientId(clientId) {
    try {
      const response = await fetch(`${this.baseUrl}/dettes?clientId=${clientId}`);
      if (!response.ok) {
        throw new Error(`Erreur ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Erreur lors de la récupération des dettes:', error);
      throw new Error('Impossible de charger les dettes');
    }
  }

  // Récupère les demandes d'un client
  async getDemandesByClient(clientId) {
    try {
      const response = await fetch(`${this.baseUrl}/demandeDettes?clientId=${clientId}`);
      if (!response.ok) {
        throw new Error(`Erreur ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Erreur lors de la récupération des demandes:', error);
      throw new Error('Impossible de charger les demandes');
    }
  }

  // Crée une nouvelle demande
  async createDemande(demande) {
    try {
      const response = await fetch(`${this.baseUrl}/demandeDettes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          ...demande,
          statut: 'pending',
          createdAt: new Date().toISOString()
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de la création de la demande');
      }

      return await response.json();
    } catch (error) {
      console.error('Erreur lors de la création de la demande:', error);
      throw error;
    }
  }

  // Valide une demande (pour boutiquier)
  async validerDemande(demandeId, data) {
    try {
      // Note: Cette opération nécessite une route PATCH pour mettre à jour le statut
      const response = await fetch(`${this.baseUrl}/demandeDettes/${demandeId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          ...data,
          statut: 'approved',
          updatedAt: new Date().toISOString()
        })
      });

      if (!response.ok) throw new Error('Échec de la validation');
      return await response.json();
    } catch (error) {
      console.error('Erreur lors de la validation:', error);
      throw error;
    }
  }
}
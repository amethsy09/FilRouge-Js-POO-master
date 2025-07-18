export class DetteService {
  constructor(repository) {
    this.BASE_URL = repository.BASE_URL;
  }

  async createDette(detteData) {
    const response = await fetch(`${this.BASE_URL}/dettes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...detteData,
        createdAt: new Date().toISOString(),
        statut: 'en_attente'
      })
    });

    if (!response.ok) throw new Error("Erreur lors de la création de la dette");
    return await response.json();
  }

  async getDettesByClient(clientId) {
    const response = await fetch(`${this.BASE_URL}/dettes?id_client=${clientId}`);
    if (!response.ok) throw new Error("Erreur lors de la récupération des dettes");
    return await response.json();
  }
}
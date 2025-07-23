export class BoutiquierService {
  constructor(repository) {
    this.repository = repository;
  }

  async getUsers() {
  return this.repository.fetchUsers(); 
}
  async create(boutiquier) {
    try {
      if (!boutiquier.nom || !boutiquier.prenom || !boutiquier.email) {
        throw new Error('Les champs obligatoires sont manquants');
      }
      return await this.repository.create(boutiquier);
    } catch (error) {
      console.error('Erreur création boutiquier:', error);
      throw new Error('Échec de la création du boutiquier');
    }
  }

  async list(includeDeleted = false) {
    try {
      return await this.repository.list(includeDeleted);
    } catch (error) {
      console.error('Erreur liste boutiquiers:', error);
      throw new Error('Impossible de charger les boutiquiers');
    }
  }

  async get(id) {
    try {
      return await this.repository.get(id);
    } catch (error) {
      console.error(`Erreur récupération boutiquier ${id}:`, error);
      throw new Error('Boutiquier introuvable');
    }
  }

  async update(id, boutiquierData) {
    try {
      return await this.repository.update(id, boutiquierData);
    } catch (error) {
      console.error(`Erreur mise à jour boutiquier ${id}:`, error);
      throw new Error('Échec de la mise à jour');
    }
  }

  async delete(id) {
    try {
      return await this.repository.softDelete(id);
    } catch (error) {
      console.error(`Erreur suppression boutiquier ${id}:`, error);
      throw new Error('Échec de la suppression');
    }
  }

  async restore(id) {
    try {
      return await this.repository.restore(id);
    } catch (error) {
      console.error(`Erreur restauration boutiquier ${id}:`, error);
      throw new Error('Échec de la restauration');
    }
  }
}
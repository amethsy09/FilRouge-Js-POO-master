import { BoutiquierRepository } from "../../data/api/boutiquierRepository.js";

export class BoutiquierService {
  constructor(repository) {
    this.repo = repository;
  }

  async list() {
    return this.repo.list();
  }

  async create(boutiquier) {
    return this.repo.create(boutiquier);
  }

  async get(id) {
    return this.repo.get(id);
  }
}

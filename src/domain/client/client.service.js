// client.service.js
import { ClientRepository } from "../../data/api/clientRepository.js";

export class ClientService {
  constructor(repository) {
    this.repo = repository;
  }

  async list() {
    return this.repo.list();
  }

  async create(client) {
    return this.repo.create(client);
  }
}
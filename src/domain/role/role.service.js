// src/domain/role/role.service.js
export class RoleService {
  constructor(repository) {
    this.repo = repository;
  }

  async list() {
    return this.repo.list();
  }
}

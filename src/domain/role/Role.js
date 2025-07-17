// src/domain/role/Role.js
export class Role {
  constructor({ id = null, libelle = "" }) {
    this.id = id;
    this.libelle = libelle.trim();
  }

  toDto() {
    return { id: this.id, libelle: this.libelle };
  }

  static fromDto(dto) {
    return new Role(dto);
  }
}

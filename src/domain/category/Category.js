export class Category {
  constructor({ id = null, libelle = '', deleted = false }) {
    this.id = id;
    this.libelle = libelle.trim();
    this.deleted = !!deleted;
  }
  isValid() { return this.libelle.length > 1; }
  toDto()   { return { id: this.id, libelle: this.libelle, deleted: this.deleted }; }
  static fromDto(dto) { return new Category(dto); }
}

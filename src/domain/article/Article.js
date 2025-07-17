export class Article {
  constructor({ 
    id = null, 
    libelle = '', 
    description = '', 
    prix = 0, 
    image = '', 
    categoryId = null,
    stock = 0,
    deleted = false 
  }) {
    this.id = id;
    this.libelle = libelle.trim();
    this.description = description.trim();
    this.prix = parseFloat(prix);
    this.image = image.trim();
    this.categoryId = categoryId;
    this.stock = parseInt(stock, 10) || 0;
    this.deleted = !!deleted;
  }

 isValid() {
    return this.libelle.length > 1 && 
           this.prix > 0 && 
           this.categoryId !== null;
  }

  toDto() {
    return {
      id: this.id,
      libelle: this.libelle,
      description: this.description,
      prix: this.prix,
      image: this.image,
      categoryId: this.categoryId,
      stock: this.stock,
      deleted: this.deleted
    };
  }

  static fromDto(dto) {
    return new Article(dto);
  }
}
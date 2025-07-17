import { Article } from './Article.js';

export class ArticleService {
  constructor(repository) {
    this.repo = repository;
  }

  async list(page = 1, limit = 10) {
    return this.repo.list(page, limit);
  }

  async create(article) {
    if (!(article instanceof Article)) {
      article = new Article(article);
    }
    if (!article.isValid()) {
      throw new Error('Article invalide');
    }
    return this.repo.create(article);
  }

  async update(article) {
    if (!(article instanceof Article)) {
      article = new Article(article);
    }
    if (!article.id) {
      throw new Error('ID manquant pour la mise à jour');
    }
    if (!article.isValid()) {
      throw new Error('Article invalide');
    }
    return this.repo.update(article);
  }

  async trash(id) {
    if (!id) throw new Error('ID manquant');
    return this.repo.trash(id);
  }

  async restore(id) {
    if (!id) throw new Error('ID manquant');
    return this.repo.restore(id);
  }
  async get(id) {
    if (!id) throw new Error('ID manquant');
    return this.repo.get(id);
  }

  async listByCategory(categoryId, excludeId = null, limit = 4) {
    if (!categoryId) throw new Error('categoryId manquant');
    return this.repo.listByCategory(categoryId, excludeId, limit);
  }
}

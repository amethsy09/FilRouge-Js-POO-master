import { ApiClient } from '../api-client.js';
import { Article } from '../../domain/article/Article.js';

export class ArticleRepository {
  constructor(base = 'http://localhost:3000/articles') {
    this.api = new ApiClient(base);
  }

  /* ---------- READ ---------- */
  async list(page = 1, limit = 10) {
    const { data, headers } = await this.api.get('', {
      _page: page,
      _limit: limit,
    });
    return { 
      data: data.map(Article.fromDto), 
      headers 
    };
  }

  /* ---------- CREATE ---------- */
  create(article) {
    // On retire l'id car le serveur va le générer
    const { id, ...body } = article.toDto();
    return this.api.post('', body).then(Article.fromDto);
  }

  /* ---------- UPDATE ---------- */
  update(article) {
    if (article.id == null) throw new Error('id manquant pour update');
    return this.api.put('', article.id, article.toDto()).then(Article.fromDto);
  }

  /* ---------- SOFT-DELETE / RESTORE ---------- */
  trash(id)   { return this._toggle(id, true); }
  restore(id) { return this._toggle(id, false); }

  _toggle(id, del) {
    if (id == null) throw new Error('id manquant');
    return this.api
      .patch('', id, { deleted: del })
      .then(Article.fromDto);
  }
   async get(id) {
    const { data } = await this.api.get(id);
    return Article.fromDto(data);
  }

  async listByCategory(categoryId, excludeId = null, limit = 4) {
    const params = {
      categoryId: categoryId,
      deleted: false,
      _limit: limit
    };

    if (excludeId) {
      params.id_ne = excludeId; // json-server: id not equal
    }

    const { data } = await this.api.get('', params);
    return data.map(Article.fromDto);
  }
}

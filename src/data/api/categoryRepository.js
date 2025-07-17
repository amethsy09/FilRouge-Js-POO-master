import { ApiClient } from '../api-client.js';
import { Category }  from '../../domain/category/Category.js';

export class CategoryRepository {
  constructor(base = 'http://localhost:3000/categories') {
    this.api = new ApiClient(base);
  }

  /* ---------- READ ---------- */
  async list(page = 1, limit = 10) {
    const { data, headers } = await this.api.get('', {
      _page: page,
      _limit: limit,
    });
    return { data: data.map(Category.fromDto), headers };
  }

  /* ---------- CREATE ---------- */
  create(cat) {
    // on retire toujours id : json-server en génèrera un (string ou number)
    const { id, ...body } = cat.toDto();
    return this.api.post('', body).then(Category.fromDto);
  }

  /* ---------- UPDATE ---------- */
  update(cat) {
    if (cat.id == null) throw new Error('id manquant pour update');
    return this.api.put('', cat.id, cat.toDto()).then(Category.fromDto);
  }

  /* ---------- SOFT-DELETE / RESTORE ---------- */
  trash(id)   { return this._toggle(id, true ); }
  restore(id) { return this._toggle(id, false); }

  _toggle(id, del) {
    if (id == null) throw new Error('id manquant');
    return this.api
      .patch('', id, { deleted: del })
      .then(Category.fromDto);
  }
   async get(id) {
    const { data } = await this.api.get(id);
    return Category.fromDto(data);
  }
}

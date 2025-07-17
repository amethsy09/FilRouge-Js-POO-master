import { Category } from "./Category.js";
export class CategoryService {
  constructor(repo) {
    this.repo = repo;
  }
  list(p, l) {
    return this.repo.list(p, l);
  }
  create(c) {
    if (!c.isValid()) throw new Error("Invalid");
    return this.repo.create(c);
  }
  update(c) {
    if (!c.isValid()) throw new Error("Invalid");
    return this.repo.update(c);
  }
  trash(id) {
    return this.repo.trash(id);
  }
  restore(id) {
    return this.repo.restore(id);
  }
}

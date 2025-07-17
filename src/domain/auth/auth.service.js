import { User } from "./User.js";

export class AuthService {
  constructor(repository) {
    this.repo = repository;
  }

  async login(email, password) {
    if (!email || !password) {
      throw new Error("Email et mot de passe requis");
    }
    return this.repo.login(email, password);
  }

  async register(user) {
    if (!(user instanceof User)) {
      user = new User(user);
    }
    if (!user.isValid()) {
      throw new Error("Données utilisateur invalides");
    }
    return this.repo.register(user);
  }

  async logout() {
    return this.repo.logout();
  }

  async getCurrentUser() {
    return this.repo.getCurrentUser();
  }
}

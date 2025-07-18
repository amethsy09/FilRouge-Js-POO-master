export class AuthService {
  constructor(repository) {
    this.BASE_URL = repository.BASE_URL;
  }

  async login(email, password) {
    // 1. Vérifier les credentials
    const usersResponse = await fetch(`${this.BASE_URL}/utilisateurs?email=${email}&password=${password}`);
    if (!usersResponse.ok) throw new Error('Erreur de connexion');
    
    const users = await usersResponse.json();
    if (users.length === 0) throw new Error('Email ou mot de passe incorrect');

    const user = users[0];
    
    // 2. Stocker l'utilisateur connecté
    localStorage.setItem('currentUser', JSON.stringify(user));
    
    // 3. Rediriger selon le rôle
    switch(user.id_role) {
      case "1": 
        window.location.hash = "#admin";
        break;
      case "2":
        window.location.hash = "#client";
        break;
      case "3":
        window.location.hash = "#boutiquier";
        break;
      default:
        window.location.hash = "#auth/login";
    }

    return user;
  }

  async logout() {
    localStorage.removeItem('currentUser');
  }

  async getCurrentUser() {
    const user = localStorage.getItem('currentUser');
    return user ? JSON.parse(user) : null;
  }

  getCurrentUserSync() {
    const user = localStorage.getItem('currentUser');
    return user ? JSON.parse(user) : null;
  }

  async isAuthenticated() {
    return !!await this.getCurrentUser();
  }

  async register(userData) {
    const response = await fetch(`${this.BASE_URL}/utilisateurs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...userData,
        id_role: userData.role || "2", // Par défaut client
        createdAt: new Date().toISOString()
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erreur lors de l\'inscription');
    }

    return await response.json();
  }
}
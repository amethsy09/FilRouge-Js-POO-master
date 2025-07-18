export class AuthRepository {
  constructor() {
    this.BASE_URL = "http://localhost:3000";
  }

  async login(email, password) {
    const response = await fetch(
      `${this.BASE_URL}/utilisateurs?email=${email}`
    );
    const users = await response.json();

    const user = users.find(
      (u) => u.email === email && u.password === password
    );

    if (!user) {
      throw new Error("Identifiants incorrects");
    }

    // Créer le nom complet à partir de nom + prenom
    const fullName = `${user.nom} ${user.prenom}`.trim();

    localStorage.setItem(
      "currentUser",
      JSON.stringify({
        id: user.id,
        name: fullName,
        email: user.email,
        photo: user.photo,
        roleId: user.id_role,
      })
    );

    return {
      id: user.id,
      name: fullName,
      email: user.email,
      photo: user.photo,
      roleId: user.id_role,
    };
  }

  async register(userData) {
    // Vérifier l'email
    const check = await fetch(
      `${this.BASE_URL}/utilisateurs?email=${userData.email}`
    );
    const existing = await check.json();

    if (existing.length > 0) {
      throw new Error("Cet email est déjà utilisé");
    }

    // Split du nom complet en nom et prénom
    const [nom, ...prenomParts] = userData.name.split(" ");
    const prenom = prenomParts.join(" ") || "";

    // Création de l'utilisateur
    const userResponse = await fetch(`${this.BASE_URL}/utilisateurs`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nom: nom,
        prenom: prenom,
        email: userData.email,
        password: userData.password,
        id_role: userData.roleId,
        photo: userData.photo,
      }),
    });

    if (!userResponse.ok) {
      throw new Error("Erreur lors de l'inscription");
    }

    const newUser = await userResponse.json();

    // Création du profil admin/client
    const roleEndpoint = userData.roleId === "1" ? "admin" : "client";

    await fetch(`${this.BASE_URL}/${roleEndpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id_utilisateur: newUser.id,
      }),
    });

    // Stockage dans localStorage
    localStorage.setItem(
      "currentUser",
      JSON.stringify({
        id: newUser.id,
        name: userData.name,
        email: newUser.email,
        roleId: newUser.id_role,
        photo: newUser.photo,
      })
    );

    return {
      id: newUser.id,
      name: userData.name,
      email: newUser.email,
      roleId: newUser.id_role,
      photo: newUser.photo,
    };
  }

  async logout() {
    localStorage.removeItem("currentUser");
    return true;
  }

  async getCurrentUser() {
    const userJson = localStorage.getItem("currentUser");
    return userJson ? JSON.parse(userJson) : null;
  }
}

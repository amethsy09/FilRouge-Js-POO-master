export class BoutiquierRepository {
  constructor() {
    this.BASE_URL = "http://localhost:3000";
  }

  async list() {
    // Récupère les utilisateurs avec roleId = 3 (boutiquiers)
    const usersResponse = await fetch(
      `${this.BASE_URL}/utilisateurs?id_role=3`
    );
    if (!usersResponse.ok) {
      throw new Error("Erreur lors de la récupération des boutiquiers");
    }
    const users = await usersResponse.json();

    // Récupère les informations spécifiques aux boutiquiers
    const boutiquiersResponse = await fetch(`${this.BASE_URL}/boutiquiers`);
    if (!boutiquiersResponse.ok) {
      throw new Error(
        "Erreur lors de la récupération des informations boutiquiers"
      );
    }
    const boutiquiers = await boutiquiersResponse.json();

    // Combine les données
    return users.map((user) => {
      const boutiquierInfo = boutiquiers.find(
        (b) => b.id_utilisateur === user.id
      );
      return {
        ...user,
        localisation: boutiquierInfo?.localisation || null,
      };
    });
  }

  async create(boutiquier) {
    // 1. Création de l'utilisateur dans la table utilisateurs
    const userResponse = await fetch(`${this.BASE_URL}/utilisateurs`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nom: boutiquier.nom,
        prenom: boutiquier.prenom,
        email: boutiquier.email,
        password: boutiquier.password,
        id_role: "3", // Role boutiquier
        photo: boutiquier.photo,
        // Note: localisation n'est pas stockée dans la table utilisateurs
      }),
    });

    if (!userResponse.ok) {
      throw new Error("Erreur lors de la création de l'utilisateur boutiquier");
    }

    const newUser = await userResponse.json();

    // 2. Création de l'entrée dans la table boutiquiers
    const boutiquierResponse = await fetch(`${this.BASE_URL}/boutiquiers`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id_utilisateur: newUser.id,
        localisation: boutiquier.localisation,
      }),
    });

    if (!boutiquierResponse.ok) {
      // Si échec, on supprime l'utilisateur créé pour garder la cohérence
      await fetch(`${this.BASE_URL}/utilisateurs/${newUser.id}`, {
        method: "DELETE",
      });
      throw new Error("Erreur lors de la création des informations boutiquier");
    }

    // Retourne les données combinées
    return {
      ...newUser,
      localisation: boutiquier.localisation,
    };
  }

  async get(id) {
    // 1. Récupère l'utilisateur
    const userResponse = await fetch(`${this.BASE_URL}/utilisateurs/${id}`);
    if (!userResponse.ok) {
      throw new Error("Boutiquier non trouvé");
    }
    const user = await userResponse.json();

    // Vérifie que c'est bien un boutiquier
    if (user.id_role !== "3") {
      throw new Error("L'utilisateur n'est pas un boutiquier");
    }

    // 2. Récupère les infos spécifiques au boutiquier
    const boutiquierResponse = await fetch(
      `${this.BASE_URL}/boutiquiers?id_utilisateur=${id}`
    );
    if (!boutiquierResponse.ok) {
      throw new Error("Informations boutiquier non trouvées");
    }
    const [boutiquierInfo] = await boutiquierResponse.json();

    // Combine les données
    return {
      ...user,
      localisation: boutiquierInfo?.localisation || null,
    };
  }

  async delete(id) {
    // 1. Supprime d'abord l'entrée dans la table boutiquiers
    const boutiquierResponse = await fetch(
      `${this.BASE_URL}/boutiquiers?id_utilisateur=${id}`
    );
    if (boutiquierResponse.ok) {
      const [boutiquierInfo] = await boutiquierResponse.json();
      if (boutiquierInfo) {
        await fetch(`${this.BASE_URL}/boutiquiers/${boutiquierInfo.id}`, {
          method: "DELETE",
        });
      }
    }

    // 2. Supprime l'utilisateur
    const userResponse = await fetch(`${this.BASE_URL}/utilisateurs/${id}`, {
      method: "DELETE",
    });

    if (!userResponse.ok) {
      throw new Error("Erreur lors de la suppression du boutiquier");
    }

    return true;
  }
}

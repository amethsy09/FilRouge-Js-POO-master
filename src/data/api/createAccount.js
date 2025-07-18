import { ApiClient } from '../api-client.js';

export async function createAccount(nom, prenom, adresse, telephone, email, password, role = "2") {
  // Par défaut, le rôle est "2" (client) si non spécifié
  const res = await fetch('http://localhost:3000/users');
  if (!res.ok) throw new Error('Erreur lors de la récupération des utilisateurs');
  const users = await res.json();

  const emailExists = users.some(u => u.email.toLowerCase() === email.toLowerCase());
  if (emailExists) throw new Error('Cet email est déjà utilisé.');

  if (telephone) {
    const phoneExists = users.some(u => u.telephone === telephone);
    if (phoneExists) throw new Error('Ce numéro de téléphone est déjà utilisé.');
  }

  const maxId = users.reduce((max, u) => Math.max(max, u.id), 0);

  const newUser = {
    id: maxId + 1,
    nom,
    prenom,
    adresse,
    telephone,
    email,
    password,
    id_role: role, // Changé de 'role' à 'id_role' pour correspondre à votre db.json
    createdAt: new Date().toISOString() // Ajout de la date de création
  };

  const response = await fetch('http://localhost:3000/users', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(newUser)
  });

  if (!response.ok) throw new Error('Erreur lors de la création du compte');

  // Création également dans la table clients si c'est un client
  if (role === "2") {
    await fetch('http://localhost:3000/clients', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id_utilisateur: maxId + 1 })
    });
  }

  return newUser; // Retourne l'utilisateur créé
}
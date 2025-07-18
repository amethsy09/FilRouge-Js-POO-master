import { startRouter } from "./app/router.js";

const root = document.getElementById("app");

// Configuration des routes
const routes = {
  // Authentification
  "#auth": () => import("./ui/screens/AuthHomeScreen.js"),
  "#auth/login": () => import("./ui/screens/LoginScreen.js"),
  "#auth/register": () => import("./ui/screens/RegisterScreen.js"),
  
  // Catégories et Articles
  "#categories": () => import("./ui/screens/CategoryScreen.js"),
  "#articles": () => import("./ui/screens/ArticleScreen.js"),
  "#articles/(\\w+)": () => import("./ui/screens/ArticleDetailScreen.js"),
  
  // Boutiquiers
   "#boutiquier": () => import("./ui/screens/BoutiquierDashboardScreen.js"), // Dashboard boutiquier
  "#boutiquiers/:id": () => import("./ui/screens/BoutiquierDetailsScreen.js"),
  
  // Clients (nouveaux écrans)
  "#client": () => import("./ui/screens/client/ClientDashboardScreen.js"),
  "#client": () => import("./ui/screens/ClientsListScreen.js"),
  "#client/add": () => import("./ui/screens/AddClientScreen.js"),
  "#client/(\\w+)": () => import("./ui/screens/client/ClientDetailScreen.js"),
  
  // Admin
  "#admin": () => import("./ui/screens/AdminDashboardScreen.js"),
  
  // Fallback pour les routes inconnues
  "#not-found": () => import("./ui/screens/NotFoundScreen.js")
};

// Démarrer le routeur
startRouter(
  root,
  routes,
  "#auth" // Route par défaut
);
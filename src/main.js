import { startRouter } from "./app/router.js";

const root = document.getElementById("app");

// Configuration des routes
const routes = {
  // Authentification
  "#auth": () => import("./ui/screens/AuthHomeScreen.js"),
  "#auth/login": () => import("./ui/screens/LoginScreen.js"),
  "#auth/register": () => import("./ui/screens/RegisterScreen.js"),
  
  // Admin
  "#admin": () => import("./ui/screens/AdminDashboardScreen.js"),
  
  // Catégories et Articles
  "#categories": () => import("./ui/screens/CategoryScreen.js"),
  "#articles": () => import("./ui/screens/ArticleScreen.js"),
  "#articles/(\\w+)": () => import("./ui/screens/ArticleDetailScreen.js"),
  
  // Boutiquiers
  "#boutiquier": () => import("./ui/screens/BoutiquierDashboardScreen.js"),
  "#boutiquiers/:id": () => import("./ui/screens/BoutiquierDetailsScreen.js"),
  
  // Clients
  "#client": () => import("./ui/screens/ClientDashboardScreen.js"),
  "#client/articles": () => import("./ui/screens/ClientArticlesScreen.js"),
  "#clients": () => import("./ui/screens/ClientsListScreen.js"),
  "#client/add": () => import("./ui/screens/AddClientScreen.js"),
  "#client/(\\w+)": () => import("./ui/screens/client/ClientDetailScreen.js"),
  
  // Fallback
  "#not-found": () => import("./ui/screens/NotFoundScreen.js")
};

// Démarrer le routeur
startRouter(
  root,
  routes,
  "#auth" // Route par défaut
);
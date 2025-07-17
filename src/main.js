import { startRouter } from "./app/router.js";

const root = document.getElementById("app");

startRouter(
  root,
  {
    "#auth": () => import("./ui/screens/AuthHomeScreen.js"),
    "#auth/login": () => import("./ui/screens/LoginScreen.js"),
    "#auth/register": () => import("./ui/screens/RegisterScreen.js"),
    "#categories": () => import("./ui/screens/CategoryScreen.js"),
    "#boutiquier": () => import("./ui/screens/ArticleScreen.js"),
    "#articles": () => import("./ui/screens/ArticleScreen.js"),
    "#client": () => import("./ui/screens/ClientScreen.js"),
    "#articles/(\\w+)": () => import("./ui/screens/ArticleDetailScreen.js"),
    "#admin": () => import("./ui/screens/AdminDashboardScreen.js"),
    "#boutiquiers/(\\w+)": () =>
      import("./ui/screens/BoutiquierDetailsScreen.js"),
  },
  "#auth"
);

export default class AuthHomeScreen {
  constructor(root) {
    this.root = root;
  }

  render() {
    this.root.innerHTML = `
      <div class="flex flex-col items-center justify-center min-h-[80vh]">
        <div class="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow">
          <h2 class="text-2xl font-bold text-center">Bienvenue</h2>
          <div class="flex flex-col space-y-4">
            <a href="#auth/login" class="px-4 py-2 text-center text-white bg-indigo-600 rounded hover:bg-indigo-700">
              Se connecter
            </a>
            <a href="#auth/register" class="px-4 py-2 text-center text-indigo-600 border border-indigo-600 rounded hover:bg-indigo-50">
              Créer un compte
            </a>
          </div>
        </div>
      </div>`;
  }

  setUpEventListeners() {}
}

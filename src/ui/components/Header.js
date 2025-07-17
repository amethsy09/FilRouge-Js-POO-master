import { AuthService } from "../../domain/auth/auth.service.js";
import { AuthRepository } from "../../data/api/authRepository.js";

export default class Header {
  constructor(root) {
    this.root = root;
    this.authSvc = new AuthService(new AuthRepository());
    this.dropdownOpen = false;
    this.toggleDropdown = this.toggleDropdown.bind(this);
    this.handleClickOutside = this.handleClickOutside.bind(this);
  }

  async render() {
    const user = await this.authSvc.getCurrentUser();

    this.root.innerHTML = `
        <img src="./assets/logo.jpg" alt="Logo" class="object-cover w-12" />

        ${
          user && user.roleId == "3"
            ? `<div class="flex items-center gap-4">
            <li>
              <a href="#categories" class="text-white font-medium">Category</a>
            </li>
            <li>
              <a href="#articles" class="text-white font-medium">Articles</a>
            </li>
            </div>`
            : ""
        }
              
        
        <nav>
          <ul class="flex items-center gap-4">
            ${
              user
                ? `
                  <li class="relative">
                    <!-- Bouton profil avec dropdown -->
                    <button id="profile-dropdown-btn" class="flex items-center gap-2 focus:outline-none">
                      ${
                        user.photo
                          ? `<img src="${user.photo}" alt="Photo" class="w-8 h-8 rounded-full object-cover">`
                          : `<div class="bg-gray-200 w-8 h-8 rounded-full"></div>`
                      }
                      <span>${user.name}</span>
                      <svg class="w-4 h-4 transition-transform ${
                        this.dropdownOpen ? "transform rotate-180" : ""
                      }" 
                           fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                      </svg>
                    </button>
                    
                    <!-- Dropdown menu -->
                    <div id="profile-dropdown" class="${
                      this.dropdownOpen ? "block" : "hidden"
                    } absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                      ${
                        user.roleId === "1"
                          ? `<a href="#admin" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Admin</a>`
                          : ""
                      }
                      <button id="btn-logout" class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        Déconnexion
                      </button>
                    </div>
                  </li>
                `
                : `
                  <li>
                    <a href="#auth" class="font-medium hover:text-gray-300">Connexion</a>
                  </li>
                `
            }
          </ul>
        </nav>
    `;

    this.setUpEventListeners();
  }

  toggleDropdown() {
    this.dropdownOpen = !this.dropdownOpen;
    const dropdown = this.root.querySelector("#profile-dropdown");
    const arrow = this.root.querySelector("#profile-dropdown-btn svg");

    if (this.dropdownOpen) {
      dropdown.classList.remove("hidden");
      dropdown.classList.add("block");
      arrow.classList.add("rotate-180");
    } else {
      dropdown.classList.remove("block");
      dropdown.classList.add("hidden");
      arrow.classList.remove("rotate-180");
    }
  }

  handleClickOutside(event) {
    const dropdownBtn = this.root.querySelector("#profile-dropdown-btn");
    const dropdown = this.root.querySelector("#profile-dropdown");

    if (
      !dropdownBtn.contains(event.target) &&
      !dropdown.contains(event.target)
    ) {
      this.dropdownOpen = false;
      dropdown.classList.remove("block");
      dropdown.classList.add("hidden");
      this.root
        .querySelector("#profile-dropdown-btn svg")
        .classList.remove("rotate-180");
    }
  }

  setUpEventListeners() {
    const logoutBtn = this.root.querySelector("#btn-logout");
    const dropdownBtn = this.root.querySelector("#profile-dropdown-btn");

    if (dropdownBtn) {
      dropdownBtn.addEventListener("click", this.toggleDropdown);
      document.addEventListener("click", this.handleClickOutside);
    }

    if (logoutBtn) {
      logoutBtn.onclick = async () => {
        await this.authSvc.logout();
        window.location.hash = "#auth";
        document.removeEventListener("click", this.handleClickOutside);
        this.render(); // Re-render le header après déconnexion
      };
    }
  }
}

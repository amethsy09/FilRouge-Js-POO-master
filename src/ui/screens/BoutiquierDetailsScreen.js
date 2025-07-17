import { BoutiquierService } from "../../domain/boutiquier/boutiquier.service.js";
import { BoutiquierRepository } from "../../data/api/boutiquierRepository.js";

export default class BoutiquierDetailsScreen {
  constructor(root, params) {
    this.root = root;
    this.boutiquierId = params.id;
    this.boutiquierSvc = new BoutiquierService(new BoutiquierRepository());
    this.state = {
      boutiquier: null,
    };
  }

  async render() {
    await this._loadBoutiquier();

    if (!this.state.boutiquier) {
      this.root.innerHTML = `<p class="text-red-500">Boutiquier non trouvé</p>`;
      return;
    }

    const b = this.state.boutiquier;

    this.root.innerHTML = `
      <div class="container mx-auto p-6">
        <button id="btn-back" class="mb-4 text-indigo-600 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clip-rule="evenodd" />
          </svg>
          Retour
        </button>
        
        <div class="bg-white rounded-xl shadow-lg overflow-hidden">
          <div class="md:flex">
            <div class="md:w-1/3 p-6">
              <div class="h-64 bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
                ${
                  b.photo
                    ? `<img src="${b.photo}" alt="${b.nom}" class="h-full w-full object-cover">`
                    : '<span class="text-gray-500">Pas de photo</span>'
                }
              </div>
            </div>
            
            <div class="md:w-2/3 p-6">
              <h1 class="text-3xl font-bold">${b.nom} ${b.prenom}</h1>
              <p class="text-gray-600 mt-2">${b.email}</p>
            </div>
          </div>
          <div class="w-full">
          <iframe class="w-full" src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3858.8081176283818!2d-17.455300926155715!3d14.723437874059965!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xec173c21564c333%3A0x504d9e7bb5384f5a!2sEcole%20221!5e0!3m2!1sfr!2ssn!4v1752317986930!5m2!1sfr!2ssn" width="600" height="450" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>
          </div>
          ${
            b.localisation
              ? `
            <div class="p-6 border-t">
              <h2 class="text-xl font-semibold mb-4">Localisation de la boutique</h2>
              <div id="map" class="h-96 bg-gray-200 rounded-lg"></div>
            </div>
          `
              : ""
          }
        </div>
      </div>
    `;

    this._initMap();
    this.setUpEventListeners();
  }

  _initMap() {
    const boutiquier = this.state.boutiquier;
    if (!boutiquier?.localisation) return;

    const { lat, lng } = boutiquier.localisation;
    const mapEl = this.root.querySelector("#map");

    if (mapEl) {
      // Solution simple avec lien vers Google Maps
      mapEl.innerHTML = `
        <iframe 
          width="100%" 
          height="100%" 
          frameborder="0" 
          scrolling="no" 
          marginheight="0" 
          marginwidth="0" 
          src="https://maps.google.com/maps?q=${lat},${lng}&z=15&output=embed">
        </iframe>
      `;
    }
  }

  async _loadBoutiquier() {
    try {
      this.state.boutiquier = await this.boutiquierSvc.get(this.boutiquierId);
    } catch (error) {
      console.error("Erreur de chargement:", error);
    }
  }

  _initMap() {
    const boutiquier = this.state.boutiquier;
    if (!boutiquier?.boutique?.localisation) return;

    const lat = boutiquier.boutique.localisation.lat;
    const lng = boutiquier.boutique.localisation.lng;

    // Initialisation de la carte (utilisez votre service de cartes préféré)
    // Exemple avec Leaflet:
    /*
    const map = L.map('map').setView([lat, lng], 15);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
    L.marker([lat, lng]).addTo(map)
      .bindPopup(boutiquier.boutique.nom)
      .openPopup();
    */

    // Pour Google Maps:
    /*
    const map = new google.maps.Map(document.getElementById("map"), {
      center: { lat, lng },
      zoom: 15
    });
    new google.maps.Marker({
      position: { lat, lng },
      map,
      title: boutiquier.boutique.nom
    });
    */

    // Solution temporaire sans bibliothèque externe
    const mapEl = this.root.querySelector("#map");
    if (mapEl) {
      mapEl.innerHTML = `
        <div class="h-full flex items-center justify-center">
          <div class="text-center">
            <p class="font-medium">Localisation:</p>
            <p>Latitude: ${lat}</p>
            <p>Longitude: ${lng}</p>
            <a href="https://www.google.com/maps?q=${lat},${lng}" 
               target="_blank" 
               class="text-indigo-600 hover:underline mt-2 inline-block">
              Voir sur Google Maps
            </a>
          </div>
        </div>
      `;
    }
  }

  setUpEventListeners() {
    // Bouton retour
    this.root.querySelector("#btn-back")?.addEventListener("click", () => {
      window.location.hash = "#admin";
    });
  }
}

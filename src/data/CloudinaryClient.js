import { activeConfig } from '../utils/config.js';


export class CloudinaryClient {
  constructor() {
    const { cloudName,uploadPreset, folder } = activeConfig.cloudinary;
   
    this.cloudName = cloudName;
    // this.apiKey = apiKey;
    this.uploadPreset = uploadPreset;
    this.folder = folder;
    this.uploadUrl = `https://api.cloudinary.com/v1_1/${this.cloudName}/image/upload`;
  }
 
  /**
   * Upload une image sur Cloudinary
   * @param {File} file - Le fichier à uploader
   * @param {Object} options - Options supplémentaires
   * @returns {Promise<Object>} - Détails de l'image uploadée
   */
  async uploadImage(file, options = {}) {
    if (!file) throw new Error('Fichier requis pour upload');
   
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', this.uploadPreset);
    formData.append('folder', this.folder);
   
    // Ajouter des options supplémentaires
    for (const [key, value] of Object.entries(options)) {
      formData.append(key, value);
    }
   
    try {
      const response = await fetch(this.uploadUrl, {
        method: 'POST',
        body: formData
      });
     
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Erreur lors de l\'upload');
      }
     
      const result = await response.json();
     
      return {
        publicId: result.public_id,
        url: result.secure_url,
        format: result.format,
        width: result.width,
        height: result.height,
        originalFilename: result.original_filename
      };
    } catch (error) {
      console.error('Erreur d\'upload Cloudinary:', error);
      throw new Error(`Échec de l'upload: ${error.message}`);
    }
  }
 
  /**
   * Supprimer une image de Cloudinary
   * Note: Nécessite une signature côté serveur pour la sécurité
   * Cette méthode est un exemple et nécessiterait un backend pour fonctionner
   */
  async deleteImage(publicId) {
    console.warn('La suppression d\'image directement depuis le front-end n\'est pas sécurisée.');
    console.warn('Utilisez un backend pour gérer les suppressions d\'images.');
    return { status: 'warning', message: 'Cette opération nécessite un backend' };
  }
 
  /**
   * Génère une URL de transformation Cloudinary
   * @param {String} url - URL de l'image originale
   * @param {Object} options - Options de transformation
   */
  getTransformedUrl(url, options = {}) {
    if (!url) return '';
   
    // Si ce n'est pas une URL Cloudinary, retourner l'URL originale
    if (!url.includes('cloudinary.com')) return url;
   
    const { width, height, crop = 'fill', quality = 'auto' } = options;
   
    // Diviser l'URL pour insérer les transformations
    const parts = url.split('/upload/');
    if (parts.length !== 2) return url;
   
    let transformations = 'q_' + quality;
   
    if (width) transformations += ',w_' + width;
    if (height) transformations += ',h_' + height;
    if (crop) transformations += ',c_' + crop;
   
    return parts[0] + '/upload/' + transformations + '/' + parts[1];
  }
}
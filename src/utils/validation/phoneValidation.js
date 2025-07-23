

export function validateSenegalPhoneNumber(phoneNumber) {
  // Nettoyer le numéro
  const cleanedPhone = phoneNumber.replace(/\D/g, '');
  
  // Variables pour le résultat
  let isValid = false;
  let formattedNumber = '';
  
  // Vérification des formats
  if (cleanedPhone.startsWith('221') || cleanedPhone.startsWith('00221')) {
    const phoneWithoutIndicatif = cleanedPhone.startsWith('221') 
      ? cleanedPhone.substring(3) 
      : cleanedPhone.substring(5);
    
    if (phoneWithoutIndicatif.length === 9) {
      const operator = phoneWithoutIndicatif.substring(0, 2);
      if (['70', '75', '76', '77'].includes(operator)) {
        isValid = true;
        formattedNumber = `+221${phoneWithoutIndicatif}`;
      }
    }
  } else if (cleanedPhone.length === 9) {
    const operator = cleanedPhone.substring(0, 2);
    if (['70', '75', '76', '77'].includes(operator)) {
      isValid = true;
      formattedNumber = `+221${cleanedPhone}`;
    }
  }
  
  return {
    isValid,
    formatted: formattedNumber,
    message: isValid ? '' : 'Numéro invalide. Formats acceptés: +221771234567 ou 771234567 (opérateurs: 70,75,76,77)'
  };
}
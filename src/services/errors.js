// Traduce un error de la API a la clave de texto (i18n) que se muestra al usuario.
const KEYS = {
  network: 'errors.network',
  timeout: 'errors.network',
  backend_not_configured: 'errors.backend',
  bad_response: 'errors.backend',
  rate_limited: 'errors.rateLimited',
  not_available: 'errors.notAvailable',
  busy: 'errors.busy',
  invalid_token: 'errors.session',
  missing_token: 'errors.session',
  donor_only: 'errors.donorOnly',
  only_receivers_can_reserve: 'errors.receiverOnly',
  ai_not_configured: 'publish.aiUnavailable',
};

export const errorKey = (error) => KEYS[error && error.code] || 'errors.generic';

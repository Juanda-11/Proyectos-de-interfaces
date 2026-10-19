import { ApiError } from '../src/services/api';
import { errorKey } from '../src/services/errors';
import es from '../src/i18n/es';

const get = (obj, path) => path.split('.').reduce((o, k) => o && o[k], obj);

test('cada código conocido apunta a un texto existente', () => {
  for (const code of ['network', 'timeout', 'backend_not_configured', 'bad_response', 'rate_limited', 'not_available', 'busy', 'invalid_token', 'donor_only', 'only_receivers_can_reserve', 'ai_not_configured']) {
    expect(typeof get(es, errorKey(new ApiError(code)))).toBe('string');
  }
});

test('códigos desconocidos usan el mensaje genérico', () => {
  expect(errorKey(new ApiError('algo_raro'))).toBe('errors.generic');
  expect(errorKey(null)).toBe('errors.generic');
});

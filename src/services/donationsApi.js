import { api } from './api';

// Donaciones y notificaciones en el backend. El campo `code` (código de entrega)
// solo llega al donante dueño de la donación.
export const listDonations = async () => (await api.get('/donations')).donations;
export const createDonation = async (draft) => (await api.post('/donations', draft)).donation;

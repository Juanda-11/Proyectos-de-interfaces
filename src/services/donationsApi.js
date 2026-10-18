import { api } from './api';

// Donaciones y notificaciones en el backend. El campo `code` (código de entrega)
// solo llega al donante dueño de la donación.
export const listDonations = async () => (await api.get('/donations')).donations;
export const createDonation = async (draft) => (await api.post('/donations', draft)).donation;

const transition = (id, action, body) => api.post(`/donations/${id}/${action}`, body).then((r) => r.donation);

export const reserveDonation = (id) => transition(id, 'reserve');
export const startPickup = (id) => transition(id, 'pickup');
export const deliverDonation = (id, code) => transition(id, 'deliver', code ? { code } : undefined);
export const cancelDonation = (id) => transition(id, 'cancel');

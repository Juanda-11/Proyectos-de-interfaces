export function formatDateTime(iso, lang) {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleString(lang === 'en' ? 'en-US' : 'es-CO', {
      day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

export function formatDate(iso, lang) {
  try {
    return new Date(iso).toLocaleDateString(lang === 'en' ? 'en-US' : 'es-CO', { month: 'long', year: 'numeric' });
  } catch {
    return '';
  }
}

export function timeAgo(iso, t) {
  const min = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
  if (min < 1) return t('notif.justNow');
  if (min < 60) return t('notif.minAgo', { n: min });
  if (min < 60 * 24) return t('notif.hAgo', { n: Math.round(min / 60) });
  return t('notif.dAgo', { n: Math.round(min / 1440) });
}

export function greetingKey() {
  const h = new Date().getHours();
  return h < 12 ? 'greeting.morning' : h < 19 ? 'greeting.afternoon' : 'greeting.evening';
}

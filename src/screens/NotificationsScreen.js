import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useStyles, useTheme } from '../theme/ThemeContext';
import { useI18n } from '../i18n/I18nContext';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { useRouter } from '../navigation/Router';
import { timeAgo } from '../utils';
import { Button, Card, EmptyState, Header, Icon, Screen } from '../components/ui';

const ICONS = { published: 'megaphone-outline', reserved: 'bookmark-outline', onTheWay: 'bicycle-outline', collected: 'checkmark-done-outline', cancelled: 'close-circle-outline' };

const makeStyles = (c) =>
  StyleSheet.create({
    item: { flexDirection: 'row', gap: 12, marginBottom: 10, padding: 14 },
    icon: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
    title: { fontSize: 14, fontWeight: '800', color: c.ink },
    body: { fontSize: 13, color: c.muted, marginTop: 3, lineHeight: 18 },
    time: { fontSize: 11, color: c.placeholder, marginTop: 6 },
    unread: { width: 9, height: 9, borderRadius: 5, backgroundColor: c.orange, marginTop: 5 },
  });

export default function NotificationsScreen() {
  const s = useStyles(makeStyles);
  const { colors } = useTheme();
  const { t } = useI18n();
  const { user } = useAuth();
  const { notifications, markAllRead } = useData();
  const { go, back } = useRouter();
  const mine = notifications.filter((n) => n.userId === user.id);
  const allRead = mine.every((n) => n.read);
  const tone = { cancelled: [colors.redSoft, colors.red], collected: [colors.blueSoft, colors.blue], onTheWay: [colors.purpleSoft, colors.purple], reserved: [colors.orangeSoft, colors.orange], published: [colors.mint, colors.accent] };

  return (
    <Screen>
      <Header title={t('notif.title')} subtitle={t('notif.subtitle')} onBack={back} />
      {mine.length === 0 ? <EmptyState icon="notifications-off-outline" text={t('notif.empty')} /> : null}
      {mine.map((n) => (
        <Card key={n.id} onPress={() => go('tracking', { id: n.donationId })} style={[s.item, n.read && { opacity: 0.7 }]}>
          <View style={[s.icon, { backgroundColor: (tone[n.type] || tone.published)[0] }]}>
            <Icon name={ICONS[n.type] || 'notifications-outline'} size={21} color={(tone[n.type] || tone.published)[1]} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.title}>{t(`notif.${n.type}`)}</Text>
            <Text style={s.body}>{t(`notif.${n.type}Body`, { title: n.title })}</Text>
            <Text style={s.time}>{timeAgo(n.createdAt, t)}</Text>
          </View>
          {!n.read ? <View style={s.unread} /> : null}
        </Card>
      ))}
      {mine.length > 0 ? (
        <View style={{ gap: 10, marginTop: 6 }}>
          <Button variant="secondary" label={allRead ? t('notif.allRead') : t('notif.markRead')} icon="checkmark-done-outline" disabled={allRead} onPress={() => markAllRead(user.id)} />
          <Button label={t('notif.goActivity')} icon="pulse-outline" onPress={() => go('activity')} />
        </View>
      ) : null}
    </Screen>
  );
}

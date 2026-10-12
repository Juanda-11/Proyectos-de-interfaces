import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useStyles, useTheme } from '../theme/ThemeContext';
import { useI18n } from '../i18n/I18nContext';
import { useRouter } from '../navigation/Router';
import { Card, Header, Icon, Screen, SectionTitle } from '../components/ui';

const makeStyles = (c) =>
  StyleSheet.create({
    item: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: c.line, paddingVertical: 14 },
    q: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    qText: { flex: 1, fontSize: 14, fontWeight: '800', color: c.ink },
    a: { fontSize: 13, color: c.muted, lineHeight: 20, marginTop: 10 },
    contact: { flexDirection: 'row', gap: 12, alignItems: 'center', marginTop: 16 },
    contactTitle: { fontSize: 14, fontWeight: '800', color: c.ink },
    contactBody: { fontSize: 13, color: c.accent, marginTop: 2, fontWeight: '700' },
  });

export default function HelpScreen() {
  const s = useStyles(makeStyles);
  const { colors } = useTheme();
  const { t } = useI18n();
  const { back } = useRouter();
  const [open, setOpen] = useState(1);
  return (
    <Screen>
      <Header title={t('help.title')} onBack={back} />
      <SectionTitle title={t('help.how')} />
      <Card style={{ paddingVertical: 2 }}>
        {[1, 2, 3, 4].map((n) => (
          <Pressable key={n} accessibilityRole="button" accessibilityState={{ expanded: open === n }} onPress={() => setOpen(open === n ? 0 : n)} style={[s.item, n === 4 && { borderBottomWidth: 0 }]}>
            <View style={s.q}>
              <Text style={s.qText}>{t(`help.q${n}`)}</Text>
              <Icon name={open === n ? 'chevron-up' : 'chevron-down'} size={18} color={colors.muted} />
            </View>
            {open === n ? <Text style={s.a}>{t(`help.a${n}`)}</Text> : null}
          </Pressable>
        ))}
      </Card>
      <Card style={s.contact}>
        <Icon name="mail-outline" size={24} color={colors.accent} />
        <View>
          <Text style={s.contactTitle}>{t('help.contact')}</Text>
          <Text style={s.contactBody}>{t('help.contactBody')}</Text>
        </View>
      </Card>
    </Screen>
  );
}

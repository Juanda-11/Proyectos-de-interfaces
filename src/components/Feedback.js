import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useStyles } from '../theme/ThemeContext';
import { useI18n } from '../i18n/I18nContext';
import { errorKey } from '../services/errors';
import { Button, Icon } from './ui';

// Diálogos de confirmación y avisos (toast) multiplataforma.
// Alert.alert no funciona en la web, por eso se implementan aquí.
const FeedbackContext = createContext(null);

const makeStyles = (c) =>
  StyleSheet.create({
    backdrop: { flex: 1, backgroundColor: c.overlay, alignItems: 'center', justifyContent: 'center', padding: 24 },
    dialog: { width: '100%', maxWidth: 360, backgroundColor: c.surface, borderRadius: 24, padding: 22 },
    title: { fontSize: 19, fontWeight: '800', color: c.ink },
    body: { fontSize: 14, color: c.muted, lineHeight: 20, marginTop: 8, marginBottom: 20 },
    row: { flexDirection: 'row', gap: 10 },
    toastWrap: { position: 'absolute', left: 0, right: 0, bottom: 100, alignItems: 'center', paddingHorizontal: 20 },
    toast: { flexDirection: 'row', alignItems: 'center', gap: 9, backgroundColor: c.ink, paddingHorizontal: 16, paddingVertical: 12, borderRadius: 16, maxWidth: 380 },
    toastText: { color: c.bg, fontWeight: '700', fontSize: 13, flexShrink: 1 },
  });

export function FeedbackProvider({ children }) {
  const s = useStyles(makeStyles);
  const { t } = useI18n();
  const [dialog, setDialog] = useState(null);
  const [toastMsg, setToastMsg] = useState(null);
  const opacity = useRef(new Animated.Value(0)).current;
  const timer = useRef(null);

  const confirm = useCallback(
    (opts) => new Promise((resolve) => setDialog({ ...opts, resolve })),
    []
  );
  const close = (result) => {
    dialog?.resolve(result);
    setDialog(null);
  };

  const toast = useCallback(
    (message, icon = 'checkmark-circle') => {
      setToastMsg({ message, icon });
      clearTimeout(timer.current);
      Animated.timing(opacity, { toValue: 1, duration: 180, useNativeDriver: true }).start();
      timer.current = setTimeout(() => {
        Animated.timing(opacity, { toValue: 0, duration: 220, useNativeDriver: true }).start(() => setToastMsg(null));
      }, 2400);
    },
    [opacity]
  );
  useEffect(() => () => clearTimeout(timer.current), []);

  // Muestra un error de la API con el texto traducido (red, sesión, reglas de negocio...).
  const toastError = useCallback((error) => toast(t(errorKey(error)), 'alert-circle'), [toast, t]);

  const value = useMemo(() => ({ confirm, toast, toastError }), [confirm, toast, toastError]);

  return (
    <FeedbackContext.Provider value={value}>
      {children}
      {toastMsg ? (
        <Animated.View pointerEvents="none" style={[s.toastWrap, { opacity }]}>
          <View style={s.toast}>
            <Icon name={toastMsg.icon} size={18} color={toastMsg.icon === 'alert-circle' ? '#FF9B9B' : '#7BE3A8'} />
            <Text style={s.toastText}>{toastMsg.message}</Text>
          </View>
        </Animated.View>
      ) : null}
      <Modal visible={!!dialog} transparent animationType="fade" onRequestClose={() => close(false)}>
        <Pressable style={s.backdrop} onPress={() => close(false)}>
          <Pressable style={s.dialog} onPress={() => {}}>
            <Text style={s.title}>{dialog?.title}</Text>
            {dialog?.body ? <Text style={s.body}>{dialog.body}</Text> : null}
            <View style={s.row}>
              <Button style={{ flex: 1 }} small variant="secondary" label={t('common.cancel')} onPress={() => close(false)} />
              <Button style={{ flex: 1 }} small variant={dialog?.danger ? 'danger' : 'primary'} label={dialog?.confirmLabel || t('common.confirm')} onPress={() => close(true)} />
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </FeedbackContext.Provider>
  );
}

export const useFeedback = () => useContext(FeedbackContext);

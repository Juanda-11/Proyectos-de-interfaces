import React, { forwardRef, useEffect, useImperativeHandle, useMemo, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import { buildMapHtml } from './mapHtml';

// Misma interfaz que LeafletMap.js, pero con un <iframe> para la versión web.
const LeafletMap = forwardRef(function LeafletMap(
  { markers, user, center, zoom = 14, dark, interactive = true, selectedId, onSelect, onError, labels, style },
  ref
) {
  const frame = useRef(null);
  const html = useMemo(
    () => buildMapHtml({ markers, user, center, zoom, dark, interactive, labels }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [JSON.stringify(markers), JSON.stringify(user), JSON.stringify(center), zoom, dark, interactive, labels.error]
  );

  const post = (payload) => frame.current?.contentWindow?.postMessage(JSON.stringify(payload), '*');
  useImperativeHandle(ref, () => ({ flyTo: (c) => post({ flCenter: c }) }));

  useEffect(() => {
    const handler = (e) => {
      if (e.source !== frame.current?.contentWindow) return;
      try {
        const msg = JSON.parse(e.data);
        if (msg.type === 'select') onSelect?.(msg.id);
        else if (msg.type === 'deselect') onSelect?.(null);
        else if (msg.type === 'error') onError?.();
      } catch {
        /* mensaje ajeno */
      }
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, [onSelect, onError]);

  useEffect(() => {
    post({ flSelect: selectedId ?? null });
  }, [selectedId]);

  return (
    <View style={[StyleSheet.absoluteFill, style]}>
      {React.createElement('iframe', {
        ref: frame,
        title: 'map',
        srcDoc: html,
        onLoad: () => selectedId && post({ flSelect: selectedId }),
        style: { border: 0, width: '100%', height: '100%', background: dark ? '#0f1713' : '#dfe8e1' },
      })}
    </View>
  );
});

export default LeafletMap;

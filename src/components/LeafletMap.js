import React, { forwardRef, useEffect, useImperativeHandle, useMemo, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { buildMapHtml } from './mapHtml';

// Mapa real (OpenStreetMap + Leaflet) dentro de un WebView en iOS / Android.
const LeafletMap = forwardRef(function LeafletMap(
  { markers, user, center, zoom = 14, dark, interactive = true, selectedId, onSelect, onError, labels, style },
  ref
) {
  const web = useRef(null);
  const html = useMemo(
    () => buildMapHtml({ markers, user, center, zoom, dark, interactive, labels }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [JSON.stringify(markers), JSON.stringify(user), JSON.stringify(center), zoom, dark, interactive, labels.error]
  );

  const post = (payload) => web.current?.injectJavaScript(`window.postMessage(${JSON.stringify(JSON.stringify(payload))},'*');true;`);
  useImperativeHandle(ref, () => ({ flyTo: (c) => post({ flCenter: c }) }));

  useEffect(() => {
    post({ flSelect: selectedId ?? null });
  }, [selectedId]);

  return (
    <View style={[StyleSheet.absoluteFill, style]}>
      <WebView
        ref={web}
        originWhitelist={['*']}
        source={{ html, baseUrl: 'https://foodlink.app' }}
        javaScriptEnabled
        domStorageEnabled
        scrollEnabled={false}
        onLoadEnd={() => selectedId && post({ flSelect: selectedId })}
        onMessage={(e) => {
          try {
            const msg = JSON.parse(e.nativeEvent.data);
            if (msg.type === 'select') onSelect?.(msg.id);
            else if (msg.type === 'deselect') onSelect?.(null);
            else if (msg.type === 'error') onError?.();
          } catch {
            /* mensaje ajeno */
          }
        }}
        style={{ flex: 1, backgroundColor: dark ? '#0f1713' : '#dfe8e1' }}
      />
    </View>
  );
});

export default LeafletMap;

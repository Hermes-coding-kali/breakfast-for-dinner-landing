// src/components/ThemeInjector.js
import React, { useMemo } from 'react';
import sanityClient from '../sanityClient';
import { useQuery } from '@tanstack/react-query';

// turn "Brand Orange" -> "brand-orange"
const toCssToken = (name = '') =>
  name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

const escapeFont = (font) => {
  if (!font) return '';
  // Quote if contains spaces/commas and not already quoted
  const needsQuotes = /[\s,]/.test(font) && !(font.startsWith("'") || font.startsWith('"'));
  return needsQuotes ? `'${font.replace(/'/g, "\\'")}'` : font;
};

function ThemeInjector() {
  const { data: designSystem } = useQuery({
    queryKey: ['designSystem'],
    queryFn: async () => sanityClient.fetch(`*[_type == "designSystem"][0]`),
    staleTime: Infinity,          // rarely changes
    gcTime: Infinity,             // keep in cache
    refetchOnWindowFocus: false,
  });

  const cssText = useMemo(() => {
    if (!designSystem) return ':root{}';

    let lines = [];

    // 1) Colors (array of {name, value:{hex}})
    (designSystem.colors || []).forEach((c) => {
      const token = toCssToken(c?.name);
      const hex = c?.value?.hex;
      if (token && hex) lines.push(`--color-${token}: ${hex};`);
    });

    // 2) Typography (array of {name, font, fontWeight, fontSize, lineHeight, letterSpacing})
    (designSystem.typography || []).forEach((t) => {
      const token = toCssToken(t?.name);
      if (!token) return;
      const family = escapeFont(t?.font) || 'system-ui';
      const weight = t?.fontWeight ?? 400;
      const size = t?.fontSize != null ? `${t.fontSize}rem` : '';
      const lineHeight = t?.lineHeight != null ? t.lineHeight : '';
      const letterSpacing = t?.letterSpacing != null ? `${t.letterSpacing}em` : '';

      lines.push(`--font-${token}-family: ${family}, sans-serif;`);
      lines.push(`--font-${token}-weight: ${weight};`);
      if (size) lines.push(`--font-${token}-size: ${size};`);
      if (lineHeight !== '') lines.push(`--font-${token}-line-height: ${lineHeight};`);
      if (letterSpacing) lines.push(`--font-${token}-letter-spacing: ${letterSpacing};`);
    });

    // 3) Buttons (array of {name, paddingX, paddingY, borderRadius, borderWidth, textColor, backgroundColor, borderColor})
    (designSystem.buttons || []).forEach((b) => {
      const token = toCssToken(b?.name);
      if (!token) return;

      const px = Number.isFinite(b?.paddingX) ? `${b.paddingX}px` : '16px';
      const py = Number.isFinite(b?.paddingY) ? `${b.paddingY}px` : '10px';
      const br = Number.isFinite(b?.borderRadius) ? `${b.borderRadius}px` : '8px';
      const bw = Number.isFinite(b?.borderWidth) ? `${b.borderWidth}px` : '2px';

      const txt = b?.textColor?.hex || '#000000';
      const bg = b?.backgroundColor?.hex || '#ffffff';
      const bc = b?.borderColor?.hex || 'transparent';

      lines.push(`--button-${token}-padding-x: ${px};`);
      lines.push(`--button-${token}-padding-y: ${py};`);
      lines.push(`--button-${token}-border-radius: ${br};`);
      lines.push(`--button-${token}-border-width: ${bw};`);
      lines.push(`--button-${token}-text-color: ${txt};`);
      lines.push(`--button-${token}-background-color: ${bg};`);
      lines.push(`--button-${token}-border-color: ${bc};`);
    });

    return `:root{\n  ${lines.join('\n  ')}\n}`;
  }, [designSystem]);

  // Render a single style tag (easy to target/replace if needed)
  return <style id="theme-injector">{cssText}</style>;
}

export default ThemeInjector;

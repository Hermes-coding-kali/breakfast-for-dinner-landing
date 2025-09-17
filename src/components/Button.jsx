import React, { forwardRef, useId } from 'react';
import { Link } from 'react-router-dom';
import './Button.css';

/** Size scale used site-wide */
const SIZE = {
  sm: { height: 44, minWidth: 160, fontSize: 16, paddingX: 20, paddingY: 10 },
  md: { height: 56, minWidth: 200, fontSize: 18, paddingX: 26, paddingY: 14 },
  lg: { height: 64, minWidth: 220, fontSize: 20, paddingX: 30, paddingY: 18 },
};

function hx(v) {
  return typeof v === 'string' ? v : v?.hex || undefined;
}

/**
 * Button
 * Expects styleTokens from Sanity (merged base + override), e.g.:
 * {
 *   paddingX, paddingY, borderRadius, borderWidth,
 *   textColor, backgroundColor, borderColor,
 *   font, fontWeight, fontSize, boxShadow, textShadow, maxWidth, minWidth
 * }
 */
const Button = forwardRef(function Button(
  {
    children,
    to,                       // internal route (may include /#hash)
    href,                     // external or same-site URL (may include #hash)
    target,
    rel,
    disabled = false,
    className = '',
    style,
    type = 'button',          // for <button>
    onClick,
    styleTokens,              // visual styling from Sanity
    fullWidth = false,
    size = 'md',              // 'sm' | 'md' | 'lg'
    lockSize = true,          // true => enforce SIZE scale (recommended)
    ...props
  },
  ref
) {
  const uid = useId();

  // Theme defaults (colors/borders/shadow)
  const themeDefaults = {
    borderRadius: 28,
    borderWidth: 4,
    textColor: '#212121',
    backgroundColor: '#FFDF5E',
    borderColor: '#212121',
    font: 'Lilita One, system-ui, sans-serif',
    fontWeight: 700,
    boxShadow: '6px 6px 0 rgba(0,0,0,0.12)',
    textShadow: 'none',
  };

  const sz = SIZE[size] || SIZE.md;
  const t = { ...themeDefaults, ...(styleTokens || {}) };

  // If lockSize=true we enforce the scale; otherwise allow Sanity to alter
  const paddingX = lockSize ? sz.paddingX : (t.paddingX ?? sz.paddingX);
  const paddingY = lockSize ? sz.paddingY : (t.paddingY ?? sz.paddingY);
  const fontSizePx = lockSize
    ? sz.fontSize
    : (typeof t.fontSize === 'number'
        ? t.fontSize
        : (t.fontSize ? parseFloat(String(t.fontSize)) : sz.fontSize));
  const minWidth  = lockSize ? sz.minWidth  : (t.minWidth ?? sz.minWidth);
  const minHeight = lockSize
    ? sz.height
    : Math.max(
        sz.height,
        (t.paddingY ?? sz.paddingY) * 2 +
          Math.ceil((typeof t.fontSize === 'number' ? t.fontSize : sz.fontSize) * 1.2)
      );

  const inline = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    boxSizing: 'border-box',

    padding: `${paddingY}px ${paddingX}px`,
    borderRadius: `${t.borderRadius}px`,
    borderWidth: `${t.borderWidth}px`,
    borderStyle: 'solid',

    color: hx(t.textColor) || themeDefaults.textColor,
    backgroundColor: hx(t.backgroundColor) || themeDefaults.backgroundColor,
    borderColor: hx(t.borderColor) || themeDefaults.borderColor,

    fontFamily: t.font,
    fontWeight: t.fontWeight,
    fontSize: `${fontSizePx}px`,
    lineHeight: 1,

    textDecoration: 'none',
    boxShadow: t.boxShadow,
    textShadow: t.textShadow,

    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    width: fullWidth ? '100%' : 'auto',
    maxWidth: t.maxWidth ? `${t.maxWidth}px` : undefined,
    minWidth,
    minHeight,

    cursor: disabled ? 'not-allowed' : 'pointer',
    pointerEvents: disabled ? 'none' : undefined,
    opacity: disabled ? 0.6 : undefined,

    ...style,
  };

  const classes = [
    'btn',
    fullWidth ? 'btn--block' : '',
    disabled ? 'btn--disabled' : '',
    className,
  ].filter(Boolean).join(' ');

  const safeOnClick = (e) => {
    if (disabled) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    onClick?.(e);
  };

  const commonProps = {
    ref,
    className: classes,
    style: inline,
    'data-btn-id': uid,
    'aria-disabled': disabled || undefined,
    tabIndex: disabled ? -1 : undefined,
    onClick: safeOnClick,
    ...props,
  };

  if (to) {
    const internalPath = typeof to === 'string' && !to.startsWith('/') ? `/${to}` : to;
    return <Link to={internalPath} target={target} {...commonProps}>{children}</Link>;
  }

  if (href) {
    const isNewTab = target === '_blank';
    const safeRel = isNewTab ? rel || 'noopener noreferrer' : rel;
    return <a href={href} target={target} rel={safeRel} {...commonProps}>{children}</a>;
  }

  return <button type={type} disabled={disabled} {...commonProps}>{children}</button>;
});

export default Button;

// src/components/AboutSection.js
import React from 'react';
import './AboutSection.css';
import {PortableText} from '@portabletext/react';
// add this near the top (inside the file, outside the component):
const color = (v) => (v && typeof v === 'object' && 'hex' in v ? v.hex : v);
function AboutSection({ data }) {
  
  if (!data) return null;

  const {
    heading,
    content,
    image,
    imageAlt,

    // layout
    layout = 'image-right',
    maxWidth = 700,
    sectionPaddingY = 35,
    sectionPaddingX = 20,

    // styling
    sectionBg,
    boxBg,
    boxPaddingY = 25,
    boxPaddingX = 35,
    boxBorderWidth = 3,
    boxBorderStyle = 'dashed',
    boxBorderColor,

    // heading
    headingColor,
    headingStrokeColor,
    headingStrokeWidth = 2,
    headingFontFamily = 'Lilita One',
    headingFontSize = 2.5, // em
    headingLetterSpacing = 0.5, // px
    headingTextShadow = '2px 2px 0px rgba(0,0,0,0.1)',

    // decor blobs
    blob1Color,
    blob1BorderColor,
    blob1Opacity = 0.6,
    blob2Color,
    blob2BorderColor,
    blob2Opacity = 0.7,

    // tape
    tapeBg,
    tapeBorderColor,
    tapeSize,
    // image styling
    imageBg,
    imageBorderColor,
    imageBorderWidth = 4,
    imageBorderRadius = 20,
    imageShadowColor,
    imageShadowOffset,
    imageShadowBlur = 0,
    imageWidthPct = 70,
    imageMaxWidth = 300,
    imageMarginTop = 20,
    imageMarginBottom = 10,
  } = data;

  const styleVars = {
    '--about-section-padding-y': `${sectionPaddingY || 35}px`,
    '--about-section-padding-x': `${sectionPaddingX || 20}px`,
    '--about-max-width': `${maxWidth || 700}px`,
  
    // backgrounds & box
    '--about-section-bg': color(sectionBg) || '#7cb342',
    '--about-box-bg': color(boxBg) || '#fffbeb',
    '--about-box-padding-y': `${boxPaddingY}px`,
    '--about-box-padding-x': `${boxPaddingX}px`,
    '--about-box-border-width': `${boxBorderWidth}px`,
    '--about-box-border-style': boxBorderStyle || 'dashed',
    '--about-box-border-color': color(boxBorderColor) || '#212121',
  
    // heading
    '--about-heading-color': color(headingColor) || '#fb8c00',
    '--about-heading-stroke-color': color(headingStrokeColor) || '#212121',
    '--about-heading-stroke-width': `${headingStrokeWidth}px`,
    '--about-heading-font': headingFontFamily || 'Lilita One',
    '--about-heading-font-size': `${headingFontSize}em`,
    '--about-heading-letter-spacing': `${headingLetterSpacing}px`,
    '--about-heading-text-shadow': headingTextShadow || '2px 2px 0px rgba(0,0,0,0.1)',
  
    // decor blobs
    '--about-blob1-bg': color(blob1Color) || '#A8E063',
    '--about-blob1-border': color(blob1BorderColor) || '#212121',
    '--about-blob1-opacity': blob1Opacity,
    '--about-blob2-bg': color(blob2Color) || '#87CEEB',
    '--about-blob2-border': color(blob2BorderColor) || '#212121',
    '--about-blob2-opacity': blob2Opacity,
  
    // tape
    '--about-tape-bg': color(tapeBg) || 'rgba(160, 210, 235, 0.6)',
    '--about-tape-border': color(tapeBorderColor) || 'rgba(0, 0, 0, 0.15)',
    '--about-tape-width': `${tapeSize?.width || 70}px`,
    '--about-tape-height': `${tapeSize?.height || 30}px`,
  
    // image/frame
    '--about-img-bg': color(imageBg) || '#fffbeb',
    '--about-img-border-color': color(imageBorderColor) || '#212121',
    '--about-img-border-width': `${imageBorderWidth}px`,
    '--about-img-border-radius': `${imageBorderRadius}px`,
    '--about-img-shadow-color': color(imageShadowColor) || '#fb8c00',
    '--about-img-shadow-x': `${imageShadowOffset?.x ?? 6}px`,
    '--about-img-shadow-y': `${imageShadowOffset?.y ?? 6}px`,
    '--about-img-shadow-blur': `${imageShadowBlur}px`,
    '--about-img-width-pct': `${imageWidthPct}%`,
    '--about-img-max-width': `${imageMaxWidth}px`,
    '--about-img-mt': `${imageMarginTop}px`,
    '--about-img-mb': `${imageMarginBottom}px`,
  };

  // Simple text fallback if PortableText isn’t available or blocks are plain
  const renderContent = () => {
    if (Array.isArray(content)) {
      try {
        return <PortableText value={content} />
      } catch {
        const text = content
          .flatMap((block) => (block?.children || []).map((c) => c.text))
          .join(' ');
        return <p>{text}</p>;
      }
    }
    if (typeof content === 'string') return <p>{content}</p>;
    return null;
  };

  return (
    <section
      id="about"
      className={`about-section layout-${layout}`}
      style={styleVars}
      aria-label="About"
    >
      <div className="bordered-box" style={{ maxWidth: 'var(--about-max-width)' }}>
        <h2 className="about-heading">{heading}</h2>
        {renderContent()}

        <div className="illustration-placeholder about-illustration">
          {image?.asset?.url && (
            <img
              src={image.asset.url}
              alt={imageAlt || 'About illustration'}
              className="illustration-image"
              loading="lazy"
              decoding="async"
            />
          )}
        </div>
      </div>
    </section>
  );
}

export default AboutSection;

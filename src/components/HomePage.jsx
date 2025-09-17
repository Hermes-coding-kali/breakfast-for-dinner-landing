// components/HomePage.jsx
import React, { Suspense, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import sanityClient from '../sanityClient';
import Section from './Section';

const HOME_PAGE_QUERY = /* groq */ `
*[_type == "page" && slug.current == "home"][0]{
  _id,
  title,
  pageBuilder[]{
    _key,
    _type,

    // ... (no changes to other section types)
    _type == "heroSection" => {
      eyebrow,
      titleLine1,
      titleLine2,
      titleLine3,
      subtitle,
      alignment,
      imagePosition,
      headingLevel,
      "image": image{asset->{url, metadata{dimensions{width,height}}}},
      imageAlt,
      buttons[]{
        _key,
        label,
        "style": style->{
          paddingX, paddingY, borderRadius, borderWidth,
          "textColor": textColor.hex,
          "backgroundColor": backgroundColor.hex,
          "borderColor": borderColor.hex,
          font, fontWeight, fontSize, boxShadow, textShadow
        },
        "override": override{
          paddingX, paddingY, borderRadius, borderWidth,
          "textColor": textColor.hex,
          "backgroundColor": backgroundColor.hex,
          "borderColor": borderColor.hex,
          font, fontWeight, fontSize, boxShadow, textShadow
        },  
        "link": link{
          "href": select(
            type == "externalUrl" => externalUrl,
            type == "internalPage" && defined(internal->slug.current) => "/" + internal->slug.current,
            type == "homeSection" && defined(homeSectionId) => "#" + homeSectionId
          ),
          type,
          openInNewTab,
          ariaLabel
        }
      },
      backgroundAngle,
      "backgroundColorStart": backgroundColorStart.hex,
      "backgroundColorEnd": backgroundColorEnd.hex,
      overlayOpacity,
      "titleLine1Color": titleLine1Color.hex,
      "titleLine2Color": titleLine2Color.hex,
      "titleLine3Color": titleLine3Color.hex,
      "imageShadowColor": imageShadowColor.hex
    },

    _type == "aboutSection" => {
      heading,
      content,
      "image": image{asset->{url, metadata{dimensions{width,height}}}},
      imageAlt,
      layout,
      maxWidth,
      sectionPaddingY,
      sectionPaddingX,
      "sectionBg": sectionBg.hex,
      "boxBg": boxBg.hex,
      boxPaddingY,
      boxPaddingX,
      boxBorderWidth,
      boxBorderStyle,
      "boxBorderColor": boxBorderColor.hex,
      "headingColor": headingColor.hex,
      "headingStrokeColor": headingStrokeColor.hex,
      headingStrokeWidth,
      headingFontFamily,
      headingFontSize,
      headingLetterSpacing,
      headingTextShadow,
      "blob1Color": blob1Color.hex,
      "blob1BorderColor": blob1BorderColor.hex,
      blob1Opacity,
      "blob2Color": blob2Color.hex,
      "blob2BorderColor": blob2BorderColor.hex,
      blob2Opacity,
      "tapeBg": tapeBg.hex,
      "tapeBorderColor": tapeBorderColor.hex,
      tapeSize,
      "imageBg": imageBg.hex,
      "imageBorderColor": imageBorderColor.hex,
      imageBorderWidth,
      imageBorderRadius,
      "imageShadowColor": imageShadowColor.hex,
      imageShadowOffset,
      imageShadowBlur,
      imageWidthPct,
      imageMaxWidth,
      imageMarginTop,
      imageMarginBottom
    },

    _type == "featuredItemSection" => {
      _type,
      content{
        eyebrow,
        heading,
        subheading,
        disclaimer,
        product->{
          _id,
          name,
          description,
          slug,
          images,
          "stripePriceId": stripe.stripePriceId
        }
      },
      "image": select(
        style->imageSource == "custom" && defined(style->image.asset) =>
          style->image{asset->{url, metadata{dimensions{width,height}}}},
        style->imageSource == "fromProduct" && defined(content.product->images[0].asset) => {
          "asset": content.product->images[0].asset->{url, metadata{dimensions{width,height}}}
        },
        defined(style->image.asset) =>
          style->image{asset->{url, metadata{dimensions{width,height}}}},
        defined(content.product->images[0].asset) => {
          "asset": content.product->images[0].asset->{url, metadata{dimensions{width,height}}}
        },
        null
      ),
      "imageUrl": select(
        style->imageSource == "custom" && defined(style->image.asset) => style->image.asset->url,
        style->imageSource == "fromProduct" && defined(content.product->images[0].asset) => content.product->images[0].asset->url,
        defined(style->image.asset) => style->image.asset->url,
        defined(content.product->images[0].asset) => content.product->images[0].asset->url,
        null
      ),
      "imageAlt": coalesce(style->imageAlt, content.product->name),
      "style": style->{
        alignment, maxWidth, paddingY, paddingX, stackOn,
        cardBg, cardBorderColor, cardBorderWidth, cardBorderStyle,
        cardRadius, cardShadow, titleColor, subtitleColor, textColor,
        patternStyle, patternColor, patternOpacity, patternAngle,
        imageSource, image, imageAlt, imageBg, imageBorderColor, imageBorderWidth,
        imageRadius, imageMaxWidth, imageAspect, imageShadowColor, imageShadowOffset,
        imageShadowBlur, stickerOutlineColor, stickerOutlineWidth, imageTilt,
        tapeEnabled, tapeBg, tapeBorderColor, tapeRotation, tapeSize,
        "image": select(
          imageSource == "custom" && defined(image.asset) =>
            image{asset->{url, metadata{dimensions{width,height}}}},
          imageSource == "fromProduct" && defined(^.content.product->images[0].asset) => {
            "asset": ^.content.product->images[0].asset->{url, metadata{dimensions{width,height}}}
          },
          image
        ),
        "imageUrl": select(
          imageSource == "custom" && defined(image.asset) => image.asset->url,
          imageSource == "fromProduct" && defined(^.content.product->images[0].asset) => ^.content.product->images[0].asset->url,
          image.asset->url
        ),
        "imageAlt": coalesce(imageAlt, ^.content.product->name),
        showPrice, priceStyle, priceBg, priceTextColor, priceBorderColor,
        priceBorderWidth, priceRadius, priceShadow, showCompareAt, showCurrency,
        priceVariant, priceAccentColor,
        primaryButton{ label, action, fullWidth, maxWidth, ariaLabel, link, override, "style": style-> },
        secondaryButton{ label, action, fullWidth, maxWidth, ariaLabel, link, override, "style": style-> }
      }
    },

    _type == "emailSignupSection" => {
      heading,
      subheading,
      privacyNote,
      formName,
      showNameFields,
      firstNamePlaceholder,
      lastNamePlaceholder,
      emailPlaceholder,
      enableHoneypot,
      honeypotFieldName,
      successMessage,
      errorMessage,
      successRedirect,
      paddingY,
      paddingX,
      formMaxWidth,
      inputBorderWidth,
      inputBorderRadius,
      inputPaddingY,
      inputPaddingX,
      inputFontFamily,
      inputFontSize,
      inputInsetShadow,
      formGap,
      "inputBorderColor": inputBorderColor.hex,
      bgAngle,
      "bgColorStart": bgColorStart.hex,
      "bgColorEnd": bgColorEnd.hex,
      headingFontFamily,
      headingFontSize,
      headingLetterSpacing,
      "headingFillColor": headingFillColor.hex,
      "headingStrokeColor": headingStrokeColor.hex,
      headingStrokeWidth,
      headingTextShadow,
      "blobColor": blobColor.hex,
      "blobBorderColor": blobBorderColor.hex,
      blobBorderWidth,
      blobOpacity,
      blobSize,
      blobPosition,
      blobRotation,
      buttonLabel,
      buttonMaxWidth,
      buttonFullWidth,
      "buttonStyle": buttonStyle->,
      "buttonOverride": buttonOverride
    },
    
    _type == "foodSortGameSection" => {
  heading,
  introText,
  instructions,
  startButtonLabel,
  difficulty,
  maxRounds,
  style{
    paddingY, paddingX, bgAngle,
    "bgStart": bgColorStart.hex,
    "bgEnd": bgColorEnd.hex,
    "textColor": textColor.hex,
    "dashColor": dashColor.hex,
    "headingFill": headingFillColor.hex,
    "headingStroke": headingStrokeColor.hex,
    headingStrokeWidth,
    "gameBg": gameAreaBg.hex,
    "gameBorderColor": gameAreaBorderColor.hex,

    // 👇 Backward-compatible renames
    // Prefer new fields; fall back to old ones if present.
    "gameBorderWidth": coalesce(gameBorderWidth, gameAreaBorderWidth),
    "gameRadius": coalesce(gameRadius, gameAreaRadius),

    "gameShadow": gameAreaShadowColor.hex,
    "statsColor": statsColor.hex,
    "feedbackColor": feedbackColor.hex,
    showBlobs,
    "blobColor": blobColor.hex,
    blobOpacity,

    // Buttons
    "startButtonStyle": startButtonStyle->{...},
    "startButtonOverride": startButtonOverride,

    // Newly added per schema update
    "breakfastButtonStyle": breakfastButtonStyle->{...},
    "breakfastButtonOverride": breakfastButtonOverride,
    "dinnerButtonStyle": dinnerButtonStyle->{...},
    "dinnerButtonOverride": dinnerButtonOverride
  }
}
  }
}
`;

export default function HomePage({ offset = 0 }) {
  const location = useLocation();

  const { data: page, isLoading, isError, error } = useQuery({
    queryKey: ['page', 'home'],
    queryFn: async () => sanityClient.fetch(HOME_PAGE_QUERY),
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (isLoading || !page || !location.hash) return;
    const id = location.hash.slice(1);
    const timer = setTimeout(() => {
      const el = document.getElementById(id);
      if (el) {
        const top = Math.max(0, el.getBoundingClientRect().top + window.scrollY - offset);
        window.scrollTo({ top, behavior: 'smooth' });
      }
    }, 150);
    return () => clearTimeout(timer);
  }, [page, isLoading, location.hash, offset]);

  if (isLoading) return <div style={{ padding: '4rem', textAlign: 'center' }}>Loading...</div>;

  if (isError) {
    return (
      <div style={{ padding: '2rem', color: '#b91c1c', background: '#fee2e2', border: '1px solid #fecaca', borderRadius: 8, margin: '2rem' }}>
        <h2>Error Loading Page Content</h2>
        <pre style={{ textAlign: 'left', background: '#fff', padding: '1rem', borderRadius: 4, whiteSpace: 'pre-wrap', wordWrap: 'break-word', fontSize: 12 }}>
          {error?.message || 'An unknown error occurred.'}
        </pre>
      </div>
    );
  }

  if (!page) return <div style={{ padding: '4rem', textAlign: 'center' }}>Page data could not be found.</div>;

  return (
    <Suspense fallback={<div style={{ padding: '4rem', textAlign: 'center' }}>Loading sections…</div>}>
      {page.pageBuilder?.map((section, i) => (
        <Section key={section?._key || `${section?._type}-${i}`} section={section} />
      ))}
    </Suspense>
  );
}
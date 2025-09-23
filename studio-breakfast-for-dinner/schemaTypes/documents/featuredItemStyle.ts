import {defineField, defineType} from 'sanity'
import {TagIcon} from '@sanity/icons'

export default defineType({
  name: 'featuredItemStyle',
  title: 'Featured Item Style',
  type: 'document',
  icon: TagIcon,
  groups: [
    {name: 'layout', title: 'Layout', default: true},
    {name: 'card', title: 'Card'},
    {name: 'image', title: 'Image'},
    {name: 'price', title: 'Price'},
    {name: 'buttons', title: 'Buttons'},
    {name: 'decor', title: 'Decor'},
  ],
  fields: [
    // ---------- LAYOUT ----------
    defineField({
      name: 'alignment', title: 'Content Alignment', type: 'string',
      options: {list: ['left','center','right'], layout: 'radio'},
      description: 'Aligns text, price and buttons inside the card.',
      initialValue: 'center', group: 'layout',
    }),
    defineField({
      name: 'maxWidth', title: 'Max Section Width (px)', type: 'number',
      description: 'Caps the overall width of this section block.',
      initialValue: 800, validation: (r)=>r.min(320), group: 'layout',
    }),
    defineField({ name: 'paddingY', title: 'Vertical Padding (px)', type: 'number', initialValue: 60, validation:(r)=>r.min(0), group:'layout' }),
    defineField({ name: 'paddingX', title: 'Horizontal Padding (px)', type: 'number', initialValue: 20, validation:(r)=>r.min(0), group:'layout' }),
    defineField({
      name: 'stackOn', title: 'Stack Layout At', type: 'string',
      options: {list: ['sm','md','lg'], layout: 'radio'},
      description: 'When the 2-column layout collapses to one column.',
      initialValue: 'md', group: 'layout',
    }),

    // ---------- CARD ----------
    defineField({
      name: 'cardBg', title: 'Card Background', type: 'color', group: 'card',
      description: 'Background color of the product card. Patterns (below) overlay on top of this color.',
      options: { colorList: ['#fffbeb', '#a0d2eb', '#7cb342', '#4fa8e0', '#c0ca33', '#fb8c00', '#8e24aa', '#ffffff'] },
    }),
    defineField({
      name: 'cardBorderColor', title: 'Card Border Color', type: 'color', group: 'card',
      description: 'Color of the card’s outer border. Set “Card Border Width” to 0 to remove the border entirely.',
      options: { colorList: ['#212121', '#8e24aa', '#fb8c00', '#4fa8e0'] },
    }),
    defineField({ name: 'cardBorderWidth', title: 'Card Border Width (px)', type: 'number', initialValue: 3, validation:(r)=>r.min(0), group:'card' }),
    defineField({
      name: 'cardBorderStyle', title: 'Card Border Style', type: 'string', group:'card',
      options: { list: ['solid','dashed'], layout: 'radio' }, initialValue: 'dashed'
    }),
    defineField({ name: 'cardRadius', title: 'Card Border Radius (px)', type: 'number', initialValue: 20, validation:(r)=>r.min(0), group:'card' }),
    defineField({ name: 'cardShadow', title: 'Card Shadow', type: 'string', initialValue: '6px 6px 0 rgba(0,0,0,0.12)', group:'card' }),
    defineField({
      name: 'titleColor', title: 'Product Title Color', type: 'color', group: 'card',
      options: { colorList: ['#212121', '#ffeb3b', '#ffa726', '#ff7043'] },
    }),
    defineField({
      name: 'subtitleColor', title: 'Subtitle/Description Color', type: 'color', group: 'card',
      options: { colorList: ['#212121', '#4fa8e0', '#8e24aa'] },
    }),
    defineField({
      name: 'textColor', title: 'Body Text Color', type: 'color', group: 'card',
      options: { colorList: ['#212121', '#ffffff'] },
    }),
    defineField({
      name: 'patternStyle', title: 'Card Pattern', type: 'string', group: 'card',
      options: { list: ['none','stripes','dots'], layout: 'radio' },
      initialValue: 'stripes',
      description: 'Optional subtle overlay pattern on the card background.'
    }),
    defineField({ name: 'patternColor', title: 'Pattern Color', type: 'color', group: 'card' }),
    defineField({
      name: 'patternOpacity', title: 'Pattern Opacity (0–1)', type: 'number', initialValue: 0.08,
      validation:(r)=>r.min(0).max(1), group: 'card'
    }),
    defineField({ name: 'patternAngle', title: 'Pattern Angle (deg)', type: 'number', initialValue: 45, group:'card' }),

    // ---------- IMAGE ----------
    defineField({
      name: 'imageSource', title: 'Image Source', type: 'string', group:'image',
      options: { list: ['fromProduct','custom'], layout: 'radio' }, initialValue: 'fromProduct',
    }),
    defineField({
      name: 'image', title: 'Custom Image', type: 'image', options:{hotspot:true}, group:'image',
      hidden: ({parent}) => parent?.imageSource !== 'custom'
    }),
    defineField({
      name: 'imageAlt', title: 'Custom Image Alt Text', type: 'string', group: 'image',
      hidden: ({parent}) => parent?.imageSource !== 'custom' || !parent?.image,
      validation: (Rule) => Rule.custom((val, ctx) => {
        if (ctx.parent?.imageSource === 'custom' && ctx.parent?.image && !val) return 'Alt text is required.'
        return true
      }),
    }),
    defineField({
      name: 'imageBg', title: 'Image Background', type: 'color', group: 'image',
      options: { colorList: ['#fffbeb', '#a0d2eb', '#c0ca33', '#fb8c00', '#8e24aa', '#ffffff'] },
    }),
    defineField({
      name: 'imageBorderColor', title: 'Image Border Color', type: 'color', group: 'image',
      options: { colorList: ['#212121', '#8e24aa', '#fb8c00'] },
    }),
    defineField({ name: 'imageBorderWidth', title: 'Image Border Width (px)', type: 'number', initialValue: 4, validation:(r)=>r.min(0), group: 'image' }),
    defineField({ name: 'imageRadius', title: 'Image Border Radius (px)', type: 'number', initialValue: 18, validation:(r)=>r.min(0), group:'image' }),
    defineField({
      name: 'imageAspect', title: 'Image Aspect Ratio', type: 'string', group:'image',
      options: { list: ['auto','1:1','4:3','16:9'], layout: 'radio' }, initialValue: 'auto'
    }),
    defineField({
      name: 'imageShadowColor', title: 'Image Shadow Color', type: 'color', group: 'image',
      options: { colorList: ['#fb8c00', '#ffa726', '#ff7043', '#212121'] },
    }),
    defineField({
      name: 'imageShadowOffset', title: 'Image Shadow Offset (px)', type: 'object', group: 'image',
      fields: [
        defineField({name:'x', title:'X', type:'number', initialValue: 6}),
        defineField({name:'y', title:'Y', type:'number', initialValue: 6}),
      ]
    }),
    defineField({ name: 'imageShadowBlur', title: 'Image Shadow Blur (px)', type: 'number', initialValue: 0, validation:(r)=>r.min(0), group:'image' }),
    defineField({ name: 'stickerOutlineColor', title: 'Sticker Outline Color', type: 'color', group:'image' }),
    defineField({ name: 'stickerOutlineWidth', title: 'Sticker Outline Width (px)', type: 'number', initialValue: 10, group:'image' }),
    defineField({ name: 'imageTilt', title: 'Image Tilt (deg)', type: 'number', initialValue: -2, group:'image' }),
    defineField({ name: 'tapeEnabled', title: 'Show Tape Corners', type: 'boolean', initialValue: true, group:'image' }),
    defineField({ name: 'tapeBg', title: 'Tape Background', type: 'color', group:'image' }),
    defineField({ name: 'tapeBorderColor', title: 'Tape Border', type: 'color', group:'image' }),
    defineField({ name: 'tapeRotation', title: 'Tape Rotation (deg)', type: 'number', initialValue: -12, group:'image' }),
    defineField({
      name: 'tapeSize', title: 'Tape Size (px)', type: 'object', group:'image',
      fields: [
        defineField({name:'w', title:'Width', type:'number', initialValue: 80}),
        defineField({name:'h', title:'Height', type:'number', initialValue: 22}),
      ],
    }),

    // ---------- PRICE ----------
    defineField({ name: 'showPrice', title: 'Show Price', type: 'boolean', initialValue: true, group:'price' }),
    defineField({
      name: 'priceStyle', title: 'Price Style', type: 'string', group:'price',
      options: { list: ['badge','inline'], layout: 'radio' }, initialValue: 'badge'
    }),
    defineField({
      name: 'priceBg', title: 'Price Badge Background', type: 'color', group:'price',
      hidden: ({parent}) => parent?.priceStyle !== 'badge',
      options: { colorList: ['#ffeb3b', '#ffa726', '#ff7043', '#8e24aa', '#4fa8e0', '#212121', '#ffffff'] },
    }),
    defineField({
      name: 'priceTextColor', title: 'Price Text Color', type: 'color', group:'price',
      options: { colorList: ['#212121', '#ffffff'] },
    }),
    defineField({
      name: 'priceBorderColor', title: 'Price Badge Border Color', type: 'color', group:'price',
      hidden: ({parent}) => parent?.priceStyle !== 'badge',
      options: { colorList: ['#212121', '#8e24aa', '#fb8c00'] },
    }),
    defineField({
      name: 'priceBorderWidth', title: 'Price Badge Border Width (px)', type: 'number',
      initialValue: 3, validation:(r)=>r.min(0), hidden: ({parent}) => parent?.priceStyle !== 'badge', group:'price'
    }),
    defineField({
      name: 'priceRadius', title: 'Price Badge Radius (px)', type: 'number',
      initialValue: 14, validation:(r)=>r.min(0), hidden: ({parent}) => parent?.priceStyle !== 'badge', group:'price'
    }),
    defineField({
      name: 'priceShadow', title: 'Price Badge Shadow', type: 'string',
      initialValue: '3px 3px 0 rgba(0,0,0,0.12)', hidden: ({parent}) => parent?.priceStyle !== 'badge', group:'price'
    }),
    defineField({ name: 'showCompareAt', title: 'Show Compare At Price', type: 'boolean', initialValue: false, group:'price' }),
    defineField({ name: 'showCurrency', title: 'Show Currency Code/Symbol', type: 'boolean', initialValue: true, group:'price' }),
    defineField({
      name: 'priceVariant', title: 'Price Variant', type: 'string', group:'price',
      options: { list: ['pill','burst','tag'], layout: 'radio' }, initialValue: 'pill'
    }),
    defineField({
      name: 'priceAccentColor', title: 'Price Accent (tag eyelet)', type: 'color', group:'price',
      hidden: ({parent}) => parent?.priceVariant !== 'tag'
    }),

    // ---------- BUTTONS ----------
    defineField({
      name: 'primaryButton', title: 'Primary Button (Buy Now)', type: 'featuredButton', group:'buttons',
      initialValue: { label: 'Buy Now', action: 'buyNow', fullWidth: true, maxWidth: 320 }
    }),
    defineField({
      name: 'secondaryButton', title: 'Secondary Button (Add to Cart)', type: 'featuredButton', group:'buttons',
      initialValue: { label: 'Add to Cart', action: 'addToCart', fullWidth: true, maxWidth: 320 }
    }),

    // ---------- DECOR (reserved) ----------
    defineField({
      name: 'blobColor', title: 'Blob Color', type: 'color', group:'decor',
      options: { colorList: ['#a0d2eb', '#c0ca33', '#fb8c00', '#8e24aa'] },
    }),
    defineField({
      name: 'blobBorderColor', title: 'Blob Border Color', type: 'color', group:'decor',
      options: { colorList: ['#212121'] },
    }),
    defineField({
      name: 'blobOpacity', title: 'Blob Opacity (0–1)', type: 'number',
      initialValue: 0.7, validation:(r)=>r.min(0).max(1), group:'decor'
    }),
    defineField({ name: 'blobBorderWidth', title: 'Blob Border Width (px)', type: 'number', initialValue: 3, validation:(r)=>r.min(0), group:'decor' }),
    defineField({
      name: 'blobSize', title: 'Blob Size (px)', type: 'object', group:'decor',
      fields: [
        defineField({name:'width', title:'Width', type:'number', initialValue: 60}),
        defineField({name:'height', title:'Height', type:'number', initialValue: 60}),
      ],
    }),
    defineField({
      name: 'blobPosition', title: 'Blob Position (%)', type: 'object', group:'decor',
      fields: [
        defineField({name:'top', title:'Top', type:'number', initialValue: 10}),
        defineField({name:'right', title:'Right', type:'number', initialValue: 10}),
      ],
    }),
    defineField({ name: 'blobRotation', title: 'Blob Rotation (deg)', type: 'number', initialValue: -25, group:'decor' }),
  ],
  preview: {
    select: { alignment: 'alignment', style: 'priceStyle' },
    prepare({alignment, style}) {
      return { title: 'Featured Item Style', subtitle: `align: ${alignment || 'center'} · price: ${style || 'badge'}` }
    }
  }
})

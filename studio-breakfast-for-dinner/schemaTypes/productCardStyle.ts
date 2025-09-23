// // schemaTypes/productCardStyle.ts
// import {defineType, defineField} from 'sanity'

// export default defineType({
//   name: 'productCardStyle',
//   title: 'Product Card Style',
//   type: 'document',
//   groups: [
//     {name: 'card', title: 'Card'},
//     {name: 'image', title: 'Image'},
//     {name: 'type', title: 'Typography'},
//     {name: 'button', title: 'Buttons'},
//     {name: 'a11y', title: 'A11y & Palette'},
//   ],
//   fields: [
//     // -------------------------------------------------------
//     // Title field FIRST so Studio uses this as the doc title
//     // -------------------------------------------------------
//     defineField({
//       name: 'name',
//       title: 'Style Name',
//       type: 'string',
//       initialValue: 'Default Card Style',
//       validation: (Rule) => Rule.required(),
//     }),

//     // --- Card ---
//     defineField({
//       name: 'cardBg', title: 'Card Background', type: 'color', group: 'card',
//       options: { colorList: ['#fcfaf5', '#ffffff', '#a0d2eb', '#fffbeb', '#212121'] },
//     }),
//     defineField({
//       name: 'cardBorderColor', title: 'Card Border Color', type: 'color', group: 'card',
//       options: { colorList: ['#212121', '#8e24aa', '#fb8c00', '#1976d2', '#ffffff'] },
//     }),
//     defineField({ name: 'cardBorderWidth', title: 'Card Border Width (px)', type: 'number', group: 'card', initialValue: 4 }),
//     defineField({ name: 'cardRadius', title: 'Card Corner Radius (px)', type: 'number', group: 'card', initialValue: 16 }),
//     defineField({ name: 'cardShadow', title: 'Card Shadow (CSS)', type: 'string', group: 'card', initialValue: '0 8px 16px rgba(0,0,0,0.07)' }),

//     // --- Image ---
//     defineField({
//       name: 'imageBg', title: 'Image Background', type: 'color', group: 'image',
//       options: { colorList: ['#fffbeb', '#a0d2eb', '#c0ca33', '#fb8c00', '#8e24aa', '#ffffff'] },
//     }),
//     defineField({
//       name: 'imageBorderColor', title: 'Image Border Color', type: 'color', group: 'image',
//       options: { colorList: ['#212121', '#8e24aa', '#1976d2', '#ffffff'] },
//     }),
//     defineField({ name: 'imageBorderWidth', title: 'Image Border Width (px)', type: 'number', group: 'image', initialValue: 4 }),
//     defineField({ name: 'imageRadius', title: 'Image Corner Radius (px)', type: 'number', group: 'image', initialValue: 12 }),
//     defineField({
//       name: 'imageShadowColor', title: 'Image Shadow Color', type: 'color', group: 'image',
//       options: { colorList: ['#8e24aa', '#1976d2', '#fb8c00', '#212121'] },
//     }),
//     defineField({ name: 'imageShadowBlur', title: 'Image Shadow Blur (px)', type: 'number', group: 'image', initialValue: 0 }),
//     defineField({
//       name: 'imageShadowOffset', title: 'Image Shadow Offset', type: 'object', group: 'image',
//       fields: [
//         defineField({name: 'x', title: 'X (px)', type: 'number', initialValue: 6}),
//         defineField({name: 'y', title: 'Y (px)', type: 'number', initialValue: 6}),
//       ],
//       initialValue: {x: 6, y: 6},
//     }),
//     defineField({
//       name: 'imageAspect', title: 'Image Aspect', type: 'string', group: 'image',
//       options: {
//         list: [
//           {title: '3:4 (tall)', value: '3:4'},
//           {title: '4:5 (portrait)', value: '4:5'},
//           {title: '1:1 (square)', value: '1:1'},
//           {title: '16:9 (wide)', value: '16:9'},
//           {title: 'Auto', value: 'auto'},
//         ],
//         layout: 'radio',
//       },
//       initialValue: '4:5',
//     }),

//     // --- Typography ---
//     defineField({ name: 'titleFont', title: 'Title Font Stack', type: 'string', group: 'type', initialValue: "'Lilita One', cursive" }),
//     defineField({
//       name: 'titleColor', title: 'Title Color', type: 'color', group: 'type',
//       options: { colorList: ['#8e24aa', '#fb8c00', '#1976d2', '#ffeb3b', '#212121', '#ffffff'] },
//     }),
//     defineField({
//       name: 'titleStrokeColor', title: 'Title Stroke Color', type: 'color', group: 'type',
//       options: { colorList: ['#212121', '#ffffff', '#8e24aa'] },
//     }),
//     defineField({ name: 'titleStrokeWidth', title: 'Title Stroke Width (px)', type: 'number', group: 'type', initialValue: 0.5 }),
//     defineField({ name: 'titleShadow', title: 'Title Shadow (CSS)', type: 'string', group: 'type', initialValue: '1px 1px 0 rgba(0,0,0,0.06)' }),
//     defineField({ name: 'priceFont', title: 'Price Font Stack', type: 'string', group: 'type', initialValue: "'Baloo 2', cursive" }),
//     defineField({
//       name: 'priceTextColor', title: 'Price Text Color', type: 'color', group: 'type',
//       options: { colorList: ['#212121', '#8e24aa', '#1976d2', '#ffffff'] },
//     }),
//     defineField({
//       name: 'priceBadgeBg', title: 'Price Badge Background', type: 'color', group: 'type',
//       options: { colorList: ['#ffeb3b', '#fb8c00', '#a0d2eb', '#ffffff', '#212121'] },
//     }),
//     defineField({ name: 'priceBadgeRadius', title: 'Price Badge Radius (px)', type: 'number', group: 'type', initialValue: 0 }),
//     defineField({ name: 'priceBadgePadding', title: 'Price Badge Padding (px)', type: 'number', group: 'type', initialValue: 0 }),

//     // --- Buttons ---
//     defineField({
//       name: 'buttonBg', title: 'Button Background', type: 'color', group: 'button',
//       options: { colorList: ['#fb8c00', '#1976d2', '#8e24aa', '#c0ca33', '#212121', '#ffffff'] },
//     }),
//     defineField({
//       name: 'buttonTextColor', title: 'Button Text Color', type: 'color', group: 'button',
//       options: { colorList: ['#212121', '#ffffff', '#ffeb3b'] },
//     }),
//     defineField({
//       name: 'buttonBorderColor', title: 'Button Border Color', type: 'color', group: 'button',
//       options: { colorList: ['#212121', '#ffffff', '#8e24aa', '#1976d2'] },
//     }),
//     defineField({ name: 'buttonRadius', title: 'Button Corner Radius (px)', type: 'number', group: 'button', initialValue: 12 }),
//     defineField({ name: 'buttonShadow', title: 'Button Shadow (CSS)', type: 'string', group: 'button', initialValue: '0 2px 0 rgba(0,0,0,0.12)' }),

//     // --- A11y & Palette ---
//     defineField({
//       name: 'focusRing', title: 'Focus Ring', type: 'color', group: 'a11y',
//       options: { colorList: ['#1976d2', '#fb8c00', '#8e24aa', '#212121', '#ffffff'] },
//     }),
//     defineField({
//       name: 'palette',
//       title: 'Accent Palette (playful aura, highlights)',
//       type: 'object',
//       group: 'a11y',
//       options: {collapsible: true},
//       fields: [
//         defineField({
//           name: 'accent1', title: 'Accent 1', type: 'color',
//           options: { colorList: ['#ff9ec4', '#a0d2eb', '#ffeb3b', '#c0ca33', '#ffffff'] },
//         }),
//         defineField({
//           name: 'accent2', title: 'Accent 2', type: 'color',
//           options: { colorList: ['#9be7d9', '#4fa8e0', '#1976d2', '#8e24aa', '#ffffff'] },
//         }),
//         defineField({
//           name: 'accent3', title: 'Accent 3', type: 'color',
//           options: { colorList: ['#ffe08a', '#ffa726', '#fb8c00', '#ff7043', '#ffffff'] },
//         }),
//         defineField({
//           name: 'accent4', title: 'Accent 4', type: 'color',
//           options: { colorList: ['#c7b5ff', '#8e24aa', '#1976d2', '#a0d2eb', '#ffffff'] },
//         }),
//       ],
//     }),
//   ],
//   preview: {
//     select: {
//       title: 'name',
//       bg: 'cardBg.hex',
//       border: 'cardBorderColor.hex',
//     },
//     prepare({ title, bg, border }) {
//       const subtitle = [bg && `BG ${bg}`, border && `Border ${border}`]
//         .filter(Boolean)
//         .join(' • ')
//       return { title: title || 'Product Card Style', subtitle: subtitle || undefined }
//     },
//   },
// })

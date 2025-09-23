// schemaTypes/storePage.ts
import {defineField, defineType} from 'sanity'
import {PackageIcon} from '@sanity/icons'

// Chic, muted palette tiles you like to keep handy
const PALETTE = [
  '#0f172a', // ink
  '#1f2937', // charcoal
  '#334155', // slate
  '#e5e7eb', // mist
  '#f5f5f4', // linen
  '#fafaf9', // ivory
  '#d1b48c', // gold-accent
  '#ffffff', // white
]

// Helper: build a color field where the FIRST swatch is the intended default for THIS item
const colorField = (name: string, title: string, first: string, desc?: string) =>
  defineField({
    name,
    title,
    type: 'color',
    description: desc,
    options: {
      disableAlpha: true,
      // Keep `first` as the first tile; dedupe if `first` is already in PALETTE
      colorList: Array.from(new Set([first, ...PALETTE])),
    },
  })

export default defineType({
  name: 'storePage',
  title: 'Store Page Settings',
  type: 'document',
  icon: PackageIcon,
  fields: [
    defineField({
      name: 'title',
      title: 'Page Title',
      type: 'string',
      description: 'The main heading displayed at the top of the store page.',
      validation: (Rule) => Rule.required(),
      initialValue: 'The Collection',
    }),

    defineField({
      name: 'styling',
      title: 'Styling Options',
      type: 'object',
      options: {collapsible: true, collapsed: false},
      fields: [
        // --- Page Layout & Background ---
        defineField({
          name: 'paddingTop',
          title: 'Top Padding (px)',
          description: 'Space above the main title.',
          type: 'number',
          initialValue: 96,
        }),
        defineField({ name: 'paddingY', title: 'Vertical Padding (px)', type: 'number', initialValue: 72 }),
        defineField({ name: 'paddingX', title: 'Horizontal Padding (px)', type: 'number', initialValue: 32 }),
        defineField({
          name: 'gridGap',
          title: 'Grid Gap (px)',
          description: 'The space between product cards.',
          type: 'number',
          initialValue: 28,
        }),

        // Color pickers — FIRST tile is the “default” (no initialValue on color fields)
        colorField('backgroundColor', 'Page Background Color', '#fafaf9'),           // ivory first
        colorField('patternColor', 'Background Pattern Color', '#f5f5f4'),           // linen first
        colorField('patternColorDarker', 'Darker Pattern Color', '#e5e7eb'),         // mist first
        defineField({
          name: 'useBackgroundPattern',
          title: 'Use Subtle Background Pattern',
          type: 'boolean',
          initialValue: false,
          description: 'Keeps things minimal by default.',
        }),

        // --- Title Styling ---
        defineField({
          name: 'titleFont',
          title: 'Title Font',
          type: 'string',
          options: {
            list: [
              'Playfair Display',
              'Cormorant Garamond',
              'Inter',
              'General Sans',
              'Poppins',
            ],
          },
          initialValue: 'Playfair Display',
        }),
        defineField({ name: 'titleFontSize', title: 'Title Font Size (em)', type: 'number', initialValue: 3.6 }),
        colorField('titleColor', 'Title Text Color', '#0f172a'),                     // ink first
        colorField('titleStrokeColor', 'Title Stroke Color', '#ffffff'),

        // --- Animated Shadow Colors (subtle cycle) ---
        defineField({
          name: 'animatedShadowColors',
          title: 'Animated Shadow Colors',
          description: 'The title shadow cycles very subtly through these tones.',
          type: 'object',
          fields: [
            colorField('color1', 'Shadow Color 1', '#1f2937'), // charcoal
            colorField('color2', 'Shadow Color 2', '#334155'), // slate
            colorField('color3', 'Shadow Color 3', '#0f172a'), // ink
            colorField('color4', 'Shadow Color 4', '#d1b48c'), // tasteful accent
          ],
        }),
        defineField({
          name: 'titleShadowIntensity',
          title: 'Title Shadow Intensity (0–1)',
          type: 'number',
          initialValue: 0.15,
          validation: (r) => r.min(0).max(1),
        }),

        // --- Product Card Style for the Official Store ---
        // Use the lighter Featured Item Style doc instead of productCardStyle
        defineField({
          name: 'featuredItemStyle',
          title: 'Featured Item Style',
          description: 'Style preset applied to product cards on this page.',
          type: 'reference',
          to: [{type: 'featuredItemStyle'}],
        }),
      ],
    }),
  ],
  preview: {
    prepare() {
      return { title: 'Store Page Settings' }
    },
  },
})

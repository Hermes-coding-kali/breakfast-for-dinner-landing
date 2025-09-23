// schemaTypes/designSystem.ts
import {defineField, defineType} from 'sanity'
import {ColorWheelIcon} from '@sanity/icons'

// Use plain HEX strings (the format you confirmed works)
const BRAND_COLORS = [
  '#8e24aa', // Pants Purple
  '#fb8c00', // Dino Orange
  '#212121', // Text Dark
  '#ffffff', // White
  '#ffeb3b', // Title Yellow
  '#ffa726', // Title Orange
  '#ff7043', // Title Red-Orange
  '#2196f3', // Sky Blue 1
  '#42a5f5', // Sky Blue 2
]

export default defineType({
  name: 'designSystem',
  title: 'Design System',
  type: 'document',
  icon: ColorWheelIcon,
  groups: [
    {name: 'colors', title: 'Color Palette', default: true},
    {name: 'typography', title: 'Typography'},
    {name: 'buttons', title: 'Button Styles'},
  ],
  fields: [
    // --- COLOR PALETTE ---
    defineField({
      name: 'colors',
      title: 'Color Palette',
      type: 'array',
      group: 'colors',
      description:
        'Create brand color “tokens” the site can reuse (e.g., “Brand Purple”, “Text Dark”).',
      of: [
        {
          type: 'object',
          name: 'colorToken',
          fields: [
            defineField({
              name: 'name',
              title: 'Color Token Name',
              description: 'A friendly name (e.g., “Brand Purple”, “Accent Orange”).',
              type: 'string',
              validation: (Rule) => Rule.required().min(2).max(40),
            }),
            defineField({
              name: 'value',
              title: 'Pick Color',
              description: 'Choose from your brand colors (you can still pick a custom color).',
              type: 'color',
              options: {
                disableAlpha: true,
                colorList: BRAND_COLORS, // <- string array (works)
              },
              validation: (Rule) => Rule.required(),
            }),
          ],
          preview: {
            select: {title: 'name', subtitle: 'value.hex'},
          },
        },
      ],
      validation: (Rule) => Rule.min(1),
    }),

    // --- TYPOGRAPHY ---
    defineField({
      name: 'typography',
      title: 'Typography',
      type: 'array',
      group: 'typography',
      description: 'Define reusable text styles used across the site.',
      of: [
        {
          type: 'object',
          name: 'textStyle',
          fields: [
            defineField({
              name: 'name',
              title: 'Style Name',
              description: 'e.g., “Page Heading”, “Body Paragraph”, “Button Label”.',
              type: 'string',
              validation: (Rule) => Rule.required().min(2).max(40),
            }),
            defineField({
              name: 'font',
              title: 'Font Family',
              description: 'Choose from the available brand fonts.',
              type: 'string',
              options: { list: ['Lilita One', 'Baloo 2', 'Poppins', 'Patrick Hand'] },
            }),
            defineField({
              name: 'fontWeight',
              title: 'Font Weight',
              description: 'How bold the text should be (100–900). 400 = normal, 700 = bold.',
              type: 'number',
              validation: (Rule) => Rule.min(100).max(900),
            }),
            defineField({
              name: 'fontSize',
              title: 'Font Size (rem)',
              description: 'e.g., 1, 1.25, 2 (1rem is usually 16px).',
              type: 'number',
              validation: (Rule) => Rule.positive(),
            }),
            defineField({
              name: 'lineHeight',
              title: 'Line Height',
              description: 'Unitless multiplier (e.g., 1.2).',
              type: 'number',
              validation: (Rule) => Rule.positive(),
            }),
            defineField({
              name: 'letterSpacing',
              title: 'Letter Spacing (em)',
              description: 'Optional spacing between letters, in ems.',
              type: 'number',
            }),
          ],
          preview: {
            select: {title: 'name', font: 'font', size: 'fontSize'},
            prepare({title, font, size}) {
              return {
                title,
                subtitle: [font, size ? `${size}rem` : ''].filter(Boolean).join(' | '),
              }
            },
          },
        },
      ],
    }),

    // --- BUTTONS ---
    defineField({
      name: 'buttons',
      title: 'Button Styles',
      type: 'array',
      group: 'buttons',
      description:
        'Define reusable button styles (e.g., “Primary”, “Secondary”). These control spacing, corners, and colors.',
      of: [
        {
          type: 'object',
          name: 'buttonStyle',
          fields: [
            defineField({
              name: 'name',
              title: 'Button Style Name',
              description: 'Give this style a clear name (e.g., “Primary”, “Secondary”).',
              type: 'string',
              validation: (Rule) => Rule.required().min(2).max(40),
            }),
            defineField({
              name: 'paddingX',
              title: 'Horizontal Padding (px)',
              description: 'Space inside the button on the left and right.',
              type: 'number',
              validation: (Rule) => Rule.min(0),
            }),
            defineField({
              name: 'paddingY',
              title: 'Vertical Padding (px)',
              description: 'Space inside the button on the top and bottom.',
              type: 'number',
              validation: (Rule) => Rule.min(0),
            }),
            defineField({
              name: 'borderRadius',
              title: 'Corner Roundness (px)',
              description: '0 = square; higher numbers = more rounded.',
              type: 'number',
              validation: (Rule) => Rule.min(0),
            }),
            defineField({
              name: 'borderWidth',
              title: 'Border Thickness (px)',
              description: 'Outline thickness. Set 0 for no border.',
              type: 'number',
              validation: (Rule) => Rule.min(0),
            }),
            // Colors with the same brand list (string array)
            defineField({
              name: 'textColor',
              title: 'Text Color',
              description: 'Color of the label text.',
              type: 'color',
              options: {
                disableAlpha: true,
                colorList: BRAND_COLORS,
              },
            }),
            defineField({
              name: 'backgroundColor',
              title: 'Background Color',
              description: 'Fill color behind the text.',
              type: 'color',
              options: {
                disableAlpha: true,
                colorList: BRAND_COLORS,
              },
            }),
            defineField({
              name: 'borderColor',
              title: 'Border Color',
              description: 'Outline color (when Border Thickness > 0).',
              type: 'color',
              options: {
                disableAlpha: true,
                colorList: BRAND_COLORS,
              },
            }),
          ],
          preview: { select: {title: 'name'} },
        },
      ],
    }),
  ],
  preview: {
    prepare() {
      return {title: 'Design System'}
    },
  },
})

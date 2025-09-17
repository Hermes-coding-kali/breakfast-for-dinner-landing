// schemaTypes/buttonStyle.ts
import {defineField, defineType} from 'sanity'
import {TagIcon} from '@sanity/icons'

export default defineType({
  name: 'buttonStyle',
  title: 'Button Style',
  type: 'document',
  icon: TagIcon,
  fields: [
    defineField({
      name: 'name',
      title: 'Style Name',
      description: 'Give this style a name like “Primary” or “Secondary” so you can reuse it.',
      type: 'string',
      validation: (Rule) => Rule.required().min(2).max(40),
      initialValue: 'Primary',
    }),

    // --- Typography ---
    defineField({
      name: 'font',
      title: 'Font Family',
      description: 'Font used for the button label.',
      type: 'string',
      options: { list: ['Lilita One', 'Baloo 2', 'Poppins', 'Patrick Hand'] },
      initialValue: 'Baloo 2',
    }),
    defineField({
      name: 'fontSize',
      title: 'Font Size (rem)',
      description: 'Base font size in rem (e.g., 1.25 = 20px if root is 16px).',
      type: 'number',
      initialValue: 1.25,
    }),
    defineField({
      name: 'fontWeight',
      title: 'Font Weight',
      description: 'Boldness of the button text (100–900).',
      type: 'number',
      initialValue: 700,
      validation: (Rule) => Rule.min(100).max(900),
    }),

    // --- Sizing & Spacing ---
    defineField({
      name: 'paddingX',
      title: 'Horizontal Padding (px)',
      description: 'Space left/right inside the button.',
      type: 'number',
      initialValue: 30,
    }),
    defineField({
      name: 'paddingY',
      title: 'Vertical Padding (px)',
      description: 'Space top/bottom inside the button.',
      type: 'number',
      initialValue: 15,
    }),
    defineField({
      name: 'borderRadius',
      title: 'Corner Roundness (px)',
      description: 'How rounded the corners should be.',
      type: 'number',
      initialValue: 30,
    }),
    defineField({
      name: 'borderWidth',
      title: 'Border Thickness (px)',
      description: 'Thickness of the button outline.',
      type: 'number',
      initialValue: 4,
    }),

    // --- Colors (use your exact palette) ---
    defineField({
      name: 'backgroundColor',
      title: 'Background Color',
      description: 'Fill color behind the text.',
      type: 'color',
      options: {
        disableAlpha: true,
        colorList: [
          '#a0d2eb', // --sky-blue
          '#7cb342', // --hill-green-light
          '#388e3c', // --hill-green-dark
          '#4fa8e0', // --river-blue
          '#c0ca33', // --dino-lime
          '#fb8c00', // --dino-orange
          '#1976d2', // --pants-blue
          '#8e24aa', // --pants-purple
          '#ffeb3b', // --title-yellow
          '#ffa726', // --title-orange
          '#ff7043', // --title-red-orange
          '#212121', // --text-dark
          '#ffffff', // white
        ],
      },
      // keep default as your purple “primary”
      initialValue: {hex: '#8e24aa'},
    }),
    defineField({
      name: 'textColor',
      title: 'Text Color',
      description: 'Color of the button label text.',
      type: 'color',
      options: { disableAlpha: true, colorList: ['#212121', '#ffffff'] },
      initialValue: {hex: '#ffffff'},
    }),
    defineField({
      name: 'borderColor',
      title: 'Border Color',
      description: 'Outline color (visible if Border Thickness > 0).',
      type: 'color',
      options: { disableAlpha: true, colorList: ['#212121', '#ffffff'] },
      initialValue: {hex: '#212121'},
    }),

    // --- Extra Effects ---
    defineField({
      name: 'boxShadow',
      title: 'Box Shadow',
      description: 'Optional shadow around the button (e.g., "5px 5px 0 #000").',
      type: 'string',
      initialValue: '3px 3px 0 #00000080',
    }),
    defineField({
      name: 'textShadow',
      title: 'Text Shadow',
      description: 'Optional shadow on the button text (e.g., "1px 1px 2px rgba(0,0,0,0.4)").',
      type: 'string',
    }),
  ],
  preview: {
    select: {title: 'name', bg: 'backgroundColor.hex', fg: 'textColor.hex'},
    prepare({title, bg, fg}) {
      return {
        title: title || 'Button Style',
        subtitle: [bg && `bg ${bg}`, fg && `text ${fg}`].filter(Boolean).join(' • '),
      }
    },
  },
})

// schemaTypes/heroSection.ts
import {defineField, defineType} from 'sanity'
import {ThLargeIcon} from '@sanity/icons'

export default defineType({
  name: 'heroSection',
  title: 'Hero Section',
  type: 'object',
  icon: ThLargeIcon,
  groups: [
    {name: 'content', title: 'Content', default: true},
    {name: 'styling', title: 'Styling'},
  ],
  fields: [
    // --- CONTENT (Unchanged) ---
    defineField({
      name: 'eyebrow',
      title: 'Eyebrow (optional)',
      type: 'string',
      group: 'content',
    }),
    defineField({
      name: 'titleLine1',
      title: 'Title: First Line',
      type: 'string',
      group: 'content',
      initialValue: 'BREAKFAST',
      validation: (r) => r.required().min(1).max(30),
    }),
    defineField({
      name: 'titleLine2',
      title: 'Title: Second Line',
      type: 'string',
      group: 'content',
      initialValue: 'FOR',
      validation: (r) => r.max(30),
    }),
    defineField({
      name: 'titleLine3',
      title: 'Title: Third Line',
      type: 'string',
      group: 'content',
      initialValue: 'DINNER',
      validation: (r) => r.max(30),
    }),
    defineField({
      name: 'subtitle',
      title: 'Subtitle (optional)',
      type: 'text',
      rows: 2,
      group: 'content',
      validation: (r) => r.max(200),
    }),
    defineField({
      name: 'image',
      title: 'Main Image',
      type: 'image',
      options: {hotspot: true},
      group: 'content',
    }),
    defineField({
      name: 'imageAlt',
      title: 'Image Alt Text',
      type: 'string',
      group: 'content',
      hidden: ({parent}) => !parent?.image,
      validation: (Rule) =>
        Rule.custom((val, ctx) => (ctx.parent?.image && !val ? 'Alt text is required' : true)),
    }),
    defineField({
      name: 'buttons',
      title: 'Buttons',
      type: 'array',
      group: 'content',
      of: [{type: 'heroButton'}],
      validation: (r) => r.max(3),
    }),

    // --- STYLING (with colorList as the default) ---
    defineField({
      name: 'headingLevel',
      title: 'Heading Level',
      type: 'string',
      group: 'styling',
      options: {list: ['h1', 'h2', 'h3'], layout: 'radio'},
      initialValue: 'h1',
    }),
    defineField({
      name: 'alignment',
      title: 'Text Alignment',
      type: 'string',
      options: {list: ['left', 'center', 'right'], layout: 'radio'},
      initialValue: 'center',
      group: 'styling',
    }),
    defineField({
      name: 'imagePosition',
      title: 'Image Position',
      type: 'string',
      options: {list: ['left', 'right', 'background'], layout: 'radio'},
      initialValue: 'right',
      group: 'styling',
    }),
    defineField({
      name: 'backgroundAngle',
      title: 'Background Gradient Angle (deg)',
      type: 'number',
      group: 'styling',
      initialValue: 180,
      validation: (r) => r.min(0).max(360),
    }),
    defineField({
      name: 'backgroundColorStart',
      title: 'Background Gradient: Start',
      type: 'color',
      group: 'styling',
      options: {
        colorList: ['#2196f3'], // Default from original CSS
      },
    }),
    defineField({
      name: 'backgroundColorEnd',
      title: 'Background Gradient: End',
      type: 'color',
      group: 'styling',
      options: {
        colorList: ['#42a5f5'], // Default from original CSS
      },
    }),
    defineField({
      name: 'overlayOpacity',
      title: 'Overlay Opacity (0–1)',
      type: 'number',
      group: 'styling',
      initialValue: 0,
      validation: (r) => r.min(0).max(1),
    }),
    defineField({
      name: 'titleLine1Color',
      title: 'Title Line 1 Color',
      type: 'color',
      group: 'styling',
      options: {
        colorList: ['#ffeb3b'], // Matches --title-yellow
      },
    }),
    defineField({
      name: 'titleLine2Color',
      title: 'Title Line 2 Color',
      type: 'color',
      group: 'styling',
      options: {
        colorList: ['#ffa726'], // Matches --title-orange
      },
    }),
    defineField({
      name: 'titleLine3Color',
      title: 'Title Line 3 Color',
      type: 'color',
      group: 'styling',
      options: {
        colorList: ['#ff7043'], // Matches --title-red-orange
      },
    }),
    defineField({
      name: 'imageShadowColor',
      title: 'Image Shadow Color',
      type: 'color',
      group: 'styling',
      // default to your original orange shadow
      options: {colorList: ['#fb8c00']},
    }),
  ],
  preview: {
    select: {l1: 'titleLine1', img: 'image'},
    prepare({l1, img}) {
      return {title: l1 || 'Hero Section', media: img}
    },
  },
})
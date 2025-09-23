// studio-breakfast-for-dinner/schemaTypes/marketingBanner.ts
import {defineField, defineType} from 'sanity'
import {DocumentTextIcon} from '@sanity/icons'

export default defineType({
  name: 'marketingBanner',
  title: 'Announcement Banner',
  type: 'document',
  icon: DocumentTextIcon,
  fields: [
    defineField({
      name: 'enabled',
      title: 'Enable Banner',
      type: 'boolean',
      description: 'Turn this on to show the banner across the top of the site.',
      initialValue: false,
    }),
    defineField({
      name: 'startDate',
      title: 'Start Date',
      type: 'datetime',
      description: 'When should the banner start showing?',
    }),
    defineField({
      name: 'endDate',
      title: 'End Date',
      type: 'datetime',
      description: 'When should the banner stop showing?',
    }),
    defineField({
      name: 'text',
      title: 'Banner Text',
      type: 'text',
      rows: 2,
      description: 'Main message (e.g., "Free shipping on all orders this week!")',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'variant',
      title: 'Banner Style',
      type: 'string',
      options: {
        list: [
          { title: 'Info', value: 'info' },
          { title: 'Promo', value: 'promo' },
          { title: 'Warning', value: 'warning' },
        ],
        layout: 'radio',
      },
      initialValue: 'info',
    }),
    defineField({
      name: 'ctas',
      title: 'Calls to Action',
      type: 'array',
      description: 'Add one or more action buttons (e.g., "Shop Now", "Learn More").',
      of: [
        {
          type: 'object',
          fields: [
            { name: 'text', title: 'Button Text', type: 'string', validation: (Rule) => Rule.required() },
            { name: 'link', title: 'Button Link', type: 'string', validation: (Rule) => Rule.required() },
          ],
          preview: {
            select: { title: 'text', subtitle: 'link' },
          },
        },
      ],
    }),
    defineField({
      name: 'backgroundColor',
      title: 'Background Color',
      type: 'color',
      description: 'Choose a custom background color for the banner.',
    }),
    defineField({
      name: 'textColor',
      title: 'Text Color',
      type: 'color',
      description: 'Choose a custom color for the text.',
    }),
    defineField({
      name: 'image',
      title: 'Optional Icon / Graphic',
      type: 'image',
      description: 'Small image (like a seasonal graphic or logo).',
      options: { hotspot: true },
    }),
  ],
  preview: {
    select: {
      title: 'text',
      enabled: 'enabled',
      variant: 'variant',
    },
    prepare({ title, enabled, variant }) {
      return {
        title: title || 'No text set',
        subtitle: `${enabled ? '🟢 Enabled' : '🔴 Disabled'} • ${variant || 'No variant'}`,
      }
    },
  },
})

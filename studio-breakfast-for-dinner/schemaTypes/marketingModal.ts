// schemaTypes/marketingModal.ts
import {defineField, defineType} from 'sanity'
import {PresentationIcon} from '@sanity/icons'

export default defineType({
  name: 'marketingModal',
  title: 'Marketing Modal',
  type: 'document',
  icon: PresentationIcon,
  fields: [
    defineField({
      name: 'title',
      title: 'Internal Title',
      type: 'string',
      description: 'e.g., "Holiday 2025 Book Presale"',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'enabled',
      title: 'Enable Modal',
      type: 'boolean',
      description: 'Turn this on to make the modal appear on the website.',
      initialValue: false,
    }),
    defineField({
      name: 'headline',
      title: 'Headline',
      type: 'string',
      description: 'The main marketing message (e.g., "Limited Time Offer!")',
    }),
    defineField({
      name: 'body',
      title: 'Body Text',
      type: 'array',
      of: [{type: 'block'}],
      description: 'Additional details or descriptive text.',
    }),
    defineField({
      name: 'backgroundImage',
      title: 'Background Image',
      type: 'image',
      options: {hotspot: true},
    }),
    defineField({
      name: 'featuredProduct',
      title: 'Featured Product',
      type: 'reference',
      to: [{type: 'product'}],
      description: 'Select the product this modal will sell.',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'ctaText',
      title: 'Button Text',
      type: 'string',
      description: 'The text for the call-to-action button (e.g., "Pre-order Now")',
      initialValue: 'Pre-order Now',
    }),
    defineField({
      name: 'buttonStyle',
      title: 'Base Button Style',
      type: 'reference',
      to: [{type: 'buttonStyle'}],
      description: 'Select a saved button style preset.',
    }),
    defineField({
      name: 'buttonOverride',
      title: 'Button Style Overrides',
      type: 'buttonStyleOverride',
      description: 'Fine-tune the button style for this modal only.',
    }),
  ],
  preview: {
    select: {
      title: 'title',
      enabled: 'enabled',
    },
    prepare({title, enabled}) {
      return {
        title,
        subtitle: enabled ? '🟢 Enabled' : '🔴 Disabled',
      }
    },
  },
})
// schemaTypes/objects/featuredButton.ts
import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'featuredButton',
  title: 'Featured Button',
  type: 'object',
  fields: [
    defineField({
      name: 'label',
      title: 'Button Label',
      type: 'string',
      description: 'Text on the button (e.g., “Buy Now”, “Add to Cart”).',
      validation: (r) => r.required().min(1).max(30),
    }),
    defineField({
      name: 'action',
      title: 'Button Action',
      type: 'string',
      options: {list: ['buyNow', 'addToCart', 'linkToPDP', 'customLink'], layout: 'radio'},
      initialValue: 'linkToPDP',
      validation: (r) => r.required(),
      description:
        '• buyNow: go straight to checkout (your frontend decides behavior) • addToCart: add item to cart • linkToPDP: go to product page • customLink: choose a link below.',
    }),

    defineField({
      name: 'link',
      title: 'Custom Link',
      type: 'link',
      hidden: ({parent}) => parent?.action !== 'customLink',
      description: 'Pick the Link Type (External URL, Internal Page, or Home Section anchor).',
    }),

    defineField({
      name: 'style',
      title: 'Base Button Style',
      type: 'reference',
      to: [{type: 'buttonStyle'}],
      description: 'Pick a saved Button Style (e.g., “Primary”).',
    }),
    defineField({
      name: 'override',
      title: 'Button Style Override',
      type: 'buttonStyleOverride',
      description: 'Only fill fields you want to override (e.g., background color).',
    }),

    defineField({
      name: 'fullWidth',
      title: 'Full Width Button',
      type: 'boolean',
      initialValue: true,
    }),
    defineField({
      name: 'maxWidth',
      title: 'Button Max Width (px)',
      type: 'number',
      initialValue: 320,
      validation: (r) => r.min(120),
    }),
    defineField({
      name: 'ariaLabel',
      title: 'ARIA Label (optional)',
      type: 'string',
      description: 'Accessibility label for screen readers.',
      validation: (r) => r.max(120),
    }),
  ],

  validation: (Rule) =>
    Rule.custom((btn) => {
      if (!btn) return true

      if (btn.action === 'customLink') {
        if (!btn.link?.type) return 'Custom Link / Link Type is required.'

        if (btn.link.type === 'externalUrl' && !btn.link.externalUrl) {
          return 'Custom Link / External URL is required.'
        }

        if (btn.link.type === 'internalPage' && !btn.link.internal?._ref) {
          return 'Custom Link / Internal Page is required.'
        }

        if (btn.link.type === 'homeSection') {
          if (!btn.link.homeSectionId) {
            return 'Custom Link / Home Section ID is required.'
          }
          if (!/^[A-Za-z][A-Za-z0-9_-]*$/.test(btn.link.homeSectionId)) {
            return 'Provide a valid HTML id (letters, numbers, dashes, underscores).'
          }
        }
      }

      return true
    }),

  preview: {
    select: {title: 'label', action: 'action'},
    prepare({title, action}) {
      return {title: title || 'Button', subtitle: action || 'action'}
    },
  },
})

// schemaTypes/objects/link.ts
import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'link',
  title: 'Link',
  type: 'object',
  fields: [
    defineField({
      name: 'type',
      title: 'Link Type',
      description: 'Choose where this link should go.',
      type: 'string',
      options: {
        list: [
          {title: 'External URL', value: 'externalUrl'},
          {title: 'Internal Page', value: 'internalPage'},
          {title: 'Home Section (anchor)', value: 'homeSection'},
        ],
        layout: 'radio',
      },
      // IMPORTANT: do NOT require this here.
      // Parent (featuredButton) will require it only when action === "customLink".
      // validation: (r) => r.required(),
    }),

    // --- External URL ---
    defineField({
      name: 'externalUrl',
      title: 'External URL',
      type: 'url',
      hidden: ({parent}) => parent?.type !== 'externalUrl',
      validation: (Rule) =>
        Rule.custom((value, context) => {
          if (context.parent?.type === 'externalUrl' && !value) {
            return 'A URL is required for external links.'
          }
          return true
        }).uri({allowRelative: false, scheme: ['http', 'https']}),
    }),
    defineField({
      name: 'openInNewTab',
      title: 'Open in new tab',
      type: 'boolean',
      initialValue: true,
      hidden: ({parent}) => parent?.type !== 'externalUrl',
    }),

    // --- Internal Page ---
    defineField({
      name: 'internal',
      title: 'Internal Page',
      type: 'reference',
      to: [{type: 'page'}],
      hidden: ({parent}) => parent?.type !== 'internalPage',
      validation: (Rule) =>
        Rule.custom((value, context) => {
          if (context.parent?.type === 'internalPage' && !value) {
            return 'You must select an internal page.'
          }
          return true
        }),
    }),

    // --- Home Section anchor ---
    defineField({
      name: 'homeSectionId',
      title: 'Home Section ID',
      description: 'Enter the ID of a section on the Home page (e.g., "about").',
      type: 'string',
      hidden: ({parent}) => parent?.type !== 'homeSection',
      validation: (Rule) =>
        Rule.custom((value, context) => {
          if (context.parent?.type === 'homeSection') {
            if (!value) return 'A Section ID is required.'
            if (!/^[A-Za-z][A-Za-z0-9_-]*$/.test(value)) {
              return 'Must start with a letter and contain only letters, numbers, underscores, or dashes.'
            }
          }
          return true
        }),
    }),

    // --- Accessibility ---
    defineField({
      name: 'ariaLabel',
      title: 'ARIA Label (optional)',
      type: 'string',
      description: 'Helps screen readers describe the link purpose.',
    }),
  ],

  preview: {
    select: {
      type: 'type',
      url: 'externalUrl',
      // references don’t deref in select; we just show a generic label
      internalRef: 'internal._ref',
      homeId: 'homeSectionId',
    },
    prepare({type, url, internalRef, homeId}) {
      if (type === 'externalUrl') return {title: url || 'External URL', subtitle: 'External link'}
      if (type === 'internalPage') return {title: internalRef ? '(internal page selected)' : '(choose a page)', subtitle: 'Internal page'}
      if (type === 'homeSection') return {title: `/#${homeId || '(not set)'}`, subtitle: 'Home section anchor'}
      return {title: 'Link', subtitle: 'Unconfigured'}
    },
  },
})

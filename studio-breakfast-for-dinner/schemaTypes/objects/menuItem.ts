// schemaTypes/objects/menuItem.ts
import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'menuItem',
  title: 'Menu Item',
  type: 'object',
  fields: [
    defineField({
      name: 'label',
      title: 'Label',
      type: 'string',
      validation: (Rule) => Rule.required().min(1).max(30),
    }),
    defineField({
      name: 'link',
      title: 'Link',
      type: 'object',
      fields: [
        defineField({
          name: 'type',
          title: 'Link Type',
          type: 'string',
          options: {list: ['internal', 'external'], layout: 'radio'},
          initialValue: 'internal',
          validation: (Rule) => Rule.required(),
        }),
        defineField({
          name: 'internal',
          title: 'Internal Page',
          type: 'reference',
          to: [{type: 'page'}], // change to your page/route doc type
          hidden: ({parent}) => parent?.type !== 'internal',
          validation: (Rule) =>
            Rule.custom((val, ctx) =>
              ctx.parent?.type === 'internal' ? (val ? true : 'Select a page') : true
            ),
        }),
        defineField({
          name: 'external',
          title: 'External URL',
          type: 'url',
          description: 'Must include http(s)://',
          hidden: ({parent}) => parent?.type !== 'external',
          validation: (Rule) =>
            Rule.custom((val, ctx) =>
              ctx.parent?.type === 'external'
                ? val
                  ? true
                  : 'Enter a URL'
                : true
            ).uri({allowRelative: false, scheme: ['http', 'https']}),
        }),
      ],
    }),
    defineField({
      name: 'openInNewTab',
      title: 'Open in new tab',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'ariaLabel',
      title: 'ARIA Label (optional)',
      type: 'string',
      description: 'Accessibility label for screen readers.',
    }),
    defineField({
      name: 'order',
      title: 'Order',
      type: 'number',
      validation: (Rule) => Rule.min(0),
    }),
  ],
  preview: {
    select: {title: 'label', type: 'link.type'},
    prepare: ({title, type}) => ({title, subtitle: type === 'external' ? 'External' : 'Internal'}),
  },
})

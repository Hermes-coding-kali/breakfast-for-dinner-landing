import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'fiContent',
  title: 'Featured Content',
  type: 'object',
  fields: [
    defineField({ name: 'heading', title: 'Section Heading', type: 'string', initialValue: 'Featured Item' }),
    defineField({ name: 'subheading', title: 'Subheading (optional)', type: 'text', rows: 2 }),
    defineField({ name: 'eyebrow', title: 'Eyebrow (optional)', type: 'string' }),
    defineField({
      name: 'product', title: 'Product', type: 'reference', to: [{type: 'product'}],
      validation: (r) => r.required()
    }),
    defineField({ name: 'disclaimer', title: 'Disclaimer (optional)', type: 'string' }),
  ],
})

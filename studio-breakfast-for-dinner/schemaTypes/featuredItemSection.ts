import {defineField, defineType} from 'sanity'
import {TagIcon} from '@sanity/icons'

export default defineType({
  name: 'featuredItemSection',
  title: 'Featured Item',
  type: 'object',
  icon: TagIcon,
  groups: [
    {name: 'content', title: 'Content', default: true},
    {name: 'style', title: 'Style (reference)'},
  ],
  fields: [
    defineField({
      name: 'content', title: 'Content', type: 'fiContent', group: 'content',
      description: 'Heading/subheading/eyebrow + the product to feature.',
    }),
    defineField({
      name: 'style', title: 'Style', type: 'reference', to: [{type: 'featuredItemStyle'}], group: 'style',
      description: 'All layout, card, image, price, buttons, and decor live here (separate doc).'
    }),
  ],
  preview: {
    select: {
      heading: 'content.heading',
      eyebrow: 'content.eyebrow',
      prod: 'content.product.name',
    },
    prepare({heading, eyebrow, prod}) {
      return {
        title: heading || eyebrow || 'Featured Item',
        subtitle: prod ? `Product: ${prod}` : 'Pick a product'
      }
    }
  }
})

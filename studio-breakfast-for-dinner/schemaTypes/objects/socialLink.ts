// schemaTypes/objects/socialLink.ts
import {defineField, defineType} from 'sanity'
import {LinkIcon} from '@sanity/icons'

export default defineType({
  name: 'socialLink',
  title: 'Social Media Link',
  type: 'object',
  icon: LinkIcon,
  fields: [
    defineField({
      name: 'platform',
      title: 'Platform',
      type: 'string',
      description: 'Select a social media platform.',
      options: {
        list: [
          {title: 'Instagram', value: 'instagram'},
          {title: 'Twitter / X', value: 'twitter'},
          {title: 'Facebook', value: 'facebook'},
          {title: 'TikTok', value: 'tiktok'},
          {title: 'YouTube', value: 'youtube'},
          {title: 'Pinterest', value: 'pinterest'},
        ],
        layout: 'radio',
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'url',
      title: 'URL',
      type: 'url',
      description: 'The full URL of the social media profile (e.g., https://instagram.com/user).',
      validation: (Rule) => Rule.required().uri({scheme: ['http', 'https']}),
    }),
  ],
  preview: {
    select: {
      title: 'platform',
      subtitle: 'url',
    },
    prepare({title, subtitle}) {
      return {
        title: title ? title.charAt(0).toUpperCase() + title.slice(1) : 'Social Link',
        subtitle: subtitle || '(URL not set)',
      }
    },
  },
})
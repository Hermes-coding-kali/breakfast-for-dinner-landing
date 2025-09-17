// schemaTypes/callToActionSection.ts
import {defineField, defineType} from 'sanity'
import {EnvelopeIcon} from '@sanity/icons'

export default defineType({
  name: 'callToActionSection',
  title: 'Call to Action Section',
  type: 'object',
  icon: EnvelopeIcon,
  fields: [
    defineField({
      name: 'heading',
      title: 'Heading',
      type: 'string',
      validation: (Rule) => Rule.required().min(2).max(80),
    }),
    defineField({
      name: 'subheading',
      title: 'Subheading (optional)',
      type: 'text',
      rows: 2,
      validation: (Rule) => Rule.max(200),
    }),
    defineField({
      name: 'formName',
      title: 'Netlify Form Name',
      type: 'string',
      description:
        'Must exactly match the form’s name attribute in your React component. Remember data-netlify="true" and a honeypot field.',
      validation: (Rule) => Rule.required().min(2).max(64),
    }),
    defineField({
      name: 'emailPlaceholder',
      title: 'Email Placeholder',
      type: 'string',
      initialValue: 'you@example.com',
      validation: (Rule) => Rule.max(80),
    }),
    defineField({
      name: 'buttonLabel',
      title: 'Submit Button Label',
      type: 'string',
      initialValue: 'Subscribe',
      validation: (Rule) => Rule.required().min(1).max(30),
    }),
    defineField({
      name: 'privacyNote',
      title: 'Privacy Note (short)',
      type: 'string',
      description: 'e.g., “We never share your email.”',
      validation: (Rule) => Rule.max(120),
    }),
    defineField({
      name: 'privacyLink',
      title: 'Privacy Policy Link (optional)',
      type: 'url',
      validation: (Rule) => Rule.uri({allowRelative: false, scheme: ['http', 'https']}),
    }),
    defineField({
      name: 'successMessage',
      title: 'Success Message',
      type: 'string',
      initialValue: 'Thanks! Please check your inbox.',
      validation: (Rule) => Rule.max(120),
    }),
    defineField({
      name: 'errorMessage',
      title: 'Error Message',
      type: 'string',
      initialValue: 'Oops—something went wrong. Please try again.',
      validation: (Rule) => Rule.max(120),
    }),
    defineField({
      name: 'successRedirect',
      title: 'Redirect URL on Success (optional)',
      type: 'url',
      description: 'If set, navigate here after successful submit.',
      validation: (Rule) => Rule.uri({allowRelative: false, scheme: ['http', 'https']}),
    }),
    defineField({
      name: 'enableHoneypot',
      title: 'Enable Honeypot',
      type: 'boolean',
      initialValue: true,
    }),
    defineField({
      name: 'honeypotFieldName',
      title: 'Honeypot Field Name',
      type: 'string',
      initialValue: 'bot-field',
      hidden: ({parent}) => parent?.enableHoneypot !== true,
      validation: (Rule) =>
        Rule.custom((v, ctx) => (ctx.parent?.enableHoneypot ? (!!v || 'Required') : true)),
    }),
  ],
  preview: {
    select: {title: 'heading', btn: 'buttonLabel'},
    prepare({title, btn}) {
      return {
        title: title || 'Call to Action Section',
        subtitle: btn ? `Button: ${btn}` : 'Email signup form',
      }
    },
  },
})

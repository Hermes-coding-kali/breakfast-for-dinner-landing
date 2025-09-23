// schemaTypes/footerStyle.ts
import {defineField, defineType} from 'sanity'
import {ControlsIcon} from '@sanity/icons'

export default defineType({
  name: 'footerStyle',
  title: 'Footer Style',
  type: 'document',
  icon: ControlsIcon,
  fields: [
    defineField({
      name: 'name',
      title: 'Style Name',
      type: 'string',
      description: 'A name for this style preset (e.g., "Default Footer").',
      validation: (Rule) => Rule.required(),
      initialValue: 'Default Footer',
    }),
    defineField({
      name: 'backgroundColor',
      title: 'Background Color',
      type: 'color',
      options: {
        disableAlpha: true,
        colorList: ['#212121', '#8e24aa', '#ffffff'], // text-dark, pants-purple, white
      },
    }),
    defineField({
      name: 'textColor',
      title: 'Text Color',
      type: 'color',
      options: {
        disableAlpha: true,
        colorList: ['#f0f0f0', '#ffffff', '#212121'],
      },
    }),
    defineField({
      name: 'socialIconColor',
      title: 'Social Icon Color',
      type: 'color',
      options: {
        disableAlpha: true,
        colorList: ['#f0f0f0', '#ffffff', '#212121'],
      },
    }),
    defineField({
      name: 'socialIconHoverColor',
      title: 'Social Icon Hover Color',
      type: 'color',
      options: {
        disableAlpha: true,
        colorList: ['#a0d2eb', '#fb8c00', '#ffeb3b'], // sky-blue, dino-orange, title-yellow
      },
    }),
  ],
})
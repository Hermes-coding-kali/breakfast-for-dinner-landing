// schemaTypes/headerStyle.ts
import {defineField, defineType} from 'sanity'
import {ControlsIcon} from '@sanity/icons'

export default defineType({
  name: 'headerStyle',
  title: 'Header Style',
  type: 'document',
  icon: ControlsIcon,
  fields: [
    defineField({
      name: 'name',
      title: 'Style Name',
      type: 'string',
      description: 'A name for this style preset (e.g., "Default Header").',
      validation: (Rule) => Rule.required(),
      initialValue: 'Default Header',
    }),

    // --- Background & Layout ---
    defineField({
      name: 'backgroundColor',
      title: 'Background Color',
      type: 'color',
      options: {
        disableAlpha: true,
        colorList: ['#8e24aa', '#212121', '#ffffff'], // pants-purple, text-dark, white
      },
    }),
    defineField({
      name: 'paddingY',
      title: 'Vertical Padding (px)',
      type: 'number',
      initialValue: 10,
    }),
    defineField({
      name: 'paddingX',
      title: 'Horizontal Padding (px)',
      type: 'number',
      initialValue: 25,
    }),

    // --- Site Title ---
    defineField({
      name: 'titleColor',
      title: 'Site Title Color',
      type: 'color',
      options: {
        disableAlpha: true,
        colorList: ['#ffffff', '#212121'],
      },
    }),
    defineField({
      name: 'titleStrokeColor',
      title: 'Site Title Stroke Color',
      type: 'color',
      options: {
        disableAlpha: true,
        colorList: ['#212121', '#ffffff'],
      },
    }),
    defineField({
      name: 'titleFontSize',
      title: 'Site Title Font Size (em)',
      type: 'number',
      initialValue: 1.8,
    }),

    // --- Navigation Links ---
    defineField({
      name: 'linkColor',
      title: 'Nav Link Color',
      type: 'color',
      options: {
        disableAlpha: true,
        colorList: ['#ffffff', '#212121'],
      },
    }),
    defineField({
      name: 'linkHoverColor',
      title: 'Nav Link Hover/Underline Color',
      type: 'color',
      options: {
        disableAlpha: true,
        colorList: ['#ffffff', '#ffeb3b', '#fb8c00'], // white, title-yellow, dino-orange
      },
    }),
    defineField({
      name: 'linkFont',
      title: 'Nav Link Font',
      type: 'string',
      options: {list: ['Baloo 2', 'Lilita One', 'Poppins', 'Patrick Hand']},
      initialValue: 'Baloo 2',
    }),
    defineField({
      name: 'linkFontSize',
      title: 'Nav Link Font Size (em)',
      type: 'number',
      initialValue: 1.1,
    }),

    // --- Cart Button ---
    defineField({
      name: 'cartIconColor',
      title: 'Cart Icon Color',
      type: 'color',
      options: {
        disableAlpha: true,
        colorList: ['#ffffff', '#212121'],
      },
    }),
    defineField({
      name: 'cartBadgeBgColor',
      title: 'Cart Badge Background Color',
      type: 'color',
      options: {
        disableAlpha: true,
        colorList: ['#ffeb3b', '#fb8c00', '#ffffff'], // title-yellow, dino-orange, white
      },
    }),
    defineField({
      name: 'cartBadgeTextColor',
      title: 'Cart Badge Text Color',
      type: 'color',
      options: {
        disableAlpha: true,
        colorList: ['#212121', '#ffffff'],
      },
    }),
    defineField({
      name: 'cartBadgeBorderColor',
      title: 'Cart Badge Border Color',
      type: 'color',
      options: {
        disableAlpha: true,
        colorList: ['#212121', '#ffffff'],
      },
    }),
  ],
  preview: {
    select: {title: 'name', bg: 'backgroundColor.hex'},
    prepare({title, bg}) {
      return {title: title || 'Header Style', subtitle: bg ? `bg: ${bg}` : ''}
    },
  },
})
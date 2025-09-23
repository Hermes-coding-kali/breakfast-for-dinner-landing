// schemaTypes/objects/buttonStyleOverride.ts
import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'buttonStyleOverride',
  title: 'Button Style Override',
  type: 'object',
  description: 'Change specific style settings for one button, without affecting the base style.',
  fields: [
    defineField({ name: 'paddingX', title: 'Horizontal Padding (px)', description: 'Override button width spacing.', type: 'number' }),
    defineField({ name: 'paddingY', title: 'Vertical Padding (px)', description: 'Override button height spacing.', type: 'number' }),
    defineField({ name: 'borderRadius', title: 'Corner Roundness (px)', description: 'Override button corner roundness.', type: 'number' }),
    defineField({ name: 'borderWidth', title: 'Border Thickness (px)', description: 'Override thickness of outline.', type: 'number' }),
    defineField({ name: 'textColor', title: 'Text Color', description: 'Override the text color.', type: 'color', options: {disableAlpha: true} }),
    defineField({ name: 'backgroundColor', title: 'Background Color', description: 'Override the background fill.', type: 'color', options: {disableAlpha: true} }),
    defineField({ name: 'borderColor', title: 'Border Color', description: 'Override the border color.', type: 'color', options: {disableAlpha: true} }),
    defineField({
      name: 'font',
      title: 'Font Family',
      description: 'Override which font family is used for this button only.',
      type: 'string',
      options: { list: ['Lilita One', 'Baloo 2', 'Poppins', 'Patrick Hand'] },
    }),
    defineField({
      name: 'fontWeight',
      title: 'Font Weight',
      description: 'Override how bold the text should be (100–900).',
      type: 'number',
    }),
    defineField({
      name: 'boxShadow',
      title: 'Box Shadow',
      description: 'Override box shadow (leave blank to use base style).',
      type: 'string',
    }),
    defineField({
      name: 'textShadow',
      title: 'Text Shadow',
      description: 'Override text shadow (leave blank to use base style).',
      type: 'string',
    }),
  ],
})

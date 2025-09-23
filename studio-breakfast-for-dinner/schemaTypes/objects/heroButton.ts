// schemaTypes/objects/heroButton.ts
import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'heroButton',
  title: 'Hero Button',
  type: 'object',
  fields: [
    defineField({
      name: 'label',
      title: 'Button Text',
      type: 'string',
      description:
        'The text shown on the button (e.g., “Buy Now”, “Read More”). Keep it short and action-oriented.',
      validation: (r) =>
        r.required().min(1).max(30).warning('Short labels (≤ 20 chars) work best on mobile.'),
    }),

    defineField({
      name: 'link',
      title: 'Destination',
      type: 'link',
      description:
        'Where this button should go when clicked. Choose an internal page, an on-page anchor (e.g., #about), or an external URL. You can also set “Open in new tab” and an accessibility label there.',
      validation: (r) => r.required(),
    }),

    // Reusable base style (reference a saved Button Style document)
    defineField({
      name: 'style',
      title: 'Base Button Style',
      type: 'reference',
      to: [{type: 'buttonStyle'}],
      description:
        'Pick a saved Button Style (e.g., “Primary”, “Secondary”). These are reusable presets managed in the Button Style collection.',
      validation: (r) => r.required(),
    }),

    // Optional one-off tweaks that only affect this button
    defineField({
      name: 'override',
      title: 'Per-Button Style Overrides (Optional)',
      type: 'buttonStyleOverride',
      description:
        'Use ONLY if this button needs to look a bit different than the selected Base Button Style. Fill in specific fields to override (e.g., just the background color or padding). Leave blank to inherit everything.',
    }),
  ],

  preview: {
    select: {title: 'label', styleName: 'style->name'},
    prepare({title, styleName}) {
      return {
        title: title || 'Button',
        subtitle: styleName ? `Style: ${styleName}` : 'Style: (not selected)',
      }
    },
  },
})

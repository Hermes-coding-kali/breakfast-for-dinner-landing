// schemaTypes/aboutSection.ts
import {defineField, defineType} from 'sanity'
import {UserIcon} from '@sanity/icons'

export default defineType({
  name: 'aboutSection',
  title: 'About Section',
  type: 'object',
  icon: UserIcon,
  groups: [
    {name: 'content', title: 'Content', default: true},
    {name: 'layout', title: 'Layout'},
    {name: 'styling', title: 'Box & Heading Styling'},
    {name: 'decor', title: 'Decorative Shapes'},
    {name: 'image', title: 'Image Styling'},
  ],
  fields: [
    // ---------------- CONTENT ----------------
    defineField({
      name: 'heading',
      title: 'Heading',
      type: 'string',
      group: 'content',
      description: 'The section title that appears above the paragraph (e.g., “What’s the Book About?”).',
      initialValue: "What's the Book About?",
      validation: (Rule) => Rule.required().min(2).max(80),
    }),
    defineField({
      name: 'content',
      title: 'Content',
      type: 'array',
      group: 'content',
      description: 'Write the main paragraph text. Use line breaks sparingly. You can add multiple blocks.',
      of: [{type: 'block'}],
      validation: (Rule) => Rule.required().min(1),
    }),
    defineField({
      name: 'image',
      title: 'Illustration Image',
      type: 'image',
      group: 'content',
      description: 'Optional image shown below the text box (inside the bordered box).',
      options: {hotspot: true},
    }),
    defineField({
      name: 'imageAlt',
      title: 'Image Alt Text',
      type: 'string',
      group: 'content',
      description: 'Describe the image for accessibility (screen readers). Required if image set.',
      hidden: ({parent}) => !parent?.image,
      validation: (Rule) =>
        Rule.custom((val, ctx) => {
          if (ctx.parent?.image && !val) return 'Alt text is required when an image is set'
          return true
        }),
    }),

    // ---------------- LAYOUT ----------------
    defineField({
      name: 'layout',
      title: 'Layout',
      type: 'string',
      group: 'layout',
      description: 'How content is arranged. “Image Right” matches your current design (image below text on mobile).',
      options: {list: ['image-left', 'image-right', 'stacked'], layout: 'radio'},
      initialValue: 'image-right',
    }),
    defineField({
      name: 'maxWidth',
      title: 'Max Content Width (px)',
      type: 'number',
      group: 'layout',
      description: 'The maximum width of the bordered box. Keep around 700 for readability.',
      initialValue: 700,
      validation: (Rule) => Rule.positive(),
    }),
    defineField({
      name: 'sectionPaddingY',
      title: 'Section Vertical Padding (px)',
      type: 'number',
      group: 'layout',
      description: 'Space above and below the section.',
      initialValue: 35,
      validation: (Rule) => Rule.min(0),
    }),
    defineField({
      name: 'sectionPaddingX',
      title: 'Section Horizontal Padding (px)',
      type: 'number',
      group: 'layout',
      description: 'Left/right padding of the section.',
      initialValue: 20,
      validation: (Rule) => Rule.min(0),
    }),

    // ---------------- STYLING (BOX & HEADING) ----------------
    defineField({
      name: 'sectionBg',
      title: 'Section Background Color',
      type: 'color',
      group: 'styling',
      description: 'Overall background behind the bordered box.',
      options: { colorList: ['#7cb342'] }, // --hill-green-light
    }),
    defineField({
      name: 'boxBg',
      title: 'Box Background Color',
      type: 'color',
      group: 'styling',
      description: 'Fill color of the dashed bordered box.',
      options: { colorList: ['#fffbeb', '#ffeb3b', '#ffa726'] }, // cream, --title-yellow, --title-orange
    }),
    defineField({
      name: 'boxPaddingY',
      title: 'Box Vertical Padding (px)',
      type: 'number',
      group: 'styling',
      description: 'Top/bottom padding inside the bordered box.',
      initialValue: 25,
      validation: (Rule) => Rule.min(0),
    }),
    defineField({
      name: 'boxPaddingX',
      title: 'Box Horizontal Padding (px)',
      type: 'number',
      group: 'styling',
      description: 'Left/right padding inside the bordered box.',
      initialValue: 35,
      validation: (Rule) => Rule.min(0),
    }),
    defineField({
      name: 'boxBorderWidth',
      title: 'Box Border Width (px)',
      type: 'number',
      group: 'styling',
      description: 'Thickness of the dashed border around the box.',
      initialValue: 3,
      validation: (Rule) => Rule.min(0),
    }),
    defineField({
      name: 'boxBorderStyle',
      title: 'Box Border Style',
      type: 'string',
      group: 'styling',
      description: 'Border style of the box (dashed/solid).',
      options: {list: ['dashed', 'solid'], layout: 'radio'},
      initialValue: 'dashed',
    }),
    defineField({
      name: 'boxBorderColor',
      title: 'Box Border Color',
      type: 'color',
      group: 'styling',
      description: 'Color of the box border lines.',
      options: { colorList: ['#212121'] }, // --text-dark
    }),

    // Heading tokens
    defineField({
      name: 'headingColor',
      title: 'Heading Fill Color',
      type: 'color',
      group: 'styling',
      description: 'Main color of the heading text.',
      options: { colorList: ['#fb8c00', '#ffa726', '#ff7043'] }, // oranges
    }),
    defineField({
      name: 'headingStrokeColor',
      title: 'Heading Stroke Color',
      type: 'color',
      group: 'styling',
      description: 'Outline color around the heading letters.',
      options: { colorList: ['#212121'] }, // --text-dark
    }),
    defineField({
      name: 'headingStrokeWidth',
      title: 'Heading Stroke Width (px)',
      type: 'number',
      group: 'styling',
      description: 'The thickness of the outline around the heading text.',
      initialValue: 2,
      validation: (Rule) => Rule.min(0),
    }),
    defineField({
      name: 'headingFontFamily',
      title: 'Heading Font Family',
      type: 'string',
      group: 'styling',
      description: 'Choose a font for the heading.',
      options: {list: ['Lilita One', 'Baloo 2', 'Poppins', 'Patrick Hand']},
      initialValue: 'Lilita One',
    }),
    defineField({
      name: 'headingFontSize',
      title: 'Heading Font Size (em)',
      type: 'number',
      group: 'styling',
      description: 'Base size; responsive CSS will still scale down on smaller screens.',
      initialValue: 2.5,
      validation: (Rule) => Rule.positive(),
    }),
    defineField({
      name: 'headingLetterSpacing',
      title: 'Heading Letter Spacing (px)',
      type: 'number',
      group: 'styling',
      description: 'Extra spacing between heading letters.',
      initialValue: 0.5,
    }),
    defineField({
      name: 'headingTextShadow',
      title: 'Heading Text Shadow',
      type: 'string',
      group: 'styling',
      description: 'CSS shadow, e.g. "2px 2px 0px rgba(0,0,0,0.1)". Leave empty for none.',
      initialValue: '2px 2px 0px rgba(0,0,0,0.1)',
    }),

    // ---------------- DECORATIVE BLOBS ----------------
    defineField({
      name: 'blob1Color',
      title: 'Bottom Left Blob Color',
      type: 'color',
      group: 'decor',
      description: 'The lime blob near bottom/left.',
      options: { colorList: ['#c0ca33'] }, // --dino-lime
    }),
    defineField({
      name: 'blob1BorderColor',
      title: 'Blob 1 Border Color',
      type: 'color',
      group: 'decor',
      description: 'Outline color of Blob 1.',
      options: { colorList: ['#212121'] }, // --text-dark
    }),
    defineField({
      name: 'blob1Opacity',
      title: 'Blob 1 Opacity (0–1)',
      type: 'number',
      group: 'decor',
      description: 'Transparency of the bottom-left blob.',
      initialValue: 0.6,
      validation: (Rule) => Rule.min(0).max(1),
    }),
    defineField({
      name: 'blob2Color',
      title: 'Top Right Blob Color',
      type: 'color',
      group: 'decor',
      description: 'The sky-blue blob near top/right.',
      options: { colorList: ['#a0d2eb'] }, // --sky-blue
    }),
    defineField({
      name: 'blob2BorderColor',
      title: 'Blob 2 Border Color',
      type: 'color',
      group: 'decor',
      description: 'Outline color of Blob 2.',
      options: { colorList: ['#212121'] }, // --text-dark
    }),
    defineField({
      name: 'blob2Opacity',
      title: 'Blob 2 Opacity (0–1)',
      type: 'number',
      group: 'decor',
      description: 'Transparency of the top-right blob.',
      initialValue: 0.7,
      validation: (Rule) => Rule.min(0).max(1),
    }),

    // “Tape” corners on the box
    defineField({
      name: 'tapeBg',
      title: 'Tape Background Color',
      type: 'color',
      group: 'decor',
      description: 'Sticky tape rectangles color (pick sky-blue, adjust alpha in the picker if desired).',
      options: { colorList: ['#a0d2eb'] }, // --sky-blue
    }),
    defineField({
      name: 'tapeBorderColor',
      title: 'Tape Border Color',
      type: 'color',
      group: 'decor',
      description: 'Thin outline on the tape rectangles (pick dark, adjust alpha if desired).',
      options: { colorList: ['#212121'] }, // --text-dark
    }),
    defineField({
      name: 'tapeSize',
      title: 'Tape Size (Width x Height px)',
      type: 'object',
      group: 'decor',
      description: 'Size of each tape rectangle.',
      fields: [
        defineField({name: 'width', title: 'Width (px)', type: 'number', initialValue: 70}),
        defineField({name: 'height', title: 'Height (px)', type: 'number', initialValue: 30}),
      ],
    }),

    // ---------------- IMAGE STYLING ----------------
    defineField({
      name: 'imageBg',
      title: 'Image Frame Background',
      type: 'color',
      group: 'image',
      description: 'Background behind the image inside its frame.',
      options: { colorList: ['#fffbeb', '#ffeb3b', '#ffa726'] }, // cream or palette yellows/orange
    }),
    defineField({
      name: 'imageBorderColor',
      title: 'Image Border Color',
      type: 'color',
      group: 'image',
      description: 'Border color of the image frame.',
      options: { colorList: ['#212121'] }, // --text-dark
    }),
    defineField({
      name: 'imageBorderWidth',
      title: 'Image Border Width (px)',
      type: 'number',
      group: 'image',
      description: 'Thickness of the image frame border.',
      initialValue: 4,
      validation: (Rule) => Rule.min(0),
    }),
    defineField({
      name: 'imageBorderRadius',
      title: 'Image Border Radius (px)',
      type: 'number',
      group: 'image',
      description: 'Roundness of the image frame corners.',
      initialValue: 20,
      validation: (Rule) => Rule.min(0),
    }),
    defineField({
      name: 'imageShadowColor',
      title: 'Image Shadow Color',
      type: 'color',
      group: 'image',
      description: 'Drop shadow color for the image (orange by default).',
      options: { colorList: ['#fb8c00', '#ffa726', '#ff7043'] }, // oranges from palette
    }),
    defineField({
      name: 'imageShadowOffset',
      title: 'Image Shadow Offset (px)',
      type: 'object',
      group: 'image',
      description: 'X and Y offset of the image shadow.',
      fields: [
        defineField({name: 'x', title: 'X', type: 'number', initialValue: 6}),
        defineField({name: 'y', title: 'Y', type: 'number', initialValue: 6}),
      ],
    }),
    defineField({
      name: 'imageShadowBlur',
      title: 'Image Shadow Blur (px)',
      type: 'number',
      group: 'image',
      description: 'Blur radius of the image shadow (0 for crisp blocky shadow).',
      initialValue: 0,
      validation: (Rule) => Rule.min(0),
    }),
    defineField({
      name: 'imageWidthPct',
      title: 'Image Width (% of container)',
      type: 'number',
      group: 'image',
      description: 'Overall image width relative to the container.',
      initialValue: 70,
      validation: (Rule) => Rule.min(1).max(100),
    }),
    defineField({
      name: 'imageMaxWidth',
      title: 'Image Max Width (px)',
      type: 'number',
      group: 'image',
      description: 'Hard cap for how wide the image can get.',
      initialValue: 300,
      validation: (Rule) => Rule.min(1),
    }),
    defineField({
      name: 'imageMarginTop',
      title: 'Image Top Margin (px)',
      type: 'number',
      group: 'image',
      description: 'Space above the image frame.',
      initialValue: 20,
      validation: (Rule) => Rule.min(0),
    }),
    defineField({
      name: 'imageMarginBottom',
      title: 'Image Bottom Margin (px)',
      type: 'number',
      group: 'image',
      description: 'Space below the image frame.',
      initialValue: 10,
      validation: (Rule) => Rule.min(0),
    }),
  ],
  preview: {
    select: {title: 'heading', media: 'image'},
    prepare: ({title, media}) => ({
      title: title || 'About Section',
      subtitle: 'Rich text + optional image, fully themeable',
      media,
    }),
  },
})

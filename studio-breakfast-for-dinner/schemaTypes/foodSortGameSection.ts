import {defineField, defineType} from 'sanity'
import {PlayIcon} from '@sanity/icons'

export default defineType({
  name: 'foodSortGameSection',
  title: 'Food Sort Game Section',
  type: 'object',
  icon: PlayIcon,

  groups: [
    {name: 'content', title: 'Content'},
    {name: 'game', title: 'Gameplay'},
    {name: 'style', title: 'Style'},
    {name: 'link', title: 'Start Link'},
  ],

  fields: [
    // ---------- CONTENT ----------
    defineField({
      name: 'heading',
      title: 'Heading',
      type: 'string',
      description: 'Big title shown above the mini-game.',
      group: 'content',
      validation: (Rule) => Rule.required().min(2).max(80),
      initialValue: 'Mini-Game: Breakfast or Dinner?',
    }),
    defineField({
      name: 'introText',
      title: 'Intro Text',
      type: 'text',
      rows: 3,
      description: 'Short intro/instructions shown before the game starts.',
      group: 'content',
      validation: (Rule) => Rule.max(240),
      initialValue: 'Categorize the food before time runs out!',
    }),
    defineField({
      name: 'instructions',
      title: 'Instructions (bulleted)',
      type: 'array',
      of: [{type: 'string'}],
      description: 'Optional bullets (max 8).',
      group: 'content',
      validation: (Rule) => Rule.max(8),
    }),

    // ---------- GAME ----------
    defineField({
      name: 'difficulty',
      title: 'Difficulty (label only)',
      type: 'string',
      options: {
        list: [
          {title: 'Easy', value: 'easy'},
          {title: 'Normal', value: 'normal'},
          {title: 'Hard', value: 'hard'},
        ],
        layout: 'radio',
      },
      description: 'Label only. Timer & scoring are fixed.',
      group: 'game',
      initialValue: 'normal',
    }),
    defineField({
      name: 'maxRounds',
      title: 'Max Rounds',
      type: 'number',
      description: 'How many items to show before ending. 0 = unlimited (timer still ends).',
      group: 'game',
      initialValue: 0,
      validation: (Rule) => Rule.min(0).max(50),
    }),
    defineField({
      name: 'startButtonLabel',
      title: 'Start Button Label',
      type: 'string',
      description: 'Text on the start/restart button.',
      group: 'game',
      validation: (Rule) => Rule.required().min(1).max(30),
      initialValue: 'Start Game!',
    }),

    // ---------- STYLE ----------
    defineField({
      name: 'style',
      title: 'Style',
      type: 'object',
      group: 'style',
      options: {collapsible: true, collapsed: false},
      description: 'Visual theming for the section.',
      fields: [
        // Layout
        defineField({
          name: 'paddingY', title: 'Section Padding (Vertical)', type: 'number',
          description: 'Top/bottom padding (px).', initialValue: 50,
        }),
        defineField({
          name: 'paddingX', title: 'Section Padding (Horizontal)', type: 'number',
          description: 'Left/right padding (px).', initialValue: 20,
        }),

        // Background gradient
        defineField({
          name: 'bgAngle', title: 'Background Angle (deg)', type: 'number',
          description: 'Angle for gradient if both colors are set.', initialValue: 0,
        }),
        defineField({
          name: 'bgColorStart', title: 'Background Color (Start)', type: 'color',
          options: { colorList: ['#7DB942', '#A5D66A', '#6FB03B'] },
        }),
        defineField({
          name: 'bgColorEnd', title: 'Background Color (End)', type: 'color',
          options: { colorList: ['#7DB942', '#A5D66A', '#6FB03B'] },
        }),
        defineField({
          name: 'textColor', title: 'Body Text Color', type: 'color',
          options: { colorList: ['#212121', '#1A1A1A'] },
        }),
        defineField({
          name: 'dashColor', title: 'Dashed Border Color', type: 'color',
          options: { colorList: ['#212121', '#1A1A1A'] },
        }),

        // Heading
        defineField({
          name: 'headingFillColor', title: 'Heading Fill', type: 'color',
          options: { colorList: ['#FFFFFF', '#FFFDF5'] },
        }),
        defineField({
          name: 'headingStrokeColor', title: 'Heading Stroke', type: 'color',
          options: { colorList: ['#212121', '#000000'] },
        }),
        defineField({
          name: 'headingStrokeWidth', title: 'Heading Stroke Width (px)', type: 'number',
          initialValue: 2,
        }),

        // Game card
        defineField({
          name: 'gameAreaBg', title: 'Game Card Background', type: 'color',
          options: { colorList: ['#FFFFFF', '#FFFEFA'] },
        }),
        defineField({
          name: 'gameAreaBorderColor', title: 'Game Card Border', type: 'color',
          options: { colorList: ['#212121'] },
        }),
        defineField({
          name: 'gameAreaBorderWidth', title: 'Game Card Border Width (px)', type: 'number',
          initialValue: 3,
        }),
        defineField({
          name: 'gameAreaRadius', title: 'Game Card Corner Radius (px)', type: 'number',
          initialValue: 15,
        }),
        defineField({
          name: 'gameAreaShadowColor', title: 'Game Card Shadow Color', type: 'color',
          options: { colorList: ['#558B2F', '#4E7F2C'] },
        }),

        // Accents
        defineField({
          name: 'statsColor', title: 'Stats Text Color', type: 'color',
          options: { colorList: ['#6C4AE3', '#512DA8'] },
        }),
        defineField({
          name: 'feedbackColor', title: 'Feedback Text Color', type: 'color',
          options: { colorList: ['#1976D2', '#3F51B5'] },
        }),

        // Decorative blobs
        defineField({
          name: 'showBlobs', title: 'Show Decorative Blobs', type: 'boolean',
          initialValue: true,
        }),
        defineField({
          name: 'blobColor', title: 'Blob Color', type: 'color',
          options: { colorList: ['#FFFFFF'] },
        }),
        defineField({
          name: 'blobOpacity', title: 'Blob Opacity', type: 'number',
          description: '0 = invisible, 1 = solid', initialValue: 0.3,
        }),

        // Start button styling
        defineField({
          name: 'startButtonStyle',
          title: 'Start Button Style',
          type: 'reference',
          to: [{type: 'buttonStyle'}],
          description: 'Pick a button style tile for the Start Game button.',
        }),
        defineField({
          name: 'startButtonOverride',
          title: 'Start Button Override',
          type: 'object',
          options: {collapsible: true, collapsed: true},
          fields: [
            defineField({ name: 'paddingX', type: 'number', title: 'Padding X (px)' }),
            defineField({ name: 'paddingY', type: 'number', title: 'Padding Y (px)' }),
            defineField({ name: 'borderRadius', type: 'number', title: 'Border Radius (px)' }),
            defineField({ name: 'borderWidth', type: 'number', title: 'Border Width (px)' }),
            defineField({
              name: 'textColor', type: 'color', title: 'Text',
              options: { colorList: ['#FFFFFF', '#212121'] },
            }),
            defineField({
              name: 'backgroundColor', type: 'color', title: 'Background',
              options: { colorList: ['#558B2F', '#7DB942', '#212121'] },
            }),
            defineField({
              name: 'borderColor', type: 'color', title: 'Border',
              options: { colorList: ['#212121', '#000000'] },
            }),
            defineField({ name: 'font', type: 'string', title: 'Font Family' }),
            defineField({ name: 'fontWeight', type: 'number', title: 'Font Weight' }),
            defineField({ name: 'fontSize', type: 'number', title: 'Font Size (px)' }),
            defineField({ name: 'boxShadow', type: 'string', title: 'Box Shadow' }),
            defineField({ name: 'textShadow', type: 'string', title: 'Text Shadow' }),
          ],
        }),

        // --- Breakfast Button ---
      defineField({
        name: 'breakfastButtonStyle',
        title: 'Breakfast Button Style',
        type: 'reference',
        to: [{type: 'buttonStyle'}],
      }),
      defineField({
        name: 'breakfastButtonOverride',
        title: 'Breakfast Button Override',
        type: 'object',
        options: {collapsible: true, collapsed: true},
        fields: [
          defineField({ name: 'paddingX', type: 'number', title: 'Padding X (px)' }),
          defineField({ name: 'paddingY', type: 'number', title: 'Padding Y (px)' }),
          defineField({ name: 'borderRadius', type: 'number', title: 'Border Radius (px)' }),
          defineField({ name: 'borderWidth', type: 'number', title: 'Border Width (px)' }),
          defineField({
            name: 'textColor', type: 'color', title: 'Text',
            options: { colorList: ['#FFFFFF', '#212121'] },
          }),
          defineField({
            name: 'backgroundColor', type: 'color', title: 'Background',
            options: { colorList: ['#ffeb3b', '#7DB942', '#212121'] },
          }),
          defineField({ name: 'borderColor', type: 'color', title: 'Border Color' }),
          defineField({ name: 'font', type: 'string', title: 'Font Family' }),
          defineField({ name: 'fontWeight', type: 'number', title: 'Font Weight' }),
          defineField({ name: 'fontSize', type: 'number', title: 'Font Size (px)' }),
          defineField({ name: 'boxShadow', type: 'string', title: 'Box Shadow' }),
          defineField({ name: 'textShadow', type: 'string', title: 'Text Shadow' }),
        ],
      }),

      // --- Dinner Button ---
      defineField({
        name: 'dinnerButtonStyle',
        title: 'Dinner Button Style',
        type: 'reference',
        to: [{type: 'buttonStyle'}],
      }),
      defineField({
        name: 'dinnerButtonOverride',
        title: 'Dinner Button Override',
        type: 'object',
        options: {collapsible: true, collapsed: true},
        fields: [
          defineField({ name: 'paddingX', type: 'number', title: 'Padding X (px)' }),
          defineField({ name: 'paddingY', type: 'number', title: 'Padding Y (px)' }),
          defineField({ name: 'borderRadius', type: 'number', title: 'Border Radius (px)' }),
          defineField({ name: 'borderWidth', type: 'number', title: 'Border Width (px)' }),
          defineField({
            name: 'textColor', type: 'color', title: 'Text',
            options: { colorList: ['#FFFFFF', '#212121'] },
          }),
          defineField({
            name: 'backgroundColor', type: 'color', title: 'Background',
            options: { colorList: ['#8e24aa', '#7DB942', '#212121'] },
          }),
          defineField({ name: 'borderColor', type: 'color', title: 'Border Color' }),
          defineField({ name: 'font', type: 'string', title: 'Font Family' }),
          defineField({ name: 'fontWeight', type: 'number', title: 'Font Weight' }),
          defineField({ name: 'fontSize', type: 'number', title: 'Font Size (px)' }),
          defineField({ name: 'boxShadow', type: 'string', title: 'Box Shadow' }),
          defineField({ name: 'textShadow', type: 'string', title: 'Text Shadow' }),
        ],
      }),
      ],
    }),

    // ---------- OPTIONAL START LINK ----------
    defineField({
      name: 'startLink',
      title: 'Start Link (optional)',
      type: 'object',
      group: 'link',
      fields: [
        defineField({
          name: 'type',
          title: 'Link Type',
          type: 'string',
          options: {list: ['internal', 'external'], layout: 'radio'},
          initialValue: 'internal',
        }),
        defineField({
          name: 'internal',
          title: 'Internal Page',
          type: 'reference',
          to: [{type: 'page'}],
          hidden: ({parent}) => parent?.type !== 'internal',
        }),
        defineField({
          name: 'external',
          title: 'External URL',
          type: 'url',
          hidden: ({parent}) => parent?.type !== 'external',
          validation: (Rule) => Rule.uri({allowRelative: false, scheme: ['http', 'https']}),
        }),
        defineField({
          name: 'openInNewTab',
          title: 'Open in new tab',
          type: 'boolean',
          initialValue: false,
        }),
      ],
    }),
  ],

  preview: {
    select: {title: 'heading', diff: 'difficulty', rounds: 'maxRounds'},
    prepare({title, diff, rounds}) {
      const badge = [diff || 'normal', rounds ? `${rounds} rounds` : null].filter(Boolean).join(' · ')
      return { title: title || 'Food Sort Game Section', subtitle: badge || 'Mini-game' }
    },
  },
})
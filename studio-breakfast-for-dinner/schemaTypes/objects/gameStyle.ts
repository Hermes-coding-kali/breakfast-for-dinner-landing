// schemaTypes/objects/gameStyle.ts
import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'gameStyle',
  title: 'Food Game Style',
  type: 'object',
  fields: [
    // Layout
    defineField({ name: 'paddingY', title: 'Padding Y', type: 'number', initialValue: 50 }),
    defineField({ name: 'paddingX', title: 'Padding X', type: 'number', initialValue: 20 }),

    // Section background
    defineField({ name: 'bgAngle', title: 'Background Angle (deg)', type: 'number', initialValue: 0 }),
    defineField({ name: 'bgColorStart', title: 'Background Color Start', type: 'color', initialValue: { _type:'color', hex:'#D9F5C1' } }),
    defineField({ name: 'bgColorEnd', title: 'Background Color End', type: 'color', initialValue: { _type:'color', hex:'#BEEA97' } }),

    // Text + dashed separators
    defineField({ name: 'textColor', title: 'Body Text Color', type: 'color', initialValue: { _type:'color', hex:'#333333' } }),
    defineField({ name: 'dashColor', title: 'Dashed Border Color', type: 'color', initialValue: { _type:'color', hex:'#333333' } }),

    // Heading
    defineField({ name: 'headingFillColor', title: 'Heading Fill', type: 'color', initialValue: { _type:'color', hex:'#FFFFFF' } }),
    defineField({ name: 'headingStrokeColor', title: 'Heading Stroke', type: 'color', initialValue: { _type:'color', hex:'#333333' } }),
    defineField({ name: 'headingStrokeWidth', title: 'Heading Stroke Width (px)', type: 'number', initialValue: 2 }),

    // Game card
    defineField({ name: 'gameAreaBg', title: 'Game Area Background', type: 'color', initialValue: { _type:'color', hex:'#FFFFFF' } }),
    defineField({ name: 'gameAreaBorderColor', title: 'Game Area Border', type: 'color', initialValue: { _type:'color', hex:'#333333' } }),
    defineField({ name: 'gameAreaBorderWidth', title: 'Game Area Border Width (px)', type: 'number', initialValue: 3 }),
    defineField({ name: 'gameAreaRadius', title: 'Game Area Radius (px)', type: 'number', initialValue: 15 }),
    defineField({ name: 'gameAreaShadowColor', title: 'Game Area Shadow Color', type: 'color', initialValue: { _type:'color', hex:'#5AA75A' } }),

    // Accents
    defineField({ name: 'statsColor', title: 'Stats Text Color', type: 'color', initialValue: { _type:'color', hex:'#6B4DE6' } }),
    defineField({ name: 'feedbackColor', title: 'Feedback Text Color', type: 'color', initialValue: { _type:'color', hex:'#2B6EF2' } }),

    // Blobs
    defineField({ name: 'showBlobs', title: 'Show Decorative Blobs', type: 'boolean', initialValue: true }),
    defineField({ name: 'blobColor', title: 'Blob Color', type: 'color', initialValue: { _type:'color', hex:'#FFFFFF' } }),
    defineField({ name: 'blobOpacity', title: 'Blob Opacity (0-1)', type: 'number', initialValue: 0.3 }),
  ],
})

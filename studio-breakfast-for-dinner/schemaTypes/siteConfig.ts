// schemaTypes/siteConfig.ts
import {defineField, defineType} from 'sanity'
import {CogIcon} from '@sanity/icons'

export default defineType({
  name: 'siteConfig',
  title: 'Site Configuration',
  type: 'document',
  icon: CogIcon,
  groups: [
    {name: 'general', title: 'General', default: true},
    {name: 'header', title: 'Header'},
    {name: 'footer', title: 'Footer'},
    {name: 'seo', title: 'SEO'},
  ],
  fields: [
    // --- GENERAL ---
    defineField({
      name: 'siteTitle',
      title: 'Site Title',
      type: 'string',
      group: 'general',
      description: 'The official name of the site. This appears in browser tabs, search engine results, and social media links.',
      validation: (Rule) => Rule.required().min(2).max(60),
      initialValue: 'Breakfast for Dinner',
    }),
    defineField({
      name: 'siteUrl',
      title: 'Site URL',
      type: 'url',
      group: 'general',
      description: 'The main web address for the site (e.g., https://breakfastfordinner.com). This is crucial for SEO.',
      validation: (Rule) =>
        Rule.uri({allowRelative: false, scheme: ['http', 'https']}).required(),
      initialValue: 'https://example.com',
    }),
    defineField({
      name: 'locale',
      title: 'Primary Language',
      type: 'string',
      group: 'general',
      description: 'The primary language of the site content, specified by a BCP 47 tag (e.g., "en-US" for English/United States or "fr-CA" for French/Canada).',
      initialValue: 'en-US',
      validation: (Rule) => Rule.regex(/^[a-z]{2,3}(-[A-Z]{2})?$/).warning('Use a valid language tag like "en-US"'),
    }),

    // --- HEADER ---
    defineField({
      name: 'headerStyle',
      title: 'Base Header Style',
      type: 'reference',
      to: [{type: 'headerStyle'}],
      group: 'header',
      description: 'Select a saved Header Style preset to apply to the main site header.',
    }),
    defineField({
      name: 'headerStyleOverride',
      title: 'Header Style Overrides (Optional)',
      type: 'headerStyle',
      group: 'header',
      description: 'Fine-tune the header by overriding specific fields from the selected Base Style. Any field you leave blank here will use the setting from the Base Style.',
    }),

    // --- FOOTER ---
    defineField({
      name: 'footerText',
      title: 'Footer Text',
      type: 'string',
      group: 'footer',
      description: 'The copyright or short message displayed in the footer. Use {year} to automatically display the current year.',
      validation: (Rule) => Rule.max(140),
      initialValue: '© {year} CoCo Bean. All Rights Reserved.',
    }),
    defineField({
      name: 'socialLinks',
      title: 'Social Media Links',
      type: 'array',
      group: 'footer',
      description: 'Add links to your social media profiles. These will appear as icons in the footer.',
      of: [{type: 'socialLink'}],
      validation: (Rule) => Rule.unique(),
      initialValue: [
        {_type: 'socialLink', platform: 'instagram', url: 'https://instagram.com'},
        {_type: 'socialLink', platform: 'twitter', url: 'https://twitter.com'},
        {_type: 'socialLink', platform: 'facebook', url: 'https://facebook.com'},
      ],
    }),
    defineField({
      name: 'footerStyle',
      title: 'Base Footer Style',
      type: 'reference',
      to: [{type: 'footerStyle'}],
      group: 'footer',
      description: 'Select a saved Footer Style preset.',
    }),
    defineField({
      name: 'footerStyleOverride',
      title: 'Footer Style Overrides (Optional)',
      type: 'footerStyle',
      group: 'footer',
      description: 'Fine-tune the footer by overriding specific fields from the selected Base Style.',
    }),

    // --- SEO ---
    defineField({
      name: 'defaultSeoTitleTemplate',
      title: 'SEO Title Template',
      type: 'string',
      group: 'seo',
      description: 'A template for page titles in search results. The "%s" will be replaced with the individual page\'s title.',
      initialValue: '%s | Breakfast for Dinner',
    }),
    defineField({
      name: 'defaultSeoDescription',
      title: 'Default SEO Description',
      type: 'text',
      rows: 3,
      group: 'seo',
      description: 'A short, compelling summary (up to 160 characters) to show in search results for pages that don\'t have their own specific description.',
      validation: (Rule) => Rule.max(160),
      initialValue: 'Discover the delightful world of "Breakfast for Dinner," a charming book by CoCo Bean that celebrates the joy of morning meals at any time of day.',
    }),
    defineField({
      name: 'defaultSeoImage',
      title: 'Default Social Share Image',
      type: 'image',
      group: 'seo',
      options: {hotspot: true},
      description: 'The image that appears when the site is shared on social media (e.g., Facebook, Twitter), if a specific page doesn\'t have its own share image.',
    }),
    defineField({
      name: 'noindex',
      title: 'Discourage Search Engines',
      type: 'boolean',
      group: 'seo',
      description: 'Enable this to add a "noindex" tag sitewide, telling search engines like Google not to list your site in their results. Useful for development or private sites.',
      initialValue: false,
    }),
    defineField({
      name: 'nofollow',
      title: 'Nofollow Outbound Links',
      type: 'boolean',
      group: 'seo',
      description: 'Enable this to add a "nofollow" tag to all external links, suggesting that search engines should not follow them.',
      initialValue: false,
    }),
    defineField({
      name: 'analyticsId',
      title: 'Google Analytics ID (optional)',
      type: 'string',
      group: 'seo',
      description: 'Your Google Analytics Measurement ID (e.g., G-XXXXXXX) to enable site tracking.',
    }),
  ],
  preview: {prepare: () => ({title: 'Site Configuration'})},
})
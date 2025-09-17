// schemaTypes/page.ts
import {defineField, defineType} from 'sanity'
import {DocumentsIcon, HideIcon, LinkIcon} from '@sanity/icons'

export default defineType({
  name: 'page',
  title: 'Page',
  type: 'document',
  icon: DocumentsIcon,

  groups: [
    {name: 'content', title: 'Content', default: true},
    {name: 'seo', title: 'SEO'},
    {name: 'options', title: 'Options'},
  ],

  fields: [
    // ---- CONTENT ----
    defineField({
      name: 'title',
      title: 'Page Title',
      type: 'string',
      group: 'content',
      validation: (Rule) => Rule.required().min(2).max(80),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      group: 'content',
      options: {
        source: 'title',
        maxLength: 96,
        isUnique: (value, context) => context.defaultIsUnique(value, context),
      },
      validation: (Rule) => Rule.required(),
      description: 'URL path for this page (e.g., "about" → /about)',
    }),
    defineField({
      name: 'description',
      title: 'Internal Description',
      type: 'text',
      rows: 2,
      group: 'content',
      description: 'Editor-only note about the page’s purpose (not shown on site).',
      validation: (Rule) => Rule.max(200),
    }),
    defineField({
      name: 'pageBuilder',
      title: 'Page Sections',
      type: 'array',
      group: 'content',
      description: 'Add, remove, and reorder sections to build the page.',
      of: [
        // Register your section object types in schemaTypes and list them here:
        {type: 'heroSection'},
        {type: 'aboutSection'},
        {type: 'featuredItemSection'},
        {type: 'emailSignupSection'}, // ← renamed/modern CTA
        {type: 'foodSortGameSection'}, // <-- Add this
      ],
      validation: (Rule) => Rule.unique(),
    }),

    // ---- SEO ----
    defineField({
      name: 'seo',
      title: 'SEO',
      type: 'object',
      group: 'seo',
      fields: [
        defineField({
          name: 'metaTitle',
          title: 'Meta Title',
          type: 'string',
          validation: (Rule) => Rule.max(60),
          description: 'Optional override. If empty, defaults to Page Title.',
        }),
        defineField({
          name: 'metaDescription',
          title: 'Meta Description',
          type: 'text',
          rows: 3,
          validation: (Rule) => Rule.max(160),
        }),
        defineField({
          name: 'ogImage',
          title: 'Open Graph Image',
          type: 'image',
          options: {hotspot: true},
          description: 'Used for link previews if set.',
        }),
        defineField({
          name: 'canonicalUrl',
          title: 'Canonical URL (optional)',
          type: 'url',
          validation: (Rule) => Rule.uri({allowRelative: false, scheme: ['http', 'https']}),
        }),
        defineField({
          name: 'noindex',
          title: 'Noindex (exclude from search engines)',
          type: 'boolean',
          initialValue: false,
        }),
        defineField({
          name: 'nofollow',
          title: 'Nofollow outbound links',
          type: 'boolean',
          initialValue: false,
        }),
      ],
    }),

    // ---- OPTIONS / METADATA ----
    defineField({
      name: 'publishedAt',
      title: 'Publish Date',
      type: 'datetime',
      group: 'options',
      description: 'Optional: controls when the page is considered “published.”',
    }),
    defineField({
      name: 'excludeFromNav',
      title: 'Hide from Navigation',
      type: 'boolean',
      group: 'options',
      initialValue: false,
    }),
    defineField({
      name: 'order',
      title: 'Manual Order',
      type: 'number',
      group: 'options',
      description: 'Use to sort pages in menus (lower first).',
      validation: (Rule) => Rule.min(0),
    }),
    defineField({
      name: 'layout',
      title: 'Layout',
      type: 'string',
      group: 'options',
      options: {
        list: [
          {title: 'Default', value: 'default'},
          {title: 'Landing (wide)', value: 'landing'},
          {title: 'Narrow (readable)', value: 'narrow'},
        ],
        layout: 'radio',
      },
      initialValue: 'default',
    }),
  ],

  orderings: [
    {title: 'Title, A→Z', name: 'titleAsc', by: [{field: 'title', direction: 'asc'}]},
    {title: 'Order, low→high', name: 'orderAsc', by: [{field: 'order', direction: 'asc'}]},
    {title: 'Publish date, new→old', name: 'publishedAtDesc', by: [{field: 'publishedAt', direction: 'desc'}]},
  ],

  preview: {
    select: {
      title: 'title',
      slug: 'slug.current',
      noindex: 'seo.noindex',
      layout: 'layout',
    },
    prepare({title, slug, noindex, layout}) {
      const path = slug ? `/${slug}` : '(no slug)'
      const badges = [
        noindex ? 'Noindex' : null,
        layout && layout !== 'default' ? `Layout: ${layout}` : null,
      ].filter(Boolean)
      return {
        title: title || 'Untitled page',
        subtitle: [path, badges.join(' · ')].filter(Boolean).join(' — '),
        media: noindex ? EyeOffIcon : LinkIcon,
      }
    },
  },
})

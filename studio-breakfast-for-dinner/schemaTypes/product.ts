// studio-breakfast-for-dinner/schemaTypes/product.ts
import { defineField, defineType } from 'sanity'
import { BookIcon } from '@sanity/icons' // Example icon

export default defineType({
    name: 'product',
    title: 'Product',
    type: 'document',
    icon: BookIcon,
    fields: [
        defineField({
            name: 'name',
            title: 'Product Name',
            type: 'string',
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: 'slug',
            title: 'Slug',
            type: 'slug',
            options: { source: 'name', maxLength: 96 },
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: 'images',
            title: 'Product Images',
            type: 'array',
            of: [{ type: 'image', options: { hotspot: true } }],
            validation: (Rule) => Rule.required().min(1),
        }),
        defineField({
            name: 'category',
            title: 'Category',
            type: 'reference',
            to: [{ type: 'category' }],
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: 'description',
            title: 'Description',
            type: 'array',
            of: [{ type: 'block' }],
        }),
        defineField({
            name: 'inventory',
            title: 'Inventory',
            type: 'number',
            description: 'Leave empty for unlimited stock.',
            validation: (Rule) => Rule.integer().min(0),
        }),
        defineField({
            name: 'isFeatured',
            title: 'Feature on homepage?',
            type: 'boolean',
            initialValue: false,
        }),
        // --- REMOVED price and currency FIELDS ---
        // The price will be fetched directly from Stripe.

        defineField({
            name: 'stripe',
            title: 'Stripe Integration',
            type: 'object',
            options: { collapsible: true, collapsed: false },
            validation: (Rule) => Rule.required(), // require that the whole object exists
            fields: [
                defineField({
                    name: 'stripePriceId',
                    title: 'Stripe Price ID',
                    type: 'string',
                    description: 'Copy the Price ID from Stripe (e.g., price_1M...)',
                    validation: (Rule) => Rule.required(), // require that this value is filled in
                }),
            ],
        }),
    ],
    preview: {
        select: {
            title: 'name',
            media: 'images.0.asset', // Show the first image in previews
            category: 'category.title',
        },
        prepare({ title, media, category }) {
            return {
                title,
                media,
                subtitle: category ? `Category: ${category}` : 'Uncategorized',
            }
        },
    },
})
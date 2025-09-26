// schemaTypes/product.ts

import { defineField, defineType } from 'sanity'
import { BookIcon } from '@sanity/icons'

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
            name: 'sku',
            title: 'SKU or ISBN',
            type: 'string',
            description: 'A unique identifier for this product (e.g., the ISBN).',
        }),
        defineField({
            name: 'priceCode',
            title: 'Publisher Price Code',
            type: 'string',
            description: 'Internal code used by the publisher (e.g., 62400).',
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
        // ⭐️ START: ADD THIS NEW FIELD ⭐️
        defineField({
            name: 'details',
            title: 'Product Details',
            type: 'object',
            options: { collapsible: true, collapsed: false },
            fields: [
                defineField({
                    name: 'format',
                    title: 'Format',
                    type: 'string',
                    options: { list: ['Hardcover', 'Paperback', 'E-Book'] },
                    initialValue: 'Hardcover',
                }),
                defineField({
                    name: 'pages',
                    title: 'Page Count',
                    type: 'number',
                    validation: (Rule) => Rule.integer().positive(),
                }),
                defineField({
                    name: 'dimensions',
                    title: 'Dimensions',
                    type: 'string',
                    description: 'e.g., "8.5 x 11 inches"',
                }),
                 defineField({
                    name: 'language',
                    title: 'Language',
                    type: 'string',
                    initialValue: 'English',
                }),
            ]
        }),
        // ⭐️ END: ADD THIS NEW FIELD ⭐️
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
        defineField({
            name: 'stripe',
            title: 'Stripe Integration',
            type: 'object',
            options: { collapsible: true, collapsed: false },
            validation: (Rule) => Rule.required(),
            fields: [
                defineField({
                    name: 'stripePriceId',
                    title: 'Stripe Price ID',
                    type: 'string',
                    description: 'Copy the Price ID from Stripe (e.g., price_1M...)',
                    validation: (Rule) => Rule.required(),
                }),
                defineField({
                    name: 'taxCode',
                    title: 'Stripe Tax Code',
                    type: 'string',
                    description: 'e.g., "txcd_92010004" for Children\'s Books (Physical).',
                    initialValue: 'txcd_92010004'
                })
            ],
        }),
    ],
    preview: {
        select: {
            title: 'name',
            media: 'images.0.asset',
            category: 'category.title',
            sku: 'sku',
        },
        prepare({ title, media, category, sku }) {
            return {
                title,
                media,
                subtitle: sku || (category ? `Category: ${category}` : 'Uncategorized'),
            }
        },
    },
})
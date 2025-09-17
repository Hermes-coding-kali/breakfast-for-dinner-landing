// studio-breakfast-for-dinner/sanity.config.ts
import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {schemaTypes} from './schemaTypes'
import {PresentationIcon, DocumentTextIcon, CogIcon, ColorWheelIcon} from '@sanity/icons' // <-- Import ColorWheelIcon
import {colorInput} from '@sanity/color-input'

export default defineConfig({
  name: 'default',
  title: 'Breakfast For Dinner',
  projectId: '14ptmpdh',
  dataset: 'production',

  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title('Content')
          .items([
            // --- UPDATED SINGLETONS ---
            S.listItem()
              .title('Design System')
              .icon(ColorWheelIcon)
              .child(S.document().schemaType('designSystem').documentId('designSystem')),
            S.listItem()
              .title('Site Configuration')
              .icon(CogIcon)
              .child(S.document().schemaType('siteConfig').documentId('siteConfig')),
            S.divider(),
            // (Your existing marketing documents are below)
            S.listItem()
              .title('Marketing Modal')
              .icon(PresentationIcon)
              .child(S.document().schemaType('marketingModal').documentId('marketingModal')),
            S.listItem()
              .title('Announcement Banner')
              .icon(DocumentTextIcon)
              .child(S.document().schemaType('marketingBanner').documentId('marketingBanner')),
            S.divider(),
            ...S.documentTypeListItems().filter(
              (listItem) =>
                !['designSystem', 'siteConfig', 'marketingModal', 'marketingBanner'].includes( // <-- Update this list
                  listItem.getId() || ''
                )
            ),
          ]),
    }),
    visionTool(),
    colorInput(),
  ],

  schema: {
    types: schemaTypes,
  },
})
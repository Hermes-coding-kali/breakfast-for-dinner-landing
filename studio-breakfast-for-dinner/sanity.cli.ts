import { defineCliConfig } from 'sanity/cli'

export default defineCliConfig({
  api: {
    projectId: '14ptmpdh',
    dataset: 'production'
  },
  deployment: {
    autoUpdates: true,
    appId: 'kol169ib4j72x7yh53eygrlc'
  },
})

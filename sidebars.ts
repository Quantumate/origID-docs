import type { SidebarsConfig } from '@docusaurus/plugin-content-docs'

const sidebars: SidebarsConfig = {
  docs: [
    'intro',
    'authentication',
    {
      type: 'category',
      label: 'Watermark API',
      collapsed: false,
      items: [
        {
          type: 'doc',
          id: 'api/watermark-encode-sign',
          label: 'Encode Watermark',
        },
        {
          type: 'doc',
          id: 'api/watermark-decode',
          label: 'Decode Watermark',
        },
        {
          type: 'doc',
          id: 'api/watermark-progress',
          label: 'Check Progress',
        },
        {
          type: 'doc',
          id: 'api/watermark-download',
          label: 'Download File',
        },
      ],
    },
  ],
}

export default sidebars

import type { Preview } from '@storybook/react'
import '../src/styles/globals.css'

const preview: Preview = {
  parameters: {
    viewport: {
      viewports: {
        mobile375: {
          name: 'Mobile 375',
          styles: { width: '375px', height: '667px' },
          type: 'mobile',
        },
        mobile414: {
          name: 'Mobile 414',
          styles: { width: '414px', height: '896px' },
          type: 'mobile',
        },
        tablet768: {
          name: 'Tablet 768',
          styles: { width: '768px', height: '1024px' },
          type: 'tablet',
        },
        desktop1280: {
          name: 'Desktop 1280',
          styles: { width: '1280px', height: '800px' },
          type: 'desktop',
        },
        largeDesktop: {
          name: 'Large Desktop',
          styles: { width: '1536px', height: '900px' },
          type: 'desktop',
        },
      },
    },
    layout: 'fullscreen',
  },
}

export default preview
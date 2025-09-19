import type { Preview } from '@storybook/nextjs'
import '../src/styles/globals.css'

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
       color: /(background|color)$/i,
       date: /Date$/i,
      },
      expanded: true,
      sort: 'requiredFirst',
    },
    layout: 'fullscreen',
    // 접근성 테스트 설정
    a11y: {
      config: {
        rules: [
          {
            id: 'color-contrast',
            enabled: true,
          },
        ],
      },
    },
    // 뷰포트 설정
    viewport: {
      viewports: {
        mobile1: {
          name: 'Small Mobile',
          styles: {
            width: '375px',
            height: '667px',
          },
        },
        mobile2: {
          name: 'Large Mobile',
          styles: {
            width: '414px',
            height: '896px',
          },
        },
        tablet: {
          name: 'Tablet',
          styles: {
            width: '768px',
            height: '1024px',
          },
        },
        desktop: {
          name: 'Desktop',
          styles: {
            width: '1024px',
            height: '768px',
          },
        },
        largeDesktop: {
          name: 'Large Desktop',
          styles: {
            width: '1920px',
            height: '1080px',
          },
        },
      },
    },
    // 성능 측정
    performance: {
      maxDuration: 1000,
    },
    // 문서화 설정
    docs: {
      toc: true,
      source: {
        state: 'open',
      },
    },
  },
  // 글로벌 데코레이터
  decorators: [
    (Story) => (
      <div style={{ fontFamily: 'Pretendard, sans-serif' }}>
        <Story />
      </div>
    ),
  ],
};

export default preview;
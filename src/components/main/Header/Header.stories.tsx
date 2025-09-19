import type { Meta, StoryObj } from '@storybook/react';
import Header from './index';

const meta: Meta<typeof Header> = {
  title: 'Components/Main/Header',
  component: Header,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
# 전국마라톤협회 헤더 컴포넌트

## 주요 기능
- **로고 및 브랜딩**: 협회 로고와 명칭 표시
- **네비게이션 메뉴**: 6개 주요 메뉴 (전마협, 대회일정, 접수안내, 게시판, 쇼핑몰, 마이페이지)
- **서브메뉴**: 각 메뉴별 상세 항목들
- **검색 기능**: 전체 사이트 검색 모달
- **사용자 기능**: 로그인, 장바구니
- **반응형 디자인**: 데스크탑, 태블릿, 모바일 지원

## 기술 스택
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Framer Motion (애니메이션)
- 반응형 디자인
        `,
      },
    },
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
        <Story />
        <div style={{ paddingTop: '80px', padding: '20px' }}>
          <h1 style={{ fontFamily: 'Pretendard, sans-serif', fontSize: '24px', marginBottom: '16px' }}>
            🏃‍♂️ 전국마라톤협회 웹사이트
          </h1>
          <p style={{ fontFamily: 'Pretendard, sans-serif', fontSize: '16px', color: '#666' }}>
            Header 컴포넌트의 모든 기능을 테스트할 수 있습니다.
          </p>
        </div>
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

// 기본 Header 스토리 (데스크탑) - 전체 화면 사용
export const Default: Story = {
  args: {},
  parameters: {
    viewport: {
      defaultViewport: 'desktop',
    },
    docs: {
      description: {
        story: '데스크탑 뷰에서의 기본 헤더 상태입니다. 마우스 호버로 서브메뉴를 확인할 수 있습니다.',
      },
    },
  },
};

// 모바일 Header 스토리 (작은 모바일) - 전체 캔버스를 모바일 크기로 제한
export const MobileSmall: Story = {
  args: {},
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
    docs: {
      description: {
        story: '작은 모바일 뷰에서의 헤더 상태입니다. 햄버거 메뉴가 우측에 표시됩니다.',
      },
    },
  },
    decorators: [
    (Story) => (
      <div style={{ 
        width: '375px', 
        minHeight: '667px',
        margin: '0 auto', 
        border: '3px solid #3b82f6', 
        borderRadius: '12px',
        overflow: 'hidden',
        backgroundColor: 'white',
        position: 'relative',
        boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
        transform: 'scale(1)',
        transformOrigin: 'top center'
      }}>
        <div style={{ 
          position: 'absolute', 
          top: '10px', 
          left: '10px', 
          backgroundColor: '#3b82f6', 
          color: 'white', 
          padding: '4px 8px', 
          borderRadius: '4px', 
          fontSize: '12px', 
          fontWeight: 'bold', 
          zIndex: 1000
        }}>
          375px
        </div>
        <div style={{ width: '100%', height: '100%' }}>
          <Story />
        </div>
        <div style={{
          position: 'absolute',
          bottom: '0',
          left: '0',
          right: '0',
          padding: '15px',
          backgroundColor: '#f8fafc',
          borderTop: '1px solid #e2e8f0'
        }}>
          <h3 style={{ fontFamily: 'Pretendard, sans-serif', fontSize: '14px', marginBottom: '8px', color: '#1e293b' }}>
            📱 모바일 뷰 (375px)
          </h3>
          <p style={{ fontFamily: 'Pretendard, sans-serif', fontSize: '12px', color: '#64748b' }}>
            실제 모바일 화면 크기로 제한된 헤더입니다.
          </p>
        </div>
        {/* 모바일 뷰포트 강제 CSS */}
        <style>{`
          @media (min-width: 768px) {
            .md\\:hidden {
              display: block !important;
            }
            .md\\:grid {
              display: none !important;
            }
          }
        `}</style>
      </div>
    ),
  ],
};

// 모바일 Header 스토리 (큰 모바일) - 전체 캔버스를 모바일 크기로 제한
export const MobileLarge: Story = {
  args: {},
  parameters: {
    viewport: {
      defaultViewport: 'mobile2',
    },
    docs: {
      description: {
        story: '큰 모바일 뷰에서의 헤더 상태입니다. 햄버거 메뉴가 우측에 표시됩니다.',
      },
    },
  },
  decorators: [
    (Story) => (
      <div style={{ 
        width: '414px', 
        minHeight: '896px',
        margin: '0 auto', 
        border: '3px solid #10b981', 
        borderRadius: '12px',
        overflow: 'hidden',
        backgroundColor: 'white',
        position: 'relative',
        boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
        transform: 'scale(1)',
        transformOrigin: 'top center'
      }}>
        <div style={{ 
          position: 'absolute', 
          top: '10px', 
          left: '10px', 
          backgroundColor: '#10b981', 
          color: 'white', 
          padding: '4px 8px', 
          borderRadius: '4px', 
          fontSize: '12px',
          fontWeight: 'bold',
          zIndex: 1000
        }}>
          414px
        </div>
        <div style={{ width: '100%', height: '100%' }}>
          <Story />
        </div>
        <div style={{ 
          position: 'absolute', 
          bottom: '0', 
          left: '0', 
          right: '0', 
          padding: '15px', 
          backgroundColor: '#f0fdf4',
          borderTop: '1px solid #bbf7d0'
        }}>
          <h3 style={{ fontFamily: 'Pretendard, sans-serif', fontSize: '14px', marginBottom: '8px', color: '#064e3b' }}>
            📱 모바일 뷰 (414px)
          </h3>
          <p style={{ fontFamily: 'Pretendard, sans-serif', fontSize: '12px', color: '#047857' }}>
            실제 모바일 화면 크기로 제한된 헤더입니다.
          </p>
        </div>
        {/* 모바일 뷰포트 강제 CSS */}
        <style>{`
          @media (min-width: 768px) {
            .md\\:hidden {
              display: block !important;
            }
            .md\\:grid {
              display: none !important;
            }
          }
        `}</style>
      </div>
    ),
  ],
};

// 태블릿 Header 스토리 - 전체 캔버스를 태블릿 크기로 제한
export const Tablet: Story = {
  args: {},
  parameters: {
    viewport: {
      defaultViewport: 'tablet',
    },
    docs: {
      description: {
        story: '태블릿 뷰에서의 헤더 상태입니다. 중간 크기 화면에서의 레이아웃을 확인할 수 있습니다.',
      },
    },
  },
  decorators: [
    (Story) => (
      <div style={{ 
        width: '768px', 
        minHeight: '1024px',
        margin: '0 auto', 
        border: '3px solid #f59e0b', 
        borderRadius: '12px',
        overflow: 'hidden',
        backgroundColor: 'white',
        position: 'relative',
        boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
        transform: 'scale(1)',
        transformOrigin: 'top center'
      }}>
        <div style={{ 
          position: 'absolute', 
          top: '10px', 
          left: '10px', 
          backgroundColor: '#f59e0b', 
          color: 'white', 
          padding: '4px 8px', 
          borderRadius: '4px', 
          fontSize: '12px',
          fontWeight: 'bold',
          zIndex: 1000
        }}>
          768px
        </div>
        <div style={{ width: '100%', height: '100%' }}>
          <Story />
        </div>
        <div style={{ 
          position: 'absolute', 
          bottom: '0', 
          left: '0', 
          right: '0', 
          padding: '15px', 
          backgroundColor: '#fffbeb',
          borderTop: '1px solid #fed7aa'
        }}>
          <h3 style={{ fontFamily: 'Pretendard, sans-serif', fontSize: '14px', marginBottom: '8px', color: '#92400e' }}>
            📱 태블릿 뷰 (768px)
          </h3>
          <p style={{ fontFamily: 'Pretendard, sans-serif', fontSize: '12px', color: '#d97706' }}>
            실제 태블릿 화면 크기로 제한된 헤더입니다.
          </p>
        </div>
      </div>
    ),
  ],
};

// 대형 데스크탑 Header 스토리 - 전체 화면 사용
export const LargeDesktop: Story = {
  args: {},
  parameters: {
    viewport: {
      defaultViewport: 'largeDesktop',
    },
    docs: {
      description: {
        story: '대형 데스크탑 뷰에서의 헤더 상태입니다. 넓은 화면에서의 레이아웃을 확인할 수 있습니다.',
      },
    },
  },
};

// 모바일에서 햄버거 메뉴가 열린 상태 - 전체 캔버스를 모바일 크기로 제한
export const MobileWithMenuOpen: Story = {
  args: {},
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
    docs: {
      description: {
        story: '모바일에서 햄버거 메뉴가 열린 상태입니다. 모바일 네비게이션 메뉴를 확인할 수 있습니다.',
      },
    },
  },
  decorators: [
    (Story) => (
      <div style={{ 
        width: '375px', 
        minHeight: '667px',
        margin: '0 auto', 
        border: '3px solid #8b5cf6', 
        borderRadius: '12px',
        overflow: 'hidden',
        backgroundColor: 'white',
        position: 'relative',
        boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
        transform: 'scale(1)',
        transformOrigin: 'top center'
      }}>
        <div style={{ 
          position: 'absolute', 
          top: '10px', 
          left: '10px', 
          backgroundColor: '#8b5cf6', 
          color: 'white', 
          padding: '4px 8px', 
          borderRadius: '4px', 
          fontSize: '12px',
          fontWeight: 'bold',
          zIndex: 1000
        }}>
          375px
        </div>
        <div style={{ width: '100%', height: '100%' }}>
          <Story />
        </div>
        <div style={{ 
          position: 'absolute', 
          bottom: '0', 
          left: '0', 
          right: '0', 
          padding: '15px', 
          backgroundColor: '#faf5ff',
          borderTop: '1px solid #e9d5ff'
        }}>
          <h3 style={{ fontFamily: 'Pretendard, sans-serif', fontSize: '14px', marginBottom: '8px', color: '#581c87' }}>
            📱 모바일 메뉴 열림 상태
          </h3>
          <p style={{ fontFamily: 'Pretendard, sans-serif', fontSize: '12px', color: '#7c3aed' }}>
            햄버거 메뉴가 자동으로 열린 상태입니다.
          </p>
        </div>
      </div>
    ),
  ],
  play: async ({ canvasElement }) => {
    const canvas = canvasElement;
    const mobileMenuButton = canvas.querySelector('button[aria-label="메뉴 열기"]') ||
                            canvas.querySelector('button img[alt="메뉴"]')?.parentElement;
    if (mobileMenuButton) {
      (mobileMenuButton as HTMLElement).click();
    }
  },
};

// 데스크탑에서 서브메뉴가 열린 상태 - 전체 화면 사용
export const DesktopWithSubmenuOpen: Story = {
  args: {},
  parameters: {
    viewport: {
      defaultViewport: 'desktop',
    },
    docs: {
      description: {
        story: '데스크탑에서 서브메뉴가 열린 상태입니다. 각 메뉴의 상세 항목들을 확인할 수 있습니다.',
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = canvasElement;
    const navItems = canvas.querySelectorAll('nav button');
    if (navItems.length > 0) {
      (navItems[0] as HTMLElement).click();
    }
  },
};

// 검색 모달이 열린 상태 - 전체 화면 사용
export const WithSearchModalOpen: Story = {
  args: {},
  parameters: {
    viewport: {
      defaultViewport: 'desktop',
    },
    docs: {
      description: {
        story: '검색 모달이 열린 상태입니다. 검색 기능을 확인할 수 있습니다.',
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = canvasElement;
    const searchButton = canvas.querySelector('button img[alt="검색"]')?.parentElement;
    if (searchButton) {
      (searchButton as HTMLElement).click();
    }
  },
}; 
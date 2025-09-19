// 로컬 샘플 이미지 (실 서비스에서는 API 연동 예정)
import img1 from '@/assets/images/main/gallery01.png'
import img2 from '@/assets/images/main/gallery02.png'
import img3 from '@/assets/images/main/galley03.png'

export interface GalleryItemBase {
	id: string
	title: string
	dateRange: string
	categoryName: string
}

// 이미지 타입은 컴포넌트 환경에 따라 달라질 수 있어 느슨하게 두고,
// 각 컴포넌트에서 StaticImageData 등으로 보강해서 사용합니다.
export type GalleryItem<ImageT = unknown> = GalleryItemBase & { image: ImageT }

export interface GallerySectionProps {
	className?: string
}

// 갤러리 데이터
export const GALLERY_ITEMS = [
	{
		id: 'daejeon-2025',
		title: '2025년 대전 월드런 마라톤 축제',
		dateRange: '2025.06.16 - 2025.06.20',
		image: img1,
		categoryName: '대전 마라톤 축제',
	},
	{
		id: 'marathon2025',
		title: '2025년 청주 마라톤 대회',
		dateRange: '2025.06.16 - 2025.06.20',
		image: img2,
		categoryName: '청주 마라톤 대회',
	},
	{
		id: 'chuncheon-2025',
		title: '2025년 춘천 마라톤 대회',
		dateRange: '2025.06.16 - 2025.06.20',
		image: img3,
		categoryName: '춘천 마라톤 대회',
	},
	{
		id: 'daejeon-2024',
		title: '2024년 대전 마라톤 축제',
		dateRange: '2024.06.15 - 2024.06.19',
		image: img1,
		categoryName: '대전 마라톤 축제',
	},
] as const 
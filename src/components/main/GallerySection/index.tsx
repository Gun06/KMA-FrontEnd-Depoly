"use client"
import React, { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import SectionPanel from '@/components/main/SectionPanel'
import type { GallerySectionProps } from './Gallery'
import pauseIcon from '@/assets/icons/main/pause.svg'
import playIcon from '@/assets/icons/main/play.svg'
import GalleryCard from './GalleryCard'
import gallery01 from '@/assets/images/main/gallery01.png'
import gallery02 from '@/assets/images/main/gallery02.png'
import gallery03 from '@/assets/images/main/gallery03.png'

export default function GallerySection({ className }: GallerySectionProps) {
	const [isDragging, setIsDragging] = useState(false)
	const [startX, setStartX] = useState(0)
	const [currentTransform, setCurrentTransform] = useState(0)
	const [dragStartTransform, setDragStartTransform] = useState(0)
	const [isLoading, setIsLoading] = useState(true)
	const marqueeRef = useRef<HTMLDivElement>(null)

	// 초기 로딩 시뮬레이션 (실제 API 연동 시 수정)
	useEffect(() => {
		const timer = setTimeout(() => {
			setIsLoading(false)
		}, 500) // 0.5초 후 로딩 완료

		return () => clearTimeout(timer)
	}, [])

	const handleMouseDown = (e: React.MouseEvent) => {
		setIsDragging(true)
		setDragStartTransform(currentTransform)
		setStartX(e.pageX)
	}

	const handleMouseMove = (e: React.MouseEvent) => {
		if (!isDragging) return
		e.preventDefault()
		
		const deltaX = e.pageX - startX
		const newTransform = dragStartTransform + deltaX * 1.2 // 더 자연스러운 드래그 감도
		
		// 드래그 범위 제한 (왼쪽으로 너무 많이 가거나 오른쪽으로 너무 많이 가지 않도록)
		const maxLeft = 0
		const isMobile = window.innerWidth < 768
		const cardWidth = isMobile ? 250 : 300
		const cardGap = isMobile ? 12 : 24
		const moreButtonMargin = isMobile ? 24 : 48 // ml-6 = 24px, ml-12 = 48px
		const extraSpace = isMobile ? 80 : 150 // 모바일에서는 여유공간 줄임
		const maxRight = -((10 * cardWidth + 9 * cardGap + moreButtonMargin + extraSpace) - window.innerWidth) // 10개 카드 + 간격 + 더보기 버튼 여백 + 여유공간
		
		setCurrentTransform(Math.max(maxRight, Math.min(maxLeft, newTransform)))
	}

	const handleMouseUp = () => {
		setIsDragging(false)
	}

	const handleMouseLeave = () => {
		setIsDragging(false)
	}

	const handleMouseEnter = () => {
		// 호버 시 부드럽게 애니메이션 중지
		// setIsTransitioning(true) // This state was removed, so this line is removed.
		// setTimeout(() => { // This state was removed, so this line is removed.
		// 	setIsPlaying(false) // This state was removed, so this line is removed.
		// 	setIsTransitioning(false) // This state was removed, so this line is removed.
		// }, 200) // This state was removed, so this line is removed. // 카카오처럼 부드러운 감속
	}

	const handleMouseLeaveFromHover = () => {
		// setIsHovering(false) // This state was removed, so this line is removed.
	}

	// 터치 이벤트 핸들러 추가
	const handleTouchStart = (e: React.TouchEvent) => {
		setIsDragging(true)
		setDragStartTransform(currentTransform)
		setStartX(e.touches[0].pageX)
	}

	const handleTouchMove = (e: React.TouchEvent) => {
		if (!isDragging) return
		e.preventDefault()
		
		const deltaX = e.touches[0].pageX - startX
		const newTransform = dragStartTransform + deltaX * 1.2 // 더 자연스러운 드래그 감도
		
		// 드래그 범위 제한
		const maxLeft = 0
		const isMobile = window.innerWidth < 768
		const cardWidth = isMobile ? 250 : 300
		const cardGap = isMobile ? 12 : 24
		const moreButtonMargin = isMobile ? 24 : 48 // ml-6 = 24px, ml-12 = 48px
		const extraSpace = isMobile ? 80 : 150 // 모바일에서는 여유공간 줄임
		const maxRight = -((10 * cardWidth + 9 * cardGap + moreButtonMargin + extraSpace) - window.innerWidth) // 10개 카드 + 간격 + 더보기 버튼 여백 + 여유공간
		
		setCurrentTransform(Math.max(maxRight, Math.min(maxLeft, newTransform)))
	}

	const handleTouchEnd = () => {
		setIsDragging(false)
	}

	return (
		<>
			<SectionPanel
				title="대회사진 갤러리"
				showChevron={false}
				fullBleed
				containerClassName={`bg-gray-50 ${className || ''}`}
				contentClassName="pt-2"
			>
				{/* 우측 상단 더보기 버튼 - 원래 재생 버튼 위치 */}
				<div className="relative">
					<div className="absolute right-6 md:right-20 -top-12 md:-top-16 z-20 flex items-center gap-6">
						{/* 더보기 버튼 */}
						<button className="text-sm md:text-base text-gray-700 hover:text-gray-900 transition-colors duration-200">
							더보기 &gt;
						</button>
					</div>
				</div>
			</SectionPanel>

			{/* 갤러리 영역 표시 */}
			<div className="relative w-screen left-1/2 -translate-x-1/2 h-[350px] md:h-[450px] flex items-center justify-center bg-gray-50">
				<div className="w-full max-w-6xl px-4 md:px-6">
					{/* 스켈레톤 UI - 로딩 중일 때 표시 */}
					<div 
						className="absolute left-0 right-0 top-0 overflow-hidden z-10 transition-opacity duration-300"
						style={{
							opacity: isLoading ? 1 : 0,
							zIndex: isLoading ? 20 : 0,
							pointerEvents: isLoading ? 'auto' : 'none'
						}}
					>
						<div className="flex w-max items-center h-full leading-[0] pl-4 md:pl-20">
							<ul className="flex items-center gap-3 md:gap-6 px-0 h-full">
								{Array.from({ length: 10 }).map((_, idx) => (
									<li key={`skeleton-${idx}`} className="shrink-0">
										<div className="w-[250px] md:w-[350px] h-[320px] md:h-[425px] bg-gray-200 rounded-tl-[12px] md:rounded-tl-[15px] rounded-tr-[12px] md:rounded-tr-[15px] rounded-bl-[12px] md:rounded-bl-[15px] rounded-br-[16px] md:rounded-br-[25px] overflow-hidden border-2 border-gray-50 relative animate-pulse">
											{/* 이미지 영역 스켈레톤 - 전체 카드 크기 */}
											<div className="absolute inset-0 bg-gray-300" />
											{/* 오른쪽 상단 배지 스켈레톤 */}
											<div className="absolute top-0 right-0 w-[120px] md:w-[150px] h-[40px] md:h-[50px] bg-gray-400 rounded-tr-[12px] md:rounded-tr-[15px] rounded-bl-[12px] md:rounded-bl-[15px]" />
											{/* 하단 텍스트 영역 스켈레톤 */}
											<div className="absolute bottom-6 md:bottom-10 left-0 right-0 p-3 md:p-4 space-y-2">
												<div className="h-5 md:h-6 w-3/4 bg-gray-400 rounded" />
												<div className="h-3 md:h-4 w-1/2 bg-gray-400 rounded" />
											</div>
											{/* 오른쪽 하단 버튼 스켈레톤 */}
											<div className="absolute bottom-0 right-0 w-[56px] md:w-[70px] h-[56px] md:h-[70px] bg-gray-50 rounded-tl-[12px] md:rounded-tl-[15px] rounded-br-[16px] md:rounded-br-[15px]" />
											<div className="absolute bottom-2 md:bottom-3 right-2 md:right-3 w-[48px] md:w-[60px] h-[48px] md:h-[60px] bg-gray-400 rounded-full" />
										</div>
									</li>
								))}
							</ul>
							{/* 더보기 버튼 스켈레톤 */}
							<div className="flex items-center justify-center ml-6 md:ml-12">
								<div className="relative">
									<div className="w-0.5 h-32 md:h-[300px] bg-gray-200"></div>
									<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 bg-gray-200 rounded-full"></div>
								</div>
							</div>
						</div>
					</div>

					{/* 통합된 갤러리 카드 영역 */}
					<div 
						ref={marqueeRef}
						onMouseDown={handleMouseDown}
						onMouseMove={handleMouseMove}
						onMouseUp={handleMouseUp}
						onMouseLeave={handleMouseLeave}
						onMouseEnter={handleMouseEnter}
						onTouchStart={handleTouchStart}
						onTouchMove={handleTouchMove}
						onTouchEnd={handleTouchEnd}
						className="absolute left-0 right-0 top-0 overflow-hidden z-10 border-2 border-gray-50 transition-opacity duration-300"
						style={{
							opacity: isLoading ? 0 : 1
						}}
					>
						<div 
							className="flex w-max items-center h-full leading-[0] transition-transform duration-300 ease-out"
							style={{
								transform: `translateX(${currentTransform}px)`,
								transition: isDragging ? 'none' : 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
							}}
						>
							{/* 첫 번째 트랙 - 10개 카드 표시 */}
							<ul className="flex items-center gap-3 md:gap-6 px-0 h-full pl-4 md:pl-20">
								<GalleryCard imageSrc={gallery01} imageAlt="갤러리 이미지 1" subtitle="대전 마라톤" title="2025년 대전 월드런 마라톤 축제" date="2025.06.16 - 2025.06.20" />
								<GalleryCard imageSrc={gallery02} imageAlt="갤러리 이미지 2" subtitle="서울 마라톤" title="2025년 서울 국제 마라톤 대회" date="2025.07.15 - 2025.07.20" />
								<GalleryCard imageSrc={gallery03} imageAlt="갤러리 이미지 3" subtitle="부산 마라톤" title="2025년 부산 해양 마라톤 페스티벌" date="2025.08.10 - 2025.08.15" />
								<GalleryCard imageSrc={gallery01} imageAlt="갤러리 이미지 4" subtitle="인천 마라톤" title="2025년 인천 국제 마라톤 대회" date="2025.09.05 - 2025.09.10" />
								<GalleryCard imageSrc={gallery02} imageAlt="갤러리 이미지 5" subtitle="광주 마라톤" title="2025년 광주 문화 마라톤 페스티벌" date="2025.10.12 - 2025.10.17" />
								<GalleryCard imageSrc={gallery03} imageAlt="갤러리 이미지 6" subtitle="대구 마라톤" title="2025년 대구 국제 마라톤 대회" date="2025.11.08 - 2025.11.13" />
								<GalleryCard imageSrc={gallery01} imageAlt="갤러리 이미지 7" subtitle="울산 마라톤" title="2025년 울산 해양 마라톤 축제" date="2025.12.03 - 2025.12.08" />
								<GalleryCard imageSrc={gallery02} imageAlt="갤러리 이미지 8" subtitle="세종 마라톤" title="2025년 세종 행정도시 마라톤" date="2025.12.15 - 2025.12.20" />
								<GalleryCard imageSrc={gallery03} imageAlt="갤러리 이미지 9" subtitle="제주 마라톤" title="2025년 제주 올레길 마라톤" date="2025.12.25 - 2025.12.30" />
								<GalleryCard imageSrc={gallery01} imageAlt="갤러리 이미지 10" subtitle="강릉 마라톤" title="2025년 강릉 단오제 마라톤" date="2025.12.31 - 2026.01.05" />
							</ul>
							
							{/* 더보기 버튼 */}
							<div className="flex items-center justify-center ml-6 md:ml-12">
								<div className="relative">
									{/* 세로선 */}
									<div className="w-0.5 h-32 md:h-[300px] bg-gray-200"></div>
									{/* 원형 버튼 - 세로선 중앙에 위치 */}
									<button 
										className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 active:bg-gray-100 transition-all duration-200 cursor-pointer"
									>
										{/* 오른쪽을 향하는 화살표 */}
										<svg className="w-5 h-5 md:w-6 md:h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
										</svg>
									</button>
								</div>
							</div>
						</div>
					</div>

					{/* 마퀴 애니메이션 스타일 */}
					<style jsx>{`
						.animate-marquee { 
							animation: marquee 80s linear infinite; 
							will-change: transform; 
							animation-fill-mode: none;
						}
						
						/* 자연스러운 마퀴 애니메이션 - 정확한 50% 이동으로 끊김 없는 루프 */
						@keyframes marquee { 
							0% { transform: translateX(0); } 
							100% { transform: translateX(-50%); } 
						}
						
						/* 호버 시 애니메이션 일시정지 */
						.animate-marquee:hover {
							animation-play-state: paused;
						}
						
						/* 드래그 중일 때 자연스러운 커서 */
						.animate-marquee:active {
							cursor: grabbing;
						}
						
						/* 애니메이션 중지 시 부드러운 감속 */
						.animate-marquee:not(.animate-marquee) {
							animation: none;
						}
						
						/* 부드러운 전환 효과 */
						.transition-all {
							transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
						}
					`}</style>
				</div>
			</div>
		</>
	)
}

"use client"
import React, { useEffect, useRef, useState } from 'react'
import Image, { StaticImageData } from 'next/image'
import arrowRight from '@/assets/icons/main/arrow-right.svg'

interface GalleryCardProps {
	imageSrc: StaticImageData
	imageAlt: string
	subtitle: string
	title: string
	date: string
}

export default function GalleryCard({ imageSrc, imageAlt, subtitle, title, date }: GalleryCardProps) {
	const [isVisible, setIsVisible] = useState(false)
	const cardRef = useRef<HTMLDivElement>(null)

	useEffect(() => {
		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting) {
					setTimeout(() => {
						setIsVisible(true)
					}, 0) // Removed delay prop, so default to 0
				}
			},
			{
				threshold: 0.1,
				rootMargin: '0px 0px -50px 0px'
			}
		)

		if (cardRef.current) {
			observer.observe(cardRef.current)
		}

		return () => observer.disconnect()
	}, []) // Removed delay from dependency array

	return (
		<div className="w-[250px] md:w-[350px] h-[320px] md:h-[425px] bg-gray-50 rounded-tl-[12px] md:rounded-tl-[15px] rounded-tr-[12px] md:rounded-tr-[15px] rounded-bl-[12px] md:rounded-bl-[15px] rounded-br-[16px] md:rounded-br-[25px] overflow-hidden border-2 border-gray-50">
			{/* 이미지 영역 */}
			<div className="relative w-full h-full overflow-hidden border-2 border-gray-50">
				<Image
					src={imageSrc}
					alt={imageAlt}
					fill
					className="object-cover rounded-tl-[12px] md:rounded-tl-[15px] rounded-tr-[12px] md:rounded-tr-[15px] rounded-bl-[12px] md:rounded-bl-[15px] rounded-br-[16px] md:rounded-br-[25px] transition-transform duration-700 hover:scale-105 border-2 border-gray-50"
					sizes="(max-width: 768px) 250px, 300px"
				/>
				{/* 어두운 투명 배경 오버레이 */}
				<div className="absolute inset-0 bg-black bg-opacity-50 rounded-tl-[12px] md:rounded-tl-[15px] rounded-tr-[12px] md:rounded-tr-[15px] rounded-bl-[12px] md:rounded-bl-[15px] rounded-br-[16px] md:rounded-br-[25px] border-2 border-gray-50"></div>
				
				{/* 오른쪽 상단 모양 */}
				<div className="absolute top-0 right-0 w-[120px] md:w-[150px] h-[40px] md:h-[50px] bg-gray-50 rounded-tl-none rounded-tr-[12px] md:rounded-tr-[15px] rounded-bl-[12px] md:rounded-bl-[15px] rounded-br-none border-gray-50 z-20 overflow-hidden">
					{/* 파란색 서브 타이틀 */}
					<div className="absolute top-0 right-0 w-[110px] md:w-[140px] h-[32px] md:h-[40px] rounded-[12px] md:rounded-[15px] flex items-center justify-center z-30" style={{ backgroundColor: '#256EF4' }}>
						<span className="text-[10px] md:text-xs font-bold text-white">{subtitle}</span>
					</div>
				</div>
				
				{/* 타이틀과 날짜 - 어두운 배경 위에 오버레이 */}
				<div className="absolute bottom-6 md:bottom-10 left-0 right-0 p-3 md:p-4 text-white">
					{/* 타이틀 - 말줄임표 처리 */}
					<h3 className="text-lg md:text-2xl font-semibold mb-1 md:mb-2 truncate font-giants" title={title}>
						{title}
					</h3>
					{/* 날짜 */}
					<p className="text-xs md:text-sm text-gray-200">{date}</p>
				</div>
				
				{/* 오른쪽 하단 흰색 배경 */}
				<div className="absolute bottom-0 right-0 w-[56px] md:w-[70px] h-[56px] md:h-[70px] bg-gray-50 rounded-tl-[12px] md:rounded-tl-[15px] rounded-tr-none rounded-bl-none rounded-br-[16px] md:rounded-br-[15px] border-gray-50 z-20 overflow-hidden">
					{/* 검은색 동그라미 - 갤러리 카드 모서리에 맞춤 */}
					<div className="absolute bottom-0 right-0 w-[48px] md:w-[60px] h-[48px] md:h-[60px] bg-black rounded-full flex items-center justify-center transition-all duration-300 ease-out cursor-pointer group hover:bg-gray-600 active:bg-gray-500">
						{/* 오른쪽을 향하는 화살표 아이콘 */}
						<svg className="w-5 h-5 md:w-7 md:h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
						</svg>
						{/* 호버/클릭 시 배경 흐림 효과 */}
						<div className="absolute inset-0 bg-black rounded-full opacity-0 group-hover:opacity-15 group-active:opacity-25 transition-opacity duration-300 ease-out blur-sm"></div>
					</div>
				</div>
			</div>
		</div>
	)
}

import { SubmenuLayout } from '@/layouts/main/SubmenuLayout'
import Image from 'next/image'
import profileImage from '@/assets/images/main/profile.png'
import stampImage from '@/assets/images/main/stamp.png'

export default function GreetingPage() {
  return (
    <SubmenuLayout
      breadcrumb={{
        mainMenu: "전마협",
        subMenu: "인사말"
      }}
    >
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8 relative">
          <div className="flex flex-col lg:flex-row gap-4 lg:gap-0">
            {/* 왼쪽: 프로필 이미지 */}
            <div className="lg:w-1/3 flex justify-center lg:justify-start">
              <div className="w-48 h-60 sm:w-56 sm:h-72 md:w-60 md:h-76 lg:w-64 lg:h-80 rounded-lg overflow-hidden border-2 border-white shadow-lg">
                <Image
                  src={profileImage}
                  alt="전국마라톤협회 회장"
                  width={256}
                  height={320}
                  className="w-full h-full object-cover"
                  priority
                />
              </div>
            </div>
            
            {/* 오른쪽: 텍스트 내용 */}
            <div className="lg:w-2/3 space-y-6 lg:-ml-2">
              <h2 className="text-3xl font-bold text-gray-900 leading-tight">
                <span className="text-orange-600">전국마라톤 동호회 여러분</span>
                <span className="text-black"> 안녕하십니까?</span>
              </h2>
              
              <div className="space-y-4 text-gray-700 leading-relaxed">
                <p>
                  여러분의 사랑과 성원속에 전마협은 연간 전국각지에서 50여개의 대회를 개최하는 수준에 이르렀습니다. 
                  항상 마라톤매니아 여러분들 입장에서 생각하고 노력했던 결과가 아닌가 싶습니다. 
                  앞으로도 전마협은 아마추어 마라톤 문화발전과 국민건강을 위하여 연구하고 노력하여 
                  우리나라를 대표하는 마라톤단체로 거듭나겠습니다.
                </p>
                
                <p>
                  현재 전마협은 대전 본사를 중심으로 서울지사, 영남지사와 마라톤의 전문가들로 구성되어 운영되고
                  있으며 그 어떤 마라톤 대회도 개최할 수 있는 협력업체와 운영위원회가 조직되어 있습니다.
                </p>
                
                <h3 className="text-2xl font-bold text-blue-600 mt-8 mb-4">
                  존경하는 전국의 마라톤매니아 여러분!
                </h3>
                
                <p>
                  새는 날고, 물고기는 헤엄치고, 인간은 달린다라는 말이 있듯이 인간이 될 수 있다는 건 신이 내린
                  가장 큰 선물이라 생각합니다.
                </p>
                
                <p>
                  사람이 태어나서 움직이고, 걷고, 뛰기 시작하는 인간의 본능적인 실천이 작용하여 우리들을 마라톤이란
                  운동에 자연스럽게 빠지게 되는것이 아닌가봅니다.
                </p>
                
                <p>
                  우리내 달림이들이 하나씩 힘을모아 전국의 모든사람이 뛰면서 건강을 지킬수 있도록 유도하여 몸과 마음이
                  튼튼한국민이 될 수 있도록 마라톤 매니아 여러분들이 앞장서보지 않으시겠습니까?
                </p>
                
                <p>
                  전마협은 항상 여러분들 곁에서 땀을 식혀주는 시원한 바람과 갈증을 해소하는 시원한 물 한모금처럼
                  항상 달림이 여러분들과 함께 호흡하는 단체로 최선을 다하겠습니다.
                </p>
                
                <h3 className="text-2xl font-bold text-blue-600 mt-8">
                  달리는 여러분 존경합니다!
                </h3>
              </div>
              
              {/* 도장 - 텍스트 다음 줄에 오른쪽 하단에 배치 */}
              <div className="flex justify-end mt-8">
                <div className="w-20 h-15 lg:w-24 lg:h-18 rounded-lg overflow-hidden">
                  <Image
                    src={stampImage}
                    alt="도장"
                    width={80}
                    height={60}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
          
          {/* 기존 절대 위치 도장 제거 */}
        </div>
      </div>
    </SubmenuLayout>
  )
}

import { RecordItem } from "@/types/event";
import { Trophy, Medal, Award, Users, User } from "lucide-react";

interface RecordTableProps {
  category: string;
  _gender: string;
  _ageGroup: string;
}

// 임시 데이터 (실제로는 API에서 가져와야 함)
const mockRecords: RecordItem[] = [
  {
    id: 1,
    rank: 1,
    name: "김철수",
    category: "개인",
    record: "2:15:30",
    time: "2시간 15분 30초",
    score: 95,
    year: 2025,
    eventTitle: "2025 청주 마라톤"
  },
  {
    id: 2,
    rank: 2,
    name: "이영희",
    category: "개인",
    record: "2:18:45",
    time: "2시간 18분 45초",
    score: 92,
    year: 2025,
    eventTitle: "2025 청주 마라톤"
  },
  {
    id: 3,
    rank: 3,
    name: "청주러닝클럽",
    category: "단체",
    record: "2:20:15",
    time: "2시간 20분 15초",
    score: 90,
    year: 2025,
    eventTitle: "2025 청주 마라톤"
  }
];

const getRankIcon = (rank: number) => {
  if (rank === 1) return <Trophy className="w-5 h-5 text-yellow-500" />;
  if (rank === 2) return <Medal className="w-5 h-5 text-gray-400" />;
  if (rank === 3) return <Award className="w-5 h-5 text-amber-600" />;
  return <span className="font-bold text-gray-600">{rank}</span>;
};

const getCategoryIcon = (category: string) => {
  switch (category) {
    case "개인":
      return <User className="w-4 h-4 text-blue-500" />;
    case "단체":
    case "팀":
      return <Users className="w-4 h-4 text-green-500" />;
    default:
      return null;
  }
};

export default function RecordTable({ category, _gender, _ageGroup }: RecordTableProps) {
  // 필터링 로직 (실제로는 API에서 처리해야 함)
  let filteredRecords = mockRecords;
  
  if (category !== "all") {
    filteredRecords = filteredRecords.filter(record => record.category === category);
  }
  
  // 성별과 연령대 필터링은 실제 데이터에 해당 필드가 있을 때 구현

  if (filteredRecords.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p>검색 결과가 없습니다.</p>
        <p className="text-sm mt-2">다른 필터를 시도해보세요.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                순위
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                이름/단체
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                카테고리
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                기록
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                시간
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                점수
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                연도
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredRecords.map((record) => (
              <tr
                key={record.id}
                className="hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center justify-center">
                    {getRankIcon(record.rank)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{record.name}</div>
                    {record.group && (
                      <div className="text-sm text-gray-500">{record.group}</div>
                    )}
                    {record.team && (
                      <div className="text-sm text-gray-500">{record.team}</div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    {getCategoryIcon(record.category)}
                    <span className="text-sm text-gray-900">{record.category}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm font-medium text-blue-600">{record.record}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {record.time ? (
                    <span className="text-sm text-gray-900">{record.time}</span>
                  ) : (
                    <span className="text-sm text-gray-400">-</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {record.score ? (
                    <span className="text-sm text-gray-900">{record.score}점</span>
                  ) : (
                    <span className="text-sm text-gray-400">-</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-gray-900">{record.year}년</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

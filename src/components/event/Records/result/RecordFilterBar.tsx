interface RecordFilterBarProps {
  selectedCategory: string;
  selectedGender: string;
  selectedAgeGroup: string;
  onCategoryChange: (category: string) => void;
  onGenderChange: (gender: string) => void;
  onAgeGroupChange: (ageGroup: string) => void;
}

export default function RecordFilterBar({ 
  selectedCategory, 
  selectedGender, 
  selectedAgeGroup,
  onCategoryChange, 
  onGenderChange, 
  onAgeGroupChange 
}: RecordFilterBarProps) {
  const categoryOptions = [
    { label: "전체", value: "all" },
    { label: "개인", value: "개인" },
    { label: "단체", value: "단체" },
    { label: "팀", value: "팀" },
  ];

  const genderOptions = [
    { label: "전체", value: "all" },
    { label: "남성", value: "남성" },
    { label: "여성", value: "여성" },
  ];

  const ageGroupOptions = [
    { label: "전체", value: "all" },
    { label: "10대", value: "10대" },
    { label: "20대", value: "20대" },
    { label: "30대", value: "30대" },
    { label: "40대", value: "40대" },
    { label: "50대", value: "50대" },
    { label: "60대 이상", value: "60대 이상" },
  ];

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* 카테고리 선택 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            카테고리
          </label>
          <select
            value={selectedCategory}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {categoryOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* 성별 선택 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            성별
          </label>
          <select
            value={selectedGender}
            onChange={(e) => onGenderChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {genderOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* 연령대 선택 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            연령대
          </label>
          <select
            value={selectedAgeGroup}
            onChange={(e) => onAgeGroupChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {ageGroupOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}

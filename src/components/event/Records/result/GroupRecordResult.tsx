import { useState } from "react";
import RecordTable from "./RecordTable";
import RecordFilterBar from "./RecordFilterBar";

interface GroupRecordResultProps {
  className?: string;
}

export default function GroupRecordResult({ className = "" }: GroupRecordResultProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedGender, setSelectedGender] = useState<string>("all");
  const [selectedAgeGroup, setSelectedAgeGroup] = useState<string>("all");

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
  };

  const handleGenderChange = (gender: string) => {
    setSelectedGender(gender);
  };

  const handleAgeGroupChange = (ageGroup: string) => {
    setSelectedAgeGroup(ageGroup);
  };

  return (
    <div className={className}>
      {/* 필터 바 */}
      <RecordFilterBar
        selectedCategory={selectedCategory}
        selectedGender={selectedGender}
        selectedAgeGroup={selectedAgeGroup}
        onCategoryChange={handleCategoryChange}
        onGenderChange={handleGenderChange}
        onAgeGroupChange={handleAgeGroupChange}
      />

      {/* 기록 테이블 */}
      <div className="mt-6">
        <RecordTable
          category={selectedCategory}
          gender={selectedGender}
          ageGroup={selectedAgeGroup}
        />
      </div>
    </div>
  );
}

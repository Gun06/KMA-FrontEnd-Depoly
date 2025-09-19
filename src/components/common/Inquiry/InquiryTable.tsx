import React from 'react';
import { InquiryItem } from './types';

interface InquiryTableProps {
  inquiries: InquiryItem[];
  onRowClick?: (inquiry: InquiryItem) => void;
  onStatusChange?: (id: string, status: InquiryItem['status']) => void;
  loading?: boolean;
}

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  answered: 'bg-green-100 text-green-800',
  closed: 'bg-gray-100 text-gray-800',
};

const priorityColors = {
  low: 'bg-blue-100 text-blue-800',
  medium: 'bg-orange-100 text-orange-800',
  high: 'bg-red-100 text-red-800',
};

export default function InquiryTable({ 
  inquiries, 
  onRowClick, 
  onStatusChange, 
  loading = false 
}: InquiryTableProps) {
  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (inquiries.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        문의사항이 없습니다.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              제목
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              작성자
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              카테고리
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              우선순위
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              상태
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              작성일
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {inquiries.map((inquiry) => (
            <tr 
              key={inquiry.id} 
              className={`hover:bg-gray-50 ${onRowClick ? 'cursor-pointer' : ''}`}
              onClick={() => onRowClick?.(inquiry)}
            >
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">
                  {inquiry.title}
                </div>
                <div className="text-sm text-gray-500 truncate max-w-xs">
                  {inquiry.content}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {inquiry.author}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {inquiry.category}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${priorityColors[inquiry.priority]}`}>
                  {inquiry.priority === 'low' ? '낮음' : inquiry.priority === 'medium' ? '보통' : '높음'}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <select
                  value={inquiry.status}
                  onChange={(e) => onStatusChange?.(inquiry.id, e.target.value as InquiryItem['status'])}
                  className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusColors[inquiry.status]} border-0 focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
                  onClick={(e) => e.stopPropagation()}
                >
                  <option value="pending">대기중</option>
                  <option value="answered">답변완료</option>
                  <option value="closed">종료</option>
                </select>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {new Date(inquiry.createdAt).toLocaleDateString('ko-KR')}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

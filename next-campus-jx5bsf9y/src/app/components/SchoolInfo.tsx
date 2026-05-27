import {
  X,
  MapPin,
  Users,
  Book,
  DollarSign,
  Globe,
  Star,
  Heart,
  Info,
} from 'lucide-react';
import { School } from '../types';
import { useFavorites } from '../contexts/FavoritesContext';

interface SchoolInfoProps {
  school: School | null;
  onClose: () => void;
  onShowDetail: (school: School) => void;
}

export function SchoolInfo({ school, onClose, onShowDetail }: SchoolInfoProps) {
  const { addFavorite, removeFavorite, isFavorite } = useFavorites();

  if (!school) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400">
        <div className="text-center">
          <MapPin className="w-16 h-16 mx-auto mb-4 opacity-30" />
          <p>지도에서 학교를 선택하세요</p>
        </div>
      </div>
    );
  }

  const favorite = isFavorite(school.id);

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header Image */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={school.image}
          alt={school.name}
          className="w-full h-full object-cover"
        />
        <button
          onClick={onClose}
          className="absolute top-4 right-4 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
        <button
          onClick={() => {
            if (favorite) {
              removeFavorite(school.id);
            } else {
              addFavorite(school);
            }
          }}
          className="absolute top-4 right-16 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg transition-colors group"
        >
          <Heart
            className={`w-5 h-5 transition-all ${
              favorite
                ? 'text-red-500 fill-red-500 scale-110'
                : 'text-gray-600 group-hover:text-red-500'
            }`}
          />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-2">{school.name}</h2>
          <div className="flex items-center text-gray-600 mb-4">
            <MapPin className="w-4 h-4 mr-2" />
            <span>{school.location}</span>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <Users className="w-5 h-5 text-blue-600 mb-2" />
            <div className="text-sm text-gray-600">학생 수</div>
            <div className="font-semibold">
              {school.students.toLocaleString()}
            </div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <DollarSign className="w-5 h-5 text-green-600 mb-2" />
            <div className="text-sm text-gray-600">연간 학비</div>
            <div className="font-semibold">{school.tuition}</div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <Book className="w-5 h-5 text-purple-600 mb-2" />
            <div className="text-sm text-gray-600">설립 연도</div>
            <div className="font-semibold">{school.founded}</div>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg">
            <Globe className="w-5 h-5 text-orange-600 mb-2" />
            <div className="text-sm text-gray-600">세계 랭킹</div>
            <div className="font-semibold">
              {school.worldRanking > 0 ? `${school.worldRanking}위` : '미집계'}
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="mb-6">
          <h3 className="font-semibold mb-2">학교 소개</h3>
          <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">
            {school.description}
          </p>
        </div>

        {/* Programs */}
        <div className="mb-6">
          <h3 className="font-semibold mb-3">주요 프로그램</h3>
          <div className="flex flex-wrap gap-2">
            {school.programs.slice(0, 3).map((program, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
              >
                {program}
              </span>
            ))}
            {school.programs.length > 3 && (
              <span className="px-3 py-1 bg-gray-100 text-gray-500 rounded-full text-sm">
                +{school.programs.length - 3}개 더
              </span>
            )}
          </div>
        </div>

        {/* View Details Button */}
        <button
          onClick={() => onShowDetail(school)}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 shadow-md"
        >
          <Info className="w-5 h-5" />
          상세정보 더 보기
        </button>
      </div>
    </div>
  );
}

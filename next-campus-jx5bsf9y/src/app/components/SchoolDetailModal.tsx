import {
  MapPin,
  Users,
  DollarSign,
  Heart,
  Calendar,
  CheckCircle2,
  Award,
  Home,
  BookOpen,
  ExternalLink,
} from 'lucide-react';
import { School } from '../types';
import { useFavorites } from '../contexts/FavoritesContext';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from './ui/dialog';

interface SchoolDetailModalProps {
  school: School | null;
  open: boolean;
  onClose: () => void;
}

export function SchoolDetailModal({
  school,
  open,
  onClose,
}: SchoolDetailModalProps) {
  const { addFavorite, removeFavorite, isFavorite } = useFavorites();

  if (!school) return null;

  const favorite = isFavorite(school.id);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-none w-screen h-screen max-h-screen top-0 left-0 translate-x-0 translate-y-0 rounded-none overflow-y-auto p-0 border-0">
        <DialogTitle className="sr-only">{school.name} 상세 정보</DialogTitle>
        <DialogDescription className="sr-only">
          {school.name}의 상세 정보를 확인하세요.
        </DialogDescription>

        {/* 헤더 이미지 */}

        <div className="relative h-80 bg-gray-900">
          {school.image ? (
            <img
              src={school.image}
              alt={school.name}
              className="w-full h-full object-cover opacity-70"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-600 text-8xl">
              🏫
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

          <button
            onClick={onClose}
            className="absolute top-4 left-4 bg-white/90 hover:bg-white text-gray-900 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            ← 지도로 돌아가기
          </button>

          <div className="absolute bottom-6 left-6 right-6">
            <h1 className="text-4xl font-bold text-white mb-2">
              {school.name}
            </h1>
            <p className="text-xl text-white/90 flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              {school.location}
            </p>
          </div>
        </div>

        {/* 컨텐츠 */}
        <div className="max-w-5xl mx-auto px-4 py-8">
          {/* 퀵 정보 + 저장 버튼 */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <div className="flex items-start justify-between">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 flex-1">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <Award className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">세계 랭킹</p>
                    <p className="font-bold text-gray-900">
                      {' '}
                      {school.worldRanking > 0
                        ? `${school.worldRanking}위`
                        : '미집계'}
                    </p>
                    <p className="text-sm text-red-500">
                      🇨🇦 캐나다{' '}
                      {school.canadaRanking > 0
                        ? `${school.canadaRanking}위`
                        : '미집계'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="bg-green-50 p-3 rounded-lg">
                    <Users className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">학생 수</p>
                    <p className="font-bold text-gray-900">
                      {school.students.toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="bg-purple-50 p-3 rounded-lg">
                    <DollarSign className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">학비</p>
                    <p className="font-bold text-gray-900">{school.tuition}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="bg-orange-50 p-3 rounded-lg">
                    <Calendar className="w-6 h-6 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">설립년도</p>
                    <p className="font-bold text-gray-900">{school.founded}</p>
                  </div>
                </div>
              </div>

              {school.website && (
                <a
                  href={school.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-4 px-6 py-3 rounded-lg flex items-center gap-2 transition-colors bg-gray-100 text-gray-700 hover:bg-gray-200 whitespace-nowrap"
                >
                  <ExternalLink className="w-5 h-5" />
                  공식 웹사이트
                </a>
              )}

              <button
                onClick={() => {
                  if (favorite) removeFavorite(school.id);
                  else addFavorite(school);
                }}
                className={`ml-4 px-6 py-3 rounded-lg flex items-center gap-2 transition-colors whitespace-nowrap ${
                  favorite
                    ? 'bg-red-50 text-red-600 hover:bg-red-100'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                <Heart
                  className={`w-5 h-5 ${favorite ? 'fill-red-500' : ''}`}
                />
                {favorite ? '저장됨' : '저장하기'}
              </button>
            </div>
          </div>

          {/* 학교 소개 */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">학교 소개</h2>
            <p className="text-gray-700 leading-relaxed">
              {school.description}
            </p>
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">유형</p>
                <p className="font-semibold text-gray-900">{school.type}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">캠퍼스</p>
                <p className="font-semibold text-gray-900">{school.campus}</p>
              </div>
            </div>
          </div>

          {/* 제공 프로그램 */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <BookOpen className="w-6 h-6 text-blue-600" />
              <h2 className="text-2xl font-bold text-gray-900">
                제공 프로그램
              </h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {school.programs.map((program, index) => (
                <div
                  key={index}
                  className="bg-blue-50 px-4 py-3 rounded-lg text-center text-gray-900"
                >
                  {program}
                </div>
              ))}
            </div>
          </div>

          {/* 입학 요건 */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">입학 요건</h2>
            <div className="space-y-4">
              {school.requirements.map((req, index) => {
                const colors = [
                  'border-blue-500',
                  'border-green-500',
                  'border-purple-500',
                  'border-orange-500',
                  'border-pink-500',
                ];
                const color = colors[index % colors.length];
                return (
                  <div key={index} className={`border-l-4 ${color} pl-4`}>
                    <p className="text-gray-700">{req}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 장학금 */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Award className="w-6 h-6 text-yellow-600" />
              <h2 className="text-2xl font-bold text-gray-900">장학금</h2>
            </div>
            <ul className="space-y-2">
              {school.scholarships.map((s, index) => (
                <li
                  key={index}
                  className="flex items-center gap-2 text-gray-700"
                >
                  <div className="w-2 h-2 bg-yellow-500 rounded-full flex-shrink-0" />
                  {s}
                </li>
              ))}
            </ul>
          </div>

          {/* 숙소 */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-2 mb-4">
              <Home className="w-6 h-6 text-indigo-600" />
              <h2 className="text-2xl font-bold text-gray-900">숙소</h2>
            </div>
            <p className="text-gray-700">{school.accommodation}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

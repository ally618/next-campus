import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { Navigation } from '../components/Navigation';
import {
  collection,
  addDoc,
  doc,
  setDoc,
  arrayUnion,
} from 'firebase/firestore';
import { db } from '../firebase';
import { ArrowLeft, Image, MapPin } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const categoryOptions = {
  board: ['후기', '정보', '비자', '장학금', '생활'],
  qna: ['시험', '장학금', '비자', '주거', '기타'],
  restaurant: ['한식', '중식', '일식', '양식', '카페'],
  housing: ['기숙사', '쉐어하우스', '원룸', '투룸', '하숙'],
};

export default function PostWritePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const tabType = (searchParams.get('tab') ||
    'board') as keyof typeof categoryOptions;
  const { user } = useAuth();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('');
  const [location, setLocation] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const tabLabels = {
    board: '게시판',
    qna: 'Q&A',
    restaurant: '맛집정보',
    housing: '숙소정보',
  };

  const needsLocation = tabType === 'restaurant' || tabType === 'housing';
  const needsImage = tabType === 'restaurant' || tabType === 'housing';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !content.trim() || !category) {
      alert('제목, 내용, 카테고리를 모두 입력해주세요.');
      return;
    }
    if (needsLocation && !location.trim()) {
      alert('위치 정보를 입력해주세요.');
      return;
    }

    setSubmitting(true);
    try {
      const docRef = await addDoc(collection(db, 'posts'), {
        title,
        content,
        category,
        location,
        image: imageUrl,
        tab: tabType,
        author: user?.displayName || '익명',
        authorId: user?.uid || '',
        authorPhoto: user?.photoURL || '',
        date: new Date().toISOString().split('T')[0],
        views: 0,
        likes: 0,
        comments: 0,
      });

      // 내가 쓴 글 ID Firebase에 저장
      if (user?.uid) {
        await setDoc(
          doc(db, 'users', user.uid),
          { myPosts: arrayUnion(docRef.id) },
          { merge: true }
        );
      }
      alert('게시글이 등록되었습니다!');
      navigate(`/community?tab=${tabType}`);
    } catch (e) {
      console.error(e);
      alert('등록 중 오류가 발생했습니다.');
    }
    setSubmitting(false);
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <Navigation searchTerm="" onSearchChange={() => {}} showSearch={false} />

      <div className="flex-1 overflow-y-auto px-8 py-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <button
              onClick={() => navigate(`/community?tab=${tabType}`)}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>돌아가기</span>
            </button>
            <h1 className="text-3xl font-bold text-gray-900">
              {tabLabels[tabType]} 글쓰기
            </h1>
          </div>

          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            {/* 카테고리 */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                카테고리 <span className="text-red-500">*</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {categoryOptions[tabType].map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className={`px-4 py-2 rounded-lg border transition-colors ${
                      category === cat
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* 제목 */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                제목 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="제목을 입력하세요"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* 위치 */}
            {needsLocation && (
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  위치 <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="예: Toronto, Canada"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            )}

            {/* 이미지 URL */}
            {needsImage && (
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  이미지 URL (선택)
                </label>
                <div className="relative">
                  <Image className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="이미지 URL을 입력하세요"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                {imageUrl && (
                  <div className="mt-3 rounded-lg overflow-hidden border border-gray-200">
                    <img
                      src={imageUrl}
                      alt="Preview"
                      className="w-full h-64 object-cover"
                    />
                  </div>
                )}
              </div>
            )}

            {/* 내용 */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                내용 <span className="text-red-500">*</span>
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="내용을 입력하세요"
                rows={15}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>

            {/* 버튼 */}
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold disabled:opacity-50"
              >
                {submitting ? '등록 중...' : '등록하기'}
              </button>
              <button
                type="button"
                onClick={() => navigate(`/community?tab=${tabType}`)}
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
              >
                취소
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

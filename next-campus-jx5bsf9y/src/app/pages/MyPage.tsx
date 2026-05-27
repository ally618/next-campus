import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Navigation } from '../components/Navigation';
import { useFavorites } from '../contexts/FavoritesContext';
import { db } from '../firebase';
import {
  Heart,
  MapPin,
  Users,
  DollarSign,
  Trash2,
  Bookmark,
  FileText,
  MessageCircle,
  Eye,
  Calendar,
  User,
  Pin,
} from 'lucide-react';
import { School } from '../types';
import { useAuth } from '../contexts/AuthContext';
import {
  collection,
  getDocs,
  query,
  orderBy,
  doc,
  getDoc,
} from 'firebase/firestore';

type TabType = 'schools' | 'saved' | 'myposts';

interface Post {
  id: string;
  title: string;
  author: string;
  date: string;
  views: number;
  likes: number;
  comments: number;
  category?: string;
  location?: string;
  image?: string;
  tab: string;
}

export default function MyPage() {
  const { favorites, removeFavorite } = useFavorites();
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('schools');
  const [allPosts, setAllPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;
    const fetchPosts = async () => {
      setLoading(true);
      try {
        const q = query(collection(db, 'posts'), orderBy('date', 'desc'));
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Post[];
        setAllPosts(data);
      } catch (e) {
        console.error(e);
      }
      setLoading(false);
    };
    fetchPosts();
  }, [user]);

  const [savedPostIds, setSavedPostIds] = useState<string[]>([]);
  const [myPostIds, setMyPostIds] = useState<string[]>([]);

  useEffect(() => {
    if (!user) {
      setSavedPostIds([]);
      setMyPostIds([]);
      return;
    }
    const fetchUserData = async () => {
      const docRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setSavedPostIds(docSnap.data().savedPosts || []);
        setMyPostIds(docSnap.data().myPosts || []);
      }
    };
    fetchUserData();
  }, [user]);

  const savedPosts = allPosts.filter((p) => savedPostIds.includes(p.id));
  const myPosts = allPosts.filter((p) => myPostIds.includes(p.id));

  const PostCard = ({ post }: { post: Post }) => (
    <div
      onClick={() => navigate(`/community/post/${post.id}?tab=${post.tab}`)}
      className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow cursor-pointer border border-gray-200"
    >
      {post.image && (
        <div className="h-48 overflow-hidden">
          <img
            src={post.image}
            alt={post.title}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          />
        </div>
      )}
      <div className="p-5">
        <div className="flex items-center gap-2 mb-2">
          {post.category && (
            <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
              {post.category}
            </span>
          )}
          {post.location && (
            <div className="flex items-center gap-1 text-sm text-gray-600">
              <Pin className="w-4 h-4" />
              <span>{post.location}</span>
            </div>
          )}
        </div>
        <h3 className="font-bold text-lg mb-2 hover:text-blue-600 transition-colors">
          {post.title}
        </h3>
        <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
          <div className="flex items-center gap-1">
            <User className="w-4 h-4" />
            <span>{post.author}</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            <span>{post.date}</span>
          </div>
        </div>
        <div className="flex items-center gap-4 pt-3 border-t border-gray-100">
          <div className="flex items-center gap-1 text-gray-600">
            <Eye className="w-4 h-4" />
            <span className="text-sm">{post.views}</span>
          </div>
          <div className="flex items-center gap-1 text-red-600">
            <Heart className="w-4 h-4" />
            <span className="text-sm">{post.likes}</span>
          </div>
          <div className="flex items-center gap-1 text-blue-600">
            <MessageCircle className="w-4 h-4" />
            <span className="text-sm">{post.comments}</span>
          </div>
        </div>
      </div>
    </div>
  );

  if (!user) {
    return (
      <div className="h-screen flex flex-col bg-gray-50">
        <Navigation
          searchTerm=""
          onSearchChange={() => {}}
          onSchoolSelect={() => {}}
          showSearch={false}
        />
        <div className="flex-1 flex flex-col items-center justify-center gap-4 text-gray-400">
          <Heart className="w-16 h-16 text-gray-300" />
          <h3 className="text-xl font-semibold">로그인이 필요해요</h3>
          <p className="text-sm">
            Google 로그인 후 마이페이지를 이용할 수 있어요
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <Navigation searchTerm="" onSearchChange={() => {}} showSearch={false} />

      <div className="flex-1 overflow-hidden flex">
        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                마이페이지
              </h2>
              <p className="text-gray-600">내 활동 관리</p>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6 border-b border-gray-200">
              {[
                {
                  id: 'schools' as TabType,
                  label: '저장한 학교',
                  icon: Heart,
                  count: favorites.length,
                },
                {
                  id: 'saved' as TabType,
                  label: '저장한 글',
                  icon: Bookmark,
                  count: savedPosts.length,
                },
                {
                  id: 'myposts' as TabType,
                  label: '내가 쓴 글',
                  icon: FileText,
                  count: myPosts.length,
                },
              ].map(({ id, label, icon: Icon, count }) => (
                <button
                  key={id}
                  onClick={() => {
                    setActiveTab(id);
                    setSelectedSchool(null);
                  }}
                  className={`flex items-center gap-2 px-6 py-4 border-b-2 transition-colors ${
                    activeTab === id
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{label}</span>
                  <span className="px-2 py-0.5 bg-blue-100 text-blue-600 rounded-full text-xs">
                    {count}
                  </span>
                </button>
              ))}
            </div>

            {/* 저장한 학교 */}
            {activeTab === 'schools' && (
              <>
                {favorites.length === 0 ? (
                  <div className="text-center py-16">
                    <Heart className="w-24 h-24 mx-auto mb-4 text-gray-300" />
                    <h3 className="text-xl font-semibold text-gray-600 mb-2">
                      저장된 학교가 없습니다
                    </h3>
                    <p className="text-gray-500">
                      지도에서 관심있는 학교를 찾아 저장해보세요!
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {favorites.map((school) => (
                      <div
                        key={school.id}
                        className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow cursor-pointer border border-gray-200"
                        onClick={() => setSelectedSchool(school)}
                      >
                        <div className="relative h-48 bg-gray-200">
                          {school.image ? (
                            <img
                              src={school.image}
                              alt={school.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400 text-4xl">
                              🏫
                            </div>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              removeFavorite(school.id);
                              if (selectedSchool?.id === school.id)
                                setSelectedSchool(null);
                            }}
                            className="absolute top-3 right-3 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg transition-colors group"
                          >
                            <Heart className="w-5 h-5 text-red-500 fill-red-500 group-hover:scale-110 transition-transform" />
                          </button>
                        </div>
                        <div className="p-5">
                          <h3 className="font-bold text-lg mb-2">
                            {school.name}
                          </h3>
                          <div className="flex items-center text-gray-600 text-sm mb-3">
                            <MapPin className="w-4 h-4 mr-1" />
                            <span>{school.location}</span>
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div className="bg-blue-50 p-3 rounded-lg">
                              <div className="flex items-center gap-2 mb-1">
                                <Users className="w-4 h-4 text-blue-600" />
                                <span className="text-xs text-gray-600">
                                  학생 수
                                </span>
                              </div>
                              <div className="text-sm font-semibold">
                                {school.students.toLocaleString()}
                              </div>
                            </div>
                            <div className="bg-green-50 p-3 rounded-lg">
                              <div className="flex items-center gap-2 mb-1">
                                <DollarSign className="w-4 h-4 text-green-600" />
                                <span className="text-xs text-gray-600">
                                  연간 학비
                                </span>
                              </div>
                              <div className="text-sm font-semibold">
                                {school.tuition || '정보 없음'}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {/* 저장한 글 */}
            {activeTab === 'saved' && (
              <>
                {loading ? (
                  <div className="text-center py-16 text-gray-400">
                    불러오는 중...
                  </div>
                ) : savedPosts.length === 0 ? (
                  <div className="text-center py-16">
                    <Bookmark className="w-24 h-24 mx-auto mb-4 text-gray-300" />
                    <h3 className="text-xl font-semibold text-gray-600 mb-2">
                      저장한 글이 없습니다
                    </h3>
                    <p className="text-gray-500">
                      커뮤니티 글에서 북마크 버튼을 눌러 저장해보세요!
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {savedPosts.map((post) => (
                      <PostCard key={post.id} post={post} />
                    ))}
                  </div>
                )}
              </>
            )}

            {/* 내가 쓴 글 */}
            {activeTab === 'myposts' && (
              <>
                {loading ? (
                  <div className="text-center py-16 text-gray-400">
                    불러오는 중...
                  </div>
                ) : myPosts.length === 0 ? (
                  <div className="text-center py-16">
                    <FileText className="w-24 h-24 mx-auto mb-4 text-gray-300" />
                    <h3 className="text-xl font-semibold text-gray-600 mb-2">
                      작성한 글이 없습니다
                    </h3>
                    <p className="text-gray-500">
                      커뮤니티에서 첫 글을 작성해보세요!
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {myPosts.map((post) => (
                      <PostCard key={post.id} post={post} />
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* 학교 상세 패널 */}
        {selectedSchool && (
          <div className="w-[450px] bg-white border-l border-gray-200 overflow-y-auto">
            <div className="relative h-48 bg-gray-200">
              {selectedSchool.image ? (
                <img
                  src={selectedSchool.image}
                  alt={selectedSchool.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400 text-6xl">
                  🏫
                </div>
              )}
              <button
                onClick={() => setSelectedSchool(null)}
                className="absolute top-4 right-4 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg transition-colors"
              >
                ×
              </button>
            </div>
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-2">{selectedSchool.name}</h2>
              <div className="flex items-center text-gray-600 mb-4">
                <MapPin className="w-4 h-4 mr-2" />
                <span>{selectedSchool.location}</span>
              </div>
              <p className="text-gray-600 text-sm leading-relaxed mb-6">
                {selectedSchool.description}
              </p>
              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="bg-orange-50 p-3 rounded-lg text-center">
                  <div className="text-xs text-gray-600 mb-1">🌍 세계 랭킹</div>
                  <div className="font-bold">
                    {selectedSchool.worldRanking > 0
                      ? `${selectedSchool.worldRanking}위`
                      : '미집계'}
                  </div>
                </div>
                <div className="bg-red-50 p-3 rounded-lg text-center">
                  <div className="text-xs text-gray-600 mb-1">
                    🇨🇦 캐나다 랭킹
                  </div>
                  <div className="font-bold">
                    {selectedSchool.canadaRanking > 0
                      ? `${selectedSchool.canadaRanking}위`
                      : '미집계'}
                  </div>
                </div>
              </div>
              <button
                onClick={() => {
                  removeFavorite(selectedSchool.id);
                  setSelectedSchool(null);
                }}
                className="w-full flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white py-3 rounded-lg transition-colors"
              >
                <Trash2 className="w-5 h-5" />
                <span>저장 취소</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

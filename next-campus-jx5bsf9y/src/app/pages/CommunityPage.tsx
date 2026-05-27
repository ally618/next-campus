import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { Navigation } from '../components/Navigation';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import {
  MessageSquare,
  HelpCircle,
  UtensilsCrossed,
  Home,
  ThumbsUp,
  MessageCircle,
  Eye,
  Calendar,
  User,
  Pin,
} from 'lucide-react';

type TabType = 'board' | 'qna' | 'restaurant' | 'housing';

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
  tab: TabType;
}

export default function CommunityPage() {
  const [activeTab, setActiveTab] = useState<TabType>('board');
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const tab = searchParams.get('tab') as TabType;
    if (tab) setActiveTab(tab);
  }, [searchParams]);

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      try {
        const q = query(collection(db, 'posts'), orderBy('date', 'desc'));
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Post[];
        setPosts(data);
      } catch (e) {
        console.error(e);
      }
      setLoading(false);
    };
    fetchPosts();
  }, []);

  const tabs = [
    { id: 'board' as TabType, label: '게시판', icon: MessageSquare },
    { id: 'qna' as TabType, label: 'Q&A', icon: HelpCircle },
    { id: 'restaurant' as TabType, label: '맛집정보', icon: UtensilsCrossed },
    { id: 'housing' as TabType, label: '숙소정보', icon: Home },
  ];

  const currentPosts = posts.filter((p) => p.tab === activeTab);
  const hasImages = activeTab === 'restaurant' || activeTab === 'housing';

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <Navigation searchTerm="" onSearchChange={() => {}} showSearch={false} />

      <div className="flex-1 overflow-hidden flex flex-col">
        <div className="bg-white border-b border-gray-200 px-8 py-6">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">커뮤니티</h1>
            <p className="text-gray-600">
              유학생들과 정보를 공유하고 소통해보세요
            </p>
          </div>
        </div>

        <div className="bg-white border-b border-gray-200 px-8">
          <div className="max-w-6xl mx-auto flex gap-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setSearchParams({ tab: tab.id });
                  }}
                  className={`flex items-center gap-2 px-6 py-4 border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-8 py-6">
          <div className="max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                전체 게시글 {currentPosts.length}개
              </h2>
              <button
                onClick={() => navigate(`/community/write?tab=${activeTab}`)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                글쓰기
              </button>
            </div>

            {loading ? (
              <div className="flex justify-center items-center h-48 text-gray-400">
                불러오는 중...
              </div>
            ) : currentPosts.length === 0 ? (
              <div className="flex justify-center items-center h-48 text-gray-400">
                아직 게시글이 없어요. 첫 글을 작성해보세요! ✍️
              </div>
            ) : hasImages ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {currentPosts.map((post) => (
                  <div
                    key={post.id}
                    onClick={() =>
                      navigate(`/community/post/${post.id}?tab=${activeTab}`)
                    }
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
                      {post.location && (
                        <div className="flex items-center gap-1 text-sm text-blue-600 mb-2">
                          <Pin className="w-4 h-4" />
                          <span>{post.location}</span>
                        </div>
                      )}
                      <h3 className="font-bold text-lg mb-2">{post.title}</h3>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          <span>{post.author}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>{post.date}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-100">
                        <div className="flex items-center gap-1 text-gray-600">
                          <Eye className="w-4 h-4" />
                          <span className="text-sm">{post.views}</span>
                        </div>
                        <div className="flex items-center gap-1 text-red-600">
                          <ThumbsUp className="w-4 h-4" />
                          <span className="text-sm">{post.likes}</span>
                        </div>
                        <div className="flex items-center gap-1 text-blue-600">
                          <MessageCircle className="w-4 h-4" />
                          <span className="text-sm">{post.comments}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
                <div className="divide-y divide-gray-200">
                  {currentPosts.map((post) => (
                    <div
                      key={post.id}
                      onClick={() =>
                        navigate(`/community/post/${post.id}?tab=${activeTab}`)
                      }
                      className="p-5 hover:bg-gray-50 transition-colors cursor-pointer"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            {post.category && (
                              <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                                {post.category}
                              </span>
                            )}
                            <h3 className="font-semibold text-lg">
                              {post.title}
                            </h3>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <div className="flex items-center gap-1">
                              <User className="w-4 h-4" />
                              <span>{post.author}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              <span>{post.date}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Eye className="w-4 h-4" />
                              <span>{post.views}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 ml-4">
                          <div className="flex items-center gap-1 text-red-600">
                            <ThumbsUp className="w-5 h-5" />
                            <span className="font-semibold">{post.likes}</span>
                          </div>
                          <div className="flex items-center gap-1 text-blue-600">
                            <MessageCircle className="w-5 h-5" />
                            <span className="font-semibold">
                              {post.comments}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

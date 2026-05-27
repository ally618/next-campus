import { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router';
import { Navigation } from '../components/Navigation';
import {
  doc,
  getDoc,
  collection,
  addDoc,
  getDocs,
  orderBy,
  query,
  updateDoc,
  increment,
  setDoc,
  arrayUnion,
  arrayRemove,
  deleteDoc,
} from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import {
  ArrowLeft,
  Eye,
  ThumbsUp,
  MessageCircle,
  Calendar,
  User,
  MapPin,
  Share2,
  Bookmark,
  Trash2,
} from 'lucide-react';

interface Post {
  id: string;
  title: string;
  author: string;
  authorId?: string;
  date: string;
  views: number;
  likes: number;
  comments: number;
  category?: string;
  location?: string;
  image?: string;
  content: string;
  tab: string;
}

interface Comment {
  id: string;
  author: string;
  authorPhoto?: string;
  date: string;
  content: string;
  likes: number;
}

export default function PostDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const tabType = searchParams.get('tab') || 'board';
  const { user } = useAuth();
  // 북마크 상태 Firebase에서 불러오기
  useEffect(() => {
    if (!user || !id) return;
    const fetchBookmark = async () => {
      const docRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const savedPosts = docSnap.data().savedPosts || [];
        setBookmarked(savedPosts.includes(id));
      }
    };
    fetchBookmark();
  }, [user, id]);

  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [loading, setLoading] = useState(true);

  // 게시글 불러오기
  useEffect(() => {
    const fetchPost = async () => {
      if (!id) return;
      try {
        const docRef = doc(db, 'posts', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setPost({ id: docSnap.id, ...docSnap.data() } as Post);
          await updateDoc(docRef, { views: increment(1) });
        }
      } catch (e) {
        console.error(e);
      }
      setLoading(false);
    };
    fetchPost();
  }, [id]);

  // 댓글 불러오기
  useEffect(() => {
    const fetchComments = async () => {
      if (!id) return;
      try {
        const q = query(
          collection(db, 'posts', id, 'comments'),
          orderBy('date', 'asc')
        );
        const snapshot = await getDocs(q);
        setComments(
          snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as Comment[]
        );
      } catch (e) {
        console.error(e);
      }
    };
    fetchComments();
  }, [id]);

  const handleLike = async () => {
    if (!id || !post) return;
    setLiked(!liked);
    await updateDoc(doc(db, 'posts', id), { likes: increment(liked ? -1 : 1) });
    setPost({ ...post, likes: post.likes + (liked ? -1 : 1) });
  };

  const handleBookmark = async () => {
    if (!id || !user) return;
    const docRef = doc(db, 'users', user.uid);
    if (bookmarked) {
      await setDoc(docRef, { savedPosts: arrayRemove(id) }, { merge: true });
      setBookmarked(false);
    } else {
      await setDoc(docRef, { savedPosts: arrayUnion(id) }, { merge: true });
      setBookmarked(true);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    alert('링크가 클립보드에 복사되었습니다!');
  };

  const handleDelete = async () => {
    if (!id || !user || user.uid !== post?.authorId) return;
    if (!confirm('정말 삭제하시겠어요?')) return;
    try {
      await deleteDoc(doc(db, 'posts', id));
      alert('게시글이 삭제되었습니다.');
      navigate(`/community?tab=${tabType}`);
    } catch (e) {
      console.error(e);
      alert('삭제 중 오류가 발생했습니다.');
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !id) return;

    try {
      const docRef = await addDoc(collection(db, 'posts', id, 'comments'), {
        author: user?.displayName || '익명',
        authorPhoto: user?.photoURL || '',
        date: new Date().toISOString().split('T')[0],
        content: newComment,
        likes: 0,
      });
      await updateDoc(doc(db, 'posts', id), { comments: increment(1) });

      setComments([
        ...comments,
        {
          id: docRef.id,
          author: user?.displayName || '익명',
          authorPhoto: user?.photoURL || '',
          date: new Date().toISOString().split('T')[0],
          content: newComment,
          likes: 0,
        },
      ]);
      setNewComment('');
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex flex-col bg-gray-50">
        <Navigation
          searchTerm=""
          onSearchChange={() => {}}
          showSearch={false}
        />
        <div className="flex-1 flex justify-center items-center text-gray-400">
          불러오는 중...
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="h-screen flex flex-col bg-gray-50">
        <Navigation
          searchTerm=""
          onSearchChange={() => {}}
          showSearch={false}
        />
        <div className="flex-1 flex justify-center items-center text-gray-400">
          게시글을 찾을 수 없습니다.
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <Navigation searchTerm="" onSearchChange={() => {}} showSearch={false} />

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-8 py-6">
          <button
            onClick={() => navigate(`/community?tab=${tabType}`)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>목록으로</span>
          </button>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center gap-2 mb-3">
                {post.category && (
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                    {post.category}
                  </span>
                )}
                {post.location && (
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <MapPin className="w-4 h-4" />
                    <span>{post.location}</span>
                  </div>
                )}
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                {post.title}
              </h1>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-sm text-gray-600">
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
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleLike}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-lg transition-colors ${
                      liked
                        ? 'bg-red-50 text-red-600'
                        : 'bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-600'
                    }`}
                  >
                    <ThumbsUp
                      className={`w-4 h-4 ${liked ? 'fill-red-600' : ''}`}
                    />
                    <span className="text-sm font-medium">{post.likes}</span>
                  </button>
                  <button
                    onClick={handleBookmark}
                    className={`p-1.5 rounded-lg transition-colors ${
                      bookmarked
                        ? 'bg-yellow-50 text-yellow-600'
                        : 'bg-gray-100 text-gray-600 hover:bg-yellow-50'
                    }`}
                  >
                    <Bookmark
                      className={`w-4 h-4 ${
                        bookmarked ? 'fill-yellow-600' : ''
                      }`}
                    />
                  </button>
                  <button
                    onClick={handleShare}
                    className="p-1.5 bg-gray-100 text-gray-600 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-colors"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                  {user?.uid === post?.authorId && (
                    <button
                      onClick={handleDelete}
                      className="flex items-center gap-1 px-3 py-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span className="text-sm font-medium">삭제</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {post.image && (
              <img
                src={post.image}
                alt={post.title}
                className="w-full h-96 object-cover"
              />
            )}

            <div className="p-6">
              {post.content.split('\n').map((line: string, index: number) => {
                if (line.startsWith('## '))
                  return (
                    <h2 key={index} className="text-2xl font-bold mt-6 mb-3">
                      {line.replace('## ', '')}
                    </h2>
                  );
                if (line.startsWith('- '))
                  return (
                    <li key={index} className="ml-6 text-gray-700">
                      {line.replace('- ', '')}
                    </li>
                  );
                if (line.trim() === '') return <br key={index} />;
                return (
                  <p key={index} className="text-gray-700 leading-relaxed mb-3">
                    {line}
                  </p>
                );
              })}
            </div>
          </div>

          {/* 댓글 */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              댓글 {comments.length}개
            </h3>

            <form onSubmit={handleCommentSubmit} className="mb-6">
              {user && (
                <div className="flex items-center gap-2 mb-3">
                  <img
                    src={user.photoURL || ''}
                    alt={user.displayName || ''}
                    className="w-8 h-8 rounded-full border border-gray-200"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    {user.displayName}
                  </span>
                </div>
              )}
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder={
                  user
                    ? '댓글을 입력하세요...'
                    : '로그인 후 댓글을 작성할 수 있어요'
                }
                disabled={!user}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none mb-3 disabled:bg-gray-50 disabled:text-gray-400"
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={!user}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  댓글 작성
                </button>
              </div>
            </form>

            <div className="space-y-4">
              {comments.map((comment) => (
                <div key={comment.id} className="border-t border-gray-200 pt-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                    {comment.authorPhoto ? (
                      <img
                        src={comment.authorPhoto}
                        alt={comment.author}
                        className="w-6 h-6 rounded-full border border-gray-200"
                      />
                    ) : (
                      <User className="w-4 h-4" />
                    )}
                    <span className="font-semibold text-gray-900">
                      {comment.author}
                    </span>
                    <span>·</span>
                    <span>{comment.date}</span>
                  </div>
                  <p className="text-gray-700 leading-relaxed">
                    {comment.content}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import {
  GraduationCap,
  Search,
  Heart,
  Map,
  Users,
  LogIn,
  LogOut,
  X,
} from 'lucide-react';
import { Link, useLocation } from 'react-router';
import { useFavorites } from '../contexts/FavoritesContext';
import { useAuth } from '../contexts/AuthContext';
import { useState, useRef, useEffect } from 'react';
import { schools } from '../data/schools';
import { School } from '../types';

interface NavigationProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onSchoolSelect?: (school: School) => void;
  showSearch?: boolean;
}

export function Navigation({
  searchTerm,
  onSearchChange,
  onSchoolSelect,
  showSearch = true,
}: NavigationProps) {
  const location = useLocation();
  const { favorites } = useFavorites();
  const { user, signInWithGoogle, logout } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 연관 검색 결과
  const suggestions =
    inputValue.trim().length > 0
      ? schools
          .filter(
            (school) =>
              school.name.toLowerCase().includes(inputValue.toLowerCase()) ||
              school.location.toLowerCase().includes(inputValue.toLowerCase())
          )
          .slice(0, 8)
      : [];

  // 외부 클릭시 드롭다운 닫기
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    setShowDropdown(true);
    onSearchChange(e.target.value);
  };

  const handleSelect = (school: School) => {
    setInputValue(school.name);
    setShowDropdown(false);
    onSearchChange(school.name);
    onSchoolSelect?.(school);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && suggestions.length > 0) {
      handleSelect(suggestions[0]);
    }
    if (e.key === 'Escape') {
      setShowDropdown(false);
    }
  };

  const handleClear = () => {
    setInputValue('');
    onSearchChange('');
    setShowDropdown(false);
    inputRef.current?.focus();
  };

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-3">
            <GraduationCap className="w-8 h-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">Next Campus</h1>
          </Link>

          <nav className="flex items-center gap-4">
            <Link
              to="/"
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                location.pathname === '/'
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Map className="w-5 h-5" />
              <span>지도</span>
            </Link>
            <Link
              to="/mypage"
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors relative ${
                location.pathname === '/mypage'
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Heart className="w-5 h-5" />
              <span>마이페이지</span>
            </Link>
            <Link
              to="/community"
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                location.pathname === '/community'
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Users className="w-5 h-5" />
              <span>커뮤니티</span>
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          {showSearch && (
            <div className="relative" ref={dropdownRef}>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="학교 이름, 도시 검색..."
                  value={inputValue}
                  onChange={handleInputChange}
                  onFocus={() => inputValue && setShowDropdown(true)}
                  onKeyDown={handleKeyDown}
                  className="pl-10 pr-10 py-2 w-80 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {inputValue && (
                  <button
                    onClick={handleClear}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* 드롭다운 */}
              {showDropdown && suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden">
                  {suggestions.map((school) => (
                    <div
                      key={school.id}
                      onClick={() => handleSelect(school)}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-blue-50 cursor-pointer transition-colors border-b border-gray-100 last:border-0"
                    >
                      <div className="bg-blue-100 p-2 rounded-lg">
                        <GraduationCap className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900 text-sm">
                          {school.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {school.location}
                        </div>
                      </div>
                      {school.worldRanking > 0 && (
                        <div className="ml-auto text-xs text-gray-400">
                          🌍 {school.worldRanking}위
                        </div>
                      )}
                    </div>
                  ))}
                  <div className="px-4 py-2 bg-gray-50 text-xs text-gray-400 text-center">
                    엔터 또는 클릭으로 선택
                  </div>
                </div>
              )}

              {/* 검색했는데 결과 없을 때 */}
              {showDropdown &&
                inputValue.trim().length > 0 &&
                suggestions.length === 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-50 p-4 text-center text-gray-400 text-sm">
                    검색 결과가 없어요 😢
                  </div>
                )}
            </div>
          )}

          {/* 로그인/로그아웃 */}
          {user ? (
            <div className="flex items-center gap-3">
              <img
                src={user.photoURL || ''}
                alt={user.displayName || ''}
                className="w-8 h-8 rounded-full border border-gray-200"
              />
              <span className="text-sm font-medium text-gray-700">
                {user.displayName}
              </span>
              <button
                onClick={logout}
                className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors text-sm"
              >
                <LogOut className="w-4 h-4" />
                <span>로그아웃</span>
              </button>
            </div>
          ) : (
            <button
              onClick={signInWithGoogle}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium"
            >
              <LogIn className="w-4 h-4" />
              <span>Google 로그인</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

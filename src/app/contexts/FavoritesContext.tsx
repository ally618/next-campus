import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { doc, setDoc, getDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from './AuthContext';
import type { School } from '../types';

interface FavoritesContextType {
  favorites: School[];
  addFavorite: (school: School) => void;
  removeFavorite: (schoolId: number) => void;
  isFavorite: (schoolId: number) => boolean;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [favorites, setFavorites] = useState<School[]>([]);
  const { user } = useAuth();

  // 로그인하면 Firebase에서 불러오기
  useEffect(() => {
    if (!user) {
      setFavorites([]);
      return;
    }
    const fetchFavorites = async () => {
      const docRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setFavorites(docSnap.data().favorites || []);
      } else {
        setFavorites([]);
      }
    };
    fetchFavorites();
  }, [user]);

  const addFavorite = async (school: School) => {
    if (!user) return;
    setFavorites(prev => [...prev, school]);
    const docRef = doc(db, 'users', user.uid);
    await setDoc(docRef, { favorites: arrayUnion(school) }, { merge: true });
  };

  const removeFavorite = async (schoolId: number) => {
    if (!user) return;
    const school = favorites.find(s => s.id === schoolId);
    if (!school) return;
    setFavorites(prev => prev.filter(s => s.id !== schoolId));
    const docRef = doc(db, 'users', user.uid);
    await updateDoc(docRef, { favorites: arrayRemove(school) });
  };

  const isFavorite = (schoolId: number) => {
    return favorites.some(s => s.id === schoolId);
  };

  return (
    <FavoritesContext.Provider value={{ favorites, addFavorite, removeFavorite, isFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (!context) throw new Error('useFavorites must be used within FavoritesProvider');
  return context;
}
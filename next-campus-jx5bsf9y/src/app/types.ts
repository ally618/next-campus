export interface School {
  id: number;
  name: string;
  country: string;
  location: string;
  lat: number;
  lng: number;
  image: string;
  rating: number;
  students: number;
  tuition: string;
  founded: number;
  description: string;
  programs: string[];
  requirements: string[];
  minZoom: number;
  worldRanking: number; // 세계 랭킹
  canadaRanking: number; // 캐나다 내 랭킹
  type: string;
  campus: string;
  scholarships: string[];
  accommodation: string;
  website?: string;
}

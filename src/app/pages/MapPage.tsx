import { useState, useMemo } from 'react';
import { Map } from '../components/Map';
import { SchoolInfo } from '../components/SchoolInfo';
import { SchoolDetailModal } from '../components/SchoolDetailModal';
import { Navigation } from '../components/Navigation';
import { schools } from '../data/schools';
import { School } from '../types';

export default function MapPage() {
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null);
  const [detailSchool, setDetailSchool] = useState<School | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [zoomLevel, setZoomLevel] = useState(4.5);

  const filteredSchools = useMemo(() => {
    let filtered = schools;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (school) =>
          school.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          school.country.toLowerCase().includes(searchTerm.toLowerCase()) ||
          school.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by zoom level
    filtered = filtered.filter((school) => zoomLevel >= (school.minZoom || 0));

    return filtered;
  }, [searchTerm, zoomLevel]);

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      <Navigation
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onSchoolSelect={setSelectedSchool}
      />

      <div className="flex-1 flex overflow-hidden">
        {/* Map Section */}
        <div className="flex-1 relative">
          <Map
            schools={filteredSchools}
            selectedSchool={selectedSchool}
            onSchoolSelect={setSelectedSchool}
            onZoomChange={setZoomLevel}
          />

          {/* Zoom Level Indicator */}
          <div className="absolute bottom-4 left-4 bg-white px-4 py-2 rounded-lg shadow-lg">
            <div className="text-xs text-gray-500">
              🏫 {filteredSchools.length}개 학교 표시 중
            </div>
          </div>
        </div>

        {/* Info Panel */}
        <div className="w-[450px] bg-white border-l border-gray-200 overflow-hidden">
          <SchoolInfo
            school={selectedSchool}
            onClose={() => setSelectedSchool(null)}
            onShowDetail={(school) => setDetailSchool(school)}
          />
        </div>
      </div>

      {/* Detail Modal */}
      <SchoolDetailModal
        school={detailSchool}
        open={detailSchool !== null}
        onClose={() => setDetailSchool(null)}
      />
    </div>
  );
}

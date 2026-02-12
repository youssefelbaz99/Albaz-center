import React from 'react';
import { useStore } from '../context/StoreContext';
import { CourseCard } from '../components/CourseCard';
import { BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const MyCoursesPage: React.FC = () => {
  const { courses, user, t } = useStore();
  const navigate = useNavigate();

  if (!user) {
    navigate('/login');
    return null;
  }

  const myCourses = courses.filter(course => user.purchasedCourses.includes(course.id));

  const getCourseProgress = (courseId: string) => {
      const course = courses.find(c => c.id === courseId);
      if (!course) return 0;

      const totalLessons = course.sections.reduce((acc, section) => acc + section.lessons.length, 0);
      if (totalLessons === 0) return 0;

      const completedCount = user.completedLessons[courseId]?.length || 0;
      return Math.round((completedCount / totalLessons) * 100);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8 flex items-center gap-3">
          <BookOpen className="w-8 h-8 text-primary" />
          {t.myCourses}
        </h1>

        {myCourses.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {myCourses.map(course => (
              <CourseCard 
                key={course.id} 
                course={course} 
                progress={getCourseProgress(course.id)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-gray-200">
            <h3 className="text-xl font-bold text-gray-700 mb-2">
              {t.noCourses}
            </h3>
            <p className="text-gray-500 mb-6">You haven't enrolled in any courses yet.</p>
            <button 
              onClick={() => navigate('/')}
              className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              {t.browseBtn}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
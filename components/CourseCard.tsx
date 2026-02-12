import React from 'react';
import { Course } from '../types';
import { Star, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useStore } from '../context/StoreContext';

interface CourseCardProps {
  course: Course;
  progress?: number; // Optional progress percentage (0-100)
}

export const CourseCard: React.FC<CourseCardProps> = ({ course, progress }) => {
  const { t, settings } = useStore();
  
  return (
    <Link to={`/course/${course.id}`} className="block group">
      <div className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 h-full flex flex-col relative">
        
        {course.discountPrice && (
            <div className="absolute top-2 left-2 z-10 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded shadow-sm">
                {t.course.discount} {Math.round(((course.price - course.discountPrice) / course.price) * 100)}%
            </div>
        )}

        <div className="relative">
          <img 
            src={course.thumbnail} 
            alt={course.title} 
            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500" 
          />
          <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-md text-xs font-bold text-primary shadow-sm">
            {course.category}
          </div>
        </div>
        
        <div className="p-4 flex flex-col flex-grow">
          <h3 className="text-lg font-bold text-gray-800 line-clamp-2 mb-2 group-hover:text-primary transition-colors">
            {course.title}
          </h3>
          
          <div className="flex items-center text-xs text-gray-500 mb-3 space-x-3 space-x-reverse">
            {settings.showStudentCount && (
                <div className="flex items-center">
                    <Users className="w-3 h-3 ml-1" />
                    {course.studentsCount} {t.course.student}
                </div>
            )}
            <div className="flex items-center text-amber-500">
              <Star className="w-3 h-3 ml-1 fill-current" />
              {course.rating}
            </div>
          </div>

          <p className="text-gray-500 text-sm line-clamp-2 mb-4 flex-grow">
            {course.description}
          </p>

          {/* Progress Bar (Visible if progress prop is provided) */}
          {typeof progress === 'number' && (
            <div className="mb-4">
              <div className="flex justify-between text-xs font-semibold text-gray-600 mb-1">
                 <span>Progress</span>
                 <span>{progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                 <div 
                    className="bg-green-500 h-2 rounded-full transition-all duration-500" 
                    style={{ width: `${progress}%` }}
                 ></div>
              </div>
            </div>
          )}
          
          <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100">
            <div className="flex items-center gap-2">
                <img src={`https://ui-avatars.com/api/?name=${course.instructor}&background=random`} className="w-6 h-6 rounded-full" alt="instructor"/>
                <span className="text-xs text-gray-600 font-medium">{course.instructor}</span>
            </div>
            <div className="flex flex-col items-end">
                {course.discountPrice ? (
                    <>
                        <span className="text-xs text-gray-400 line-through">{course.price} {t.course.currency}</span>
                        <span className="text-lg font-bold text-red-600">
                            {course.discountPrice} {t.course.currency}
                        </span>
                    </>
                ) : (
                    <span className="text-lg font-bold text-primary">
                        {course.price > 0 ? `${course.price} ${t.course.currency}` : t.course.free}
                    </span>
                )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};
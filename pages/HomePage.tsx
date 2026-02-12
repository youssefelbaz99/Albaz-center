import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { CourseCard } from '../components/CourseCard';
import { Rocket, CreditCard, BookOpen, ArrowLeft, ArrowRight, Award } from 'lucide-react';
import { Link } from 'react-router-dom';

export const HomePage: React.FC = () => {
  const { courses, t, language, user, settings } = useStore();
  const [filter, setFilter] = useState('');
  const [currentSlide, setCurrentSlide] = useState(0);

  // Auto-play Slider
  useEffect(() => {
      if (settings.heroImageUrls.length <= 1) return;
      
      const timer = setInterval(() => {
          setCurrentSlide((prev) => (prev + 1) % settings.heroImageUrls.length);
      }, 5000);

      return () => clearInterval(timer);
  }, [settings.heroImageUrls]);

  // Map filters to translation keys
  const filterMap: {[key: string]: string} = {
      'الكل': 'all',
      'برمجة': 'programming',
      'تصميم': 'design',
      'تسويق': 'marketing'
  };

  const filteredCourses = courses.filter(c => 
    !filter || filter === 'all' || 
    c.title.includes(filter) || 
    (filter === 'programming' && c.category === 'برمجة') ||
    (filter === 'design' && c.category === 'تصميم') ||
    (filter === 'marketing' && c.category === 'تسويق')
  );

  // Safely check for purchased courses
  const myCourses = user ? courses.filter(c => user.purchasedCourses.includes(c.id)) : [];

  const scrollToCourses = () => {
    const element = document.getElementById('courses-section');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary to-blue-800 text-white py-20 px-4 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between relative z-10">
          <div className="md:w-1/2 text-center md:text-right mb-10 md:mb-0">
            <h1 className="text-4xl md:text-6xl font-extrabold mb-6 leading-tight">
              {language === 'ar' ? settings.heroTitleAr : settings.heroTitleEn} <br/>
              <span className="text-secondary">{language === 'ar' ? settings.heroSubtitleAr : settings.heroSubtitleEn}</span>
            </h1>
            <p className="text-lg md:text-xl text-blue-100 mb-8 max-w-lg mx-auto md:mx-0">
              {t.homeHeroDesc}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <button 
                onClick={scrollToCourses}
                className="bg-secondary hover:bg-amber-600 text-white font-bold py-3 px-8 rounded-full shadow-lg transform hover:-translate-y-1 transition duration-300"
              >
                {t.browseBtn}
              </button>
            </div>
          </div>
          
          {/* Image Slider */}
          <div className="md:w-1/2 flex justify-center relative min-h-[300px] md:min-h-[400px] w-full">
            {settings.heroImageUrls.length > 0 ? (
                settings.heroImageUrls.map((url, index) => (
                    <img 
                      key={index} 
                      src={url} 
                      alt="Learning Illustration" 
                      className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-md drop-shadow-2xl transition-all duration-1000 ease-in-out ${index === currentSlide ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
                    />
                ))
            ) : (
                <img 
                  src="https://cdni.iconscout.com/illustration/premium/thumb/online-learning-4112674-3407969.png" 
                  alt="Learning Illustration" 
                  className="w-full max-w-md drop-shadow-2xl animate-pulse-slow"
                />
            )}
            
            {/* Slider Dots */}
            {settings.heroImageUrls.length > 1 && (
                <div className="absolute -bottom-10 left-1/2 transform -translate-x-1/2 flex gap-2">
                    {settings.heroImageUrls.map((_, idx) => (
                        <button 
                            key={idx} 
                            onClick={() => setCurrentSlide(idx)}
                            className={`w-3 h-3 rounded-full transition-all ${currentSlide === idx ? 'bg-secondary w-6' : 'bg-white/50 hover:bg-white'}`}
                        />
                    ))}
                </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Features */}
      <div className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureBox icon={<Rocket className="w-8 h-8"/>} title={language === 'ar' ? "تعلم سريع" : "Fast Learning"} desc={language === 'ar' ? "محتوى مركز ومختصر يوفر عليك الوقت والجهد." : "Concise content saving you time and effort."} />
            <FeatureBox icon={<CreditCard className="w-8 h-8"/>} title={language === 'ar' ? "دفع آمن" : "Secure Payment"} desc={language === 'ar' ? "وسائل دفع متعددة ومحلية (فودافون كاش، فوري)." : "Multiple local payment methods available."} />
            <FeatureBox icon={<Award className="w-8 h-8"/>} title={language === 'ar' ? "شهادات إتمام" : "Completion Certificates"} desc={language === 'ar' ? "احصل على شهادة موثقة عند إتمامك لأي كورس." : "Get a verified certificate upon course completion."} />
        </div>
      </div>

      {/* My Courses Section (Visible when User is Logged In and has courses) */}
      {user && myCourses.length > 0 && (
          <div className="max-w-7xl mx-auto px-4 py-8">
             <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                <div className="flex justify-between items-center mb-8 border-r-4 border-primary pr-4 rtl:border-r-4 rtl:border-l-0 ltr:border-l-4 ltr:border-r-0 ltr:pl-4">
                    <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <BookOpen className="w-6 h-6 text-primary" />
                        {t.myCourses}
                    </h2>
                    <Link to="/my-courses" className="text-primary hover:text-blue-700 hover:underline text-sm font-bold flex items-center gap-1">
                        {language === 'ar' ? 'عرض الكل' : 'View All'}
                        {language === 'ar' ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
                    </Link>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {myCourses.slice(0, 4).map(course => (
                        <CourseCard key={course.id} course={course} />
                    ))}
                </div>
             </div>
          </div>
      )}

      {/* Latest Courses List */}
      <div id="courses-section" className="max-w-7xl mx-auto px-4 py-16">
        <div className="flex flex-col md:flex-row justify-between items-center mb-10">
            <h2 className="text-3xl font-bold text-gray-800 border-r-4 border-secondary pr-4 rtl:border-r-4 rtl:border-l-0 ltr:border-l-4 ltr:border-r-0 ltr:pl-4">{t.latestCourses}</h2>
            
            {/* Simple Category Filter */}
            <div className="mt-4 md:mt-0 flex gap-2 overflow-x-auto pb-2 md:pb-0">
                {['all', 'programming', 'design', 'marketing'].map(cat => (
                    <button 
                        key={cat}
                        onClick={() => setFilter(cat === 'all' ? '' : cat)}
                        className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${
                            (cat === 'all' && filter === '') || filter === cat 
                            ? 'bg-primary text-white' 
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                    >
                        {/* @ts-ignore */}
                        {t.filters[cat]}
                    </button>
                ))}
            </div>
        </div>

        {filteredCourses.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredCourses.map(course => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-gray-500">
            {t.noCourses}
          </div>
        )}
      </div>
    </div>
  );
};

const FeatureBox = ({icon, title, desc}: {icon: React.ReactNode, title: string, desc: string}) => (
    <div className="flex items-start gap-4 p-6 rounded-xl border border-slate-100 hover:shadow-md transition bg-white">
        <div className="p-3 bg-blue-50 text-primary rounded-lg">{icon}</div>
        <div>
            <h3 className="font-bold text-lg mb-1">{title}</h3>
            <p className="text-gray-500 text-sm">{desc}</p>
        </div>
    </div>
)
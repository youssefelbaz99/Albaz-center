import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { PlayCircle, FileText, Lock, CheckCircle, MessageSquare, Send, Star, User as UserIcon, Circle, Download, Award, ShieldCheck, AlertTriangle, X, EyeOff } from 'lucide-react';
import { generateCourseSummary, askCourseAssistant } from '../services/geminiService';
import { CourseCard } from '../components/CourseCard';

export const CourseDetailsPage: React.FC = () => {
  const { id } = useParams();
  const { courses, user, addToCart, t, language, addReview, markLessonCompleted, settings } = useStore();
  const navigate = useNavigate();
  
  const course = courses.find(c => c.id === id);
  const isEnrolled = user?.purchasedCourses.includes(id || '') || false;
  
  const [activeLessonId, setActiveLessonId] = useState<string | null>(null);
  const [aiSummary, setAiSummary] = useState<string>('');
  const [aiChatOpen, setAiChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState<{role: 'user' | 'ai', text: string}[]>([]);
  const [loadingAi, setLoadingAi] = useState(false);
  
  // Security State
  const [securityWarning, setSecurityWarning] = useState(false);
  const [contentHidden, setContentHidden] = useState(false);

  // Review State
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');

  // --- INTELLIGENT SECURITY SYSTEM ---
  useEffect(() => {
    if(!isEnrolled) return;

    // 1. Precise Key Detection (Only block malicious shortcuts)
    const handleKeyDown = (e: KeyboardEvent) => {
        // PrintScreen
        const isPrintScreen = e.key === 'PrintScreen';
        
        // Windows/Linux Snipping Tools: Win+Shift+S
        const isSnippingTool = e.metaKey && e.shiftKey && e.key.toLowerCase() === 's';
        
        // Mac Screenshots: Cmd+Shift+3 or 4 or 5 (Record)
        const isMacScreenshot = (e.metaKey || e.ctrlKey) && e.shiftKey && (['3', '4', '5'].includes(e.key));

        // Windows Game Bar Record (Win+Alt+R)
        const isGameBarRecord = e.metaKey && e.altKey && e.key.toLowerCase() === 'r';

        // Developer Tools: F12 or Ctrl+Shift+I (To prevent inspecting video source)
        const isDevTools = e.key === 'F12' || ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'i');

        if (isPrintScreen || isSnippingTool || isMacScreenshot || isDevTools || isGameBarRecord) {
            e.preventDefault();
            e.stopPropagation();
            
            // Trigger Warning Overlay
            setSecurityWarning(true);
            setContentHidden(true); // Hide content on shortcut attempt
            
            // Auto-hide warning after 3 seconds
            setTimeout(() => setSecurityWarning(false), 3000);
        }
    };

    // 2. Prevent Context Menu (Right Click)
    const handleContextMenu = (e: MouseEvent) => {
        e.preventDefault();
        return false;
    };

    // 3. Focus Detection (Anti-recording software often takes focus or runs in background)
    const handleVisibilityChange = () => {
        if (document.hidden) {
            setContentHidden(true);
        }
    };

    const handleWindowBlur = () => {
        // When window loses focus (e.g. user clicks another app/monitor), hide content
        setContentHidden(true);
    };

    const handleWindowFocus = () => {
        // Restore content when user comes back
        setContentHidden(false);
    };

    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);
    window.addEventListener('focus', handleWindowFocus);

    // CSS Text Selection Protection
    document.body.style.userSelect = 'none';
    document.body.style.webkitUserSelect = 'none';

    return () => {
        window.removeEventListener('keydown', handleKeyDown);
        document.removeEventListener('contextmenu', handleContextMenu);
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        window.removeEventListener('blur', handleWindowBlur);
        window.removeEventListener('focus', handleWindowFocus);
        document.body.style.userSelect = 'auto';
        document.body.style.webkitUserSelect = 'auto';
    };
  }, [isEnrolled, language]);

  useEffect(() => {
    if (course) {
        generateCourseSummary(course.title, course.description, language).then(setAiSummary);
    }
  }, [course, language]);

  if (!course) return <div className="p-10 text-center">Course not found</div>;

  // --- Helpers for Video & Certificate ---

  const getYoutubeId = (url: string) => {
      if (!url) return null;
      // Handle standard and shortened YouTube URLs
      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
      const match = url.match(regExp);
      
      // Standard IDs are 11 chars, but some logic suggests allowing 10-12 to be safe against edge cases
      // We check for match and ensure captured ID length is reasonable
      return (match && match[2].length >= 10) ? match[2] : null;
  };

  // --- CERTIFICATE GENERATION (Kept Same) ---
  const generateCertificate = () => {
      if (!user || !course) return;

      const canvas = document.createElement('canvas');
      canvas.width = 2000;
      canvas.height = 1400;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const bgGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      bgGradient.addColorStop(0, '#FFFFFF');
      bgGradient.addColorStop(1, '#F8FAFC');
      ctx.fillStyle = bgGradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 15;
      ctx.strokeRect(40, 40, canvas.width - 80, canvas.height - 80);
      
      ctx.strokeStyle = '#D4AF37';
      ctx.lineWidth = 5;
      ctx.strokeRect(65, 65, canvas.width - 130, canvas.height - 130);

      ctx.textAlign = 'center';
      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 80px "Times New Roman", serif';
      ctx.fillText(language === 'ar' ? 'شهادة إتمام كورس' : 'CERTIFICATE OF COMPLETION', canvas.width / 2, 300);

      ctx.fillStyle = '#64748b';
      ctx.font = '30px Arial, sans-serif';
      ctx.fillText(language === 'ar' ? 'تُمنح هذه الشهادة بفخر إلى' : 'This certificate is proudly presented to', canvas.width / 2, 400);

      ctx.font = 'bold italic 100px "Great Vibes", "Times New Roman", serif';
      const nameGradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
      nameGradient.addColorStop(0.3, '#D4AF37');
      nameGradient.addColorStop(0.7, '#B8860B');
      ctx.fillStyle = nameGradient;
      ctx.fillText(user.name, canvas.width / 2, 550);

      ctx.beginPath();
      ctx.moveTo(canvas.width / 2 - 300, 580);
      ctx.lineTo(canvas.width / 2 + 300, 580);
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#D4AF37';
      ctx.stroke();

      ctx.fillStyle = '#1e293b';
      ctx.font = '35px Arial, sans-serif';
      const courseText = language === 'ar' 
        ? `لإتمامه بنجاح متطلبات الكورس التدريبي:`
        : `For successfully completing the training course requirements for:`;
      ctx.fillText(courseText, canvas.width / 2, 700);

      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 60px Arial, sans-serif';
      ctx.fillText(course.title, canvas.width / 2, 800);

      ctx.fillStyle = '#64748b';
      ctx.font = 'italic 30px Arial, sans-serif';
      const instructorText = language === 'ar'
        ? `بقيادة المحاضر: ${course.instructor}`
        : `Instructed by: ${course.instructor}`;
      ctx.fillText(instructorText, canvas.width / 2, 900);

      const date = new Date().toLocaleDateString(language === 'en' ? 'en-US' : 'ar-EG', { year: 'numeric', month: 'long', day: 'numeric' });
      
      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 25px Arial';
      ctx.fillText(language === 'ar' ? 'تاريخ المنح' : 'Date Issued', 400, 1100);
      ctx.fillStyle = '#555';
      ctx.font = '25px Arial';
      ctx.fillText(date, 400, 1150);
      ctx.beginPath();
      ctx.moveTo(250, 1170);
      ctx.lineTo(550, 1170);
      ctx.strokeStyle = '#ccc';
      ctx.stroke();

      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 25px Arial';
      ctx.fillText('Albaz Platform', canvas.width - 400, 1100);
      
      ctx.font = 'italic 40px "Brush Script MT", cursive';
      ctx.fillStyle = '#D4AF37';
      ctx.fillText('Youssef Elbaz', canvas.width - 400, 1150);
      
      ctx.beginPath();
      ctx.moveTo(canvas.width - 550, 1170);
      ctx.lineTo(canvas.width - 250, 1170);
      ctx.strokeStyle = '#ccc';
      ctx.stroke();

      const link = document.createElement('a');
      link.download = `Certificate_${course.id}_${user.id}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
  };

  const handleLessonPlay = (lessonId: string, isFree: boolean) => {
    if (isEnrolled || isFree) {
        setActiveLessonId(lessonId);
        if (isEnrolled && course) {
            markLessonCompleted(course.id, lessonId);
        }
    } else {
        alert(language === 'ar' ? 'يجب شراء الكورس لمشاهدة هذا الدرس' : 'You must buy the course to watch this lesson');
    }
  };

  const handleAskAi = async () => {
    if (!chatInput.trim()) return;
    const question = chatInput;
    setChatInput('');
    setChatHistory(prev => [...prev, { role: 'user', text: question }]);
    setLoadingAi(true);
    const answer = await askCourseAssistant(question, `${course.title}: ${course.description}`, language);
    setChatHistory(prev => [...prev, { role: 'ai', text: answer }]);
    setLoadingAi(false);
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
        alert('Please login first');
        return;
    }
    if (course.reviews.find(r => r.userId === user.id)) {
        alert('You have already reviewed this course');
        return;
    }
    addReview(course.id, {
        userId: user.id,
        userName: user.name,
        rating: reviewRating,
        comment: reviewComment
    });
    setReviewComment('');
    setReviewRating(5);
  };

  const recommendedCourses = courses
    .filter(c => c.category === course.category && c.id !== course.id)
    .slice(0, 3);

  const completedCount = course.sections.reduce((acc, sec) => 
    acc + sec.lessons.filter(l => user?.completedLessons[course.id]?.includes(l.id)).length
  , 0);
  const totalLessons = course.sections.reduce((acc, sec) => acc + sec.lessons.length, 0);
  const progressPercentage = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;
  const isCompleted = progressPercentage === 100;

  const handleBuyNow = () => {
    addToCart(course);
    navigate('/checkout');
  };

  const scrollToContent = () => {
    document.getElementById('course-content')?.scrollIntoView({ behavior: 'smooth' });
  };

  const activeLesson = activeLessonId ? course.sections.flatMap(s => s.lessons).find(l => l.id === activeLessonId) : null;

  // --- VIDEO PLAYER COMPONENT ---
  const getVideoComponent = (url: string, title: string) => {
      // Dynamic Watermark: Robust Tiled Pattern
      const WatermarkOverlay = () => {
          if (!user) return null;
          const watermarkText = `${user.name} • ${user.phone || user.email}`;
          
          return (
              <div className="absolute inset-0 z-50 pointer-events-none overflow-hidden select-none flex flex-wrap content-center justify-center opacity-30">
                  {Array.from({ length: 15 }).map((_, i) => (
                      <div 
                        key={i} 
                        className="m-12 transform -rotate-12 text-white/40 font-bold text-lg whitespace-nowrap"
                        style={{
                            textShadow: '0 0 2px rgba(0,0,0,0.5)',
                            // Random slight animation delay for each to make it look alive
                            animation: `pulse 4s infinite alternate ${i * 0.5}s`
                        }}
                      >
                          {watermarkText}
                      </div>
                  ))}
                  <style>{`
                    @keyframes pulse {
                        0% { opacity: 0.3; transform: rotate(-12deg) scale(1); }
                        100% { opacity: 0.6; transform: rotate(-12deg) scale(1.05); }
                    }
                  `}</style>
              </div>
          );
      };

      const youtubeId = getYoutubeId(url);
      const shouldHide = securityWarning || contentHidden;

      return (
        <div className="relative w-full h-full bg-black group rounded-lg overflow-hidden">
             
             {/* Security Blackout Screen - Triggered by shortcut OR focus loss */}
             {shouldHide && (
                 <div className="absolute inset-0 z-[100] bg-black/95 backdrop-blur-3xl flex flex-col items-center justify-center text-center p-6 animate-pulse">
                     {securityWarning ? (
                        <AlertTriangle className="w-16 h-16 text-red-500 mb-4" />
                     ) : (
                        <EyeOff className="w-16 h-16 text-gray-400 mb-4" />
                     )}
                     
                     <h2 className="text-xl font-bold text-white mb-2">
                        {securityWarning 
                            ? (language === 'ar' ? 'تحذير أمني' : 'Security Warning')
                            : (language === 'ar' ? 'المحتوى مخفي' : 'Content Hidden')}
                     </h2>
                     <p className="text-gray-300 text-sm">
                         {securityWarning 
                            ? (language === 'ar' ? 'محاولة تسجيل الشاشة ممنوعة. تم تسجيل النشاط.' : 'Screen recording is prohibited. Activity logged.')
                            : (language === 'ar' ? 'يرجى العودة إلى الصفحة لمتابعة المشاهدة' : 'Please return to the page to continue watching')}
                     </p>
                 </div>
             )}

             {youtubeId ? (
                 <iframe 
                    className="w-full h-full"
                    src={`https://www.youtube.com/embed/${youtubeId}?modestbranding=1&rel=0&playsinline=1&enablejsapi=1`}
                    title={title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowFullScreen
                    style={{ 
                        pointerEvents: shouldHide ? 'none' : 'auto',
                        filter: shouldHide ? 'blur(20px)' : 'none'
                    }}
                ></iframe>
             ) : (
                 <video 
                    className="w-full h-full object-contain"
                    controls
                    controlsList="nodownload" 
                    disablePictureInPicture
                    src={url}
                    onContextMenu={(e) => e.preventDefault()}
                    style={{ filter: shouldHide ? 'blur(20px)' : 'none' }}
                 >
                     Your browser does not support the video tag.
                 </video>
             )}
             
             {/* Transparent Overlay for Watermark */}
             <WatermarkOverlay />
        </div>
      );
  };

  return (
    <div className={`min-h-screen bg-gray-50 pb-20 relative`}>
      
      {/* Header/Hero for Course */}
      <div className="bg-dark text-white py-12 relative">
        {/* Protection Badge */}
        {isEnrolled && (
            <div className="absolute top-4 right-4 flex items-center gap-1 bg-green-900/50 border border-green-500/30 px-3 py-1 rounded-full text-xs text-green-400">
                <ShieldCheck className="w-3 h-3" />
                <span>{language === 'ar' ? 'المحتوى محمي' : 'Secure Content'}</span>
            </div>
        )}

        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row gap-8">
            <div className="md:w-2/3">
                <h1 className="text-3xl font-bold mb-4">{course.title}</h1>
                <p className="text-gray-300 text-lg mb-6 leading-relaxed">{course.description}</p>
                
                <div className="flex items-center gap-6 text-sm text-gray-400">
                    <span>{t.course.instructor}: <strong className="text-white">{course.instructor}</strong></span>
                    <span>{t.course.updated}: 2024/05</span>
                    {settings.showStudentCount && <span>{t.course.student}: {course.studentsCount}</span>}
                </div>

                {isEnrolled && (
                    <div className="mt-6">
                        <div className="flex justify-between items-end text-sm mb-1 text-gray-300">
                            <div>
                                <span>{language === 'ar' ? 'تقدمك في الكورس' : 'Course Progress'}</span>
                                <span className="mx-2 font-bold text-secondary">{progressPercentage}%</span>
                            </div>
                            
                            {/* Certificate Button */}
                            {isCompleted && (
                                <button 
                                    onClick={generateCertificate}
                                    className="bg-secondary hover:bg-amber-600 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition animate-pulse shadow-lg shadow-amber-500/20"
                                >
                                    <Award className="w-5 h-5" />
                                    {language === 'ar' ? 'استخراج الشهادة' : 'Claim Certificate'}
                                </button>
                            )}
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2.5 mt-2 overflow-hidden">
                            <div className="bg-secondary h-2.5 rounded-full transition-all duration-1000 ease-out" style={{ width: `${progressPercentage}%` }}></div>
                        </div>
                    </div>
                )}

                {/* AI Summary Badge */}
                {aiSummary && (
                    <div className="mt-6 p-4 bg-white/10 rounded-lg border border-white/20 backdrop-blur-sm">
                        <h4 className="flex items-center gap-2 font-bold text-secondary mb-2">
                            <span className="animate-pulse">✨</span> {t.course.aiSummary}
                        </h4>
                        <p className="text-sm text-gray-200">{aiSummary}</p>
                    </div>
                )}
            </div>
            
            {/* Purchase Card */}
            <div className="md:w-1/3 relative">
                <div className="bg-white text-gray-800 rounded-xl shadow-2xl p-6 md:absolute md:top-0 md:left-4 w-full">
                    <img src={course.thumbnail} alt={course.title} className="w-full h-40 object-cover rounded-lg mb-4" />
                    
                    <div className="mb-4">
                        {course.discountPrice ? (
                            <div className="flex items-baseline gap-3">
                                <span className="text-3xl font-bold text-red-600">{course.discountPrice} {t.course.currency}</span>
                                <span className="text-lg text-gray-400 line-through">{course.price} {t.course.currency}</span>
                            </div>
                        ) : (
                            <div className="text-3xl font-bold text-gray-900">{course.price} {t.course.currency}</div>
                        )}
                    </div>
                    
                    {isEnrolled ? (
                        <button 
                            onClick={scrollToContent}
                            className="w-full bg-green-600 text-white font-bold py-3 rounded-lg hover:bg-green-700 transition mb-4"
                        >
                            {t.course.continueLearning}
                        </button>
                    ) : (
                        <div className="flex flex-col gap-3">
                            <button 
                                onClick={() => { addToCart(course); navigate('/checkout'); }}
                                className="w-full bg-primary text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition"
                            >
                                {t.course.addToCart}
                            </button>
                            <button 
                                onClick={handleBuyNow}
                                className="w-full border border-gray-300 font-bold py-3 rounded-lg hover:bg-gray-50 transition"
                            >
                                {t.course.buyNow}
                            </button>
                        </div>
                    )}
                    <div className="text-xs text-center text-gray-500 mt-4">{t.course.moneyBack}</div>
                </div>
            </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 mt-8 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
            
            {/* Content Player Area */}
            {activeLesson ? (
                <div className="bg-white p-6 rounded-xl shadow-lg mb-8 border border-gray-100 relative group-hover:block overflow-hidden">
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <PlayCircle className="text-primary" /> {activeLesson.title}
                    </h3>
                    
                    {/* Display Resources */}
                    <div className="space-y-6">
                        {activeLesson.resources && activeLesson.resources.length > 0 ? (
                            activeLesson.resources.map((res, idx) => (
                                <div key={idx} className="space-y-2">
                                    <h4 className="font-bold text-gray-700 text-sm">{res.title}</h4>
                                    {res.type === 'video' || res.type === 'upload' ? (
                                        <div className="relative aspect-video bg-black rounded-lg overflow-hidden group shadow-inner">
                                            {getVideoComponent(res.url, res.title)}
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg border border-gray-200">
                                            <div className="flex items-center gap-3">
                                                <FileText className="w-8 h-8 text-red-500" />
                                                <div>
                                                    <p className="font-medium text-gray-800">{res.title}</p>
                                                    <p className="text-xs text-gray-500">Downloadable Resource</p>
                                                </div>
                                            </div>
                                            <a href={res.url} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-primary hover:underline text-sm font-bold">
                                                <Download className="w-4 h-4" /> Download
                                            </a>
                                        </div>
                                    )}
                                </div>
                            ))
                        ) : (
                             /* Fallback for legacy contentUrl */
                             activeLesson.type === 'video' ? (
                                <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
                                     {getVideoComponent(activeLesson.contentUrl || "https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1", activeLesson.title)}
                                </div>
                             ) : (
                                <div className="text-center p-8 bg-gray-50 rounded-lg">
                                    <FileText className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                                    <p>Text/File Content</p>
                                    <a href={activeLesson.contentUrl} target="_blank" rel="noreferrer" className="text-primary underline">Open Resource</a>
                                </div>
                             )
                        )}
                    </div>

                    <div className="mt-6 pt-4 border-t border-gray-100 text-sm text-gray-500">
                        {activeLesson.description}
                    </div>
                </div>
            ) : (
                <div className="bg-white p-10 rounded-xl border border-gray-200 text-center mb-8">
                    <PlayCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">{language === 'ar' ? 'اختر درسًا لبدء المشاهدة' : 'Select a lesson to start watching'}</p>
                </div>
            )}

            {/* Curriculum */}
            <div id="course-content" className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-12">
                <h3 className="text-xl font-bold mb-6">{t.course.content}</h3>
                <div className="space-y-4">
                    {course.sections.length > 0 ? course.sections.map((section) => (
                        <div key={section.id} className="border border-gray-100 rounded-lg overflow-hidden">
                            <div className="bg-gray-50 p-4 font-bold text-gray-700 border-b border-gray-100">
                                {section.title}
                            </div>
                            <div>
                                {section.lessons.map(lesson => {
                                    const isCompleted = user?.completedLessons[course.id]?.includes(lesson.id);
                                    const resourceCount = lesson.resources?.length || 0;
                                    
                                    return (
                                        <div 
                                            key={lesson.id} 
                                            onClick={() => handleLessonPlay(lesson.id, lesson.isFree || false)}
                                            className={`flex items-center justify-between p-4 cursor-pointer hover:bg-blue-50 transition ${activeLessonId === lesson.id ? 'bg-blue-50 text-primary' : 'bg-white'}`}
                                        >
                                            <div className="flex items-center gap-3">
                                                {isEnrolled ? (
                                                     isCompleted ? <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" /> : <Circle className="w-5 h-5 text-gray-300 flex-shrink-0" />
                                                ) : (
                                                    lesson.type === 'video' ? <PlayCircle className="w-4 h-4" /> : <FileText className="w-4 h-4" />
                                                )}
                                                
                                                <div>
                                                    <span className="text-sm font-medium block">{lesson.title}</span>
                                                    <div className="flex gap-2 text-xs text-gray-400 mt-1">
                                                        {lesson.description && <span>{lesson.description}</span>}
                                                        {resourceCount > 1 && <span className="bg-blue-100 text-blue-600 px-1.5 rounded">{resourceCount} items</span>}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className="text-xs text-gray-400">{lesson.duration}</span>
                                                {isEnrolled || lesson.isFree ? (
                                                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                                ) : (
                                                    <Lock className="w-4 h-4 text-gray-300" />
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )) : (
                        <p className="text-gray-500">{t.course.noContent}</p>
                    )}
                </div>
            </div>

            {/* Reviews Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-12">
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                    {t.course.reviews}
                    <span className="text-sm bg-amber-100 text-amber-700 px-2 py-1 rounded-full">{course.rating} ★</span>
                </h3>
                
                {/* Review List */}
                <div className="space-y-6 mb-8">
                    {course.reviews.length > 0 ? course.reviews.map(review => (
                        <div key={review.id} className="border-b border-gray-100 last:border-0 pb-4">
                            <div className="flex justify-between items-start mb-2">
                                <div className="flex items-center gap-2">
                                    <div className="bg-gray-100 p-2 rounded-full">
                                        <UserIcon className="w-4 h-4 text-gray-500" />
                                    </div>
                                    <span className="font-bold text-sm">{review.userName}</span>
                                </div>
                                <span className="text-xs text-gray-400">{review.date}</span>
                            </div>
                            <div className="flex items-center mb-2">
                                {[...Array(5)].map((_, i) => (
                                    <Star key={i} className={`w-3 h-3 ${i < review.rating ? 'text-amber-400 fill-current' : 'text-gray-300'}`} />
                                ))}
                            </div>
                            <p className="text-gray-600 text-sm">{review.comment}</p>
                        </div>
                    )) : (
                        <p className="text-gray-500 italic text-sm">No reviews yet.</p>
                    )}
                </div>

                {/* Add Review Form */}
                {isEnrolled && (
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                        <h4 className="font-bold text-sm mb-3">{t.course.addReview}</h4>
                        <form onSubmit={handleSubmitReview}>
                            <div className="flex items-center gap-1 mb-3">
                                <span className="text-xs text-gray-500 ml-2">{t.course.rating}:</span>
                                {[1, 2, 3, 4, 5].map(star => (
                                    <Star 
                                        key={star} 
                                        className={`w-5 h-5 cursor-pointer transition ${star <= reviewRating ? 'text-amber-400 fill-current' : 'text-gray-300'}`}
                                        onClick={() => setReviewRating(star)}
                                    />
                                ))}
                            </div>
                            <textarea 
                                value={reviewComment}
                                onChange={e => setReviewComment(e.target.value)}
                                className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary mb-3 bg-white"
                                placeholder={t.course.commentPlaceholder}
                                rows={3}
                                required
                            ></textarea>
                            <button type="submit" className="bg-primary text-white text-sm font-bold py-2 px-4 rounded-lg hover:bg-blue-700 transition">
                                {t.course.submitReview}
                            </button>
                        </form>
                    </div>
                )}
            </div>

            {/* Recommended Courses */}
            {recommendedCourses.length > 0 && (
                <div className="mb-12">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-4">{t.course.recommended}</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {recommendedCourses.map(rc => (
                            <CourseCard key={rc.id} course={rc} />
                        ))}
                    </div>
                </div>
            )}
        </div>
      </div>

      {/* AI Chat */}
      <div className="fixed bottom-6 right-6 z-40">
        {!aiChatOpen && (
            <button 
                onClick={() => setAiChatOpen(true)}
                className="bg-secondary text-white p-4 rounded-full shadow-lg hover:bg-amber-600 transition flex items-center gap-2 animate-bounce"
            >
                <MessageSquare className="w-6 h-6" />
                <span className="font-bold">{t.course.aiChat}</span>
            </button>
        )}

        {aiChatOpen && (
            <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-80 md:w-96 flex flex-col h-[500px]">
                <div className="bg-secondary text-white p-4 rounded-t-2xl flex justify-between items-center">
                    <h3 className="font-bold">{language === 'ar' ? 'المساعد الذكي 🤖' : 'AI Assistant 🤖'}</h3>
                    <button onClick={() => setAiChatOpen(false)} className="text-white hover:text-gray-200 bg-white/20 hover:bg-white/30 rounded-full p-1 transition">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
                    <div className="bg-white p-3 rounded-lg rounded-tl-none shadow-sm text-sm border border-gray-100">
                        {language === 'ar' ? 'مرحباً! كيف يمكنني مساعدتك في فهم هذا الكورس؟' : 'Hello! How can I help you understand this course?'}
                    </div>
                    {chatHistory.map((msg, idx) => (
                        <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-start' : 'justify-end'}`}>
                            <div className={`p-3 rounded-lg max-w-[85%] text-sm shadow-sm ${msg.role === 'user' ? 'bg-primary text-white rounded-tr-none' : 'bg-white text-gray-800 rounded-tl-none border border-gray-100'}`}>
                                {msg.text}
                            </div>
                        </div>
                    ))}
                    {loadingAi && <div className="text-center text-xs text-gray-400">{language === 'ar' ? 'جاري التفكير...' : 'Thinking...'}</div>}
                </div>

                <div className="p-3 bg-white border-t border-gray-100 rounded-b-2xl">
                    <div className="flex gap-2">
                        <input 
                            type="text" 
                            value={chatInput}
                            onChange={(e) => setChatInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleAskAi()}
                            placeholder={language === 'ar' ? 'اكتب سؤالك هنا...' : 'Type your question...'}
                            className="flex-1 border border-gray-300 rounded-full px-4 py-2 text-sm focus:outline-none focus:border-secondary bg-white"
                        />
                        <button onClick={handleAskAi} disabled={loadingAi} className="bg-secondary text-white p-2 rounded-full hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed">
                            <Send className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};
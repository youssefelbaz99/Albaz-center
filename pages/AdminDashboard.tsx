import React, { useState, useEffect, useMemo } from 'react';
import { useStore } from '../context/StoreContext';
import { Plus, Trash, Save, Layout, Edit, X, Users, Settings, TicketPercent, Lock, BookOpen, LogIn, Search, Phone, Upload, Palette, ArrowLeft, ArrowRight, CheckCircle, Smartphone, CreditCard, Store, Home, PlusCircle, ArrowUp, ArrowDown, Megaphone, Send, Bell, FileVideo, Link as LinkIcon, Loader, Filter, Download } from 'lucide-react';
import { Course, Section, Lesson, Coupon, UserRole, PaymentMethodConfig, LessonResource, SiteTheme } from '../types';
import { useNavigate } from 'react-router-dom';

// --- INTERNAL COMPONENT: COURSE EDITOR (Isolated for Performance) ---
const CourseEditor: React.FC<{ 
    courseId: string | null; 
    onCancel: () => void; 
    onSave: () => void; 
}> = ({ courseId, onCancel, onSave }) => {
    const { courses, addCourse, updateCourse, language, t } = useStore();
    
    // Local State for Form (Prevents Dashboard Re-renders)
    const [title, setTitle] = useState('');
    const [desc, setDesc] = useState('');
    const [price, setPrice] = useState(0);
    const [discountPrice, setDiscountPrice] = useState(0);
    const [thumbnail, setThumbnail] = useState('');
    const [category, setCategory] = useState('برمجة');
    const [instructor, setInstructor] = useState('Admin');
    const [studentsCount, setStudentsCount] = useState(0);
    const [sections, setSections] = useState<Section[]>([]);
    
    // Upload State Tracking: Map of ResourceID -> Progress %
    const [uploadProgressMap, setUploadProgressMap] = useState<Record<string, number>>({});

    // Load Data if Editing
    useEffect(() => {
        if (courseId) {
            const course = courses.find(c => c.id === courseId);
            if (course) {
                setTitle(course.title);
                setDesc(course.description);
                setPrice(course.price);
                setDiscountPrice(course.discountPrice || 0);
                setThumbnail(course.thumbnail);
                setCategory(course.category);
                setInstructor(course.instructor);
                setStudentsCount(course.studentsCount);
                setSections(course.sections);
            }
        }
    }, [courseId, courses]);

    // Handlers
    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setThumbnail(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>, sectionId: string, lessonId: string, resourceId: string) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Initialize progress
        setUploadProgressMap(prev => ({ ...prev, [resourceId]: 0 }));

        // Simulate Upload Process
        let progress = 0;
        const interval = setInterval(() => {
            progress += Math.floor(Math.random() * 10) + 5;
            if (progress >= 100) {
                progress = 100;
                clearInterval(interval);
                
                // On Complete: Create a fake URL for the uploaded file
                const fakeUrl = URL.createObjectURL(file);
                updateResource(sectionId, lessonId, resourceId, 'url', fakeUrl);
                
                // Clear progress after a delay
                setTimeout(() => {
                    setUploadProgressMap(prev => {
                        const newMap = { ...prev };
                        delete newMap[resourceId];
                        return newMap;
                    });
                }, 1000);
            }
            setUploadProgressMap(prev => ({ ...prev, [resourceId]: progress }));
        }, 300);
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        const courseData: Course = {
            id: courseId || Math.random().toString(36).substr(2, 9),
            title,
            description: desc,
            price: Number(price),
            discountPrice: Number(discountPrice) > 0 ? Number(discountPrice) : undefined,
            thumbnail: thumbnail || `https://picsum.photos/seed/${Math.random()}/800/450`,
            category,
            instructor,
            studentsCount: Number(studentsCount),
            sections,
            rating: courseId ? (courses.find(c => c.id === courseId)?.rating || 0) : 0,
            reviews: courseId ? (courses.find(c => c.id === courseId)?.reviews || []) : []
        };

        if (courseId) {
            updateCourse(courseData);
        } else {
            addCourse(courseData);
        }
        onSave();
    };

    // Section/Lesson Helpers
    const addSection = () => setSections([...sections, { id: Math.random().toString(36).substr(2, 9), title: language === 'ar' ? 'قسم جديد' : 'New Section', lessons: [] }]);
    const updateSectionTitle = (id: string, val: string) => setSections(sections.map(s => s.id === id ? { ...s, title: val } : s));
    const deleteSection = (id: string) => setSections(sections.filter(s => s.id !== id));
    
    const addLesson = (secId: string) => setSections(sections.map(s => s.id === secId ? { ...s, lessons: [...s.lessons, { id: Math.random().toString(36).substr(2, 9), title: language === 'ar' ? 'درس جديد' : 'New Lesson', type: 'video', duration: '10:00', description: '', contentUrl: '', resources: [] }] } : s));
    const deleteLesson = (secId: string, lId: string) => setSections(sections.map(s => s.id === secId ? { ...s, lessons: s.lessons.filter(l => l.id !== lId) } : s));
    const updateLesson = (secId: string, lId: string, field: keyof Lesson, val: any) => setSections(sections.map(s => s.id === secId ? { ...s, lessons: s.lessons.map(l => l.id === lId ? { ...l, [field]: val } : l) } : s));

    // Resource Logic
    const addResource = (secId: string, lId: string) => {
        setSections(sections.map(s => s.id === secId ? { 
            ...s, lessons: s.lessons.map(l => l.id === lId ? { 
                ...l, resources: [...(l.resources || []), { id: Math.random().toString(36).substr(2, 9), title: 'New Resource', url: '', type: 'video' }] 
            } : l) 
        } : s));
    };

    const updateResource = (secId: string, lId: string, rId: string, field: keyof LessonResource, val: any) => {
        setSections(sections.map(s => s.id === secId ? { 
            ...s, lessons: s.lessons.map(l => l.id === lId ? { 
                ...l, resources: (l.resources || []).map(r => r.id === rId ? { ...r, [field]: val } : r) 
            } : l) 
        } : s));
    };
    
    const removeResource = (secId: string, lId: string, rId: string) => {
        setSections(sections.map(s => s.id === secId ? { 
            ...s, lessons: s.lessons.map(l => l.id === lId ? { 
                ...l, resources: (l.resources || []).filter(r => r.id !== rId) 
            } : l) 
        } : s));
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-fade-in">
            <div className="flex justify-between items-center mb-6 border-b pb-4">
                <h2 className="text-xl font-bold flex items-center gap-2">
                    <Edit className="w-5 h-5 text-primary" />
                    {courseId ? t.admin.editCourse : t.admin.newCourse}
                </h2>
                {/* Important: type="button" prevents form submission */}
                <button type="button" onClick={onCancel} className="text-gray-400 hover:text-gray-600">
                    <X className="w-6 h-6" />
                </button>
            </div>

            <form onSubmit={handleSave} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">{t.admin.courseTitle}</label>
                            <input required type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full border rounded-lg p-2.5 bg-white" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">{t.admin.courseDesc}</label>
                            <textarea required rows={3} value={desc} onChange={e => setDesc(e.target.value)} className="w-full border rounded-lg p-2.5 bg-white" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">{t.admin.price}</label>
                                <input required type="number" value={price} onChange={e => setPrice(Number(e.target.value))} className="w-full border rounded-lg p-2.5 bg-white" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">{t.admin.discountPrice}</label>
                                <input type="number" value={discountPrice} onChange={e => setDiscountPrice(Number(e.target.value))} className="w-full border rounded-lg p-2.5 bg-white" />
                            </div>
                        </div>
                         <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Category</label>
                            <select value={category} onChange={e => setCategory(e.target.value)} className="w-full border rounded-lg p-2.5 bg-white">
                                <option value="برمجة">Programming</option>
                                <option value="تصميم">Design</option>
                                <option value="تسويق">Marketing</option>
                                <option value="بيزنس">Business</option>
                            </select>
                        </div>
                    </div>
                    
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">{t.admin.thumbnail}</label>
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:bg-gray-50 transition cursor-pointer relative bg-white">
                                <input type="file" accept="image/*" onChange={handleImageUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                                {thumbnail ? (
                                    <img src={thumbnail} alt="Preview" className="h-32 mx-auto object-cover rounded" />
                                ) : (
                                    <div className="py-8 text-gray-400">
                                        <Upload className="w-8 h-8 mx-auto mb-2" />
                                        <span>Click to upload image</span>
                                    </div>
                                )}
                            </div>
                        </div>
                         <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">{t.course.instructor}</label>
                            <input type="text" value={instructor} onChange={e => setInstructor(e.target.value)} className="w-full border rounded-lg p-2.5 bg-white" />
                        </div>
                    </div>
                </div>

                <div className="border-t pt-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold">{t.course.content}</h3>
                        {/* Explicit type="button" */}
                        <button type="button" onClick={addSection} className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg text-sm font-bold flex items-center gap-1">
                            <Plus className="w-4 h-4" /> Add Section
                        </button>
                    </div>
                    
                    <div className="space-y-4">
                        {sections.map((section, sIdx) => (
                            <div key={section.id} className="border border-gray-200 rounded-lg overflow-hidden bg-gray-50/50">
                                <div className="bg-gray-100 p-3 flex items-center gap-3">
                                    <span className="font-mono text-xs text-gray-500">#{sIdx + 1}</span>
                                    <input 
                                        type="text" 
                                        value={section.title} 
                                        onChange={e => updateSectionTitle(section.id, e.target.value)} 
                                        className="bg-white border border-gray-300 rounded px-2 py-1 font-bold text-gray-700 focus:outline-none flex-1"
                                        placeholder="Section Title"
                                    />
                                    {/* Action buttons inside form must have type="button" */}
                                    <button type="button" onClick={() => addLesson(section.id)} className="text-blue-600 hover:bg-blue-100 p-1 rounded" title="Add Lesson"><Plus className="w-4 h-4" /></button>
                                    <button type="button" onClick={() => deleteSection(section.id)} className="text-red-500 hover:bg-red-100 p-1 rounded" title="Delete Section"><Trash className="w-4 h-4" /></button>
                                </div>
                                <div className="p-3 space-y-2">
                                    {section.lessons.map((lesson, lIdx) => (
                                        <div key={lesson.id} className="bg-white border border-gray-200 rounded p-4 shadow-sm">
                                            <div className="flex items-center gap-2 mb-2">
                                                <div className="bg-blue-100 p-1 rounded text-primary"><BookOpen className="w-4 h-4" /></div>
                                                <input 
                                                    type="text" 
                                                    value={lesson.title} 
                                                    onChange={e => updateLesson(section.id, lesson.id, 'title', e.target.value)}
                                                    className="font-medium text-sm border border-gray-300 rounded px-2 py-1 focus:border-primary focus:outline-none flex-1 bg-white"
                                                    placeholder="Lesson Title"
                                                />
                                                <input 
                                                    type="text" 
                                                    value={lesson.duration || ''} 
                                                    onChange={e => updateLesson(section.id, lesson.id, 'duration', e.target.value)}
                                                    className="w-20 text-xs border rounded p-1 text-center bg-white"
                                                    placeholder="MM:SS"
                                                />
                                                <button type="button" onClick={() => deleteLesson(section.id, lesson.id)} className="text-red-400 hover:text-red-600"><Trash className="w-4 h-4" /></button>
                                            </div>
                                            
                                            {/* Resources Management */}
                                            <div className="pl-4 border-l-2 border-gray-100 mt-3 space-y-3">
                                                <h5 className="text-xs font-bold text-gray-500 uppercase">Lesson Resources (Videos/Files)</h5>
                                                {(lesson.resources || []).map((res) => (
                                                    <div key={res.id} className="bg-gray-50 p-3 rounded border border-gray-200">
                                                        <div className="flex flex-wrap items-center gap-2 text-xs mb-2">
                                                            <select 
                                                                value={res.type} 
                                                                onChange={e => updateResource(section.id, lesson.id, res.id, 'type', e.target.value)}
                                                                className="border rounded p-1.5 bg-white font-medium"
                                                            >
                                                                <option value="video">🎥 Video Link</option>
                                                                <option value="upload">☁️ Upload Video</option>
                                                                <option value="file">📄 File</option>
                                                            </select>
                                                            
                                                            <input 
                                                                type="text" 
                                                                value={res.title} 
                                                                onChange={e => updateResource(section.id, lesson.id, res.id, 'title', e.target.value)}
                                                                className="border rounded p-1.5 flex-1 bg-white"
                                                                placeholder="Resource Title"
                                                            />
                                                            
                                                            <button type="button" onClick={() => removeResource(section.id, lesson.id, res.id)} className="text-red-500 hover:bg-red-100 p-1 rounded"><Trash className="w-3 h-3"/></button>
                                                        </div>

                                                        {/* Resource Input Area */}
                                                        <div className="flex items-center gap-2">
                                                            {res.type === 'upload' ? (
                                                                <div className="flex-1">
                                                                    {uploadProgressMap[res.id] !== undefined ? (
                                                                         <div className="w-full">
                                                                             <div className="flex justify-between text-[10px] text-gray-600 mb-1">
                                                                                 <span>Uploading...</span>
                                                                                 <span>{uploadProgressMap[res.id]}%</span>
                                                                             </div>
                                                                             <div className="w-full bg-gray-200 rounded-full h-2">
                                                                                 <div 
                                                                                    className="bg-green-500 h-2 rounded-full transition-all duration-300" 
                                                                                    style={{ width: `${uploadProgressMap[res.id]}%` }}
                                                                                 ></div>
                                                                             </div>
                                                                         </div>
                                                                    ) : (
                                                                        <div className="flex gap-2 items-center">
                                                                             <label className="flex-1 cursor-pointer border border-dashed border-gray-400 rounded p-2 text-center hover:bg-gray-100 bg-white">
                                                                                <input 
                                                                                    type="file" 
                                                                                    accept="video/*" 
                                                                                    className="hidden" 
                                                                                    onChange={(e) => handleVideoUpload(e, section.id, lesson.id, res.id)}
                                                                                />
                                                                                <div className="flex items-center justify-center gap-2 text-gray-500">
                                                                                    <Upload className="w-4 h-4" />
                                                                                    <span>Select Video File</span>
                                                                                </div>
                                                                            </label>
                                                                            {res.url && <span className="text-green-600 text-xs font-bold flex items-center gap-1"><CheckCircle className="w-3 h-3"/> Uploaded</span>}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            ) : (
                                                                <div className="flex-1 relative">
                                                                     <LinkIcon className="w-3 h-3 text-gray-400 absolute left-2 top-2.5 rtl:right-2 rtl:left-auto" />
                                                                     <input 
                                                                        type="text" 
                                                                        value={res.url} 
                                                                        onChange={e => updateResource(section.id, lesson.id, res.id, 'url', e.target.value)}
                                                                        className="border rounded p-1.5 w-full pl-7 rtl:pr-7 rtl:pl-2 bg-white"
                                                                        placeholder={res.type === 'video' ? "Paste YouTube Link..." : "Paste File URL..."}
                                                                    />
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                                <button type="button" onClick={() => addResource(section.id, lesson.id)} className="text-xs text-primary flex items-center gap-1 hover:underline mt-2">
                                                    <PlusCircle className="w-3 h-3" /> Add Resource
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                    {section.lessons.length === 0 && <p className="text-xs text-gray-400 text-center py-2">No lessons in this section.</p>}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t">
                    <button type="button" onClick={onCancel} className="px-6 py-2 border rounded-lg font-bold text-gray-600 hover:bg-gray-50">{t.admin.delete}</button>
                    {/* Submit button */}
                    <button type="submit" className="px-6 py-2 bg-primary text-white rounded-lg font-bold hover:bg-blue-700 flex items-center gap-2">
                        <Save className="w-4 h-4" /> {t.admin.save}
                    </button>
                </div>
            </form>
        </div>
    );
};

// --- MAIN DASHBOARD COMPONENT ---
export const AdminDashboard: React.FC = () => {
  const { courses, deleteCourse, settings, updateSettings, coupons, addCoupon, deleteCoupon, t, language, allUsers, adminUpdateUser, adminManageEnrollment, deleteUser, bulkDeleteUsers, loginAsUser, sendNotification, notifications, removeNotification, exportUsers } = useStore();
  const navigate = useNavigate();

  // Navigation State
  const [activeTab, setActiveTab] = useState<'courses' | 'users' | 'settings' | 'coupons' | 'broadcast'>('courses');
  
  // Editor State
  const [editingCourseId, setEditingCourseId] = useState<string | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);

  // User Management Local State
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState<'all' | UserRole | 'has_courses' | 'no_courses'>('all');
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [managingEnrollmentUserId, setManagingEnrollmentUserId] = useState<string | null>(null);
  const [enrollmentSearch, setEnrollmentSearch] = useState(''); // New search filter for enrollment modal
  
  // Coupon Management State
  const [couponForm, setCouponForm] = useState({
      code: '',
      discountPercent: 10,
      expiryDate: '',
      specificCourseId: ''
  });

  // User Sorting & Selection State
  const [sortConfig, setSortConfig] = useState<{ key: 'joinedDate' | 'lastLogin' | 'courseCount' | 'name', direction: 'asc' | 'desc' } | null>(null);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);

  // Broadcast State
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastMessage, setBroadcastMessage] = useState('');

  // Edit User Form State
  const [editUserForm, setEditUserForm] = useState({ name: '', email: '', phone: '', password: '' });

  // Settings Local State
  const [localSettings, setLocalSettings] = useState(settings);

  // Sync settings when they change from store (initial load)
  useEffect(() => {
      setLocalSettings(settings);
  }, [settings]);

  // --- ACTIONS ---

  const handleEditCourse = (id: string) => {
      setEditingCourseId(id);
      setIsEditorOpen(true);
  };

  const handleCreateCourse = () => {
      setEditingCourseId(null);
      setIsEditorOpen(true);
  };

  const handleCloseEditor = () => {
      setIsEditorOpen(false);
      setEditingCourseId(null);
  };

  const handleEditUser = (user: any) => {
      setEditingUser(user);
      setEditUserForm({ name: user.name, email: user.email, phone: user.phone || '', password: user.password || '' });
  };

  const saveUserChanges = (e: React.FormEvent) => {
      e.preventDefault();
      if (editingUser) {
          adminUpdateUser(editingUser.id, editUserForm);
          setEditingUser(null);
          alert(t.admin.userDataUpdated);
      }
  };

  const handleEnrollmentToggle = (userId: string, courseId: string, isEnrolled: boolean) => {
      adminManageEnrollment(userId, courseId, isEnrolled ? 'unenroll' : 'enroll');
  };

  // Sorting Logic
  const handleSort = (key: typeof sortConfig.key) => {
      let direction: 'asc' | 'desc' = 'asc';
      if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
          direction = 'desc';
      }
      setSortConfig({ key, direction });
  };

  // Selection Logic
  const handleSelectUser = (userId: string) => {
      setSelectedUserIds(prev => 
          prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
      );
  };

  const handleSelectAll = (filtered: any[]) => {
      if (selectedUserIds.length === filtered.length) {
          setSelectedUserIds([]);
      } else {
          setSelectedUserIds(filtered.map(u => u.id));
      }
  };

  const handleBulkDelete = () => {
      if (window.confirm(`Are you sure you want to delete ${selectedUserIds.length} users?`)) {
          bulkDeleteUsers(selectedUserIds);
          setSelectedUserIds([]);
      }
  };

  const handleAddCoupon = (e: React.FormEvent) => {
      e.preventDefault();
      if(!couponForm.code || !couponForm.expiryDate) return;
      
      addCoupon({
          id: Math.random().toString(36).substr(2, 9),
          code: couponForm.code.toUpperCase(),
          discountPercent: couponForm.discountPercent,
          expiryDate: couponForm.expiryDate,
          specificCourseId: couponForm.specificCourseId || undefined
      });
      
      setCouponForm({ code: '', discountPercent: 10, expiryDate: '', specificCourseId: '' });
      alert(t.admin.couponCreated);
  };

  const handleAddHeroImage = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          const reader = new FileReader();
          reader.onloadend = () => {
              setLocalSettings(prev => ({
                  ...prev,
                  heroImageUrls: [...prev.heroImageUrls, reader.result as string]
              }));
          };
          reader.readAsDataURL(file);
      }
  };

  const handleRemoveHeroImage = (indexToRemove: number) => {
      setLocalSettings(prev => ({
          ...prev,
          heroImageUrls: prev.heroImageUrls.filter((_, index) => index !== indexToRemove)
      }));
  };

  const filteredUsers = useMemo(() => {
      let result = allUsers.filter(u => {
        const matchesSearch = u.name.toLowerCase().includes(userSearch.toLowerCase()) || 
                              u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
                              (u.phone && u.phone.includes(userSearch));
        
        let matchesRole = true;
        if (userRoleFilter === 'has_courses') {
            matchesRole = u.purchasedCourses.length > 0;
        } else if (userRoleFilter === 'no_courses') {
            matchesRole = u.purchasedCourses.length === 0;
        } else if (userRoleFilter !== 'all') {
            matchesRole = u.role === userRoleFilter;
        }

        return matchesSearch && matchesRole;
      });

      if (sortConfig) {
          result.sort((a, b) => {
              let aValue: any = '';
              let bValue: any = '';

              if (sortConfig.key === 'courseCount') {
                  aValue = a.purchasedCourses.length;
                  bValue = b.purchasedCourses.length;
              } else if (sortConfig.key === 'joinedDate') {
                  aValue = new Date(a.joinedDate || 0).getTime();
                  bValue = new Date(b.joinedDate || 0).getTime();
              } else if (sortConfig.key === 'lastLogin') {
                  aValue = new Date(a.lastLogin || 0).getTime();
                  bValue = new Date(b.lastLogin || 0).getTime();
              } else {
                  aValue = a.name.toLowerCase();
                  bValue = b.name.toLowerCase();
              }

              if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
              if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
              return 0;
          });
      }
      return result;
  }, [allUsers, userSearch, sortConfig, userRoleFilter]);

  const filteredEnrollmentCourses = useMemo(() => {
      return courses.filter(c => c.title.toLowerCase().includes(enrollmentSearch.toLowerCase()));
  }, [courses, enrollmentSearch]);

  const handleSendBroadcast = (e: React.FormEvent) => {
      e.preventDefault();
      if (!broadcastTitle || !broadcastMessage) return;
      sendNotification(broadcastTitle, broadcastMessage, 'info');
      setBroadcastTitle('');
      setBroadcastMessage('');
      alert('Notification Sent!');
  };

  // --- RENDER HELPERS ---

  const renderSidebar = () => (
      <div className="w-20 md:w-64 bg-white border-r border-gray-200 flex flex-col fixed h-full z-10 transition-all duration-300">
          <div className="h-16 flex items-center justify-center md:justify-start md:px-6 border-b border-gray-100">
              <Layout className="w-8 h-8 text-primary" />
              <span className="hidden md:block font-bold text-xl ml-2 text-gray-800">Admin</span>
          </div>
          <nav className="flex-1 py-6 space-y-2 px-2">
              <NavItem icon={<BookOpen />} label={t.admin.viewCourses} active={activeTab === 'courses'} onClick={() => { setActiveTab('courses'); setIsEditorOpen(false); }} />
              <NavItem icon={<Users />} label={t.admin.users} active={activeTab === 'users'} onClick={() => setActiveTab('users')} />
              <NavItem icon={<TicketPercent />} label={t.admin.coupons} active={activeTab === 'coupons'} onClick={() => setActiveTab('coupons')} />
              <NavItem icon={<Megaphone />} label={t.admin.broadcast} active={activeTab === 'broadcast'} onClick={() => setActiveTab('broadcast')} />
              <NavItem icon={<Settings />} label={t.admin.settings} active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} />
          </nav>
          <div className="p-4 border-t border-gray-100">
               <button onClick={() => navigate('/')} className="flex items-center gap-2 text-gray-500 hover:text-primary w-full justify-center md:justify-start">
                   <Home className="w-5 h-5" />
                   <span className="hidden md:block text-sm font-bold">{t.cartPage.backHome}</span>
               </button>
          </div>
      </div>
  );

  const NavItem = ({ icon, label, active, onClick }: any) => (
      <button 
        onClick={onClick}
        className={`w-full flex items-center justify-center md:justify-start gap-3 px-4 py-3 rounded-lg transition-colors ${active ? 'bg-blue-50 text-primary font-bold' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'}`}
      >
          {React.cloneElement(icon, { className: "w-5 h-5" })}
          <span className="hidden md:block">{label}</span>
      </button>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex" dir={language === 'ar' ? 'rtl' : 'ltr'}>
        {renderSidebar()}
        
        {/* Main Content Area */}
        <div className={`flex-1 transition-all duration-300 ${language === 'ar' ? 'mr-20 md:mr-64' : 'ml-20 md:ml-64'}`}>
            <div className="p-8 max-w-6xl mx-auto">
                
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800 mb-1">{t.admin.title}</h1>
                        <p className="text-gray-500 text-sm">Welcome back, Admin</p>
                    </div>
                    {activeTab === 'courses' && !isEditorOpen && (
                        <button onClick={handleCreateCourse} className="bg-primary text-white px-4 py-2 rounded-lg font-bold shadow-lg hover:bg-blue-700 flex items-center gap-2 transition transform hover:-translate-y-1">
                            <Plus className="w-5 h-5" /> {t.admin.addCourse}
                        </button>
                    )}
                </div>

                {/* CONTENT: COURSES */}
                {activeTab === 'courses' && (
                    isEditorOpen ? (
                        <CourseEditor courseId={editingCourseId} onCancel={handleCloseEditor} onSave={handleCloseEditor} />
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
                            {courses.map(course => (
                                <div key={course.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden group hover:shadow-md transition">
                                    <div className="relative h-40">
                                        <img src={course.thumbnail} alt="" className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
                                            <button onClick={() => handleEditCourse(course.id)} className="bg-white p-2 rounded-full text-gray-800 hover:text-primary"><Edit className="w-5 h-5"/></button>
                                            <button onClick={() => { if(window.confirm('Delete?')) deleteCourse(course.id) }} className="bg-white p-2 rounded-full text-gray-800 hover:text-red-500"><Trash className="w-5 h-5"/></button>
                                        </div>
                                    </div>
                                    <div className="p-4">
                                        <h3 className="font-bold text-gray-800 mb-1 line-clamp-1">{course.title}</h3>
                                        <div className="flex justify-between items-center text-sm text-gray-500">
                                            <span>{course.price} {t.course.currency}</span>
                                            <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {course.studentsCount}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            <button onClick={handleCreateCourse} className="border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center h-full min-h-[250px] text-gray-400 hover:border-primary hover:text-primary hover:bg-blue-50 transition gap-2 bg-white">
                                <PlusCircle className="w-10 h-10" />
                                <span className="font-bold">{t.admin.addCourse}</span>
                            </button>
                        </div>
                    )
                )}

                {/* CONTENT: USERS */}
                {activeTab === 'users' && (
                     <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden animate-fade-in">
                        <div className="p-4 border-b border-gray-100 bg-gray-50 flex flex-col md:flex-row gap-4 justify-between items-center">
                            {/* Search and Filters Container */}
                            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                                <div className="flex items-center gap-2 bg-gray-100 px-3 py-2 rounded-lg border border-gray-200 w-full sm:w-64">
                                    <Search className="w-5 h-5 text-gray-400" />
                                    <input 
                                        type="text" 
                                        placeholder={t.admin.searchUser} 
                                        value={userSearch} 
                                        onChange={e => setUserSearch(e.target.value)} 
                                        className="bg-white outline-none flex-1 text-sm p-1 rounded"
                                    />
                                </div>
                                
                                <div className="relative">
                                    <select 
                                        value={userRoleFilter} 
                                        onChange={(e) => setUserRoleFilter(e.target.value as any)}
                                        className="appearance-none bg-gray-100 border border-gray-200 text-gray-700 py-2 pl-3 pr-8 rounded-lg leading-tight focus:outline-none focus:bg-white text-sm h-full"
                                    >
                                        <option value="all">All Roles</option>
                                        <option value={UserRole.ADMIN}>Admins</option>
                                        <option value={UserRole.STUDENT}>Students</option>
                                        <option value="has_courses">Has Purchased Courses</option>
                                        <option value="no_courses">No Purchases</option>
                                    </select>
                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 rtl:left-0 rtl:right-auto">
                                        <Filter className="w-4 h-4" />
                                    </div>
                                </div>
                            </div>
                            
                            {/* Bulk Actions Bar */}
                            <div className="flex items-center gap-4 animate-fade-in">
                                {selectedUserIds.length > 0 && (
                                    <>
                                        <span className="text-sm text-gray-500 font-bold">{selectedUserIds.length} Selected</span>
                                        <button onClick={handleBulkDelete} className="bg-red-50 text-red-600 px-3 py-2 rounded-lg text-sm font-bold hover:bg-red-100 flex items-center gap-1">
                                            <Trash className="w-4 h-4" /> Delete Selected
                                        </button>
                                    </>
                                )}
                                <button onClick={exportUsers} className="bg-green-50 text-green-700 px-3 py-2 rounded-lg text-sm font-bold hover:bg-green-100 flex items-center gap-1 border border-green-200">
                                    <Download className="w-4 h-4" /> Export Users
                                </button>
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left rtl:text-right">
                                <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                                    <tr>
                                        <th className="p-4 w-10">
                                            <input 
                                                type="checkbox" 
                                                onChange={() => handleSelectAll(filteredUsers)} 
                                                checked={filteredUsers.length > 0 && selectedUserIds.length === filteredUsers.length}
                                            />
                                        </th>
                                        <th className="p-4 cursor-pointer hover:text-gray-700" onClick={() => handleSort('name')}>
                                            <div className="flex items-center gap-1">
                                                {t.loginPage.name}
                                                {sortConfig?.key === 'name' && (sortConfig.direction === 'asc' ? <ArrowUp className="w-3 h-3"/> : <ArrowDown className="w-3 h-3"/>)}
                                            </div>
                                        </th>
                                        <th className="p-4 cursor-pointer hover:text-gray-700" onClick={() => handleSort('joinedDate')}>
                                            <div className="flex items-center gap-1">
                                                {t.admin.joinedDate}
                                                {sortConfig?.key === 'joinedDate' && (sortConfig.direction === 'asc' ? <ArrowUp className="w-3 h-3"/> : <ArrowDown className="w-3 h-3"/>)}
                                            </div>
                                        </th>
                                        <th className="p-4 cursor-pointer hover:text-gray-700" onClick={() => handleSort('lastLogin')}>
                                             <div className="flex items-center gap-1">
                                                {t.admin.lastLogin}
                                                {sortConfig?.key === 'lastLogin' && (sortConfig.direction === 'asc' ? <ArrowUp className="w-3 h-3"/> : <ArrowDown className="w-3 h-3"/>)}
                                            </div>
                                        </th>
                                        <th className="p-4 cursor-pointer hover:text-gray-700" onClick={() => handleSort('courseCount')}>
                                             <div className="flex items-center gap-1">
                                                {t.admin.joinedCourses}
                                                {sortConfig?.key === 'courseCount' && (sortConfig.direction === 'asc' ? <ArrowUp className="w-3 h-3"/> : <ArrowDown className="w-3 h-3"/>)}
                                            </div>
                                        </th>
                                        <th className="p-4 text-center">{t.admin.actions}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {filteredUsers.map(u => (
                                        <tr key={u.id} className={`hover:bg-gray-50 ${selectedUserIds.includes(u.id) ? 'bg-blue-50' : ''}`}>
                                            <td className="p-4">
                                                <input 
                                                    type="checkbox" 
                                                    checked={selectedUserIds.includes(u.id)} 
                                                    onChange={() => handleSelectUser(u.id)}
                                                    disabled={u.role === UserRole.ADMIN}
                                                />
                                            </td>
                                            <td className="p-4">
                                                <div className="font-bold text-gray-800 flex items-center gap-2">
                                                    <div className="w-8 h-8 rounded-full bg-blue-100 text-primary flex items-center justify-center text-xs">{u.name.charAt(0).toUpperCase()}</div>
                                                    <div>
                                                        <div>{u.name}</div>
                                                        <div className="text-xs text-gray-400 font-normal">{u.email}</div>
                                                    </div>
                                                    {u.role === UserRole.ADMIN && <span className="bg-purple-100 text-purple-600 text-[10px] px-1.5 py-0.5 rounded border border-purple-200">ADMIN</span>}
                                                </div>
                                            </td>
                                            <td className="p-4 text-xs text-gray-500">
                                                {u.joinedDate ? new Date(u.joinedDate).toLocaleDateString() : '-'}
                                            </td>
                                            <td className="p-4 text-xs text-gray-500">
                                                {u.lastLogin ? new Date(u.lastLogin).toLocaleString() : '-'}
                                            </td>
                                            <td className="p-4">
                                                <span className={`px-2 py-1 rounded text-xs font-bold ${u.purchasedCourses.length > 0 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                                    {u.purchasedCourses.length}
                                                </span>
                                            </td>
                                            <td className="p-4 flex justify-center gap-2">
                                                <button onClick={() => loginAsUser(u.id)} className="p-2 text-blue-500 hover:bg-blue-50 rounded" title={t.admin.loginAs}><LogIn className="w-4 h-4"/></button>
                                                <button onClick={() => setManagingEnrollmentUserId(u.id)} className="p-2 text-green-600 hover:bg-green-50 rounded" title={t.admin.manageCourses}><BookOpen className="w-4 h-4"/></button>
                                                <button onClick={() => handleEditUser(u)} className="p-2 text-gray-600 hover:bg-gray-100 rounded" title={t.admin.edit}><Edit className="w-4 h-4"/></button>
                                                {u.role !== UserRole.ADMIN && <button onClick={() => { if(window.confirm(t.admin.deleteUserConfirm)) deleteUser(u.id) }} className="p-2 text-red-500 hover:bg-red-50 rounded"><Trash className="w-4 h-4"/></button>}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* CONTENT: BROADCAST */}
                {activeTab === 'broadcast' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Send Form */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 animate-fade-in">
                            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                                <Megaphone className="w-5 h-5 text-primary" />
                                {t.admin.broadcast}
                            </h2>
                            <form onSubmit={handleSendBroadcast} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Notification Title</label>
                                    <input 
                                        type="text" 
                                        required 
                                        value={broadcastTitle} 
                                        onChange={e => setBroadcastTitle(e.target.value)} 
                                        className="w-full border rounded-lg p-3 bg-white"
                                        placeholder="e.g., New Course Available!"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Message</label>
                                    <textarea 
                                        required 
                                        rows={4}
                                        value={broadcastMessage} 
                                        onChange={e => setBroadcastMessage(e.target.value)} 
                                        className="w-full border rounded-lg p-3 bg-white"
                                        placeholder="Write your message here..."
                                    />
                                </div>
                                <button type="submit" className="w-full bg-primary text-white py-3 rounded-lg font-bold hover:bg-blue-700 flex items-center justify-center gap-2">
                                    <Send className="w-4 h-4" /> Send to All Users
                                </button>
                            </form>
                        </div>

                        {/* History */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 animate-fade-in">
                            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                                <Bell className="w-5 h-5 text-gray-500" />
                                Active Notifications
                            </h2>
                            <div className="space-y-4">
                                {notifications.length > 0 ? notifications.map(n => (
                                    <div key={n.id} className="border border-gray-100 p-4 rounded-lg bg-gray-50 flex justify-between items-start">
                                        <div>
                                            <h4 className="font-bold text-gray-800">{n.title}</h4>
                                            <p className="text-sm text-gray-600 mt-1">{n.message}</p>
                                            <span className="text-xs text-gray-400 mt-2 block">{new Date(n.date).toLocaleString()}</span>
                                        </div>
                                        <button onClick={() => removeNotification(n.id)} className="text-red-400 hover:text-red-600 p-1">
                                            <Trash className="w-4 h-4" />
                                        </button>
                                    </div>
                                )) : (
                                    <p className="text-gray-400 text-center py-8">No active notifications.</p>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* CONTENT: SETTINGS */}
                {activeTab === 'settings' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-fade-in">
                         {/* General & Payment Settings */}
                         <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                                <Settings className="w-5 h-5 text-primary" />
                                {t.admin.settings}
                            </h2>
                            <div className="space-y-6">
                                <div>
                                    <label className="block font-bold text-gray-700 mb-2">{t.admin.siteTheme}</label>
                                    <select 
                                        value={localSettings.siteTheme}
                                        onChange={e => setLocalSettings({...localSettings, siteTheme: e.target.value as SiteTheme})} 
                                        className="w-full border rounded-lg p-3 bg-white"
                                    >
                                        <option value="default">Default (Blue/Amber)</option>
                                        <option value="ramadan">Ramadan (Green/Gold)</option>
                                        <option value="eid-fitr">Eid Al-Fitr (Purple/Pink)</option>
                                        <option value="eid-adha">Eid Al-Adha (Cyan/Orange)</option>
                                    </select>
                                </div>
                                
                                <div>
                                    <label className="block font-bold text-gray-700 mb-2">{t.admin.vodafoneNumber}</label>
                                    <input 
                                        type="text" 
                                        value={localSettings.vodafoneWalletNumber} 
                                        onChange={e => setLocalSettings({...localSettings, vodafoneWalletNumber: e.target.value})}
                                        className="w-full border rounded-lg p-3 font-mono bg-white"
                                    />
                                </div>

                                <div>
                                    <h3 className="font-bold text-gray-800 mb-4 border-b pb-2">{t.admin.managePaymentMethods}</h3>
                                    <div className="space-y-4">
                                        {localSettings.paymentMethods.map((pm, idx) => (
                                            <div key={pm.id} className="border p-4 rounded-lg flex items-center justify-between bg-white">
                                                <div>
                                                    <p className="font-bold text-sm">{language === 'ar' ? pm.nameAr : pm.nameEn}</p>
                                                    <p className="text-xs text-gray-400 capitalize">{pm.type}</p>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <label className="flex items-center gap-2 text-sm cursor-pointer">
                                                        <input 
                                                            type="checkbox" 
                                                            checked={pm.isEnabled} 
                                                            onChange={(e) => {
                                                                const newMethods = [...localSettings.paymentMethods];
                                                                newMethods[idx].isEnabled = e.target.checked;
                                                                setLocalSettings({...localSettings, paymentMethods: newMethods});
                                                            }}
                                                        />
                                                        Active
                                                    </label>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                         </div>

                         {/* Appearance Settings */}
                         <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                             <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                                <Palette className="w-5 h-5 text-secondary" />
                                Appearance & Branding
                             </h2>
                             <div className="space-y-4">
                                <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border border-gray-200">
                                    <span className="font-bold text-sm text-gray-700">Show Student Count</span>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input 
                                            type="checkbox" 
                                            className="sr-only peer" 
                                            checked={localSettings.showStudentCount} 
                                            onChange={(e) => setLocalSettings({...localSettings, showStudentCount: e.target.checked})} 
                                        />
                                        <div className={`w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all ${localSettings.showStudentCount ? 'peer-checked:bg-primary' : ''}`}></div>
                                    </label>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Brand Name</label>
                                    <input 
                                        type="text" 
                                        value={localSettings.brandName} 
                                        onChange={e => setLocalSettings({...localSettings, brandName: e.target.value})}
                                        className="w-full border rounded-lg p-2.5 bg-white"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1">Primary Color</label>
                                        <div className="flex items-center gap-2">
                                            <input 
                                                type="color" 
                                                value={localSettings.primaryColor} 
                                                onChange={e => setLocalSettings({...localSettings, primaryColor: e.target.value})}
                                                className="w-10 h-10 border rounded cursor-pointer"
                                            />
                                            <input 
                                                type="text" 
                                                value={localSettings.primaryColor} 
                                                onChange={e => setLocalSettings({...localSettings, primaryColor: e.target.value})}
                                                className="flex-1 border rounded-lg p-2 bg-white text-sm"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1">Secondary Color</label>
                                        <div className="flex items-center gap-2">
                                            <input 
                                                type="color" 
                                                value={localSettings.secondaryColor} 
                                                onChange={e => setLocalSettings({...localSettings, secondaryColor: e.target.value})}
                                                className="w-10 h-10 border rounded cursor-pointer"
                                            />
                                            <input 
                                                type="text" 
                                                value={localSettings.secondaryColor} 
                                                onChange={e => setLocalSettings({...localSettings, secondaryColor: e.target.value})}
                                                className="flex-1 border rounded-lg p-2 bg-white text-sm"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-4 border-t">
                                    <h3 className="font-bold text-gray-800 mb-3 text-sm uppercase text-gray-500">Home Page Hero</h3>
                                    <div className="space-y-3">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 mb-1">Hero Images (Gallery)</label>
                                            
                                            {/* Image Gallery Grid */}
                                            <div className="grid grid-cols-3 gap-2 mb-2">
                                                {localSettings.heroImageUrls.map((url, idx) => (
                                                    <div key={idx} className="relative group rounded-lg overflow-hidden border border-gray-200">
                                                        <img src={url} className="w-full h-24 object-cover" alt={`Hero ${idx}`} />
                                                        <button
                                                            onClick={() => handleRemoveHeroImage(idx)}
                                                            className="absolute top-1 right-1 bg-red-500/80 hover:bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition shadow-sm"
                                                            title="Remove Image"
                                                        >
                                                            <X className="w-3 h-3" />
                                                        </button>
                                                    </div>
                                                ))}
                                                <label className="border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center h-24 cursor-pointer hover:bg-gray-50 transition text-gray-400 hover:text-primary hover:border-primary">
                                                    <input type="file" accept="image/*" className="hidden" onChange={handleAddHeroImage} />
                                                    <Plus className="w-6 h-6 mb-1" />
                                                    <span className="text-[10px] font-bold">Add Image</span>
                                                </label>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="block text-xs font-bold text-gray-500 mb-1">Title (AR)</label>
                                                <input type="text" value={localSettings.heroTitleAr} onChange={e => setLocalSettings({...localSettings, heroTitleAr: e.target.value})} className="w-full border rounded p-2 text-sm bg-white"/>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-gray-500 mb-1">Title (EN)</label>
                                                <input type="text" value={localSettings.heroTitleEn} onChange={e => setLocalSettings({...localSettings, heroTitleEn: e.target.value})} className="w-full border rounded p-2 text-sm bg-white"/>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-gray-500 mb-1">Subtitle (AR)</label>
                                                <input type="text" value={localSettings.heroSubtitleAr} onChange={e => setLocalSettings({...localSettings, heroSubtitleAr: e.target.value})} className="w-full border rounded p-2 text-sm bg-white"/>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-gray-500 mb-1">Subtitle (EN)</label>
                                                <input type="text" value={localSettings.heroSubtitleEn} onChange={e => setLocalSettings({...localSettings, heroSubtitleEn: e.target.value})} className="w-full border rounded p-2 text-sm bg-white"/>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                             </div>
                         </div>
                         
                         <div className="md:col-span-2">
                            <button onClick={() => { updateSettings(localSettings); alert('Saved!'); }} className="w-full bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 shadow-lg">
                                {t.admin.save}
                            </button>
                         </div>
                    </div>
                )}
                
                {/* CONTENT: COUPONS */}
                {activeTab === 'coupons' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
                        
                        {/* Left: Add Coupon Form */}
                        <div className="lg:col-span-1 bg-white rounded-xl shadow-sm border border-gray-200 p-6 h-fit">
                            <h3 className="text-lg font-bold mb-4 flex items-center gap-2 border-b pb-2">
                                <PlusCircle className="w-5 h-5 text-primary" />
                                {t.admin.addCoupon}
                            </h3>
                            <form onSubmit={handleAddCoupon} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">{t.admin.code}</label>
                                    <input 
                                        type="text" 
                                        required 
                                        value={couponForm.code} 
                                        onChange={e => setCouponForm({...couponForm, code: e.target.value.toUpperCase()})}
                                        className="w-full border rounded-lg p-2.5 bg-white uppercase font-mono"
                                        placeholder="e.g. SALE20"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">{t.admin.discountPercent}</label>
                                    <input 
                                        type="number" 
                                        required 
                                        min="1" max="100"
                                        value={couponForm.discountPercent} 
                                        onChange={e => setCouponForm({...couponForm, discountPercent: Number(e.target.value)})}
                                        className="w-full border rounded-lg p-2.5 bg-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">{t.admin.expiryDate}</label>
                                    <input 
                                        type="date" 
                                        required 
                                        value={couponForm.expiryDate} 
                                        onChange={e => setCouponForm({...couponForm, expiryDate: e.target.value})}
                                        className="w-full border rounded-lg p-2.5 bg-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">{t.admin.specificCourse}</label>
                                    <select 
                                        value={couponForm.specificCourseId} 
                                        onChange={e => setCouponForm({...couponForm, specificCourseId: e.target.value})}
                                        className="w-full border rounded-lg p-2.5 bg-white text-sm"
                                    >
                                        <option value="">{t.admin.allCourses}</option>
                                        {courses.map(c => (
                                            <option key={c.id} value={c.id}>{c.title}</option>
                                        ))}
                                    </select>
                                </div>
                                <button type="submit" className="w-full bg-primary text-white font-bold py-2.5 rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2">
                                    <Plus className="w-4 h-4" /> Create Coupon
                                </button>
                            </form>
                        </div>

                        {/* Right: Coupon List */}
                        <div className="lg:col-span-2 space-y-4">
                            {coupons.length > 0 ? coupons.map(c => (
                                <div key={c.id} className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col sm:flex-row justify-between items-center shadow-sm relative overflow-hidden group">
                                    {/* Decorative circle */}
                                    <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-gray-50 rounded-full border-r border-gray-200"></div>
                                    <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-gray-50 rounded-full border-l border-gray-200"></div>
                                    
                                    <div className="flex items-center gap-4 mb-3 sm:mb-0 w-full sm:w-auto">
                                        <div className="bg-green-100 text-green-700 p-3 rounded-lg font-mono font-bold text-lg border-2 border-dashed border-green-300">
                                            {c.code}
                                        </div>
                                        <div>
                                            <div className="font-bold text-gray-800">{c.discountPercent}% OFF</div>
                                            <div className="text-xs text-gray-500">
                                                {c.specificCourseId 
                                                    ? courses.find(course => course.id === c.specificCourseId)?.title || 'Unknown Course' 
                                                    : t.admin.allCourses}
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                                        <div className="text-xs text-gray-500 text-right">
                                            <div className="font-semibold">{t.admin.expiryDate}</div>
                                            <div>{c.expiryDate}</div>
                                        </div>
                                        <button onClick={() => deleteCoupon(c.id)} className="text-red-400 hover:text-red-600 bg-red-50 p-2 rounded-lg transition">
                                            <Trash className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            )) : (
                                <div className="text-center text-gray-400 py-12 bg-white rounded-xl border border-gray-200 border-dashed">
                                    <TicketPercent className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                    <p>No active coupons found.</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

            </div>
        </div>

        {/* --- MODALS --- */}
        
        {/* User Edit Modal */}
        {editingUser && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
                    <h3 className="text-xl font-bold mb-4">{t.admin.edit} User</h3>
                    <form onSubmit={saveUserChanges} className="space-y-4">
                         <input required value={editUserForm.name} onChange={e => setEditUserForm({...editUserForm, name: e.target.value})} className="w-full border rounded p-2 bg-white" placeholder="Name" />
                         <input required value={editUserForm.email} onChange={e => setEditUserForm({...editUserForm, email: e.target.value})} className="w-full border rounded p-2 bg-white" placeholder="Email" />
                         <input value={editUserForm.phone} onChange={e => setEditUserForm({...editUserForm, phone: e.target.value})} className="w-full border rounded p-2 bg-white" placeholder="Phone" />
                         <input value={editUserForm.password} onChange={e => setEditUserForm({...editUserForm, password: e.target.value})} className="w-full border rounded p-2 bg-white" placeholder="Password" />
                         <div className="flex justify-end gap-2 pt-2">
                             <button type="button" onClick={() => setEditingUser(null)} className="px-4 py-2 text-gray-600">Cancel</button>
                             <button type="submit" className="px-4 py-2 bg-primary text-white rounded">Save</button>
                         </div>
                    </form>
                </div>
            </div>
        )}

        {/* Enrollments Modal with Search */}
        {managingEnrollmentUserId && (
             <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                 <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 max-h-[80vh] flex flex-col">
                     <div className="flex justify-between items-center mb-4">
                         <div>
                             <h3 className="font-bold text-lg">{t.admin.manageCourses}</h3>
                             <p className="text-xs text-gray-500">
                                 {t.admin.coursesUpdated}: {allUsers.find(u => u.id === managingEnrollmentUserId)?.name}
                             </p>
                         </div>
                         <button onClick={() => setManagingEnrollmentUserId(null)}><X className="w-5 h-5 text-gray-400"/></button>
                     </div>
                     
                     {/* Search Bar for Courses */}
                     <div className="mb-4 relative">
                         <Search className="w-4 h-4 absolute top-3 left-3 text-gray-400" />
                         <input 
                            type="text" 
                            placeholder="Search courses..." 
                            value={enrollmentSearch}
                            onChange={(e) => setEnrollmentSearch(e.target.value)}
                            className="w-full border rounded-lg pl-9 p-2 text-sm bg-white focus:bg-gray-50 transition"
                         />
                     </div>

                     <div className="flex-1 overflow-y-auto space-y-2 pr-2">
                         {filteredEnrollmentCourses.map(course => {
                             const targetUser = allUsers.find(u => u.id === managingEnrollmentUserId);
                             const isEnrolled = targetUser?.purchasedCourses.includes(course.id) || false;
                             return (
                                 <div key={course.id} className={`flex items-center justify-between p-3 rounded-lg border ${isEnrolled ? 'border-green-500 bg-green-50' : 'border-gray-200'}`}>
                                     <div className="flex items-center gap-3">
                                         <div className="w-10 h-10 rounded overflow-hidden bg-gray-200 flex-shrink-0">
                                            <img src={course.thumbnail} className="w-full h-full object-cover" alt="" />
                                         </div>
                                         <div>
                                             <p className="font-bold text-sm line-clamp-1">{course.title}</p>
                                             <p className="text-xs text-gray-500">{course.price} {t.course.currency}</p>
                                         </div>
                                     </div>
                                     <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" className="sr-only peer" checked={isEnrolled} onChange={() => handleEnrollmentToggle(managingEnrollmentUserId, course.id, isEnrolled)} />
                                        <div className={`w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all ${isEnrolled ? 'peer-checked:bg-green-600' : ''}`}></div>
                                     </label>
                                 </div>
                             )
                         })}
                         {filteredEnrollmentCourses.length === 0 && <p className="text-center text-gray-400 text-sm py-4">No courses found.</p>}
                     </div>
                 </div>
             </div>
        )}

    </div>
  );
};
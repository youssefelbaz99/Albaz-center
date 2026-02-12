import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { useNavigate } from 'react-router-dom';
import { PaymentMethod } from '../types';
import { CreditCard, Smartphone, Store, CheckCircle, Trash, Copy, Loader, Printer, User, Mail, Phone, Ticket, MessageCircle } from 'lucide-react';

export const CheckoutPage: React.FC = () => {
  const { cart, courses, clearCart, enrollInCourses, removeFromCart, settings, user, t, language, validateCoupon } = useStore();
  const navigate = useNavigate();
  
  // Get active methods from settings
  const availableMethods = settings.paymentMethods?.filter(m => m.isEnabled) || [];
  
  // Set default method
  const [method, setMethod] = useState<string>(availableMethods[0]?.type || 'visa');
  
  const [paymentStep, setPaymentStep] = useState<'review' | 'vf_contact' | 'vf_instructions' | 'processing' | 'fawry_pending' | 'success'>('review');
  const [fawryCode, setFawryCode] = useState('');
  
  // Coupon State
  const [couponCode, setCouponCode] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [couponError, setCouponError] = useState('');

  // Visa Data
  const [cardNumber, setCardNumber] = useState('');
  
  // Vodafone Data
  const [vfName, setVfName] = useState(user?.name || '');
  const [vfEmail, setVfEmail] = useState(user?.email || '');
  const [vfPhone, setVfPhone] = useState(user?.phone || '');
  const [userWalletNumber, setUserWalletNumber] = useState('');

  const subtotal = cart.reduce((sum, item) => sum + item.price, 0);
  const total = subtotal - discountAmount;

  const handleApplyCoupon = () => {
      const result = validateCoupon(couponCode.toUpperCase(), cart);
      if (result.valid) {
          setDiscountAmount(result.discountAmount);
          setAppliedCoupon(couponCode.toUpperCase());
          setCouponError('');
      } else {
          setDiscountAmount(0);
          setAppliedCoupon(null);
          setCouponError(result.message || t.cartPage.invalidCoupon);
      }
  };

  const handleRemoveCoupon = () => {
      setAppliedCoupon(null);
      setDiscountAmount(0);
      setCouponCode('');
  };

  // Initial Payment Click
  const handleProceedToPayment = () => {
      // --- CRITICAL: Login Check ---
      if (!user) {
          alert(language === 'ar' ? 'يجب تسجيل الدخول أولاً لإتمام عملية الدفع' : 'You must login first to proceed with payment');
          navigate('/login');
          return;
      }

      if (method === 'subscription') {
         // Create the WhatsApp Message
         const courseDetails = cart.map(item => {
             const course = courses.find(c => c.id === item.courseId);
             const instructor = course ? course.instructor : (language === 'ar' ? 'المحاضر' : 'the instructor');
             return `"${item.title}" ${language === 'ar' ? 'لـ' : 'by'} "${instructor}"`;
         }).join(' + ');

         const message = language === 'ar' 
            ? `مرحباً، أريد الاشتراك في كورس: ${courseDetails}`
            : `Hello, I want to subscribe to course: ${courseDetails}`;
         
         const whatsappUrl = `https://wa.me/201142645708?text=${encodeURIComponent(message)}`;
         
         window.open(whatsappUrl, '_blank');
         return;
      } else if (method === 'vodafone') {
          setPaymentStep('vf_contact');
      } else if (method === 'visa') {
          if(cardNumber.replace(/\s/g, '').length < 16) {
             alert(language === 'ar' ? 'يرجى إدخال رقم بطاقة صحيح' : 'Invalid card number');
             return;
          }
          setPaymentStep('processing');
          setTimeout(() => finalizePayment(), 2500);
      } else if (method === 'fawry') {
          setPaymentStep('processing');
          // Mock API call for Fawry
          setTimeout(() => {
              setFawryCode(Math.floor(900000000 + Math.random() * 90000000).toString());
              setPaymentStep('fawry_pending');
          }, 2000);
      }
  };

  // Vodafone Flow: Step 1 (Contact Info -> Email Simulation)
  const handleVfContactSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      // Simulate sending email
      setPaymentStep('processing');
      setTimeout(() => {
          alert(language === 'ar' 
              ? `تم إرسال تعليمات الدفع إلى ${vfEmail}` 
              : `Payment instructions sent to ${vfEmail}`);
          setPaymentStep('vf_instructions');
      }, 1500);
  };

  // Vodafone Flow: Step 2 (Finalize after transfer)
  const handleVfConfirmTransfer = () => {
      if(userWalletNumber.length < 11) {
          alert(language === 'ar' ? 'يرجى إدخال رقم محفظة صحيح' : 'Invalid wallet number');
          return;
      }
      setPaymentStep('processing');
      setTimeout(() => finalizePayment(), 2000);
  };

  // Shared Finalize
  const finalizePayment = () => {
    enrollInCourses(cart.map(i => i.courseId));
    clearCart();
    setPaymentStep('success');
  };

  if (cart.length === 0 && paymentStep !== 'success' && paymentStep !== 'fawry_pending') {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">{t.cartPage.empty}</h2>
                <button onClick={() => navigate('/')} className="text-primary underline">{t.browseBtn}</button>
            </div>
        </div>
    );
  }

  // --- VODAFONE CASH SCREENS ---

  if (paymentStep === 'vf_contact') {
      return (
          <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
              <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full">
                  <h2 className="text-xl font-bold mb-6 text-center flex items-center justify-center gap-2">
                      <Smartphone className="text-red-600" />
                      {language === 'ar' ? 'بيانات التواصل' : 'Contact Information'}
                  </h2>
                  <form onSubmit={handleVfContactSubmit} className="space-y-4">
                      <div>
                          <label className="block text-sm font-bold text-gray-700 mb-2">{t.loginPage.name}</label>
                          <div className="relative">
                            <input required type="text" value={vfName} onChange={e => setVfName(e.target.value)} className="w-full border p-3 rounded-lg pl-10 bg-white" />
                            <User className="w-5 h-5 absolute top-3 left-3 text-gray-400" />
                          </div>
                      </div>
                      <div>
                          <label className="block text-sm font-bold text-gray-700 mb-2">{t.loginPage.email}</label>
                          <div className="relative">
                            <input required type="text" value={vfEmail} onChange={e => setVfEmail(e.target.value)} className="w-full border p-3 rounded-lg pl-10 bg-white" />
                            <Mail className="w-5 h-5 absolute top-3 left-3 text-gray-400" />
                          </div>
                      </div>
                      <div>
                          <label className="block text-sm font-bold text-gray-700 mb-2">{language === 'ar' ? 'رقم الهاتف' : 'Phone Number'}</label>
                          <div className="relative">
                            <input required type="text" value={vfPhone} onChange={e => setVfPhone(e.target.value)} className="w-full border p-3 rounded-lg pl-10 bg-white" placeholder="01xxxxxxxxx" />
                            <Phone className="w-5 h-5 absolute top-3 left-3 text-gray-400" />
                          </div>
                      </div>
                      <button type="submit" className="w-full bg-red-600 text-white font-bold py-3 rounded-lg hover:bg-red-700 transition mt-4">
                          {language === 'ar' ? 'أرسل تعليمات الدفع' : 'Send Payment Instructions'}
                      </button>
                      <button type="button" onClick={() => setPaymentStep('review')} className="w-full text-gray-500 py-2 mt-2">
                          {language === 'ar' ? 'عودة' : 'Back'}
                      </button>
                  </form>
              </div>
          </div>
      )
  }

  if (paymentStep === 'vf_instructions') {
      return (
          <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
              <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full border-t-4 border-red-600">
                  <h2 className="text-xl font-bold mb-4 text-center">{language === 'ar' ? 'تحويل فودافون كاش' : 'Vodafone Cash Transfer'}</h2>
                  
                  <div className="bg-red-50 p-4 rounded-lg mb-6 border border-red-100 text-center">
                      <p className="text-sm text-gray-600 mb-2">{language === 'ar' ? 'يرجى تحويل مبلغ' : 'Please transfer'}</p>
                      <p className="text-2xl font-bold text-red-700 mb-2">{total.toFixed(2)} {t.course.currency}</p>
                      <p className="text-sm text-gray-600 mb-2">{language === 'ar' ? 'إلى الرقم التالي:' : 'To the following number:'}</p>
                      <div className="flex items-center justify-center gap-2 bg-white p-2 rounded border border-red-200 shadow-sm">
                          <span className="text-xl font-mono font-bold text-gray-800">{settings.vodafoneWalletNumber}</span>
                          <Copy className="w-4 h-4 cursor-pointer text-gray-400 hover:text-red-600" onClick={() => navigator.clipboard.writeText(settings.vodafoneWalletNumber)}/>
                      </div>
                  </div>

                  <div className="space-y-4">
                      <label className="block text-sm font-bold text-gray-700">
                          {language === 'ar' ? 'أدخل رقم محفظتك للتأكيد' : 'Enter YOUR wallet number for confirmation'}
                      </label>
                      <input 
                        type="text" 
                        value={userWalletNumber} 
                        onChange={e => setUserWalletNumber(e.target.value)} 
                        className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-red-500 outline-none bg-white" 
                        placeholder="01xxxxxxxxx"
                      />
                      <button onClick={handleVfConfirmTransfer} className="w-full bg-primary text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition">
                          {language === 'ar' ? 'تأكيد التحويل' : 'Confirm Transfer'}
                      </button>
                  </div>
              </div>
          </div>
      )
  }

  // --- FAWRY RECEIPT SCREEN ---
  if (paymentStep === 'fawry_pending') {
      return (
          <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
              <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden border border-gray-200 animate-fade-in-up">
                  {/* Header */}
                  <div className="bg-[#18457C] text-white p-6 text-center">
                      <div className="flex justify-center items-center gap-2 mb-2">
                        <Store className="w-8 h-8 text-[#FFD200]" />
                        <h2 className="text-2xl font-bold italic">Fawry<span className="text-[#FFD200]">Pay</span></h2>
                      </div>
                      <p className="text-blue-100 text-sm">{language === 'ar' ? 'كود الدفع الخاص بك' : 'Your Payment Reference Code'}</p>
                  </div>
                  
                  <div className="p-8">
                      <div className="text-center mb-6">
                          <p className="text-gray-500 text-sm mb-2">
                              {language === 'ar' 
                                  ? 'يرجى التوجه لأي منفذ فوري والدفع باستخدام الكود التالي:' 
                                  : 'Please pay at any Fawry outlet using the code below:'}
                          </p>
                          <div className="bg-gray-50 border-2 border-dashed border-[#18457C] rounded-xl p-4 my-4">
                              <div className="text-4xl font-mono font-bold text-gray-800 tracking-wider flex justify-center items-center gap-2">
                                  {fawryCode}
                                  <button onClick={() => navigator.clipboard.writeText(fawryCode)} className="p-1 hover:bg-gray-200 rounded">
                                      <Copy className="w-5 h-5 text-gray-400" />
                                  </button>
                              </div>
                              <p className="text-xs text-gray-400 mt-2">Ref: #ORD-{Math.floor(Math.random()*10000)}</p>
                          </div>
                      </div>

                      <div className="space-y-4 border-t border-b border-gray-100 py-4 mb-6">
                          <div className="flex justify-between items-center text-sm">
                              <span className="text-gray-600">{language === 'ar' ? 'التاجر:' : 'Merchant:'}</span>
                              <span className="font-bold">Albaz Platform</span>
                          </div>
                          <div className="flex justify-between items-center text-sm">
                              <span className="text-gray-600">{language === 'ar' ? 'المبلغ المستحق:' : 'Amount Due:'}</span>
                              <span className="font-bold text-lg text-green-600">{total.toFixed(2)} {t.course.currency}</p>
                          </div>
                          <div className="flex justify-between items-center text-sm">
                              <span className="text-gray-600">{language === 'ar' ? 'صلاحية الكود:' : 'Expires In:'}</span>
                              <span className="text-red-500 font-medium">23:59:59</span>
                          </div>
                      </div>

                      <div className="flex gap-3">
                        <button 
                            onClick={() => window.print()}
                            className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-lg font-bold hover:bg-gray-50 flex items-center justify-center gap-2"
                        >
                            <Printer className="w-4 h-4" />
                            {language === 'ar' ? 'طباعة' : 'Print'}
                        </button>
                        <button 
                            onClick={finalizePayment}
                            className="flex-[2] bg-[#18457C] text-white py-3 rounded-lg font-bold hover:bg-blue-900 transition shadow-lg"
                        >
                            {language === 'ar' ? 'لقد قمت بالدفع' : 'I Have Paid'}
                        </button>
                      </div>
                  </div>
              </div>
          </div>
      )
  }

  // --- SUCCESS SCREEN ---
  if (paymentStep === 'success') {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <div className="bg-white p-8 rounded-2xl shadow-xl text-center max-w-md w-full animate-fade-in-up">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="w-10 h-10 text-green-500" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">{t.cartPage.success}</h2>
                <p className="text-gray-500 mb-8">{t.cartPage.successDesc}</p>
                
                <div className="bg-gray-50 rounded-lg p-4 mb-6 text-sm text-left rtl:text-right">
                    <p className="flex justify-between mb-2">
                        <span className="text-gray-500">Transaction ID:</span>
                        <span className="font-mono">TX-{Math.floor(Math.random() * 100000)}</span>
                    </p>
                    <p className="flex justify-between">
                        <span className="text-gray-500">Total Paid:</span>
                        <span className="font-bold text-green-600">{total.toFixed(2)} {t.course.currency}</span>
                    </p>
                </div>

                <button 
                    onClick={() => navigate('/my-courses')} 
                    className="w-full bg-primary text-white py-3 rounded-lg font-bold hover:bg-blue-700 mb-3"
                >
                    {t.myCourses}
                </button>
                <button 
                    onClick={() => navigate('/')} 
                    className="w-full text-gray-500 py-3 rounded-lg font-medium hover:text-gray-800"
                >
                    {t.cartPage.backHome}
                </button>
            </div>
        </div>
      );
  }

  // --- PROCESSING LOADER ---
  if (paymentStep === 'processing') {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-white">
            <Loader className="w-12 h-12 text-primary animate-spin mb-4" />
            <h3 className="text-xl font-bold text-gray-800">
                {language === 'ar' ? 'جاري المعالجة...' : 'Processing...'}
            </h3>
            <p className="text-gray-500 mt-2">{language === 'ar' ? 'رجاء عدم إغلاق الصفحة' : 'Please do not close this page'}</p>
        </div>
      );
  }

  // --- CHECKOUT FORM (REVIEW) ---
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Order Summary */}
        <div className="bg-white rounded-xl shadow-sm p-6 h-fit order-2 md:order-1">
            <h2 className="text-xl font-bold mb-6 border-b pb-4">{t.cartPage.summary}</h2>
            <div className="space-y-4 mb-6">
                {cart.map(item => (
                    <div key={item.courseId} className="flex gap-4 items-center">
                        <img src={item.thumbnail} alt="" className="w-16 h-10 object-cover rounded" />
                        <div className="flex-1">
                            <h4 className="text-sm font-bold text-gray-800 line-clamp-1">{item.title}</h4>
                            <span className="text-xs text-gray-500">{item.price} {t.course.currency}</span>
                        </div>
                        <button 
                            onClick={() => removeFromCart(item.courseId)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-full transition"
                            title={t.cartPage.remove}
                        >
                            <Trash className="w-4 h-4" />
                        </button>
                    </div>
                ))}
            </div>

            {/* Coupon Input */}
            <div className="mb-6 pt-4 border-t">
                <div className="flex items-center gap-2 mb-2 text-sm font-bold text-gray-700">
                    <Ticket className="w-4 h-4 text-primary" />
                    {t.cartPage.haveCoupon}
                </div>
                <div className="flex gap-2">
                    <input 
                        type="text" 
                        value={couponCode} 
                        onChange={e => setCouponCode(e.target.value)} 
                        placeholder="SALE20"
                        disabled={!!appliedCoupon}
                        className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm uppercase focus:outline-none focus:border-primary bg-white"
                    />
                    {appliedCoupon ? (
                        <button onClick={handleRemoveCoupon} className="bg-gray-200 text-gray-600 px-4 py-2 rounded-lg text-sm font-bold hover:bg-gray-300">
                            X
                        </button>
                    ) : (
                        <button onClick={handleApplyCoupon} className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-700">
                            {t.cartPage.apply}
                        </button>
                    )}
                </div>
                {couponError && <p className="text-xs text-red-500 mt-1">{couponError}</p>}
                {appliedCoupon && <p className="text-xs text-green-600 mt-1 font-bold">{t.cartPage.couponApplied}</p>}
            </div>

            <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between items-center text-gray-600">
                    <span>Subtotal</span>
                    <span>{subtotal.toFixed(2)} {t.course.currency}</span>
                </div>
                {discountAmount > 0 && (
                    <div className="flex justify-between items-center text-green-600">
                        <span>{t.cartPage.discountValue}</span>
                        <span>- {discountAmount.toFixed(2)} {t.course.currency}</span>
                    </div>
                )}
                <div className="flex justify-between items-center text-lg font-bold border-t pt-2">
                    <span>{t.cartPage.total}</span>
                    <span className="text-primary">{total.toFixed(2)} {t.course.currency}</span>
                </div>
            </div>
        </div>

        {/* Payment Methods */}
        <div className="bg-white rounded-xl shadow-sm p-6 order-1 md:order-2">
            <h2 className="text-xl font-bold mb-6">{t.cartPage.paymentMethod}</h2>
            
            <div className="space-y-4 mb-8">
                {availableMethods.map((pm) => {
                    const isSelected = method === pm.type;
                    const Icon = pm.type === 'subscription' ? MessageCircle : pm.type === 'visa' ? CreditCard : pm.type === 'vodafone' ? Smartphone : Store;
                    const iconColor = pm.type === 'subscription' ? 'text-green-600' : pm.type === 'visa' ? 'text-blue-600' : pm.type === 'vodafone' ? 'text-red-600' : 'text-[#18457C]';
                    const activeBorder = pm.type === 'subscription' ? 'border-green-500 ring-1 ring-green-500' : 'border-primary ring-1 ring-primary';
                    const activeBg = pm.type === 'subscription' ? 'bg-green-50' : 'bg-blue-50';

                    return (
                        <div key={pm.id} onClick={() => setMethod(pm.type)} className={`border rounded-xl cursor-pointer transition overflow-hidden ${isSelected ? activeBorder + ' shadow-md' : 'border-gray-200 hover:border-gray-300'}`}>
                            <div className={`flex items-center p-4 ${isSelected ? activeBg : ''}`}>
                                <Icon className={`w-6 h-6 ${iconColor} ml-4 rtl:ml-4 ltr:mr-4`} />
                                <div className="flex-1 mx-4">
                                    <span className="block font-bold">{language === 'ar' ? pm.nameAr : pm.nameEn}</span>
                                    {(language === 'ar' ? pm.descriptionAr : pm.descriptionEn) && (
                                        <span className="text-xs text-gray-500">{language === 'ar' ? pm.descriptionAr : pm.descriptionEn}</span>
                                    )}
                                </div>
                                {isSelected && <CheckCircle className={`w-5 h-5 ${pm.type === 'subscription' ? 'text-green-600' : 'text-primary'}`} />}
                            </div>
                            {/* Visa Input */}
                            {isSelected && pm.type === 'visa' && (
                                <div className="p-4 bg-gray-50 border-t border-gray-100 space-y-3 animate-fade-in">
                                    <input 
                                        type="text" 
                                        value={cardNumber}
                                        onChange={e => setCardNumber(e.target.value)}
                                        placeholder="0000 0000 0000 0000" 
                                        className="w-full border rounded-lg p-3 text-sm focus:border-primary focus:outline-none bg-white" 
                                        maxLength={19}
                                    />
                                    <div className="flex gap-3">
                                        <input type="text" placeholder="MM/YY" className="w-1/2 border rounded-lg p-3 text-sm focus:border-primary focus:outline-none bg-white" />
                                        <input type="text" placeholder="CVC" className="w-1/2 border rounded-lg p-3 text-sm focus:border-primary focus:outline-none bg-white" maxLength={3} />
                                    </div>
                                </div>
                            )}
                            {/* Generic Info for others if selected */}
                            {isSelected && (pm.type === 'vodafone') && (
                                <div className="p-4 bg-gray-50 border-t border-gray-100 animate-fade-in text-sm text-gray-600">
                                {language === 'ar' ? 'الدفع عن طريق التحويل للمحفظة.' : 'Payment via Wallet Transfer.'}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            <button 
                onClick={handleProceedToPayment} 
                className={`w-full py-4 rounded-xl text-white font-bold text-lg shadow-lg transition flex items-center justify-center gap-2 ${method === 'subscription' ? 'bg-green-600 hover:bg-green-700' : 'bg-secondary hover:bg-amber-600'} transform hover:-translate-y-1`}
            >
                {method === 'subscription' ? t.cartPage.chatToPay : t.cartPage.pay} 
                {method !== 'subscription' && <span className="bg-white/20 px-2 py-0.5 rounded text-sm">{total.toFixed(2)} {t.course.currency}</span>}
            </button>
        </div>
      </div>
    </div>
  );
};
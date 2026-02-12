import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const generateCourseSummary = async (courseTitle: string, courseDescription: string, lang: 'ar' | 'en'): Promise<string> => {
  if (!process.env.API_KEY) return lang === 'ar' ? "عذرًا، خدمة الذكاء الاصطناعي غير متوفرة حاليًا." : "Sorry, AI service is currently unavailable.";

  try {
    const prompt = lang === 'ar' 
      ? `قم بتلخيص هذا الكورس التعليمي في 3 نقاط رئيسية تشجع الطالب على الشراء. العنوان: ${courseTitle}. الوصف: ${courseDescription}. اجعل الرد باللغة العربية وجذابًا.`
      : `Summarize this educational course in 3 key points that encourage students to enroll. Title: ${courseTitle}. Description: ${courseDescription}. Keep it catchy and in English.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text || (lang === 'ar' ? "لا يوجد ملخص متاح." : "No summary available.");
  } catch (error) {
    console.error("Gemini Error:", error);
    return lang === 'ar' ? "حدث خطأ أثناء توليد الملخص." : "Error generating summary.";
  }
};

export const askCourseAssistant = async (question: string, context: string, lang: 'ar' | 'en'): Promise<string> => {
    if (!process.env.API_KEY) return lang === 'ar' ? "عذرًا، خدمة الذكاء الاصطناعي غير متوفرة حاليًا." : "Sorry, AI service is currently unavailable.";

    try {
      const prompt = lang === 'ar'
        ? `أنت مساعد تعليمي ذكي في منصة "الباز". سياق الكورس: ${context}. سؤال الطالب: ${question}. جاوب بإيجاز ودقة وباللغة العربية.`
        : `You are an intelligent educational assistant on "Albaz" platform. Course context: ${context}. Student question: ${question}. Answer concisely and accurately in English.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
      });
      return response.text || (lang === 'ar' ? "لم أستطع فهم السؤال، حاول مرة أخرى." : "I couldn't understand the question, please try again.");
    } catch (error) {
      console.error("Gemini Error:", error);
      return lang === 'ar' ? "حدث خطأ في الاتصال بالمساعد الذكي." : "Error connecting to AI assistant.";
    }
  };
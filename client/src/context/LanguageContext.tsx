import { createContext, useContext, useState, useEffect, ReactNode } from "react";

type Language = "en" | "hi";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  en: {
    // Navigation
    dashboard: "Dashboard",
    schemes: "Schemes",
    myApplications: "My Applications",
    applications: "Applications",
    profile: "Profile",
    logout: "Logout",
    home: "Home",
    alerts: "Alerts",

    // Landing Page
    heroTitle: "Discover Government Schemes Tailored for You",
    heroSubtitle: "Find, understand, and apply for government schemes with our AI-powered platform. Get personalized recommendations based on your profile.",
    startDiscovering: "Start Discovering",
    learnMore: "Learn More",
    governmentSchemes: "Government Schemes",
    beneficiaries: "Beneficiaries Helped",
    statesCovered: "States Covered",
    featuresTitle: "Powerful Features to Help You",
    featuresSubtitle: "Everything you need to discover and apply for government schemes",
    ctaTitle: "Ready to Discover Your Benefits?",
    ctaSubtitle: "Join thousands of citizens who have already benefited from government schemes",
    signUpNow: "Sign Up Now",
    getStarted: "Get Started",

    // Authentication
    login: "Login",
    signIn: "Sign In",
    signUp: "Sign Up",
    createAccount: "Create Account",
    welcomeBack: "Welcome Back",
    loginDescription: "Sign in to access your personalized government scheme recommendations",
    registerDescription: "Join GConnect to discover government schemes tailored for you",
    email: "Email",
    password: "Password",
    confirmPassword: "Confirm Password",
    firstName: "First Name",
    lastName: "Last Name",
    enterEmail: "Enter your email",
    enterPassword: "Enter your password",
    enterFirstName: "Enter first name",
    enterLastName: "Enter last name",
    signingIn: "Signing In...",
    creatingAccount: "Creating Account...",
    dontHaveAccount: "Don't have an account?",
    alreadyHaveAccount: "Already have an account?",
    backToHome: "Back to Home",

    // Dashboard
    welcomeUser: "Welcome",
    discoverSchemes: "Discover government schemes tailored for you",
    eligibleSchemes: "Eligible Schemes",
    viewAll: "View All",
    applicationsTracked: "Applications Tracked",
    approved: "Approved",
    pending: "Pending",
    deadlinesThisWeek: "Deadlines This Week",
    recommendedForYou: "Recommended for You",
    recentApplications: "Recent Applications",
    notifications: "Notifications",
    markAllRead: "Mark All Read",
    noNotifications: "No notifications",

    // Profile
    profileSettings: "Profile Settings",
    personalInformation: "Personal Information",
    saveChanges: "Save Changes",
    age: "Age",
    gender: "Gender",
    income: "Annual Income (₹)",
    occupation: "Occupation",
    state: "State",
    district: "District",
    male: "Male",
    female: "Female",
    other: "Other",
    profileUpdated: "Profile updated successfully",

    // Schemes
    allSchemes: "All Government Schemes",
    searchSchemes: "Search schemes...",
    filterByCategory: "Filter by Category",
    education: "Education",
    health: "Health",
    business: "Business",
    agriculture: "Agriculture",
    employment: "Employment",
    social: "Social Welfare",
    eligibility: "Eligibility",
    benefits: "Benefits",
    howToApply: "How to Apply",
    applyNow: "Apply Now",
    learnMoreAboutScheme: "Learn More",
    match: "Match",
    officialWebsite: "Official Website",
    applicationProcess: "Application Process",
    requiredDocuments: "Required Documents",
    trackApplication: "Track Application",

    // Applications
    myApplicationsTitle: "My Applications",
    applicationStatus: "Application Status",
    submittedOn: "Submitted On",
    lastUpdated: "Last Updated",
    applicationId: "Application ID",
    underReview: "Under Review",
    documentPending: "Document Pending",
    rejected: "Rejected",
    addNewApplication: "Add New Application",
    updateStatus: "Update Status",

    // Common
    loading: "Loading...",
    error: "Error",
    success: "Success",
    save: "Save",
    cancel: "Cancel",
    edit: "Edit",
    delete: "Delete",
    close: "Close",
    search: "Search",
    filter: "Filter",
    apply: "Apply",
    submit: "Submit",
    next: "Next",
    previous: "Previous",

    // Footer
    footerDescription: "Empowering citizens with easy access to government schemes and benefits.",
    quickLinks: "Quick Links",
    aboutUs: "About Us",
    contactUs: "Contact Us",
    privacyPolicy: "Privacy Policy",
    terms: "Terms & Conditions",
    support: "Support",
    helpCenter: "Help Center",
    faq: "FAQ",
    guidelines: "Guidelines",
    connect: "Connect",
    allRightsReserved: "All rights reserved.",

    // States
    maharashtra: "Maharashtra",
    karnataka: "Karnataka",
    tamilNadu: "Tamil Nadu",
    gujarat: "Gujarat",
    rajasthan: "Rajasthan",
    westBengal: "West Bengal",
    madhyaPradesh: "Madhya Pradesh",
    uttarPradesh: "Uttar Pradesh",
    kerala: "Kerala",
    punjab: "Punjab",
  },
  hi: {
    // Navigation
    dashboard: "डैशबोर्ड",
    schemes: "योजनाएं",
    myApplications: "मेरे आवेदन",
    applications: "आवेदन",
    profile: "प्रोफाइल",
    logout: "लॉगआउट",
    home: "होम",
    alerts: "अलर्ट",

    // Landing Page
    heroTitle: "आपके लिए सरकारी योजनाएं खोजें",
    heroSubtitle: "हमारे AI-संचालित प्लेटफॉर्म के साथ सरकारी योजनाओं को खोजें, समझें और आवेदन करें। अपनी प्रोफाइल के आधार पर व्यक्तिगत सिफारिशें प्राप्त करें।",
    startDiscovering: "खोजना शुरू करें",
    learnMore: "और जानें",
    governmentSchemes: "सरकारी योजनाएं",
    beneficiaries: "लाभार्थियों की मदद की गई",
    statesCovered: "राज्य कवर किए गए",
    featuresTitle: "आपकी मदद के लिए शक्तिशाली सुविधाएं",
    featuresSubtitle: "सरकारी योजनाओं को खोजने और उनके लिए आवेदन करने के लिए आवश्यक सब कुछ",
    ctaTitle: "अपने लाभ खोजने के लिए तैयार हैं?",
    ctaSubtitle: "हजारों नागरिकों से जुड़ें जिन्होंने पहले से ही सरकारी योजनाओं का लाभ उठाया है",
    signUpNow: "अभी साइन अप करें",
    getStarted: "शुरू करें",

    // Authentication
    login: "लॉगिन",
    signIn: "साइन इन",
    signUp: "साइन अप",
    createAccount: "खाता बनाएं",
    welcomeBack: "वापस स्वागत है",
    loginDescription: "अपनी व्यक्तिगत सरकारी योजना सिफारिशों तक पहुंचने के लिए साइन इन करें",
    registerDescription: "आपके लिए तैयार की गई सरकारी योजनाओं को खोजने के लिए GConnect में शामिल हों",
    email: "ईमेल",
    password: "पासवर्ड",
    confirmPassword: "पासवर्ड की पुष्टि करें",
    firstName: "पहला नाम",
    lastName: "अंतिम नाम",
    enterEmail: "अपना ईमेल दर्ज करें",
    enterPassword: "अपना पासवर्ड दर्ज करें",
    enterFirstName: "पहला नाम दर्ज करें",
    enterLastName: "अंतिम नाम दर्ज करें",
    signingIn: "साइन इन हो रहे हैं...",
    creatingAccount: "खाता बना रहे हैं...",
    dontHaveAccount: "खाता नहीं है?",
    alreadyHaveAccount: "पहले से खाता है?",
    backToHome: "होम पर वापस",

    // Dashboard
    welcomeUser: "नमस्ते",
    discoverSchemes: "आपके लिए तैयार की गई सरकारी योजनाएं खोजें",
    eligibleSchemes: "योग्य योजनाएं",
    viewAll: "सभी देखें",
    applicationsTracked: "ट्रैक किए गए आवेदन",
    approved: "अनुमोदित",
    pending: "लंबित",
    deadlinesThisWeek: "इस सप्ताह की समय सीमा",
    recommendedForYou: "आपके लिए सुझाई गई",
    recentApplications: "हाल के आवेदन",
    notifications: "सूचनाएं",
    markAllRead: "सभी को पढ़ा हुआ चिह्नित करें",
    noNotifications: "कोई सूचना नहीं",

    // Profile
    profileSettings: "प्रोफाइल सेटिंग्स",
    personalInformation: "व्यक्तिगत जानकारी",
    saveChanges: "परिवर्तन सहेजें",
    age: "आयु",
    gender: "लिंग",
    income: "वार्षिक आय (₹)",
    occupation: "व्यवसाय",
    state: "राज्य",
    district: "जिला",
    male: "पुरुष",
    female: "महिला",
    other: "अन्य",
    profileUpdated: "प्रोफाइल सफलतापूर्वक अपडेट हुई",

    // Schemes
    allSchemes: "सभी सरकारी योजनाएं",
    searchSchemes: "योजनाएं खोजें...",
    filterByCategory: "श्रेणी के अनुसार फ़िल्टर करें",
    education: "शिक्षा",
    health: "स्वास्थ्य",
    business: "व्यापार",
    agriculture: "कृषि",
    employment: "रोजगार",
    social: "सामाजिक कल्याण",
    eligibility: "पात्रता",
    benefits: "लाभ",
    howToApply: "आवेदन कैसे करें",
    applyNow: "अभी आवेदन करें",
    learnMoreAboutScheme: "और जानें",
    match: "मैच",
    officialWebsite: "आधिकारिक वेबसाइट",
    applicationProcess: "आवेदन प्रक्रिया",
    requiredDocuments: "आवश्यक दस्तावेज",
    trackApplication: "आवेदन ट्रैक करें",

    // Applications
    myApplicationsTitle: "मेरे आवेदन",
    applicationStatus: "आवेदन की स्थिति",
    submittedOn: "जमा किया गया",
    lastUpdated: "अंतिम बार अपडेट किया गया",
    applicationId: "आवेदन आईडी",
    underReview: "समीक्षाधीन",
    documentPending: "दस्तावेज लंबित",
    rejected: "अस्वीकृत",
    addNewApplication: "नया आवेदन जोड़ें",
    updateStatus: "स्थिति अपडेट करें",

    // Common
    loading: "लोड हो रहा है...",
    error: "त्रुटि",
    success: "सफलता",
    save: "सहेजें",
    cancel: "रद्द करें",
    edit: "संपादित करें",
    delete: "हटाएं",
    close: "बंद करें",
    search: "खोजें",
    filter: "फ़िल्टर",
    apply: "आवेदन करें",
    submit: "जमा करें",
    next: "अगला",
    previous: "पिछला",

    // Footer
    footerDescription: "सरकारी योजनाओं और लाभों तक आसान पहुंच के साथ नागरिकों को सशक्त बनाना।",
    quickLinks: "त्वरित लिंक",
    aboutUs: "हमारे बारे में",
    contactUs: "संपर्क करें",
    privacyPolicy: "गोपनीयता नीति",
    terms: "नियम और शर्तें",
    support: "सहायता",
    helpCenter: "सहायता केंद्र",
    faq: "अक्सर पूछे जाने वाले प्रश्न",
    guidelines: "दिशानिर्देश",
    connect: "जुड़ें",
    allRightsReserved: "सभी अधिकार सुरक्षित।",

    // States
    maharashtra: "महाराष्ट्र",
    karnataka: "कर्नाटक",
    tamilNadu: "तमिल नाडु",
    gujarat: "गुजरात",
    rajasthan: "राजस्थान",
    westBengal: "पश्चिम बंगाल",
    madhyaPradesh: "मध्य प्रदेश",
    uttarPradesh: "उत्तर प्रदेश",
    kerala: "केरल",
    punjab: "पंजाब",
  },
};

const LanguageContext = createContext<LanguageContextType | null>(null);

interface LanguageProviderProps {
  children: ReactNode;
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  const [language, setLanguage] = useState<Language>("en");

  useEffect(() => {
    const savedLanguage = localStorage.getItem("language") as Language;
    if (savedLanguage && (savedLanguage === "en" || savedLanguage === "hi")) {
      setLanguage(savedLanguage);
    }
  }, []);

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem("language", lang);
  };

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations.en] || key;
  };

  const value: LanguageContextType = {
    language,
    setLanguage: handleSetLanguage,
    t,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}

export { LanguageContext };

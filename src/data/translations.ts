/**
 * Complete Translation Map for Manpower Hub
 */

export const translations: Record<string, any> = {
  // ── Navigation ──────────────────────────────────────────────────────────────
  nav: {
    siteName:        { BN: 'ম্যানপাওয়ার হাব',  EN: 'Manpower Hub' },
    home:            { BN: 'হোম',              EN: 'Home' },
    workerList:      { BN: '👥 কর্মী তালিকা',    EN: '👥 Worker List' },
    jobSearch:       { BN: '💼 জব তালিকা', EN: '💼 Job List' },
    login:           { BN: 'লগইন',             EN: 'Login' },
    register:        { BN: 'নিবন্ধন',          EN: 'Register' },
    logout:          { BN: 'লগআউট',            EN: 'Logout' },
    myProfile:       { BN: 'আমার প্রোফাইল',  EN: 'My Profile' },
    toggleLang:      { BN: 'English',          EN: 'বাংলা' },
    jobOpportunities:{ BN: 'কাজের সুযোগ',    EN: 'Jobs Board' }
  },

  // ── Hero Section ────────────────────────────────────────────────────────────
  hero: {
    title:    { BN: 'বিশ্বস্ত ও দক্ষ স্থানীয় জনবল খুঁজুন', EN: 'Find Trusted & Skilled Local Workers' },
    subtitle: {
      BN: 'বাংলাদেশের সর্বত্র সকল বিভাগ, জেলা, থানা ও ইউনিয়নের যাচাইকৃত পেশাদার কর্মী, বিশেষজ্ঞ ও ব্যবসায়ীদের সাথে সংযুক্ত হোন।',
      EN: 'Connect with verified professional workers, specialists, and merchants from all divisions, districts, and sub-districts of Bangladesh.',
    },
    searchPlaceholder: { BN: 'ইলেকট্রিশিয়ান, ডাক্তার, দর্জি...', EN: 'Search for electrician, doctor, tailor...' },
    searchBtn:          { BN: 'খুঁজুন',                      EN: 'Search' },
    statsWorkers:       { BN: '৫০০+ যাচাইকৃত পেশাদার',     EN: '500+ Verified Professionals' },
    statsEmployers:     { BN: '২০০+ নিয়োগকারী',            EN: '200+ Employers' },
    statsJobs:          { BN: '১০০০+ সম্পন্ন কাজ',         EN: '1000+ Jobs Done' },
  },

  // ── Trusted Categories Section ───────────────────────────────────────────────
  categories: {
    sectionTitle: { BN: 'নির্ভরযোগ্য ক্যাটাগরি সমূহ',       EN: 'Trusted Categories' },
    sectionSub:   { BN: 'আপনার দৈনন্দিন বা বাণিজ্যিক প্রয়োজনের সেবাটি বেছে নিন', EN: 'Choose the services you need for home or business' },
    construction: { BN: 'নির্মাণ কাজ',                       EN: 'Construction' },
    electrical:   { BN: 'ইলেকট্রিক্যাল',                    EN: 'Electrical' },
    household:    { BN: 'গৃহস্থালি কাজ',                    EN: 'Household Services' },
    officeSupport:{ BN: 'অফিস সাপোর্ট',                     EN: 'Office Support' },
    emergency:    { BN: 'জরুরী সেবা',                        EN: 'Emergency Services' },
    training:     { BN: 'প্রশিক্ষণ ও উন্নয়ন',              EN: 'Training & Skills' },
  },

  // ── Specialist Zone ──────────────────────────────────────────────────────────
  specialists: {
    sectionTitle:      { BN: 'বিশেষজ্ঞ কর্নার',               EN: 'Specialists Zone' },
    sectionSub:        { BN: 'অভিজ্ঞ চিকিৎসক ও প্রকৌশলী বিশেষজ্ঞদের সাথে সরাসরি যোগাযোগ করুন', EN: 'Connect directly with certified doctors, dentists & engineers' },
    generalPhysician:  { BN: 'জেনারেল ফিজিশিয়ান',    EN: 'General Physician' },
    dentist:           { BN: 'দন্ত চিকিৎসক (ডেন্টিস্ট)', EN: 'Dental Specialist' },
    civilEngineer:     { BN: 'সিভিল ইঞ্জিনিয়ার',          EN: 'Civil Engineer' },
    contractor:        { BN: 'ঠিকাদার (কন্ট্রাক্টর)',      EN: 'Contractor' },
  },

  // ── Merchant Hub ─────────────────────────────────────────────────────────────
  merchants: {
    sectionTitle: { BN: 'মার্চেন্ট হাব ও ব্যবসা',           EN: 'Merchant Hub' },
    sectionSub:   { BN: 'স্থানীয় দোকানদার ও পণ্য সরবরাহকারীরা সেবা দিতে প্রস্তুত', EN: 'Find local shops, medicines, and property service agents' },
    grocery:      { BN: 'মুদি ও নিত্যপণ্য',                EN: 'Grocery & Retail' },
    pharmacy:     { BN: 'ফার্মেসী ও মেডিসিন',              EN: 'Pharmacy & Medicine' },
    landServices: { BN: 'ভূমি সেবা',                        EN: 'Land Services' },
  },

  // ── Auth Page ─────────────────────────────────────────────────────────────────
  auth: {
    workerTab:     { BN: 'পেশাদার ও বিশেষজ্ঞ',              EN: 'Worker & Specialist' },
    employerTab:   { BN: 'কাজের নিয়োগকারী',                EN: 'Employer / Hirer' },
    loginTitle:    { BN: 'লগইন করুন',                       EN: 'Access Account (Log In)' },
    registerTitle: { BN: 'নিবন্ধন করুন',                    EN: 'Create Free Account' },
    emailLabel:    { BN: 'ইমেইল এড্রেস',                     EN: 'Email Address' },
    passLabel:     { BN: 'পাসওয়ার্ড',                       EN: 'Security Password' },
    nameLabel:     { BN: 'পূর্ণ নাম',                       EN: 'Your Legal Full Name' },
    phoneLabel:    { BN: 'সচল মোবাইল নম্বর',                EN: 'Active Mobile Number' },
    googleBtn:     { BN: 'গুগল দিয়ে সহজেই সাইন ইন করুন',  EN: 'Continue with Google' },
    loginBtn:      { BN: 'লগইন করুন',                       EN: 'Log In Now' },
    registerBtn:   { BN: 'নিবন্ধন সম্পন্ন করুন',            EN: 'Register Profile' },
    haveAccount:   { BN: 'ইতিমধ্যে অ্যাকাউন্ট আছে?',       EN: 'Already have an account?' },
    noAccount:     { BN: 'নতুন অ্যাকাউন্ট তৈরি করবেন?',    EN: "Don't have an account?" },
    notice: {
      BN: 'নিবন্ধন সম্পন্ন করার পর আপনার প্রোফাইলটি ডিরেক্টরিতে দৃশ্যমান থাকবে। অনুগ্রহ করে প্রোফাইল এডিটে গিয়ে আপনার ছবি ও অভিজ্ঞতা যুক্ত করুন।',
      EN: 'After registration, your profile will be live in the directory. Please update your profile with a photo, portfolio, and experience tags.',
    },
  },

  // ── Profile Form ──────────────────────────────────────────────────────────────
  profile: {
    pageTitle:          { BN: 'আমার প্রোফাইল এডিট করুন',    EN: 'Manage My Profile' },
    fullName:           { BN: 'পূর্ণ নাম (Bangla / English)',EN: 'Full Name' },
    phone:              { BN: 'সরাসরি যোগাযোগের ফোন নম্বর', EN: 'Public Phone Number' },
    age:                { BN: 'আপনার বয়স',                    EN: 'Your Age' },
    gender:             { BN: 'লিঙ্গ',                        EN: 'Gender Selection' },
    male:               { BN: 'প্যাট্রিয়ার্ক / পুরুষ',       EN: 'Male' },
    female:             { BN: 'মহিলা',                        EN: 'Female' },
    other:              { BN: 'অন্যান্য',                    EN: 'Other' },
    location:           { BN: 'কাজের এলাকা / উপজেলা',        EN: 'Location / Sub-district' },
    selectLocation:     { BN: 'এলাকা নির্বাচন করুন',         EN: 'Select Sub-district' },
    fullAddress:        { BN: 'অবস্থান / গ্রাম এবং সড়ক',      EN: 'Full Vill/Road Address' },
    role:               { BN: 'নিবন্ধনের ধরন / মোড',          EN: 'Core Account Profile Mode' },
    primaryCategory:    { BN: 'প্রধান দক্ষতার বিভাগ',        EN: 'Primary Occupational Field' },
    specialties:        { BN: 'বিশেষ অন্যান্য দক্ষতা',        EN: 'Select Special Skills (Multi-select)' },
    experience:         { BN: 'অভিজ্ঞতার কাল (বছর)',          EN: 'Years of Practice' },
    bio:                { BN: 'পরিচিতি এবং যোগ্যতা (বায়ো)', EN: 'About Yourself / Public Profile Bio' },
    aiSuggest:          { BN: 'AI বায়ো জেনারেটর',             EN: 'AI Bio Generator' },
    facebook:           { BN: 'ফেসবুক প্রোফাইল লিংক',         EN: 'Facebook Profile URL' },
    linkedin:           { BN: 'লিংকডইন প্রোফাইল লিংক',       EN: 'LinkedIn Portfolio Link' },
    website:            { BN: 'ওয়েবসাইট লিংক',               EN: 'Personal/Business Website' },
    profilePhoto:       { BN: 'প্রোফাইল ছবির URL',            EN: 'Profile Photo Image URL' },
    saveBtn:            { BN: 'প্রোফাইল তথ্য আপডেট করুন',    EN: 'Save All Changes' },
    saving:             { BN: 'সংরক্ষণ করা হচ্ছে...',        EN: 'Updating record...' },
    successMsg:         { BN: 'প্রোফাইল তথ্য সফলভাবে আপডেট করা হয়েছে!', EN: 'Profile statistics modified successfully!' },
    pendingNotice:      { BN: 'আপনার প্রোফাইল ডিরেক্টরিতে সচল আছে! ডার্ক মোড এবং বাংলা ভাষাতেও আপনার কার্ড শেয়ার করতে পারেন।', EN: 'Your profile has been modified live in the directory. You can test your card with themes and share natively!' },
  },

  // ── Role Labels ───────────────────────────────────────────────────────────────
  roles: {
    worker:     { BN: 'পেশাদার কর্মী (Worker)',   EN: 'Skilled Tradesperson (Worker)' },
    employer:   { BN: 'নিয়োগকারী (Employer)',      EN: 'Hirer / Employer' },
    business:   { BN: 'স্থানীয় মার্চেন্ট (Business)', EN: 'Merchant / Seller (Business)' },
    doctor:     { BN: 'সার্টিফাইড চিসিত্সক (Doctor)',EN: 'Medical Doctor' },
    dentist:    { BN: 'দন্ত রোগ বিশেষজ্ঞ (Dentist)',  EN: 'Dentist Pro' },
    contractor: { BN: 'কন্ট্রাক্টর ঠিকাদার',         EN: 'Civil Contractor' },
    admin:      { BN: 'অ্যাডমিনিস্ট্রেটর',         EN: 'System Admin' },
  },

  // ── Job Categories ────────────────────────────────────────────────────────────
  jobCategories: {
    agriculture_farming:  { BN: 'কৃষি ও খামার পরিচালনা',     EN: 'Agriculture & Farming' },
    beauty_fashion:       { BN: 'অভিনন্দন, বিউটি ও ফ্যাশন',    EN: 'Beauty & Fashion Design' },
    electrician:          { BN: 'অন-কল ইলেকট্রিশিয়ান',       EN: 'On-Call Electrician' },
    construction:         { BN: 'কনস্ট্রাকশন রাজমিস্ত্রি',     EN: 'Masonry & Construction' },
    civil_engineer:       { BN: 'সিভিল ইঞ্জিনিয়ারিং',          EN: 'Civil Engineering' },
    land_services:        { BN: 'জমি জরিপ ও ক্রয়-বিক্রয়',     EN: 'Survey & Land Services' },
    helper:               { BN: 'সহকারী ও দিনমজুর',            EN: 'Assistant Helper' },
    plumber:              { BN: 'প্লাম্বিং পাইপ ফিটিং',        EN: 'Plumber & Pipefitting' },
    painter:              { BN: 'রং মিস্ত্রী ও গৃহসজ্জা',      EN: 'Professional Painter' },
    carpenter:            { BN: 'কাঠমিস্ত্রি ফার্নিচার',      EN: 'Woodworking & Carpenter' },
    ac_technician:        { BN: 'এসি ও ফ্রিজ টেকনিশিয়ান',     EN: 'AC & Fridge Repair' },
    driver:               { BN: 'ড্রাইভার ও চালক',             EN: 'Professional Driver' },
    security_guard:       { BN: 'দারোয়ান ও নিরাপত্তা গ্যারান্টি', EN: 'Security Support' },
    cleaning_services:    { BN: 'পরিচ্ছন্নতা সেবা',              EN: 'Professional Cleaning' },
    cooking_catering:     { BN: 'রান্না ও ক্যাটরিং পরিবেশক',   EN: 'Cooking & Catering' },
    tailoring:            { BN: 'দর্জি ও পোষাক তৈরিকারক',      EN: 'Tailoring & Dressmaker' },
    photography:          { BN: 'ফটোগ্রাফি ও ইভেন্ট কভারেজ',   EN: 'Photography & Media' },
    computer_it:          { BN: 'কম্পিউটার সার্ভিসিং ও আইটি',  EN: 'Computer Hardware & IT' },
    office_support:       { BN: 'অফিস সহকারী ও ক্লার্ক',      EN: 'Admin & Office Support' },
    healthcare:           { BN: 'নার্সিং ও মেডিকেল কেয়ার',     EN: 'Healthcare & Nursing' },
    education_tutoring:   { BN: 'গৃহ শিক্ষক ও কোচিং টিউটর',   EN: 'Home Academic Tutor' },
    delivery_logistics:   { BN: 'হোম ডেলিভারি রাইডার',         EN: 'Delivery & Courier Rider' },
    emergency_services:   { BN: 'জরুরী ফায়ার ও উদ্ধার',        EN: 'Emergency Operations' },
    training_development: { BN: 'কারিগরী প্রশিক্ষণ শিক্ষক',    EN: 'Technical Skills Trainer' },
    grocery_retail:       { BN: 'মুদি ও জেনারেল ষ্টোর',       EN: 'Grocery Retail & Goods' },
    pharmacy_medicine:    { BN: 'ঔষধালয় ফার্মেসী',            EN: 'Pharmacy & Drug Store' },
    general_physician:    { BN: 'মেডিসিন জেনারেল ফিজিশিয়ান',  EN: 'General Medical Practitioner' },
    dentist_specialist:   { BN: 'দন্ত রোগ বিশারদ ডেন্টিস্ট',   EN: 'Dental Surgeon specialist' },
  },

  // ── Footer ────────────────────────────────────────────────────────────────────
  footer: {
    tagline: {
      BN: 'বাংলাদেশের সর্বত্র নির্ভরযোগ্য ও যাচাইকৃত পেশাদার এবং প্রয়োজনীয় জনবল খোঁজার সেরা আধুনিক সংযোগ মাধ্যম।',
      EN: 'The most trusted countrywide digital portal connecting verified workers, technicians, and specialists across all of Bangladesh.',
    },
    office: {
      BN: 'প্রধান কার্যালয়: রথপাড়া, ভেড়ামারা উপজেলা, কুষ্টিয়া জেলা।',
      EN: 'HQ Office: Rathpara Ward-4, Bheramara, Kushtia, Bangladesh.',
    },
    copyright: {
      BN: '© ২০২৬ ম্যানপাওয়ার হাব - স্থানীয় কর্মসংস্থান ইকোসিস্টেম ডিরেক্টরি। সর্বস্বত্ব সংরক্ষিত।',
      EN: '© 2026 Manpower Hub Directory. Engineered for premium speed & accessibility.',
    },
    quickLinks: { BN: 'সহজ লিংক তালিকা', EN: 'Quick Directory Links' },
    contact:    { BN: 'যোগাযোগ ও সাপোর্ট', EN: 'Contact Support Help' },
  },

  // ── Worker List Page ──────────────────────────────────────────────────────────
  workerList: {
    title:       { BN: 'যাচাইকৃত পেশাদারদের তালিকা', EN: 'Verified Services Directory' },
    subtitle:    { BN: 'বাংলাদেশের সর্বত্র ১০০% নিবন্ধিত, দক্ষ ও প্রয়োজনীয় জনবল এবং কাজের সরাসরি সার্চ বোর্ড', EN: 'Browse and contact active freelance experts, tradespeople & specialists nationwide' },
    filterRole:  { BN: 'মূল প্রকার',               EN: 'Filter Profile Class' },
    filterCat:   { BN: 'দক্ষতা বিভাগ',            EN: 'Filter by Skill Skillset' },
    filterArea:  { BN: 'থানা ও সাকিন',              EN: 'Filter by Upazila (Area)' },
    allRoles:    { BN: 'সব প্রকার অ্যাকাউন্ট',     EN: 'All Profile Types' },
    allCats:     { BN: 'সকল দক্ষতা বিভাগ',        EN: 'All Occupational Skillsets' },
    allAreas:    { BN: 'সকল উপজেলা / থানা',        EN: 'All Sub-districts' },
    noResults:   { BN: 'উক্ত ফিল্টারিং শর্তে কোনো জনবল পাওয়া যায়নি।', EN: 'No service professionals found matching selected criteria.' },
    viewProfile: { BN: 'কার্ড এবং প্রোফাইল দেখুন', EN: 'View Full Bio & Card' },
    verified:    { BN: 'যাচাইকৃত প্রোফাইল',      EN: 'Verified Member' },
    experience:  { BN: 'অভিজ্ঞতা',               EN: 'Experience' },
    years:       { BN: 'বছর',                     EN: 'Years' },
    jobs:        { BN: 'টি সম্পন্ন কাজ',          EN: 'Jobs Completed' },
  },

  // ── Share Buttons ────────────────────────────────────────────────────────────
  share: {
    label:     { BN: 'এই কার্ডটি শেয়ার করুন', EN: 'Share Digital Profile Card' },
    copied:    { BN: 'লিংক কপি করা হয়েছে!',    EN: 'Profile Link Copied!' },
    copyLink:  { BN: 'লিংক কপি করুন',          EN: 'Copy Profile Link' },
    nativeShare: { BN: 'অন্যান্য অ্যাপস',       EN: 'Device Share Menu' },
  },

  // ── Common ────────────────────────────────────────────────────────────────────
  common: {
    loading:     { BN: 'রিপোর্ট লোড করা হচ্ছে...',    EN: 'Loading database assets...' },
    error:       { BN: 'সার্ভার যোগাযোগ ত্রুটি!',     EN: 'Network communication error' },
    retry:       { BN: 'পুনরায় চেষ্টা করুন',         EN: 'Retry Operation' },
    submit:      { BN: 'জমা দিন',                     EN: 'Submit Request' },
    cancel:      { BN: 'বাতিল করুন',                  EN: 'Cancel Operation' },
    viewAll:     { BN: 'সবগুলো দেখুন ➔',              EN: 'Browse Category ➔' },
    rating:      { BN: 'কাস্টমার রেটিং',              EN: 'Rating Metrics' },
    contactUs:   { BN: 'সরাসরি হেল্পলাইন',            EN: 'Call Verification HQ' },
    darkMode:    { BN: 'ডার্ক মোড',                     EN: 'Dark' },
    lightMode:   { BN: 'লাইট মোড',                    EN: 'Light' },
    pending:     { BN: 'অনুমোদন অপেক্ষায়',            EN: 'Verification Pending' },
    approved:    { BN: 'অনুমোদিত',                    EN: 'Fully Verified' },
  }
};

export const LOCATIONS_BN = [
  'কুষ্টিয়া সদর', 'কুমারখালী', 'খোকসা', 'মিরপুর', 'দৌলতপুর',
  'ভেড়ামারা', 'খুলনা সদর', 'দিঘলিয়া', 'ফুলতলা', 'তেরখাদা',
  'ডুমুরিয়া', 'রূপসা', 'পাইকগাছা', 'দাকোপ', 'কয়রা',
];

export const LOCATIONS_EN = [
  'Kushtia Sadar', 'Kumarkhali', 'Khoksa', 'Mirpur', 'Daulatpur',
  'Bheramara', 'Khulna Sadar', 'Dighalia', 'Phultala', 'Terkhada',
  'Dumuria', 'Rupsha', 'Paikgachha', 'Dacope', 'Koyra',
];

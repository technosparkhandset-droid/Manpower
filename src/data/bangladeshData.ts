/**
 * Standard Bangladesh Divisions and Districts Data
 */

export interface BangladeshDivision {
  bn: string;
  en: string;
  districts: { bn: string; en: string }[];
}

export const BANGLADESH_LOCATIONS: Record<string, BangladeshDivision> = {
  dhaka: {
    bn: 'ঢাকা',
    en: 'Dhaka',
    districts: [
      { bn: 'ঢাকা', en: 'Dhaka' },
      { bn: 'গাজীপুর', en: 'Gazipur' },
      { bn: 'নারায়ণগঞ্জ', en: 'Narayanganj' },
      { bn: 'টাঙ্গাইল', en: 'Tangail' },
      { bn: 'ফরিদপুর', en: 'Faridpur' },
      { bn: 'নরসিংদী', en: 'Narsingdi' },
      { bn: 'মানিকগঞ্জ', en: 'Manikganj' },
      { bn: 'মুন্সীগঞ্জ', en: 'Munshiganj' },
      { bn: 'রাজবাড়ী', en: 'Rajbari' },
      { bn: 'মাদারীপুর', en: 'Madaripur' },
      { bn: 'গোপালগঞ্জ', en: 'Gopalganj' },
      { bn: 'শরীয়তপুর', en: 'Shariatpur' },
      { bn: 'কিশোরগঞ্জ', en: 'Kishoreganj' }
    ]
  },
  chattogram: {
    bn: 'চট্টগ্রাম',
    en: 'Chattogram',
    districts: [
      { bn: 'চট্টগ্রাম', en: 'Chattogram' },
      { bn: 'কক্সবাজার', en: 'Cox\'s Bazar' },
      { bn: 'কুমিল্লা', en: 'Cumilla' },
      { bn: 'নোয়াখালী', en: 'Noakhali' },
      { bn: 'ফেনী', en: 'Feni' },
      { bn: 'ব্রাহ্মণবাড়িয়া', en: 'Brahmanbaria' },
      { bn: 'চাঁদপুর', en: 'Chandpur' },
      { bn: 'লক্ষ্মীপুর', en: 'Lakshmipur' },
      { bn: 'রাঙ্গামাটি', en: 'Rangamati' },
      { bn: 'বান্দরবান', en: 'Bandarban' },
      { bn: 'খাগড়াছড়ি', en: 'Khagrachhari' }
    ]
  },
  rajshahi: {
    bn: 'রাজশাহী',
    en: 'Rajshahi',
    districts: [
      { bn: 'রাজশাহী', en: 'Rajshahi' },
      { bn: 'বগুড়া', en: 'Bogura' },
      { bn: 'পাবনা', en: 'Pabna' },
      { bn: 'সিরাজগঞ্জ', en: 'Sirajganj' },
      { bn: 'নওগাঁ', en: 'Naogaon' },
      { bn: 'নাটোর', en: 'Natore' },
      { bn: 'চাঁপাইনবাবগঞ্জ', en: 'Chapainawabganj' },
      { bn: 'জয়পুরহাট', en: 'Joypurhat' }
    ]
  },
  khulna: {
    bn: 'খুলনা',
    en: 'Khulna',
    districts: [
      { bn: 'খুলনা', en: 'Khulna' },
      { bn: 'কুষ্টিয়া', en: 'Kushtia' },
      { bn: 'যশোর', en: 'Jashore' },
      { bn: 'সাতক্ষীরা', en: 'Satkhira' },
      { bn: 'বাগেরহাট', en: 'Bagerhat' },
      { bn: 'ঝিনাইদহ', en: 'Jhenaidah' },
      { bn: 'মাগুরা', en: 'Magura' },
      { bn: 'চুয়াডাঙ্গা', en: 'Chuadanga' },
      { bn: 'মেহেরপুর', en: 'Meherpur' },
      { bn: 'নড়াইল', en: 'Narail' }
    ]
  },
  barishal: {
    bn: 'বরিশাল',
    en: 'Barishal',
    districts: [
      { bn: 'বরিশাল', en: 'Barishal' },
      { bn: 'ভোলা', en: 'Bhola' },
      { bn: 'পটুয়াখালী', en: 'Patuakhali' },
      { bn: 'পিরোজপুর', en: 'Pirojpur' },
      { bn: 'বরগুনা', en: 'Barguna' },
      { bn: 'ঝালকাঠি', en: 'Jhalokati' }
    ]
  },
  sylhet: {
    bn: 'সিলেট',
    en: 'Sylhet',
    districts: [
      { bn: 'সিলেট', en: 'Sylhet' },
      { bn: 'মৌলভীবাজার', en: 'Moulvibazar' },
      { bn: 'হবিগঞ্জ', en: 'Habiganj' },
      { bn: 'সুনামগঞ্জ', en: 'Sunamganj' }
    ]
  },
  rangpur: {
    bn: 'রংপুর',
    en: 'Rangpur',
    districts: [
      { bn: 'রংপুর', en: 'Rangpur' },
      { bn: 'দিনাজপুর', en: 'Dinajpur' },
      { bn: 'গাইবান্ধা', en: 'Gaibandha' },
      { bn: 'কুড়িগ্রাম', en: 'Kurigram' },
      { bn: 'লালমনিরহাট', en: 'Lalmonirhat' },
      { bn: 'নীলফামারী', en: 'Nilphamari' },
      { bn: 'পঞ্চগড়', en: 'Panchagarh' },
      { bn: 'ঠাকুরগাঁও', en: 'Thakurgaon' }
    ]
  },
  mymensingh: {
    bn: 'ময়মনসিংহ',
    en: 'Mymensingh',
    districts: [
      { bn: 'ময়মনসিংহ', en: 'Mymensingh' },
      { bn: 'জামালপুর', en: 'Jamalpur' },
      { bn: 'নেত্রকোণা', en: 'Netrokona' },
      { bn: 'শেরপুর', en: 'Sherpur' }
    ]
  }
};

export const DIVISIONS_LIST = Object.entries(BANGLADESH_LOCATIONS).map(([key, value]) => ({
  key,
  bn: value.bn,
  en: value.en
}));

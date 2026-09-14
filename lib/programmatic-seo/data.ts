/**
 * Programmatic SEO Data Types and Constants
 * ATP Trading
 */

import { Product } from "@/lib/shopify/types";

// Category Page Types
export interface CategoryPageData {
  slug: string;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  metaTitle: string;
  metaDescription: string;
  products: string[]; // Product handles
  benefits: string[];
  benefitsAr: string[];
  relatedCategories: string[];
  faqs: FAQ[];
  faqsAr: FAQ[];
  image: string;
  icon: string;
}

export interface FAQ {
  question: string;
  answer: string;
}

// Location Page Types
export interface LocationPageData {
  city: string;
  cityAr: string;
  service: string;
  serviceAr: string;
  description: string;
  descriptionAr: string;
  metaTitle: string;
  metaDescription: string;
  deliveryInfo: string;
  deliveryInfoAr: string;
  nearbyCities: string[];
  products: string[];
}

// Benefit Page Types
export interface BenefitPageData {
  slug: string;
  benefit: string;
  benefitAr: string;
  productType: string;
  productTypeAr: string;
  description: string;
  descriptionAr: string;
  metaTitle: string;
  metaDescription: string;
  scienceExplanation: string;
  scienceExplanationAr: string;
  benefits: string[];
  benefitsAr: string[];
  howToUse: string[];
  howToUseAr: string[];
  relatedProducts: string[];
  faqs: FAQ[];
  faqsAr: FAQ[];
}

// Ingredient Page Types
export interface IngredientPageData {
  slug: string;
  name: string;
  nameAr: string;
  scientificName?: string;
  description: string;
  descriptionAr: string;
  metaTitle: string;
  metaDescription: string;
  benefits: string[];
  benefitsAr: string[];
  products: string[]; // Product handles containing this ingredient
  safetyInfo: string;
  safetyInfoAr: string;
  relatedIngredients: string[];
}

// Comparison Point Type
export interface ComparisonPoint {
  feature: string;
  featureAr: string;
  optionA: string;
  optionAAr: string;
  optionB: string;
  optionBAr: string;
  winner: "A" | "B" | "tie";
}

// Comparison Page Types
export interface ComparisonPageData {
  slug: string;
  optionA: string;
  optionAAr: string;
  optionB: string;
  optionBAr: string;
  description: string;
  descriptionAr: string;
  metaTitle: string;
  metaDescription: string;
  introText: string;
  introTextAr: string;
  comparisonPoints: ComparisonPoint[];
  verdict: string;
  verdictAr: string;
  recommendation: string;
  recommendationAr: string;
  relatedProductsA: string[];
  relatedProductsB: string[];
  faqs: FAQ[];
  faqsAr: FAQ[];
}

// UAE Cities
export const UAECities = [
  // UAE Cities
  { slug: "dubai", name: "Dubai", nameAr: "دبي", country: "AE" },
  { slug: "abu-dhabi", name: "Abu Dhabi", nameAr: "أبوظبي", country: "AE" },
  { slug: "sharjah", name: "Sharjah", nameAr: "الشارقة", country: "AE" },
  { slug: "ajman", name: "Ajman", nameAr: "عجمان", country: "AE" },
  { slug: "ras-al-khaimah", name: "Ras Al Khaimah", nameAr: "رأس الخيمة", country: "AE" },
  { slug: "fujairah", name: "Fujairah", nameAr: "الفجيرة", country: "AE" },
  { slug: "umm-al-quwain", name: "Umm Al Quwain", nameAr: "أم القيوين", country: "AE" },
  { slug: "al-ain", name: "Al Ain", nameAr: "العين", country: "AE" },
  { slug: "jebel-ali", name: "Jebel Ali", nameAr: "جبل علي", country: "AE" },
  { slug: "khor-fakkan", name: "Khor Fakkan", nameAr: "خورفكان", country: "AE" },
  { slug: "kalba", name: "Kalba", nameAr: "كلباء", country: "AE" },
  { slug: "dibba", name: "Dibba", nameAr: "دبا", country: "AE" },
  // Saudi Arabia
  { slug: "riyadh", name: "Riyadh", nameAr: "الرياض", country: "SA" },
  { slug: "jeddah", name: "Jeddah", nameAr: "جدة", country: "SA" },
  { slug: "dammam", name: "Dammam", nameAr: "الدمام", country: "SA" },
  { slug: "khobar", name: "Khobar", nameAr: "الخبر", country: "SA" },
  // Kuwait
  { slug: "kuwait-city", name: "Kuwait City", nameAr: "مدينة الكويت", country: "KW" },
  // Bahrain
  { slug: "manama", name: "Manama", nameAr: "المنامة", country: "BH" },
  // Qatar
  { slug: "doha", name: "Doha", nameAr: "الدوحة", country: "QA" },
  // Oman
  { slug: "muscat", name: "Muscat", nameAr: "مسقط", country: "OM" },
];

// Service Categories for Location Pages
export const LocationServices = [
  {
    "slug": "ems-training",
    "name": "EMS Training",
    "nameAr": "تدريب EMS",
    "collection": "ems",
    "icon": "Zap"
  },
  {
    "slug": "skincare-products",
    "name": "Skincare Products",
    "nameAr": "منتجات العناية بالبشرة",
    "collection": "amazing-thai-products",
    "icon": "Sparkles"
  },
  {
    "slug": "supplements",
    "name": "Supplements",
    "nameAr": "المكملات الغذائية",
    "collection": "amazing-thai-products",
    "icon": "Heart"
  },
  {
    "slug": "water-technology",
    "name": "Water Technology",
    "nameAr": "تقنية المياه",
    "collection": "water-soil-technology-solutions",
    "icon": "Droplets"
  },
  {
    "slug": "soil-technology",
    "name": "Soil Technology",
    "nameAr": "تقنية التربة",
    "collection": "water-soil-technology-solutions",
    "icon": "Leaf"
  },
  {
    "slug": "hair-care",
    "name": "Hair Care",
    "nameAr": "العناية بالشعر",
    "collection": "amazing-thai-products",
    "icon": "Scissors"
  },
  {
    "slug": "organic-farming",
    "name": "Organic Farming",
    "nameAr": "الزراعة العضوية",
    "collection": "water-soil-technology-solutions",
    "icon": "Sprout"
  },
  {
    "slug": "detox-products",
    "name": "Fibre & Wellness Products",
    "nameAr": "منتجات الألياف والعافية",
    "collection": "amazing-thai-products",
    "icon": "RefreshCw"
  },
  {
    "slug": "collagen-supplements",
    "name": "Collagen Supplements",
    "nameAr": "مكملات الكولاجين",
    "collection": "amazing-thai-products",
    "icon": "Heart"
  },
  {
    "slug": "alkaline-water",
    "name": "Alkaline Water",
    "nameAr": "المياه القلوية",
    "collection": "water-soil-technology-solutions",
    "icon": "Droplets"
  }
];

// Category Definitions
export const CategoryData: Record<string, CategoryPageData> = {
  "ems-training": {
    "slug": "ems-training",
    "name": "EMS Training",
    "nameAr": "تدريب EMS",
    "description": "Professional Electrical Muscle Stimulation (EMS) training equipment and solutions for fitness enthusiasts and healthcare professionals in UAE. Our cutting-edge EMS technology delivers effective workouts in just 20 minutes.",
    "descriptionAr": "معدات وحلول تدريب التحفيز العضلي الكهربائي (EMS) الاحترافية لمحبي اللياقة البدنية والمهنيين الصحيين في الإمارات. توفر تقنية EMS المتطورة لدينا تمارين فعالة في 20 دقيقة فقط.",
    "metaTitle": "EMS Training UAE | Professional EMS Equipment Dubai | ATP Trading",
    "metaDescription": "Discover professional EMS training in UAE. Electrical Muscle Stimulation equipment for fitness, rehabilitation, and sports performance. Shop EMS devices at ATP Trading Dubai.",
    "products": [
      "ems",
      "ems-pro-one-suit"
    ],
    "benefits": [
      "20-minute full-body workouts",
      "Activates 90% of muscle fibers",
      "Perfect for fitness and rehabilitation",
      "Professional-grade equipment",
      "Personal training sessions available"
    ],
    "benefitsAr": [
      "تمارين كاملة الجسم في 20 دقيقة",
      "تنشيط 90٪ من الألياف العضلية",
      "مثالي للياقة البدنية والتأهيل",
      "معدات على مستوى احترافي",
      "جلسات تدريب شخصية متوفرة"
    ],
    "relatedCategories": [
      "supplements",
      "skincare"
    ],
    "faqs": [
      {
        "question": "What is EMS training?",
        "answer": "EMS (Electrical Muscle Stimulation) training uses low-frequency electrical impulses to stimulate muscle contractions. It's 3x more effective than conventional training, activating up to 90% of muscle fibers simultaneously."
      },
      {
        "question": "Is EMS training safe?",
        "answer": "Yes, EMS training is completely safe when conducted with professional equipment and trained specialists. Our devices are ISO certified and used by healthcare professionals worldwide."
      },
      {
        "question": "How long is an EMS session?",
        "answer": "A typical EMS training session lasts 20 minutes, equivalent to 3-4 hours of conventional gym training. Results are visible after just 4-6 sessions."
      }
    ],
    "faqsAr": [
      {
        "question": "ما هو تدريب EMS؟",
        "answer": "يستخدم تدريب EMS (التحفيز العضلي الكهربائي) نبضات كهربائية ذات تردد منخفض لتحفيز تقلصات العضلات. إنه أكثر فعالية 3 مرات من التدريب التقليدي، وينشط ما يصل إلى 90٪ من الألياف العضلية في وقت واحد."
      },
      {
        "question": "هل تدريب EMS آمن؟",
        "answer": "نعم، تدريب EMS آمن تمامًا عند إجرائه بمعدات احترافية وأخصائيين مدربين. أجهزتنا معتمدة من ISO وتستخدمها المتخصصون في الرعاية الصحية في جميع أنحاء العالم."
      },
      {
        "question": "كم تستغرق جلسة EMS؟",
        "answer": "تستمر جلسة تدريب EMS النموذجية 20 دقيقة، ما يعادل 3-4 ساعات من التدريب التقليدي في الصالة الرياضية. النتائج واضحة بعد 4-6 جلسات فقط."
      }
    ],
    "image": "/images/category-ems.jpg",
    "icon": "Zap"
  },
  "skincare": {
    "slug": "skincare",
    "name": "Skincare Products",
    "nameAr": "منتجات العناية بالبشرة",
    "description": "Explore skincare and personal care products from ATP Trading. Compare ingredients, product instructions and suitability before choosing your routine.",
    "descriptionAr": "اكتشف منتجات العناية بالبشرة والعناية الشخصية من ATP Trading. قارن المكونات وتعليمات الاستخدام ومدى ملاءمة المنتج لروتينك.",
    "metaTitle": "Skincare Products UAE | Premium Beauty Products Dubai | ATP Trading",
    "metaDescription": "Browse skincare and personal care products in the UAE. Compare ingredients and instructions, with delivery options shown at checkout.",
    "products": [
      "smone-brightening-cream",
      "dna-hya-facial-cleanser",
      "clear-plus-natural-facial-soap",
      "s-mone-sherbet-sunscreen-spf-50-pa"
    ],
    "benefits": [
      "Check the ingredients on each product",
      "Choose products for your skin concerns",
      "Follow the instructions on the label",
      "Results and tolerance vary between people"
    ],
    "benefitsAr": [
      "راجع مكونات كل منتج",
      "اختر المنتج المناسب لاحتياجات بشرتك",
      "اتبع تعليمات العبوة",
      "تختلف النتائج ومدى التحمل من شخص لآخر"
    ],
    "relatedCategories": [
      "supplements"
    ],
    "faqs": [
      {
        "question": "Are all products suitable for sensitive skin?",
        "answer": "Suitability depends on the complete formula and your sensitivities. Read the label and patch-test a new topical product before wider use."
      },
      {
        "question": "When will I see results?",
        "answer": "There is no guaranteed result or timeline for everyone. Follow the product directions and review how your skin responds."
      }
    ],
    "faqsAr": [
      {
        "question": "هل جميع المنتجات مناسبة للبشرة الحساسة؟",
        "answer": "تعتمد الملاءمة على التركيبة الكاملة وحساسية بشرتك. اقرأ الملصق واختبر المنتج الموضعي الجديد على منطقة صغيرة قبل استخدامه على نطاق أوسع."
      },
      {
        "question": "متى تظهر النتائج؟",
        "answer": "لا توجد نتيجة أو مدة مضمونة للجميع. اتبع تعليمات المنتج وراقب استجابة بشرتك."
      }
    ],
    "image": "/images/collection-supplements-care-coffee.jpg",
    "icon": "Sparkles"
  },
  "supplements": {
    "slug": "supplements",
    "name": "Health Supplements",
    "nameAr": "المكملات الغذائية",
    "description": "Browse collagen, fibre and other food supplements. Compare the formula, serving size and label instructions to make an informed choice.",
    "descriptionAr": "تصفح مكملات الكولاجين والألياف وغيرها من المكملات الغذائية. قارن التركيبة وحجم الحصة وتعليمات الملصق لاختيار ما يناسبك.",
    "metaTitle": "Food Supplements UAE | Collagen & Fibre | ATP Trading",
    "metaDescription": "Explore food supplements at ATP Trading in the UAE. Review ingredients, serving sizes and product instructions before buying.",
    "products": [
      "mores-collagen",
      "phytovy-liv-detox",
      "sod-more"
    ],
    "benefits": [
      "Compare ingredient quantities per serving",
      "Check allergens and suitability",
      "Use the directions for the specific product",
      "Food supplements complement a varied diet"
    ],
    "benefitsAr": [
      "قارن كميات المكونات في الحصة",
      "تحقق من مسببات الحساسية والملاءمة",
      "اتبع تعليمات المنتج المحدد",
      "المكملات الغذائية تكمل النظام الغذائي المتنوع"
    ],
    "relatedCategories": [
      "skincare"
    ],
    "faqs": [
      {
        "question": "Does natural mean safe for everyone?",
        "answer": "No. Suitability depends on ingredients, dose, medicines and health conditions. Ask a qualified healthcare professional when relevant."
      },
      {
        "question": "How should I use a supplement?",
        "answer": "Follow the instructions on that product label. Do not apply a dose or mixing instruction from one supplement to another."
      }
    ],
    "faqsAr": [
      {
        "question": "هل تعني كلمة طبيعي أنه آمن للجميع؟",
        "answer": "لا. تعتمد الملاءمة على المكونات والجرعة والأدوية والحالة الصحية. استشر مختصًا صحيًا عند الحاجة."
      },
      {
        "question": "كيف أستخدم المكمل؟",
        "answer": "اتبع تعليمات ملصق المنتج نفسه. لا تطبق جرعة أو طريقة تحضير مكمل على منتج آخر."
      }
    ],
    "image": "/images/collection-supplements-care-coffee.jpg",
    "icon": "Heart"
  },
  "water-technology": {
    "slug": "water-technology",
    "name": "Water Technology",
    "nameAr": "تقنية المياه",
    "description": "Explore household water filtration options. Choose a system based on your water source, the manufacturer specifications and replacement-filter requirements.",
    "descriptionAr": "اكتشف خيارات ترشيح المياه المنزلية. اختر النظام وفق مصدر المياه ومواصفات الشركة المصنعة ومتطلبات استبدال الفلاتر.",
    "metaTitle": "Water Filtration UAE | Alkaline Water Systems Dubai | ATP Trading",
    "metaDescription": "Browse water filtration products in the UAE. Compare system specifications, replacement filters and maintenance requirements.",
    "products": [
      "alkamag-9-stage-mineral-alkaline-water-filter"
    ],
    "benefits": [
      "Review the model specifications",
      "Check replacement-filter compatibility",
      "Follow the maintenance schedule",
      "Confirm installation requirements before purchase"
    ],
    "benefitsAr": [
      "راجع مواصفات الموديل",
      "تحقق من توافق الفلتر البديل",
      "اتبع جدول الصيانة",
      "تأكد من متطلبات التركيب قبل الشراء"
    ],
    "relatedCategories": [
      "soil-technology",
      "supplements"
    ],
    "faqs": [
      {
        "question": "Does a higher pH prove that water is safer?",
        "answer": "No. Select filtration for the water source and the contaminants you need to address. A pH or ORP reading alone does not establish safety or health benefits."
      },
      {
        "question": "When should I replace a filter?",
        "answer": "Use the replacement interval and water-use limits specified for your model. Contact us to confirm the correct replacement part."
      }
    ],
    "faqsAr": [
      {
        "question": "هل ارتفاع pH يثبت أن المياه أكثر أمانًا؟",
        "answer": "لا. اختر نظام الترشيح وفق مصدر المياه والملوثات المطلوب التعامل معها. قراءة pH أو ORP وحدها لا تثبت السلامة أو الفوائد الصحية."
      },
      {
        "question": "متى أستبدل الفلتر؟",
        "answer": "اتبع فترة الاستبدال وحدود استهلاك المياه المحددة للموديل. تواصل معنا للتأكد من القطعة البديلة المناسبة."
      }
    ],
    "image": "/images/collection-water-soil.jpg",
    "icon": "Droplets"
  },
  "soil-technology": {
    "slug": "soil-technology",
    "name": "Soil Technology",
    "nameAr": "تقنية التربة",
    "description": "Compare soil-care and agricultural products for your growing conditions. Review the intended crop, application rate and product instructions.",
    "descriptionAr": "قارن منتجات العناية بالتربة والزراعة وفق ظروف زراعتك. راجع المحصول المستهدف ومعدل الاستخدام وتعليمات المنتج.",
    "metaTitle": "Organic Soil Enhancers UAE | Agricultural Solutions Dubai | ATP Trading",
    "metaDescription": "Explore soil-care and agricultural products in the UAE. Check application instructions and suitability for your growing conditions.",
    "products": [
      "transform-soil-premium-organic-soil-enhancer-1-kg",
      "transform-plus-full-growth-cycle-agricultural-formula"
    ],
    "benefits": [
      "Choose for your crop and soil conditions",
      "Follow the labelled application rate",
      "Check storage and handling instructions",
      "Results depend on soil, water and growing practice"
    ],
    "benefitsAr": [
      "اختر حسب المحصول وظروف التربة",
      "اتبع معدل الاستخدام على الملصق",
      "راجع تعليمات التخزين والتعامل",
      "تتأثر النتائج بالتربة والمياه وممارسات الزراعة"
    ],
    "relatedCategories": [
      "water-technology",
      "supplements"
    ],
    "faqs": [
      {
        "question": "Will a soil product guarantee a higher yield?",
        "answer": "Yield depends on crop, soil, irrigation, climate and use. A product cannot guarantee the same outcome in every setting."
      },
      {
        "question": "How much should I apply?",
        "answer": "Follow the instructions for the product and crop. Avoid estimating an application rate from a different product."
      }
    ],
    "faqsAr": [
      {
        "question": "هل يضمن منتج التربة زيادة الإنتاج؟",
        "answer": "يعتمد الإنتاج على المحصول والتربة والري والمناخ وطريقة الاستخدام. لا يمكن ضمان النتيجة نفسها في كل الظروف."
      },
      {
        "question": "ما الكمية المناسبة للاستخدام؟",
        "answer": "اتبع تعليمات المنتج والمحصول. تجنب تقدير معدل الاستخدام اعتمادًا على منتج آخر."
      }
    ],
    "image": "/images/collection-water-soil.jpg",
    "icon": "Leaf"
  }
};

// Ingredient Definitions
export const IngredientData: Record<string, IngredientPageData> = {
  "hyaluronic-acid": {
    "slug": "hyaluronic-acid",
    "name": "Hyaluronic Acid",
    "nameAr": "حمض الهيالورونيك",
    "scientificName": "Hyaluronan",
    "description": "Hyaluronic acid is a moisture-binding ingredient used in skincare. The experience and suitability of a product depend on the full formula.",
    "descriptionAr": "حمض الهيالورونيك مكون يرتبط بالماء ويُستخدم في العناية بالبشرة. تعتمد تجربة المنتج وملاءمته على التركيبة الكاملة.",
    "metaTitle": "Hyaluronic Acid | Ingredient Guide | ATP Trading",
    "metaDescription": "Read about hyaluronic acid in skincare and what to check on a product label.",
    "benefits": [
      "Used in moisturising formulas",
      "Compare the complete formula",
      "Follow topical-use instructions"
    ],
    "benefitsAr": [
      "يُستخدم في تركيبات الترطيب",
      "قارن التركيبة الكاملة",
      "اتبع تعليمات الاستخدام الموضعي"
    ],
    "products": [
      "dna-hya-facial-cleanser",
      "smone-brightening-cream"
    ],
    "safetyInfo": "Follow the product label. Patch-test a new topical product and stop if irritation occurs.",
    "safetyInfoAr": "اتبع ملصق المنتج. اختبر المنتج الموضعي الجديد على منطقة صغيرة وتوقف عند حدوث تهيج.",
    "relatedIngredients": [
      "marine-collagen"
    ]
  },
  "marine-collagen": {
    "slug": "marine-collagen",
    "name": "Marine Collagen",
    "nameAr": "الكولاجين البحري",
    "scientificName": "Hydrolyzed Fish Collagen",
    "description": "Collagen supplements are studied for skin hydration and elasticity, but evidence varies with study quality. A benefit or a fixed result cannot be promised for an individual product.",
    "descriptionAr": "تُدرس مكملات الكولاجين لترطيب البشرة ومرونتها، لكن الأدلة تختلف باختلاف جودة الدراسات. لا يمكن ضمان فائدة أو نتيجة محددة لمنتج بعينه.",
    "metaTitle": "Marine Collagen | Ingredient Guide | ATP Trading",
    "metaDescription": "Compare marine collagen ingredients, source and allergen information. Understand the limits of skin-benefit claims.",
    "benefits": [
      "Review the collagen source",
      "Check serving size on the label",
      "Check fish-allergen information"
    ],
    "benefitsAr": [
      "راجع مصدر الكولاجين",
      "تحقق من حجم الحصة على الملصق",
      "راجع معلومات حساسية السمك"
    ],
    "products": [
      "mores-collagen"
    ],
    "safetyInfo": "Follow the specific product label. Ask a healthcare professional about suitability if pregnant, taking medicines or managing a medical condition. Avoid fish-derived collagen if you have a fish allergy.",
    "safetyInfoAr": "اتبع ملصق المنتج المحدد. اسأل مختصًا صحيًا عن الملاءمة في حالة الحمل أو تناول أدوية أو وجود حالة صحية. تجنب الكولاجين المشتق من السمك إذا كنت تعاني من حساسية السمك.",
    "relatedIngredients": [
      "hyaluronic-acid"
    ]
  },
  "sod-enzyme": {
    "slug": "sod-enzyme",
    "name": "SOD Enzyme",
    "nameAr": "إنزيم SOD",
    "scientificName": "Superoxide Dismutase",
    "description": "Superoxide dismutase (SOD) is an enzyme involved in antioxidant processes. Its biological role does not by itself prove a health benefit from an oral supplement.",
    "descriptionAr": "سوبرأوكسيد ديسميوتاز (SOD) إنزيم يشارك في عمليات مضادات الأكسدة. دوره الحيوي لا يثبت وحده فائدة صحية لمكمل يؤخذ عن طريق الفم.",
    "metaTitle": "SOD Enzyme | Ingredient Guide | ATP Trading",
    "metaDescription": "A practical guide to SOD supplement labels and the difference between an ingredient mechanism and product evidence.",
    "benefits": [
      "Review the specific formulation",
      "Check ingredient quantities",
      "Do not treat an ORAC score as proof of health outcomes"
    ],
    "benefitsAr": [
      "راجع التركيبة المحددة",
      "تحقق من كميات المكونات",
      "لا تعتبر رقم ORAC دليلًا على نتائج صحية"
    ],
    "products": [
      "sod-more"
    ],
    "safetyInfo": "Follow the specific product label. Ask a healthcare professional about suitability if pregnant, taking medicines or managing a medical condition.",
    "safetyInfoAr": "اتبع ملصق المنتج المحدد. اسأل مختصًا صحيًا عن الملاءمة في حالة الحمل أو تناول أدوية أو وجود حالة صحية.",
    "relatedIngredients": []
  },
  "psyllium-husk": {
    "slug": "psyllium-husk",
    "name": "Psyllium Husk",
    "nameAr": "قشر السيليوم",
    "scientificName": "Plantago ovata",
    "description": "Psyllium husk is a fibre ingredient from Plantago ovata. Review the product label, fluid instructions and suitability before use.",
    "descriptionAr": "قشور السيليوم مكون ألياف من نبات Plantago ovata. راجع ملصق المنتج وتعليمات السوائل ومدى الملاءمة قبل الاستخدام.",
    "metaTitle": "Psyllium Husk | Ingredient Guide | ATP Trading",
    "metaDescription": "Learn what to check when choosing psyllium fibre products: label instructions, fluid requirements and suitability.",
    "benefits": [
      "Check the amount of fibre per serving",
      "Follow the labelled fluid instructions",
      "Check medicine interactions with a pharmacist"
    ],
    "benefitsAr": [
      "راجع كمية الألياف في الحصة",
      "اتبع تعليمات السوائل على الملصق",
      "تحقق من التداخلات الدوائية مع الصيدلي"
    ],
    "products": [
      "phytovy-liv-detox"
    ],
    "safetyInfo": "Follow the specific product label. Ask a healthcare professional about suitability if pregnant, taking medicines or managing a medical condition.",
    "safetyInfoAr": "اتبع ملصق المنتج المحدد. اسأل مختصًا صحيًا عن الملاءمة في حالة الحمل أو تناول أدوية أو وجود حالة صحية.",
    "relatedIngredients": []
  }
};

// Benefit Page Definitions
export const BenefitData: Record<string, BenefitPageData> = {
  "ems-weight-loss": {
    "slug": "ems-weight-loss",
    "benefit": "Weight Loss with EMS",
    "benefitAr": "فقدان الوزن مع EMS",
    "productType": "EMS Training",
    "productTypeAr": "تدريب EMS",
    "description": "EMS training is scientifically proven to accelerate weight loss by activating multiple muscle groups simultaneously. A 20-minute EMS session burns calories equivalent to 3-4 hours of conventional training.",
    "descriptionAr": "ثبت علميًا أن تدريب EMS يسرع فقدان الوزن عن طريق تنشيط مجموعات عضلية متعددة في وقت واحد. تحرق جلسة EMS لمدة 20 دقيقة سعرات حرارية تعادل 3-4 ساعات من التدريب التقليدي.",
    "metaTitle": "EMS Weight Loss | Burn Fat with Electrical Muscle Stimulation | ATP Trading",
    "metaDescription": "Lose weight faster with EMS training. 20 minutes = 3 hours gym workout. Scientifically proven fat burning. Book EMS sessions in Dubai.",
    "scienceExplanation": "EMS activates up to 90% of muscle fibers simultaneously, including deep muscle layers that are difficult to target with conventional exercise. This creates a higher metabolic demand, leading to increased calorie burn both during and after the session (EPOC effect).",
    "scienceExplanationAr": "ينشط EMS ما يصل إلى 90٪ من الألياف العضلية في وقت واحد، بما في ذلك طبقات العضلات العميقة التي يصعب استهدافها بالتمرين التقليدي. هذا يخلق طلبًا أيضيًا أعلى، مما يؤدي إلى زيادة حرق السعرات الحرارية أثناء الجلسة وبعدها (تأثير EPOC).",
    "benefits": [
      "Burn up to 500 calories per 20-minute session",
      "Continue burning calories for 48 hours after session",
      "Target stubborn fat areas effectively",
      "Build lean muscle while losing fat",
      "No joint stress or impact injuries"
    ],
    "benefitsAr": [
      "حرق ما يصل إلى 500 سعرة حرارية لكل جلسة 20 دقيقة",
      "مواصلة حرق السعرات الحرارية لمدة 48 ساعة بعد الجلسة",
      "استهداف مناطق الدهون العنيدة بفعالية",
      "بناء العضلات النحيفة أثناء فقدان الدهون",
      "لا إجهاد مفصلي أو إصابات صدمة"
    ],
    "howToUse": [
      "Book an initial consultation",
      "Wear comfortable sportswear",
      "20-minute sessions, 1-2 times per week",
      "Combine with healthy diet for best results",
      "Track progress with body composition analysis"
    ],
    "howToUseAr": [
      "احجز استشارة أولية",
      "ارتدي ملابس رياضية مريحة",
      "جلسات 20 دقيقة، 1-2 مرات في الأسبوع",
      "اجمع مع نظام غذائي صحي للحصول على أفضل النتائج",
      "تتبع التقدم مع تحليل التركيب الجسمي"
    ],
    "relatedProducts": [
      "ems",
      "mores-collagen"
    ],
    "faqs": [
      {
        "question": "How much weight can I lose with EMS?",
        "answer": "Results vary, but most clients lose 2-4 kg per month when combining EMS with a healthy diet. Consistency is key - we recommend 2 sessions per week."
      },
      {
        "question": "Is EMS better than gym for weight loss?",
        "answer": "EMS is more time-efficient - 20 minutes equals 3-4 hours at the gym. It's particularly effective for people with busy schedules or those who find traditional exercise challenging."
      }
    ],
    "faqsAr": [
      {
        "question": "كم من الوزن يمكن أن أفقده مع EMS؟",
        "answer": "تختلف النتائج، لكن معظم العملاء يفقدون 2-4 كجم شهريًا عند الجمع بين EMS ونظام غذائي صحي. الاتساق هو المفتاح - نوصي بجلساتين في الأسبوع."
      },
      {
        "question": "هل EMS أفضل من الصالة الرياضية لفقدان الوزن؟",
        "answer": "EMS أكثر كفاءة من حيث الوقت - 20 دقيقة تعادل 3-4 ساعات في الصالة الرياضية. إنه فعال بشكل خاص للأشخاص ذوي الجداول المزدحمة أو أولئك الذين يجدون التمرين التقليدي تحديًا."
      }
    ]
  },
  "collagen-skin-health": {
    "slug": "collagen-skin-health",
    "benefit": "Collagen for Skin Health",
    "benefitAr": "الكولاجين لصحة الجلد",
    "productType": "Marine Collagen Supplements",
    "productTypeAr": "مكملات الكولاجين البحري",
    "description": "Collagen supplements are studied for skin hydration and elasticity, but evidence varies with study quality. A benefit or a fixed result cannot be promised for an individual product.",
    "descriptionAr": "تُدرس مكملات الكولاجين لترطيب البشرة ومرونتها، لكن الأدلة تختلف باختلاف جودة الدراسات. لا يمكن ضمان فائدة أو نتيجة محددة لمنتج بعينه.",
    "metaTitle": "Collagen & Skin | Evidence and Product Choice | ATP Trading",
    "metaDescription": "Understand the limits of collagen research and compare supplement ingredients, allergens and label directions.",
    "scienceExplanation": "A 2025 review of 23 trials found benefits in pooled results, but not in the high-quality studies or studies without pharmaceutical-company funding. This does not establish that every collagen product improves skin.",
    "scienceExplanationAr": "وجدت مراجعة عام 2025 شملت 23 تجربة فوائد عند جمع النتائج، لكنها لم تجدها في الدراسات عالية الجودة أو غير الممولة من شركات دوائية. لا يثبت ذلك أن كل منتج كولاجين يحسن البشرة.",
    "benefits": [
      "Evidence quality matters when comparing claims",
      "A serving size is not a guarantee of results",
      "Check the source and fish-allergen statement",
      "Use product-specific instructions"
    ],
    "benefitsAr": [
      "جودة الأدلة مهمة عند مقارنة الادعاءات",
      "حجم الحصة لا يضمن النتائج",
      "راجع المصدر وبيان حساسية السمك",
      "اتبع تعليمات المنتج المحدد"
    ],
    "howToUse": [
      "Read the full label",
      "Follow the labelled serving size",
      "Check suitability with a clinician if pregnant, taking medicines or managing a condition"
    ],
    "howToUseAr": [
      "اقرأ الملصق كاملًا",
      "اتبع حجم الحصة المحدد",
      "تحقق من الملاءمة مع مختص في حالة الحمل أو تناول أدوية أو وجود حالة صحية"
    ],
    "relatedProducts": [
      "mores-collagen",
      "smone-brightening-cream"
    ],
    "faqs": [
      {
        "question": "Is there a guaranteed time to see results?",
        "answer": "No. Research findings do not support promising a fixed result or timeline for every customer."
      },
      {
        "question": "Is marine collagen always better than bovine?",
        "answer": "The source alone does not prove superior absorption or effectiveness. Compare the complete formula and evidence for the specific product."
      }
    ],
    "faqsAr": [
      {
        "question": "هل توجد مدة مضمونة لظهور النتائج؟",
        "answer": "لا. لا تدعم نتائج الأبحاث وعد كل عميل بنتيجة أو مدة محددة."
      },
      {
        "question": "هل الكولاجين البحري أفضل دائمًا من البقري؟",
        "answer": "المصدر وحده لا يثبت تفوق الامتصاص أو الفعالية. قارن التركيبة الكاملة والأدلة الخاصة بالمنتج."
      }
    ]
  },
  "alkaline-water-benefits": {
    "slug": "alkaline-water-benefits",
    "benefit": "Alkaline Water: What to Compare",
    "benefitAr": "المياه القلوية: ما الذي تقارنه؟",
    "productType": "Water Filtration Systems",
    "productTypeAr": "أنظمة ترشيح المياه",
    "description": "Alkaline water has a higher pH than neutral water. Water quality, filtration and maintenance are separate considerations; a higher pH alone is not a health guarantee.",
    "descriptionAr": "المياه القلوية أعلى في درجة pH من المياه المتعادلة. جودة المياه والترشيح والصيانة أمور منفصلة؛ ارتفاع pH وحده لا يضمن فائدة صحية.",
    "metaTitle": "Alkaline Water | pH, Filtration & Maintenance | ATP Trading",
    "metaDescription": "Compare water pH, filter specifications and maintenance requirements without assuming that alkalinity proves health benefits.",
    "scienceExplanation": "pH describes acidity or alkalinity. It does not identify every contaminant, prove better hydration or show that a filter treats a medical condition. Choose a system using water-quality information and model-specific performance documentation.",
    "scienceExplanationAr": "يصف pH الحموضة أو القلوية. لا يكشف كل الملوثات، ولا يثبت ترطيبًا أفضل أو قدرة الفلتر على علاج حالة صحية. اختر النظام وفق معلومات جودة المياه ووثائق أداء الموديل المحدد.",
    "benefits": [
      "Compare documented filtration performance",
      "Check compatibility with the water source",
      "Budget for replacement filters",
      "Keep the system maintained"
    ],
    "benefitsAr": [
      "قارن أداء الترشيح الموثق",
      "تحقق من الملاءمة لمصدر المياه",
      "احسب تكلفة الفلاتر البديلة",
      "حافظ على صيانة النظام"
    ],
    "howToUse": [
      "Follow the installation manual",
      "Use compatible replacement filters",
      "Follow cleaning and replacement instructions"
    ],
    "howToUseAr": [
      "اتبع دليل التركيب",
      "استخدم فلاتر بديلة متوافقة",
      "اتبع تعليمات التنظيف والاستبدال"
    ],
    "relatedProducts": [
      "alkamag-9-stage-mineral-alkaline-water-filter"
    ],
    "faqs": [
      {
        "question": "Does a higher pH mean healthier water?",
        "answer": "Not by itself. Water safety and filter performance should be assessed separately from pH."
      },
      {
        "question": "How do I choose a filter?",
        "answer": "Compare the documented capabilities, the water source, maintenance needs and total cost. Ask for model-specific information before purchase."
      }
    ],
    "faqsAr": [
      {
        "question": "هل يعني pH أعلى أن المياه صحية أكثر؟",
        "answer": "ليس بحد ذاته. يجب تقييم سلامة المياه وأداء الفلتر بصورة مستقلة عن pH."
      },
      {
        "question": "كيف أختار الفلتر؟",
        "answer": "قارن القدرات الموثقة ومصدر المياه ومتطلبات الصيانة والتكلفة الكاملة. اطلب معلومات الموديل المحدد قبل الشراء."
      }
    ]
  }
};

// FAQ Topics
export const FAQTopics = [
  {
    "slug": "ems-training",
    "name": "EMS Training",
    "nameAr": "تدريب EMS",
    "faqs": [
      {
        "question": "What is EMS training?",
        "answer": "EMS (Electrical Muscle Stimulation) training uses low-frequency electrical impulses to stimulate muscle contractions. It activates up to 90% of muscle fibers simultaneously, making it 3x more effective than conventional training."
      },
      {
        "question": "Is EMS training safe?",
        "answer": "Yes, EMS is completely safe when conducted with professional equipment and certified trainers. Our devices are ISO certified and FDA approved for fitness and rehabilitation use."
      },
      {
        "question": "How long is an EMS session?",
        "answer": "A typical EMS session lasts 20 minutes, equivalent to 3-4 hours of conventional gym training. We recommend 1-2 sessions per week for optimal results."
      },
      {
        "question": "Who can do EMS training?",
        "answer": "EMS is suitable for most adults. However, it's not recommended for pregnant women, people with pacemakers, or those with certain medical conditions. A consultation is required before starting."
      },
      {
        "question": "What should I wear for EMS?",
        "answer": "Wear comfortable sportswear. We provide special EMS suits that are worn over light clothing. The suit has electrodes that deliver the electrical impulses to your muscles."
      }
    ]
  },
  {
    "slug": "shipping-delivery",
    "name": "Shipping & Delivery",
    "nameAr": "الشحن والتوصيل",
    "faqs": [
      {
        "question": "Do you deliver within the UAE?",
        "answer": "Yes. Standard UAE delivery is AED 15 for orders below AED 250 and free from AED 250. Active ATP members receive free UAE delivery."
      },
      {
        "question": "When will my order arrive?",
        "answer": "Check the delivery information shown at checkout. Contact us with your address if you need help confirming delivery arrangements."
      },
      {
        "question": "How can I follow my order?",
        "answer": "Sign in to your account to view your orders and available status information."
      }
    ]
  },
  {
    "slug": "membership",
    "name": "ATP Membership",
    "nameAr": "عضوية ATP",
    "faqs": [
      {
        "question": "Does creating an account make me an ATP member?",
        "answer": "No. A customer account and ATP membership are separate. Membership is paid or granted by the store."
      },
      {
        "question": "What are the paid membership benefits?",
        "answer": "The annual membership is AED 99 with annual renewal, 15% off eligible supplements and personal care, 10% off water and soil products, and free UAE delivery."
      },
      {
        "question": "Can I cancel or request a refund?",
        "answer": "Manage your paid subscription through your account. Membership fees can be refunded within 7 days of purchase or renewal if the benefits have not been used in that period. See the refund policy for details."
      }
    ]
  }
];

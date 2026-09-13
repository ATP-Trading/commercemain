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
  { slug: "ems-training", name: "EMS Training", nameAr: "تدريب EMS", collection: "ems", icon: "Zap" },
  { slug: "skincare-products", name: "Skincare Products", nameAr: "منتجات العناية بالبشرة", collection: "skincare", icon: "Sparkles" },
  { slug: "supplements", name: "Supplements", nameAr: "المكملات الغذائية", collection: "supplements", icon: "Heart" },
  { slug: "water-technology", name: "Water Technology", nameAr: "تقنية المياه", collection: "water-soil-technology-solutions", icon: "Droplets" },
  { slug: "soil-technology", name: "Soil Technology", nameAr: "تقنية التربة", collection: "water-soil-technology-solutions", icon: "Leaf" },
  { slug: "hair-care", name: "Hair Care", nameAr: "العناية بالشعر", collection: "hair-care", icon: "Scissors" },
  { slug: "organic-farming", name: "Organic Farming", nameAr: "الزراعة العضوية", collection: "water-soil-technology-solutions", icon: "Sprout" },
  { slug: "detox-products", name: "Detox Products", nameAr: "منتجات الديتوكس", collection: "supplements", icon: "RefreshCw" },
  { slug: "collagen-supplements", name: "Collagen Supplements", nameAr: "مكملات الكولاجين", collection: "supplements", icon: "Heart" },
  { slug: "alkaline-water", name: "Alkaline Water", nameAr: "المياه القلوية", collection: "water-soil-technology-solutions", icon: "Droplets" },
];

// Category Definitions
export const CategoryData: Record<string, CategoryPageData> = {
  "ems-training": {
    slug: "ems-training",
    name: "EMS Training",
    nameAr: "تدريب EMS",
    description: "Professional Electrical Muscle Stimulation (EMS) training equipment and solutions for fitness enthusiasts and healthcare professionals in UAE. Our cutting-edge EMS technology delivers effective workouts in just 20 minutes.",
    descriptionAr: "معدات وحلول تدريب التحفيز العضلي الكهربائي (EMS) الاحترافية لمحبي اللياقة البدنية والمهنيين الصحيين في الإمارات. توفر تقنية EMS المتطورة لدينا تمارين فعالة في 20 دقيقة فقط.",
    metaTitle: "EMS Training UAE | Professional EMS Equipment Dubai | ATP Trading",
    metaDescription: "Discover professional EMS training in UAE. Electrical Muscle Stimulation equipment for fitness, rehabilitation, and sports performance. Shop EMS devices at ATP Trading Dubai.",
    products: ["ems", "ems-pro-one-suit"],
    benefits: [
      "20-minute full-body workouts",
      "Activates 90% of muscle fibers",
      "Perfect for fitness and rehabilitation",
      "Professional-grade equipment",
      "Personal training sessions available"
    ],
    benefitsAr: [
      "تمارين كاملة الجسم في 20 دقيقة",
      "تنشيط 90٪ من الألياف العضلية",
      "مثالي للياقة البدنية والتأهيل",
      "معدات على مستوى احترافي",
      "جلسات تدريب شخصية متوفرة"
    ],
    relatedCategories: ["supplements", "skincare"],
    faqs: [
      {
        question: "What is EMS training?",
        answer: "EMS (Electrical Muscle Stimulation) training uses low-frequency electrical impulses to stimulate muscle contractions. It's 3x more effective than conventional training, activating up to 90% of muscle fibers simultaneously."
      },
      {
        question: "Is EMS training safe?",
        answer: "Yes, EMS training is completely safe when conducted with professional equipment and trained specialists. Our devices are ISO certified and used by healthcare professionals worldwide."
      },
      {
        question: "How long is an EMS session?",
        answer: "A typical EMS training session lasts 20 minutes, equivalent to 3-4 hours of conventional gym training. Results are visible after just 4-6 sessions."
      }
    ],
    faqsAr: [
      {
        question: "ما هو تدريب EMS؟",
        answer: "يستخدم تدريب EMS (التحفيز العضلي الكهربائي) نبضات كهربائية ذات تردد منخفض لتحفيز تقلصات العضلات. إنه أكثر فعالية 3 مرات من التدريب التقليدي، وينشط ما يصل إلى 90٪ من الألياف العضلية في وقت واحد."
      },
      {
        question: "هل تدريب EMS آمن؟",
        answer: "نعم، تدريب EMS آمن تمامًا عند إجرائه بمعدات احترافية وأخصائيين مدربين. أجهزتنا معتمدة من ISO وتستخدمها المتخصصون في الرعاية الصحية في جميع أنحاء العالم."
      },
      {
        question: "كم تستغرق جلسة EMS؟",
        answer: "تستمر جلسة تدريب EMS النموذجية 20 دقيقة، ما يعادل 3-4 ساعات من التدريب التقليدي في الصالة الرياضية. النتائج واضحة بعد 4-6 جلسات فقط."
      }
    ],
    image: "/images/category-ems.jpg",
    icon: "Zap"
  },
  
  skincare: {
    slug: "skincare",
    name: "Skincare Products",
    nameAr: "منتجات العناية بالبشرة",
    description: "Premium skincare products featuring advanced ingredients like marine collagen, hyaluronic acid, and botanical extracts. Achieve radiant, healthy skin with our scientifically formulated products available in UAE.",
    descriptionAr: "منتجات العناية بالبشرة الفاخرة التي تحتوي على مكونات متقدمة مثل الكولاجين البحري وحمض الهيالورونيك والمستخلصات النباتية. احصلي على بشرة صحية ومشرقة مع منتجاتنا الم formulated علميًا المتوفرة في الإمارات.",
    metaTitle: "Skincare Products UAE | Premium Beauty Products Dubai | ATP Trading",
    metaDescription: "Shop premium skincare products in UAE. Korean beauty, marine collagen, hyaluronic acid formulas. Free delivery in Dubai, Abu Dhabi & across UAE.",
    products: ["smone-brightening-cream", "dna-hya-facial-cleanser", "clear-plus-natural-facial-soap", "s-mone-sherbet-sunscreen-spf-50-pa"],
    benefits: [
      "Korean beauty technology",
      "Marine collagen formulas",
      "Natural botanical extracts",
      "Suitable for all skin types",
      "Dermatologically tested"
    ],
    benefitsAr: [
      "تقنية الجمال الكورية",
      "صيغ الكولاجين البحري",
      "مستخلصات نباتية طبيعية",
      "مناسبة لجميع أنواع البشرة",
      "مختبرة dermatologically"
    ],
    relatedCategories: ["supplements", "ems-training"],
    faqs: [
      {
        question: "Are your skincare products suitable for sensitive skin?",
        answer: "Yes, our skincare products are formulated with gentle, natural ingredients suitable for all skin types, including sensitive skin. All products are dermatologically tested and free from harsh chemicals."
      },
      {
        question: "How long before I see results?",
        answer: "Most customers see visible improvements within 2-4 weeks of consistent use. For best results, follow the recommended skincare routine and use products consistently."
      }
    ],
    faqsAr: [
      {
        question: "هل منتجات العناية بالبشرة مناسبة للبشرة الحساسة؟",
        answer: "نعم، تمت صياغة منتجات العناية بالبشرة لدينا بمكونات طبيعية لطيفة مناسبة لجميع أنواع البشرة، بما في ذلك البشرة الحساسة. جميع المنتجات مختبرة dermatologically وخالية من المواد الكيميائية القاسية."
      },
      {
        question: "كم من الوقت قبل أن أرى النتائج؟",
        answer: "يرى معظم العملاء تحسينات واضحة في غضون 2-4 أسابيع من الاستخدام المنتظم. للحصول على أفضل النتائج، اتبع روتين العناية بالبشرة الموصى به واستخدم المنتجات باستمرار."
      }
    ],
    image: "/images/category-skincare.jpg",
    icon: "Sparkles"
  },
  
  supplements: {
    slug: "supplements",
    name: "Health Supplements",
    nameAr: "المكملات الغذائية",
    description: "Premium health supplements including marine collagen, detox formulas, and antioxidant drinks. Science-backed formulations for wellness, beauty, and vitality. Available across UAE with free delivery.",
    descriptionAr: "مكملات صحية فاخرة تشمل الكولاجين البحري وصيغ الديتوكس ومشروبات مضادات الأكسدة. تركيبات مدعومة بالعلم للعافية والجمال والحيوية. متوفرة في جميع أنحاء الإمارات مع توصيل مجاني.",
    metaTitle: "Health Supplements UAE | Collagen, Detox & Vitamins Dubai | ATP Trading",
    metaDescription: "Buy premium health supplements in UAE. Marine collagen, detox, SOD enzyme, and antioxidant formulas. Free delivery in Dubai and across UAE.",
    products: ["mores-collagen", "phytovy-liv-detox", "sod-more"],
    benefits: [
      "Marine collagen for skin health",
      "Natural detox formulas",
      "High ORAC antioxidant values",
      "Science-backed ingredients",
      "Fast absorption formulas"
    ],
    benefitsAr: [
      "كولاجين بحري لصحة البشرة",
      "صيغ ديتوكس طبيعية",
      "قيم مضادات أكسدة ORAC عالية",
      "مكونات مدعومة بالعلم",
      "صيغ الامتصاص السريع"
    ],
    relatedCategories: ["skincare", "ems-training"],
    faqs: [
      {
        question: "Are your supplements safe?",
        answer: "Yes, all our supplements are made with high-quality, natural ingredients. They are food supplements, not medications. Always consult your healthcare provider if you have medical conditions."
      },
      {
        question: "How should I take collagen supplements?",
        answer: "Mix one sachet with 120ml of cold water and drink once daily. For best results, take consistently for at least 30 days."
      }
    ],
    faqsAr: [
      {
        question: "هل مكملاتك آمنة؟",
        answer: "نعم، جميع مكملاتنا مصنوعة من مكونات طبيعية عالية الجودة. إنها مكملات غذائية، وليست أدوية. استشر مزود الرعاية الصحية الخاص بك دائمًا إذا كنت تعاني من حالات طبية."
      },
      {
        question: "كيف يجب أن آخذ مكملات الكولاجين؟",
        answer: "امزج كيس واحد مع 120 مل من الماء البارد واشرب مرة واحدة يوميًا. للحصول على أفضل النتائج، استخدم باستمرار لمدة 30 يومًا على الأقل."
      }
    ],
    image: "/images/category-supplements.jpg",
    icon: "Heart"
  },
  
  "water-technology": {
    slug: "water-technology",
    name: "Water Technology",
    nameAr: "تقنية المياه",
    description: "Advanced water filtration and alkaline water systems for homes and businesses in UAE. Transform your water quality with our 9-stage mineral alkaline water filters and purification solutions.",
    descriptionAr: "أنظمة ترشيح المياه المتقدمة ومياه القلوية للمنازل والشركات في الإمارات. حول جودة مياهك مع مرشحات المياه المعدنية القلوية ذات 9 مراحل وحلول التنقية لدينا.",
    metaTitle: "Water Filtration UAE | Alkaline Water Systems Dubai | ATP Trading",
    metaDescription: "Buy advanced water filtration systems in UAE. 9-stage alkaline water filters, mineral water technology. Free installation in Dubai, Abu Dhabi & across UAE.",
    products: ["alkamag-9-stage-mineral-alkaline-water-filter"],
    benefits: [
      "9-stage filtration system",
      "Alkaline pH 8.5-9.5",
      "Removes 99% of contaminants",
      "Adds essential minerals",
      "Easy installation & maintenance"
    ],
    benefitsAr: [
      "نظام ترشيح 9 مراحل",
      "قلوي pH 8.5-9.5",
      "يزيل 99٪ من الملوثات",
      "يضيف المعادن الأساسية",
      "سهل التركيب والصيانة"
    ],
    relatedCategories: ["soil-technology", "supplements"],
    faqs: [
      {
        question: "What is alkaline water?",
        answer: "Alkaline water has a pH level between 8.5-9.5, higher than regular drinking water. It contains alkaline minerals and has a negative ORP, which helps neutralize acid in your body."
      },
      {
        question: "How often should I change the filters?",
        answer: "Filter replacement depends on usage and water quality. Generally, pre-filters should be changed every 6 months, and the main filter every 12 months. Our system alerts you when it's time to replace."
      }
    ],
    faqsAr: [
      {
        question: "ما هي المياه القلوية؟",
        answer: "المياه القلوية لها مستوى pH بين 8.5-9.5، أعلى من مياه الشرب العادية. تحتوي على معادن قلوية ولها ORP سلبي، مما يساعد على تحييد الحمض في جسمك."
      },
      {
        question: "كم مرة يجب أن أغير المرشحات؟",
        answer: "يعتمد استبدال المرشح على الاستخدام وجودة المياه. بشكل عام، يجب تغيير المرشحات الأولية كل 6 أشهر، والمرشح الرئيسي كل 12 شهرًا. ينبهك نظامنا عندما يحين وقت الاستبدال."
      }
    ],
    image: "/images/category-water.jpg",
    icon: "Droplets"
  },
  
  "soil-technology": {
    slug: "soil-technology",
    name: "Soil Technology",
    nameAr: "تقنية التربة",
    description: "Premium organic soil enhancers and fertilizers for agriculture and gardening in UAE. Our Transform Soil products improve crop yield, soil health, and plant vitality using natural, lab-tested formulas.",
    descriptionAr: "محسنات التربة العضوية الفاخرة والأسمدة للزراعة والبستنة في الإمارات. تحسن منتجات Transform Soil لدينا محصول المحاصيل وصحة التربة وحيوية النبات باستخدام صيغ طبيعية مختبرة في المختبر.",
    metaTitle: "Organic Soil Enhancers UAE | Agricultural Solutions Dubai | ATP Trading",
    metaDescription: "Buy premium soil enhancers and fertilizers in UAE. Organic soil solutions for farming and gardening. Lab-tested results. Delivery across UAE.",
    products: ["transform-soil-premium-organic-soil-enhancer-1-kg", "transform-plus-full-growth-cycle-agricultural-formula"],
    benefits: [
      "Increases crop yield by up to 40%",
      "100% organic ingredients",
      "Improves soil structure",
      "Lab-tested effectiveness",
      "Reduces fertilizer dependency"
    ],
    benefitsAr: [
      "يزيد إنتاج المحاصيل بنسبة تصل إلى 40٪",
      "مكونات عضوية 100٪",
      "يحسن بنية التربة",
      "فعالية مختبرة في المختبر",
      "يقلل الاعتماد على الأسمدة"
    ],
    relatedCategories: ["water-technology", "supplements"],
    faqs: [
      {
        question: "How does Transform Soil work?",
        answer: "Transform Soil uses a blend of humic acid, biochar, dolomite, and seaweed extract to restore damaged soil, improve nutrient absorption, and stimulate root growth. It balances soil pH and increases microbial activity."
      },
      {
        question: "Is it suitable for home gardens?",
        answer: "Yes, Transform Soil is perfect for both home gardens and large-scale farms. It's easy to use - just dissolve in water and apply to soil around plants."
      }
    ],
    faqsAr: [
      {
        question: "كيف يعمل Transform Soil؟",
        answer: "يستخدم Transform Soil مزيجًا من حمض الهيوميك والفحم الحيوي والدولوميت ومستخلص الأعشاب البحرية لاستعادة التربة التالفة وتحسين امتصاص المغذيات وتحفيز نمو الجذور. يوازن pH التربة ويزيد من النشاط الميكروبي."
      },
      {
        question: "هل هو مناسب للحدائق المنزلية؟",
        answer: "نعم، Transform Soil مثالي لكل من الحدائق المنزلية والمزارع واسعة النطاق. سهل الاستخدام - فقط ذوب في الماء وطبق على التربة حول النباتات."
      }
    ],
    image: "/images/category-soil.jpg",
    icon: "Leaf"
  }
};

// Ingredient Definitions
export const IngredientData: Record<string, IngredientPageData> = {
  "hyaluronic-acid": {
    slug: "hyaluronic-acid",
    name: "Hyaluronic Acid",
    nameAr: "حمض الهيالورونيك",
    scientificName: "Hyaluronan",
    description: "Hyaluronic acid is a powerful humectant that can hold up to 1000x its weight in water. It's naturally found in skin and helps maintain hydration, elasticity, and a youthful appearance.",
    descriptionAr: "حمض الهيالورونيك هو مادة رطبة قوية يمكنها الاحتفاظ بوزن يصل إلى 1000 ضعف وزنها في الماء. يوجد بشكل طبيعي في الجلد ويساعد على الحفاظ على الترطيب والمرونة والمظهر الشبابي.",
    metaTitle: "Hyaluronic Acid Benefits | Skin Hydration Science | ATP Trading",
    metaDescription: "Learn about hyaluronic acid benefits for skin. Science-backed hydration, anti-aging properties. Find hyaluronic acid products at ATP Trading Dubai.",
    benefits: [
      "Intense hydration - holds 1000x water weight",
      "Reduces fine lines and wrinkles",
      "Improves skin elasticity",
      "Suitable for all skin types",
      "Speeds up wound healing"
    ],
    benefitsAr: [
      "ترطيب مكثف - يحمل 1000 ضعف وزن الماء",
      "يقلل الخطوط الدقيقة والتجاعيد",
      "يحسن مرونة الجلد",
      "مناسب لجميع أنواع البشرة",
      "يسرع شفاء الجروح"
    ],
    products: ["dna-hya-facial-cleanser", "smone-brightening-cream"],
    safetyInfo: "Hyaluronic acid is generally safe for all skin types. It's naturally occurring in the body. Patch test recommended for sensitive skin.",
    safetyInfoAr: "حمض الهيالورونيك آمن بشكل عام لجميع أنواع البشرة. إنه موجود بشكل طبيعي في الجسم. يوصى باختبار الرقعة للبشرة الحساسة.",
    relatedIngredients: ["marine-collagen", "vitamin-c", "niacinamide"]
  },
  
  "marine-collagen": {
    slug: "marine-collagen",
    name: "Marine Collagen",
    nameAr: "الكولاجين البحري",
    scientificName: "Hydrolyzed Fish Collagen",
    description: "Marine collagen is derived from fish and provides Type I and Type III collagen, which are essential for skin, hair, and nail health. It's more bioavailable than bovine or porcine collagen.",
    descriptionAr: "يستمد الكولاجين البحري من السمك ويوفر الكولاجين من النوع I والنوع III، وهي ضرورية لصحة الجلد والشعر والأظافر. إنه أكثر توفرًا بيولوجيًا من الكولاجين البقري أو الخنزير.",
    metaTitle: "Marine Collagen Benefits | Skin & Hair Health | ATP Trading",
    metaDescription: "Discover marine collagen benefits for skin, hair, and nails. 10x more absorbable than bovine collagen. Shop marine collagen supplements at ATP Trading.",
    benefits: [
      "10,000mg per serving for maximum results",
      "Improves skin elasticity and hydration",
      "Strengthens hair and nails",
      "No fishy aftertaste",
      "Fast absorption"
    ],
    benefitsAr: [
      "10,000 ملغ لكل وجبة للحصول على أقصى النتائج",
      "يحسن مرونة وترطيب الجلد",
      "يقوي الشعر والأظافر",
      "لا يوجد طعم سمكي",
      "امتصاص سريع"
    ],
    products: ["mores-collagen"],
    safetyInfo: "Not recommended for pregnant women or children. Consult a doctor if under medical treatment. Results may vary by individual.",
    safetyInfoAr: "غير موصى به للنساء الحوامل أو الأطفال. استشر الطبيب إذا كنت تحت العلاج الطبي. قد تختلف النتائج حسب الفرد.",
    relatedIngredients: ["hyaluronic-acid", "vitamin-c", "elastin"]
  },
  
  "sod-enzyme": {
    slug: "sod-enzyme",
    name: "SOD Enzyme",
    nameAr: "إنزيم SOD",
    scientificName: "Superoxide Dismutase",
    description: "SOD (Superoxide Dismutase) is a powerful antioxidant enzyme that neutralizes harmful free radicals at the cellular level. It helps protect DNA, supports immune function, and promotes longevity.",
    descriptionAr: "SOD (سوبرأوكسيد ديسميوتاز) هو إنزيم مضاد للأكسدة قوي يحيد الجذور الحرة الضارة على المستوى الخلوي. يساعد في حماية الحمض النووي، ويدعم وظيفة المناعة، ويعزز طول العمر.",
    metaTitle: "SOD Enzyme Benefits | Cellular Antioxidant Defense | ATP Trading",
    metaDescription: "Learn about SOD enzyme benefits. Powerful antioxidant with ORAC 312,000. Cellular protection and anti-aging. Shop SOD supplements at ATP Trading.",
    benefits: [
      "Neutralizes free radicals at cellular level",
      "Protects DNA from oxidative damage",
      "Supports immune resilience",
      "High ORAC value: 312,000 µmol",
      "Promotes cellular rejuvenation"
    ],
    benefitsAr: [
      "يحيد الجذور الحرة على المستوى الخلوي",
      "يحمي الحمض النووي من التلف التأكسدي",
      "يدعم مرونة المناعة",
      "قيمة ORAC عالية: 312,000 µmol",
      "يعزز تجديد الخلايا"
    ],
    products: ["sod-more"],
    safetyInfo: "Food supplement, not medication. Not suitable for pregnant women or children. Consult healthcare provider before use.",
    safetyInfoAr: "مكمل غذائي، ليس دواء. غير مناسب للنساء الحوامل أو الأطفال. استشر مزود الرعاية الصحية قبل الاستخدام.",
    relatedIngredients: ["glutathione", "coq10", "resveratrol"]
  },
  
  "psyllium-husk": {
    slug: "psyllium-husk",
    name: "Psyllium Husk",
    nameAr: "قشر السيليوم",
    scientificName: "Plantago ovata",
    description: "Psyllium husk is a soluble fiber derived from the seeds of Plantago ovata. It's used for digestive health, detoxification, and weight management. It absorbs water and forms a gel-like substance that aids digestion.",
    descriptionAr: "قشر السيليوم هو ألياف قابلة للذوبان مستمدة من بذور Plantago ovata. يستخدم لصحة الجهاز الهضمي والديتوكس وإدارة الوزن. يمتص الماء ويشكل مادة تشبه الهلام تساعد في الهضم.",
    metaTitle: "Psyllium Husk Benefits | Digestive Health & Detox | ATP Trading",
    metaDescription: "Discover psyllium husk benefits for digestion and detox. Natural fiber supplement. Shop PHYTOVY LIV detox at ATP Trading Dubai.",
    benefits: [
      "Relieves constipation naturally",
      "Binds intestinal toxins",
      "Promotes satiety and weight control",
      "Supports healthy cholesterol levels",
      "Prebiotic fiber for gut health"
    ],
    benefitsAr: [
      "يخفف الإمساك بشكل طبيعي",
      "يربط سموم الأمعاء",
      "يعزز الشبع ومراقبة الوزن",
      "يدعم مستويات الكوليسترول الصحية",
      "ألياف بريبايوتيك لصحة الأمعاء"
    ],
    products: ["phytovy-liv-detox"],
    safetyInfo: "Drink plenty of water when taking psyllium. Not suitable for pregnant women or children. Start with small doses to assess tolerance.",
    safetyInfoAr: "اشرب الكثير من الماء عند تناول السيليوم. غير مناسب للنساء الحوامل أو الأطفال. ابدأ بجرعات صغيرة لتقييم التحمل.",
    relatedIngredients: ["artichoke-extract", "glutathione", "alfalfa"]
  }
};

// Benefit Page Definitions
export const BenefitData: Record<string, BenefitPageData> = {
  "ems-weight-loss": {
    slug: "ems-weight-loss",
    benefit: "Weight Loss with EMS",
    benefitAr: "فقدان الوزن مع EMS",
    productType: "EMS Training",
    productTypeAr: "تدريب EMS",
    description: "EMS training is scientifically proven to accelerate weight loss by activating multiple muscle groups simultaneously. A 20-minute EMS session burns calories equivalent to 3-4 hours of conventional training.",
    descriptionAr: "ثبت علميًا أن تدريب EMS يسرع فقدان الوزن عن طريق تنشيط مجموعات عضلية متعددة في وقت واحد. تحرق جلسة EMS لمدة 20 دقيقة سعرات حرارية تعادل 3-4 ساعات من التدريب التقليدي.",
    metaTitle: "EMS Weight Loss | Burn Fat with Electrical Muscle Stimulation | ATP Trading",
    metaDescription: "Lose weight faster with EMS training. 20 minutes = 3 hours gym workout. Scientifically proven fat burning. Book EMS sessions in Dubai.",
    scienceExplanation: "EMS activates up to 90% of muscle fibers simultaneously, including deep muscle layers that are difficult to target with conventional exercise. This creates a higher metabolic demand, leading to increased calorie burn both during and after the session (EPOC effect).",
    scienceExplanationAr: "ينشط EMS ما يصل إلى 90٪ من الألياف العضلية في وقت واحد، بما في ذلك طبقات العضلات العميقة التي يصعب استهدافها بالتمرين التقليدي. هذا يخلق طلبًا أيضيًا أعلى، مما يؤدي إلى زيادة حرق السعرات الحرارية أثناء الجلسة وبعدها (تأثير EPOC).",
    benefits: [
      "Burn up to 500 calories per 20-minute session",
      "Continue burning calories for 48 hours after session",
      "Target stubborn fat areas effectively",
      "Build lean muscle while losing fat",
      "No joint stress or impact injuries"
    ],
    benefitsAr: [
      "حرق ما يصل إلى 500 سعرة حرارية لكل جلسة 20 دقيقة",
      "مواصلة حرق السعرات الحرارية لمدة 48 ساعة بعد الجلسة",
      "استهداف مناطق الدهون العنيدة بفعالية",
      "بناء العضلات النحيفة أثناء فقدان الدهون",
      "لا إجهاد مفصلي أو إصابات صدمة"
    ],
    howToUse:[
      "Book an initial consultation",
      "Wear comfortable sportswear",
      "20-minute sessions, 1-2 times per week",
      "Combine with healthy diet for best results",
      "Track progress with body composition analysis"
    ],
    howToUseAr: [
      "احجز استشارة أولية",
      "ارتدي ملابس رياضية مريحة",
      "جلسات 20 دقيقة، 1-2 مرات في الأسبوع",
      "اجمع مع نظام غذائي صحي للحصول على أفضل النتائج",
      "تتبع التقدم مع تحليل التركيب الجسمي"
    ],
    relatedProducts: ["ems", "mores-collagen"],
    faqs: [
      {
        question: "How much weight can I lose with EMS?",
        answer: "Results vary, but most clients lose 2-4 kg per month when combining EMS with a healthy diet. Consistency is key - we recommend 2 sessions per week."
      },
      {
        question: "Is EMS better than gym for weight loss?",
        answer: "EMS is more time-efficient - 20 minutes equals 3-4 hours at the gym. It's particularly effective for people with busy schedules or those who find traditional exercise challenging."
      }
    ],
    faqsAr: [
      {
        question: "كم من الوزن يمكن أن أفقده مع EMS؟",
        answer: "تختلف النتائج، لكن معظم العملاء يفقدون 2-4 كجم شهريًا عند الجمع بين EMS ونظام غذائي صحي. الاتساق هو المفتاح - نوصي بجلساتين في الأسبوع."
      },
      {
        question: "هل EMS أفضل من الصالة الرياضية لفقدان الوزن؟",
        answer: "EMS أكثر كفاءة من حيث الوقت - 20 دقيقة تعادل 3-4 ساعات في الصالة الرياضية. إنه فعال بشكل خاص للأشخاص ذوي الجداول المزدحمة أو أولئك الذين يجدون التمرين التقليدي تحديًا."
      }
    ]
  },
  
  "collagen-skin-health": {
    slug: "collagen-skin-health",
    benefit: "Collagen for Skin Health",
    benefitAr: "الكولاجين لصحة الجلد",
    productType: "Marine Collagen Supplements",
    productTypeAr: "مكملات الكولاجين البحري",
    description: "Marine collagen supplements help restore skin's natural collagen levels, improving elasticity, reducing wrinkles, and promoting a radiant, youthful complexion from within.",
    descriptionAr: "تساعد مكملات الكولاجين البحري على استعادة مستويات الكولاجين الطبيعية في الجلد، وتحسين المرونة، وتقليل التجاعيد، وتعزيز بشرة مشرقة وشبابية من الداخل.",
    metaTitle: "Collagen for Skin | Anti-Aging & Skin Elasticity | ATP Trading",
    metaDescription: "Discover how marine collagen improves skin health. Reduce wrinkles, boost elasticity, get glowing skin. Shop collagen supplements at ATP Trading Dubai.",
    scienceExplanation: "After age 25, collagen production decreases by 1-2% annually. Marine collagen peptides are small enough to be absorbed into the bloodstream and reach the skin's dermis layer, where they stimulate fibroblasts to produce new collagen, elastin, and hyaluronic acid.",
    scienceExplanationAr: "بعد سن 25، ينخفض إنتاج الكولاجين بنسبة 1-2٪ سنويًا. ببتيدات الكولاجين البحري صغيرة بما يكفي لتتم امتصاصها في مجرى الدم والوصول إلى طبقة الأدمة في الجلد، حيث تحفز الخلايا الليفية لإنتاج كولاجين وإيلاستين وحمض الهيالورونيك الجديد.",
    benefits: [
      "Reduces wrinkles and fine lines by 25% in 8 weeks",
      "Improves skin elasticity and firmness",
      "Hydrates skin from within",
      "Strengthens hair and nails",
      "Supports joint health and mobility"
    ],
    benefitsAr: [
      "يقلل التجاعيد والخطوط الدقيقة بنسبة 25٪ في 8 أسابيع",
      "يحسن مرونة وثبات الجلد",
      "يرطب الجلد من الداخل",
      "يقوي الشعر والأظافر",
      "يدعم صحة المفاصل والحركة"
    ],
    howToUse: [
      "Take 1 sachet daily",
      "Mix with 120ml cold water",
      "Best taken on empty stomach",
      "Use consistently for 30+ days",
      "Combine with vitamin C for better absorption"
    ],
    howToUseAr: [
      "تناول كيس واحد يوميًا",
      "امزج مع 120 مل ماء بارد",
      "الأفضل تناوله على معدة فارغة",
      "استخدم باستمرار لمدة 30+ يومًا",
      "اجمع مع فيتامين C لامتصاص أفضل"
    ],
    relatedProducts: ["mores-collagen", "smone-brightening-cream"],
    faqs: [
      {
        question: "How long until I see skin improvements?",
        answer: "Most customers notice improved skin hydration within 2 weeks. Visible wrinkle reduction and increased elasticity typically appear after 4-8 weeks of consistent use."
      },
      {
        question: "Is marine collagen better than bovine collagen?",
        answer: "Marine collagen has smaller peptides, making it up to 1.5x more bioavailable than bovine collagen. It's also more sustainable and suitable for pescatarians."
      }
    ],
    faqsAr: [
      {
        question: "كم من الوقت حتى أرى تحسينات في الجلد؟",
        answer: "يلاحظ معظم العملاء تحسنًا في ترطيب الجلد في غضون أسبوعين. يظهر تقليل التجاعيد المرئي وزيادة المرونة عادةً بعد 4-8 أسابيع من الاستخدام المنتظم."
      },
      {
        question: "هل الكولاجين البحري أفضل من الكولاجين البقري؟",
        answer: "يحتوي الكولاجين البحري على ببتيدات أصغر، مما يجعله أكثر توفرًا بيولوجيًا بنسبة تصل إلى 1.5x من الكولاجين البقري. إنه أيضًا أكثر استدامة ومناسب لأكل السمك."
      }
    ]
  },
  
  "alkaline-water-benefits": {
    slug: "alkaline-water-benefits",
    benefit: "Alkaline Water Benefits",
    benefitAr: "فوائد المياه القلوية",
    productType: "Water Filtration Systems",
    productTypeAr: "أنظمة ترشيح المياه",
    description: "Alkaline water with pH 8.5-9.5 helps neutralize acid in the body, improve hydration at the cellular level, and provide essential minerals for overall health and wellness.",
    descriptionAr: "المياه القلوية مع pH 8.5-9.5 تساعد على تحييد الحمض في الجسم، وتحسين الترطيب على المستوى الخلوي، وتوفير المعادن الأساسية للصحة والعافية العامة.",
    metaTitle: "Alkaline Water Benefits | pH Balance & Hydration | ATP Trading",
    metaDescription: "Discover alkaline water benefits. Better hydration, pH balance, essential minerals. Shop alkaline water filters in Dubai, UAE at ATP Trading.",
    scienceExplanation: "Regular tap water has a pH around 7, while alkaline water has pH 8.5-9.5. The higher pH helps neutralize excess acid in the body. Additionally, the negative ORP (Oxidation Reduction Potential) acts as an antioxidant, while added minerals like calcium, magnesium, and potassium support various bodily functions.",
    scienceExplanationAr: "المياه العادية من الحنفية لها pH حوالي 7، بينما المياه القلوية لها pH 8.5-9.5. يساعد pH الأعلى على تحييد الحمض الزائد في الجسم. بالإضافة إلى ذلك، يعمل ORP السلبي (إمكانية الاختزال الأكسدة) كمضاد للأكسدة، بينما تدعم المعادن المضافة مثل الكالسيوم والمغنيسيوم والبوتاسيوم وظائف الجسم المختلفة.",
    benefits: [
      "Better hydration at cellular level",
      "Natural detoxification support",
      "Rich in essential minerals (Ca, Mg, K)",
      "Antioxidant properties (negative ORP)",
      "Improved athletic recovery"
    ],
    benefitsAr: [
      "ترطيب أفضل على المستوى الخلوي",
      "دعم الديتوكس الطبيعي",
      "غني بالمعادن الأساسية (الكالسيوم والمغنيسيوم والبوتاسيوم)",
      "خصائص مضادات الأكسدة (ORP السلبي)",
      "تحسين تعافي الرياضيين"
    ],
    howToUse: [
      "Install ALKAMAG 9-stage filter",
      "Drink 2-3 liters daily",
      "Best consumed 30 minutes before meals",
      "Store in glass or BPA-free containers",
      "Avoid boiling (maintains pH)"
    ],
    howToUseAr: [
      "قم بتثبيت مرشح ALKAMAG ذو 9 مراحل",
      "اشرب 2-3 لتر يوميًا",
      "الأفضل استهلاكه قبل 30 دقيقة من الوجبات",
      "خزن في حاويات زجاجية أو خالية من BPA",
      "تجنب الغليان (يحافظ على pH)"
    ],
    relatedProducts: ["alkamag-9-stage-mineral-alkaline-water-filter"],
    faqs: [
      {
        question: "What pH should alkaline water be?",
        answer: "Optimal alkaline water has a pH between 8.5-9.5. Our ALKAMAG system consistently produces water in this range with a negative ORP of -200 to -400mV."
      },
      {
        question: "Can I drink alkaline water every day?",
        answer: "Yes, alkaline water is safe for daily consumption. Many health experts recommend drinking 2-3 liters daily for optimal hydration and pH balance."
      }
    ],
    faqsAr: [
      {
        question: "ما هو pH المياه القلوية المثلى؟",
        answer: "المياه القلوية المثلى لها pH بين 8.5-9.5. ينتج نظام ALKAMAG لدينا باستمرار مياه في هذا النطاق مع ORP سلبي من -200 إلى -400mV."
      },
      {
        question: "هل يمكنني شرب المياه القلوية كل يوم؟",
        answer: "نعم، المياه القلوية آمنة للاستهلاك اليومي. يوصي العديد من خبراء الصحة بشرب 2-3 لتر يوميًا للحصول على ترطيب مثالي وتوازن pH."
      }
    ]
  }
};

// FAQ Topics
export const FAQTopics = [
  {
    slug: "ems-training",
    name: "EMS Training",
    nameAr: "تدريب EMS",
    faqs: [
      {
        question: "What is EMS training?",
        answer: "EMS (Electrical Muscle Stimulation) training uses low-frequency electrical impulses to stimulate muscle contractions. It activates up to 90% of muscle fibers simultaneously, making it 3x more effective than conventional training."
      },
      {
        question: "Is EMS training safe?",
        answer: "Yes, EMS is completely safe when conducted with professional equipment and certified trainers. Our devices are ISO certified and FDA approved for fitness and rehabilitation use."
      },
      {
        question: "How long is an EMS session?",
        answer: "A typical EMS session lasts 20 minutes, equivalent to 3-4 hours of conventional gym training. We recommend 1-2 sessions per week for optimal results."
      },
      {
        question: "Who can do EMS training?",
        answer: "EMS is suitable for most adults. However, it's not recommended for pregnant women, people with pacemakers, or those with certain medical conditions. A consultation is required before starting."
      },
      {
        question: "What should I wear for EMS?",
        answer: "Wear comfortable sportswear. We provide special EMS suits that are worn over light clothing. The suit has electrodes that deliver the electrical impulses to your muscles."
      }
    ]
  },
  {
    slug: "shipping-delivery",
    name: "Shipping & Delivery",
    nameAr: "الشحن والتوصيل",
    faqs: [
      {
        question: "Do you deliver across UAE?",
        answer: "Yes, we deliver to all Emirates including Dubai, Abu Dhabi, Sharjah, Ajman, Ras Al Khaimah, Fujairah, and Umm Al Quwain. Free delivery on orders over 200 AED."
      },
      {
        question: "How long does delivery take?",
        answer: "Dubai: 1-2 business days. Abu Dhabi & Sharjah: 2-3 business days. Other Emirates: 3-5 business days. Express delivery available for urgent orders."
      },
      {
        question: "What are the delivery charges?",
        answer: "Free delivery on orders over 200 AED. For orders below 200 AED, delivery fee is 25 AED within Dubai and 35-50 AED for other Emirates depending on location."
      },
      {
        question: "Can I track my order?",
        answer: "Yes, you'll receive a tracking number via email and SMS once your order is dispatched. You can track your delivery in real-time through our website or app."
      }
    ]
  },
  {
    slug: "membership",
    name: "ATP Membership",
    nameAr: "عضوية ATP",
    faqs: [
      {
        question: "What is ATP Membership?",
        answer: "ATP Membership is our exclusive loyalty program that gives you 15% off all services and products, plus free delivery on all orders. Membership costs 99 AED per year."
      },
      {
        question: "How do I become a member?",
        answer: "Sign up on our website or in-store. Pay the annual fee of 99 AED. Your membership benefits start immediately and are valid for 12 months from the date of purchase."
      },
      {
        question: "Can I cancel my membership?",
        answer: "Memberships are non-refundable once activated. However, you can choose not to renew after the 12-month period. You'll receive a reminder before renewal."
      }
    ]
  }
];

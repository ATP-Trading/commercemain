"use client";

import { useMemo, useEffect, useState } from "react";
import {
    Sparkles,
    FlaskConical,
    BookOpen,
    ShieldAlert,
    HelpCircle,
    BadgeCheck,
    Ruler,
    Thermometer,
    Package,
    Info,
} from "lucide-react";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { cn } from "@/lib/utils";

// ============================================================================
// Types
// ============================================================================

interface ProductDescriptionSection {
    id: string;
    title: string;
    displayTitle: string;
    content: string;
    icon: React.ReactNode;
    priority: number;
}

interface ProductDescriptionAccordionProps {
    descriptionHtml: string;
    className?: string;
    isRTL?: boolean;
}

// ============================================================================
// Section Configuration — Single Source of Truth
// ============================================================================

type SectionType =
    | 'overview'
    | 'contents'
    | 'benefits'
    | 'ingredients'
    | 'usage'
    | 'storage'
    | 'specifications'
    | 'certifications'
    | 'warnings'
    | 'disclaimer'
    | 'faq';

interface SectionConfig {
    type: SectionType;
    priority: number; // Lower = appears first
    icon: React.ReactNode;
    displayTitle: { en: string; ar: string };
    /**
     * Weighted keywords for fuzzy matching.
     * Each keyword carries a score — the section with the highest total wins.
     * Supports both English and Arabic keywords.
     */
    keywords: { word: string; weight: number }[];
    /** Legacy exact-match patterns (fallback) */
    patterns: RegExp[];
}

const SECTION_CONFIGS: SectionConfig[] = [
    {
        type: 'overview',
        priority: 1,
        icon: <Sparkles className="w-5 h-5 text-amber-500" />,
        displayTitle: { en: 'Overview', ar: 'نظرة عامة' },
        keywords: [
            { word: 'overview', weight: 10 },
            { word: 'about', weight: 8 },
            { word: 'description', weight: 8 },
            { word: 'product overview', weight: 10 },
            { word: 'نظرة عامة', weight: 10 },
            { word: 'نظرة', weight: 6 },
            { word: 'عن المنتج', weight: 9 },
            { word: 'وصف', weight: 7 },
            { word: 'الوصف', weight: 7 },
        ],
        patterns: [
            /^overview:?$/i,
            /^نظرة\s*عامة:?$/i,
            /^about:?$/i,
            /^description:?$/i,
            /^product\s*overview:?$/i,
        ],
    },
    {
        type: 'contents',
        priority: 2,
        icon: <Package className="w-5 h-5 text-purple-500" />,
        displayTitle: { en: "What's Included", ar: 'محتويات الطقم' },
        keywords: [
            { word: 'contents', weight: 9 },
            { word: 'included', weight: 8 },
            { word: "what's included", weight: 10 },
            { word: 'kit contents', weight: 10 },
            { word: 'package contents', weight: 10 },
            { word: 'in the box', weight: 9 },
            { word: 'box contents', weight: 9 },
            { word: 'محتويات', weight: 10 },
            { word: 'محتويات الطقم', weight: 10 },
            { word: 'محتويات العبوة', weight: 10 },
            { word: 'محتويات المنتج', weight: 10 },
            { word: 'يتضمن', weight: 7 },
            { word: 'يشمل', weight: 7 },
        ],
        patterns: [
            /^(what'?s?\s*)?included:?$/i,
            /^(kit|package|box)\s*contents:?$/i,
            /^contents:?$/i,
            /^محتويات(\s*(الطقم|العبوة|المنتج))?:?$/i,
        ],
    },
    {
        type: 'benefits',
        priority: 3,
        icon: <Sparkles className="w-5 h-5 text-amber-500" />,
        displayTitle: { en: 'Key Benefits', ar: 'الفوائد الرئيسية' },
        keywords: [
            { word: 'benefits', weight: 10 },
            { word: 'key benefits', weight: 10 },
            { word: 'main benefits', weight: 10 },
            { word: 'advantages', weight: 8 },
            { word: 'features', weight: 6 },
            { word: 'why', weight: 4 },
            { word: 'الفوائد', weight: 10 },
            { word: 'الفوائد الرئيسية', weight: 10 },
            { word: 'فوائد', weight: 9 },
            { word: 'المميزات', weight: 8 },
            { word: 'مميزات', weight: 7 },
            { word: 'المزايا', weight: 8 },
        ],
        patterns: [
            /^(key\s*)?benefits:?$/i,
            /^main\s*benefits:?$/i,
            /^advantages:?$/i,
            /^الفوائد(\s*الرئيسية)?:?$/i,
            /^فوائد:?$/i,
            /^المميزات:?$/i,
        ],
    },
    {
        type: 'ingredients',
        priority: 4,
        icon: <FlaskConical className="w-5 h-5 text-green-500" />,
        displayTitle: { en: 'Ingredients', ar: 'المكونات' },
        keywords: [
            { word: 'ingredients', weight: 10 },
            { word: 'active ingredients', weight: 10 },
            { word: 'key ingredients', weight: 10 },
            { word: 'main ingredients', weight: 10 },
            { word: 'composition', weight: 8 },
            { word: 'formula', weight: 6 },
            { word: 'المكونات', weight: 10 },
            { word: 'المكونات البارزة', weight: 10 },
            { word: 'المكونات الفعالة', weight: 10 },
            { word: 'المكونات الرئيسية', weight: 10 },
            { word: 'مكونات', weight: 9 },
            { word: 'التركيبة', weight: 8 },
            { word: 'التركيب', weight: 7 },
        ],
        patterns: [
            /^(active\s*|key\s*|main\s*)?ingredients:?$/i,
            /^composition:?$/i,
            /^المكونات(\s*(البارزة|الفعالة|الرئيسية))?:?$/i,
            /^مكونات:?$/i,
            /^التركيبة?:?$/i,
        ],
    },
    {
        type: 'usage',
        priority: 5,
        icon: <BookOpen className="w-5 h-5 text-blue-500" />,
        displayTitle: { en: 'How to Use', ar: 'طريقة الاستخدام' },
        keywords: [
            { word: 'how to use', weight: 10 },
            { word: 'usage', weight: 9 },
            { word: 'directions', weight: 9 },
            { word: 'instructions', weight: 9 },
            { word: 'application', weight: 7 },
            { word: 'how to apply', weight: 10 },
            { word: 'steps', weight: 5 },
            { word: 'method', weight: 5 },
            { word: 'طريقة الاستخدام', weight: 10 },
            { word: 'طريقة', weight: 5 },
            { word: 'الاستخدام', weight: 8 },
            { word: 'كيفية الاستخدام', weight: 10 },
            { word: 'كيفية', weight: 5 },
            { word: 'إرشادات', weight: 8 },
            { word: 'إرشادات الاستخدام', weight: 10 },
            { word: 'تعليمات', weight: 8 },
            { word: 'خطوات', weight: 7 },
        ],
        patterns: [
            /^how\s*to\s*(use|apply):?$/i,
            /^usage:?$/i,
            /^directions:?$/i,
            /^instructions:?$/i,
            /^application:?$/i,
            /^طريقة\s*(الاستخدام)?:?$/i,
            /^كيفية\s*(الاستخدام)?:?$/i,
            /^الاستخدام:?$/i,
            /^إرشادات(\s*الاستخدام)?:?$/i,
        ],
    },
    {
        type: 'storage',
        priority: 6,
        icon: <Thermometer className="w-5 h-5 text-cyan-500" />,
        displayTitle: { en: 'Storage', ar: 'التخزين' },
        keywords: [
            { word: 'storage', weight: 10 },
            { word: 'store', weight: 7 },
            { word: 'shelf life', weight: 9 },
            { word: 'expiry', weight: 7 },
            { word: 'preservation', weight: 7 },
            { word: 'keep', weight: 4 },
            { word: 'التخزين', weight: 10 },
            { word: 'يُخزن', weight: 8 },
            { word: 'يحفظ', weight: 8 },
            { word: 'الحفظ', weight: 8 },
            { word: 'صلاحية', weight: 7 },
            { word: 'تاريخ الصلاحية', weight: 9 },
        ],
        patterns: [
            /^storage(\s*conditions)?:?$/i,
            /^shelf\s*life:?$/i,
            /^التخزين:?$/i,
            /^طريقة\s*التخزين:?$/i,
            /^الحفظ:?$/i,
        ],
    },
    {
        type: 'specifications',
        priority: 7,
        icon: <Ruler className="w-5 h-5 text-indigo-500" />,
        displayTitle: { en: 'Specifications', ar: 'المواصفات' },
        keywords: [
            { word: 'specifications', weight: 10 },
            { word: 'specs', weight: 9 },
            { word: 'technical', weight: 7 },
            { word: 'dimensions', weight: 8 },
            { word: 'weight', weight: 5 },
            { word: 'size', weight: 5 },
            { word: 'details', weight: 4 },
            { word: 'المواصفات', weight: 10 },
            { word: 'المواصفات الفنية', weight: 10 },
            { word: 'التفاصيل', weight: 6 },
            { word: 'الحجم', weight: 5 },
            { word: 'الأبعاد', weight: 8 },
        ],
        patterns: [
            /^(technical\s*)?specifications?:?$/i,
            /^specs:?$/i,
            /^dimensions:?$/i,
            /^المواصفات(\s*الفنية)?:?$/i,
        ],
    },
    {
        type: 'certifications',
        priority: 8,
        icon: <BadgeCheck className="w-5 h-5 text-emerald-500" />,
        displayTitle: { en: 'Certifications', ar: 'الشهادات' },
        keywords: [
            { word: 'certifications', weight: 10 },
            { word: 'certified', weight: 8 },
            { word: 'halal', weight: 7 },
            { word: 'organic', weight: 6 },
            { word: 'fda', weight: 7 },
            { word: 'iso', weight: 7 },
            { word: 'approved', weight: 6 },
            { word: 'الشهادات', weight: 10 },
            { word: 'شهادات', weight: 9 },
            { word: 'معتمد', weight: 7 },
            { word: 'حلال', weight: 7 },
            { word: 'عضوي', weight: 6 },
        ],
        patterns: [
            /^certifications?:?$/i,
            /^certified:?$/i,
            /^الشهادات:?$/i,
            /^شهادات:?$/i,
        ],
    },
    {
        type: 'warnings',
        priority: 9,
        icon: <ShieldAlert className="w-5 h-5 text-red-500" />,
        displayTitle: { en: 'Warnings', ar: 'التحذيرات' },
        keywords: [
            { word: 'warnings', weight: 10 },
            { word: 'warning', weight: 10 },
            { word: 'caution', weight: 9 },
            { word: 'precautions', weight: 9 },
            { word: 'side effects', weight: 8 },
            { word: 'contraindications', weight: 8 },
            { word: 'safety', weight: 6 },
            { word: 'التحذيرات', weight: 10 },
            { word: 'تحذيرات', weight: 10 },
            { word: 'تحذير', weight: 9 },
            { word: 'احتياطات', weight: 9 },
            { word: 'الاحتياطات', weight: 9 },
            { word: 'الأعراض الجانبية', weight: 8 },
            { word: 'موانع الاستعمال', weight: 8 },
            { word: 'موانع', weight: 7 },
        ],
        patterns: [
            /^warnings?:?$/i,
            /^caution:?$/i,
            /^precautions?:?$/i,
            /^side\s*effects?:?$/i,
            /^التحذيرات:?$/i,
            /^تحذيرات?:?$/i,
            /^احتياطات:?$/i,
            /^الاحتياطات:?$/i,
            /^الأعراض\s*الجانبية:?$/i,
        ],
    },
    {
        type: 'disclaimer',
        priority: 10,
        icon: <Info className="w-5 h-5 text-orange-500" />,
        displayTitle: { en: 'Disclaimer', ar: 'تنويه' },
        keywords: [
            { word: 'disclaimer', weight: 10 },
            { word: 'note', weight: 6 },
            { word: 'important', weight: 5 },
            { word: 'notice', weight: 7 },
            { word: 'legal', weight: 6 },
            { word: 'تنويه', weight: 10 },
            { word: 'ملاحظة', weight: 7 },
            { word: 'ملاحظات', weight: 7 },
            { word: 'هام', weight: 6 },
            { word: 'ملحوظة', weight: 7 },
        ],
        patterns: [
            /^disclaimer:?$/i,
            /^note:?$/i,
            /^important(\s*note)?:?$/i,
            /^notice:?$/i,
            /^تنويه:?$/i,
            /^ملاحظة:?$/i,
            /^هام:?$/i,
        ],
    },
    {
        type: 'faq',
        priority: 11,
        icon: <HelpCircle className="w-5 h-5 text-violet-500" />,
        displayTitle: { en: 'FAQ', ar: 'الأسئلة الشائعة' },
        keywords: [
            { word: 'faq', weight: 10 },
            { word: 'frequently asked', weight: 10 },
            { word: 'questions', weight: 7 },
            { word: 'q&a', weight: 10 },
            { word: 'الأسئلة الشائعة', weight: 10 },
            { word: 'أسئلة', weight: 7 },
            { word: 'سؤال وجواب', weight: 10 },
        ],
        patterns: [
            /^faq:?$/i,
            /^frequently\s*asked(\s*questions)?:?$/i,
            /^q\s*&\s*a:?$/i,
            /^الأسئلة\s*(الشائعة)?:?$/i,
        ],
    },
];

// ============================================================================
// Smart Matching Engine
// ============================================================================

/**
 * Normalize text for comparison — strip punctuation, collapse whitespace
 */
function normalizeText(text: string): string {
    return text
        .replace(/[:\-–—.،؛!?]/g, '')
        .replace(/\s+/g, ' ')
        .trim()
        .toLowerCase();
}

/**
 * Identify section type from header text using a two-pass approach:
 * 1. Exact regex match (fast, reliable for known patterns)
 * 2. Keyword scoring (fuzzy, handles variations)
 *
 * Returns the best-matching SectionConfig, or null if no confident match.
 */
function identifySectionType(headerText: string): SectionConfig | null {
    const trimmed = headerText.trim();
    const cleaned = trimmed.replace(/[:\-–—]/g, '').trim();

    // --- Pass 1: Exact regex match ---
    for (const config of SECTION_CONFIGS) {
        for (const pattern of config.patterns) {
            if (pattern.test(cleaned)) {
                return config;
            }
        }
    }

    // --- Pass 2: Keyword scoring ---
    const normalized = normalizeText(trimmed);
    if (normalized.length < 2 || normalized.length > 80) return null;

    let bestConfig: SectionConfig | null = null;
    let bestScore = 0;
    const THRESHOLD = 6; // Minimum score to consider a match

    for (const config of SECTION_CONFIGS) {
        let score = 0;
        for (const { word, weight } of config.keywords) {
            const normalizedWord = normalizeText(word);
            // Exact match with normalized text
            if (normalized === normalizedWord) {
                score += weight * 2; // Double weight for exact match
            }
            // Header contains the keyword
            else if (normalized.includes(normalizedWord)) {
                score += weight;
            }
            // Keyword contains the header (for short headers)
            else if (normalizedWord.includes(normalized) && normalized.length >= 3) {
                score += Math.floor(weight * 0.6);
            }
        }
        if (score > bestScore) {
            bestScore = score;
            bestConfig = config;
        }
    }

    return bestScore >= THRESHOLD ? bestConfig : null;
}

/**
 * Content-based heuristic: detects section type from content patterns
 * when no header match is found.
 */
function inferSectionFromContent(text: string): SectionType | null {
    const lines = text.split('\n').filter(l => l.trim());
    if (lines.length < 2) return null;

    // Check for numbered steps → usage
    const numberedPattern = /^[\d١٢٣٤٥٦٧٨٩٠]+[.):\-]/;
    const stepPattern = /^(step|خطوة)\s*[\d١٢٣٤٥٦٧٨٩٠]+/i;
    const numberedLines = lines.filter(l => numberedPattern.test(l.trim()) || stepPattern.test(l.trim()));
    if (numberedLines.length >= 2 && numberedLines.length / lines.length > 0.5) {
        return 'usage';
    }

    // Check for warning patterns in content
    const warningPatterns = [
        /للاستخدام\s*الخارجي/,
        /تجنب\s*ملامسة/,
        /external\s*use\s*only/i,
        /avoid\s*contact/i,
        /keep\s*out\s*of\s*reach/i,
        /بعيدًا\s*عن\s*متناول/,
        /يُحفظ\s*بعيدًا/,
        /توقف\s*عن\s*الاستخدام/,
        /discontinue\s*use/i,
    ];
    const warningHits = warningPatterns.filter(p => p.test(text)).length;
    if (warningHits >= 2) return 'warnings';

    // Check for storage patterns
    const storagePatterns = [
        /يُخزن|يحفظ|store\s*(in|at)/i,
        /بارد\s*وجاف|cool\s*and\s*dry/i,
        /أشعة\s*الشمس|sunlight|direct\s*light/i,
        /room\s*temperature|درجة\s*حرارة/i,
    ];
    const storageHits = storagePatterns.filter(p => p.test(text)).length;
    if (storageHits >= 2) return 'storage';

    return null;
}

// ============================================================================
// Smart HTML Parser
// ============================================================================

/**
 * Smart HTML parser that handles:
 * 1. Headers in <strong>, <b>, <h1-h6> tags
 * 2. Headers as standalone bold text in paragraphs
 * 3. Plain text headers (standalone short lines that match keywords)
 * 4. Deduplication via Map
 * 5. Content heuristics for unmatched blocks
 * 6. Canonical ordering by priority
 */
function parseDescriptionHtml(
    html: string,
    isRTL: boolean
): ProductDescriptionSection[] {
    if (!html || typeof window === 'undefined') return [];

    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    // Map: sectionType → accumulated contents
    const sectionMap = new Map<SectionType, { config: SectionConfig; contents: string[] }>();
    let introContent: string[] = [];
    let currentSectionType: SectionType | null = null;

    function addToSection(sectionType: SectionType, content: string) {
        const section = sectionMap.get(sectionType);
        if (section) {
            section.contents.push(content);
        }
    }

    function switchSection(config: SectionConfig) {
        currentSectionType = config.type;
        if (!sectionMap.has(config.type)) {
            sectionMap.set(config.type, { config, contents: [] });
        }
    }

    /**
     * Try to detect a section header from text. Returns config if found.
     */
    function tryHeader(text: string): SectionConfig | null {
        const cleaned = text.replace(/[:\-–—]/g, '').trim();
        if (cleaned.length < 2 || cleaned.length > 80) return null;
        return identifySectionType(cleaned);
    }

    /**
     * Process a single DOM node recursively
     */
    function processNode(node: Node): void {
        if (node.nodeType === Node.TEXT_NODE) {
            const text = node.textContent?.trim() || '';
            if (!text) return;

            // Check if standalone text is a header
            const headerConfig = tryHeader(text);
            if (headerConfig && text.length < 60) {
                switchSection(headerConfig);
                return;
            }

            // Add to current section or intro
            if (currentSectionType) {
                addToSection(currentSectionType, text);
            } else {
                introContent.push(text);
            }
            return;
        }

        if (node.nodeType === Node.ELEMENT_NODE) {
            const element = node as Element;
            const tagName = element.tagName.toLowerCase();

            // --- Header elements: strong, b, h1-h6 ---
            const isHeaderElement = ['strong', 'b', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(tagName);

            if (isHeaderElement) {
                const headerText = element.textContent?.trim() || '';
                const headerConfig = tryHeader(headerText);

                if (headerConfig) {
                    switchSection(headerConfig);
                    return; // Skip children — this was a header
                }
                // If the bold/strong text isn't a header, fall through to render as content
            }

            // --- Paragraphs and divs — check first-line header ---
            if (['p', 'div'].includes(tagName)) {
                const fullText = element.textContent?.trim() || '';

                // If the paragraph is short enough it could be a standalone header line
                if (fullText.length < 60) {
                    const headerConfig = tryHeader(fullText);
                    if (headerConfig) {
                        switchSection(headerConfig);
                        return;
                    }
                }

                // Check if first child is a <strong>/<b> that is a header
                const firstChild = element.firstElementChild;
                if (firstChild && ['strong', 'b'].includes(firstChild.tagName.toLowerCase())) {
                    const boldText = firstChild.textContent?.trim() || '';
                    const headerConfig = tryHeader(boldText);
                    if (headerConfig) {
                        switchSection(headerConfig);
                        // Get remaining content after the bold header
                        const remaining = fullText.substring(boldText.length).trim();
                        if (remaining) {
                            addToSection(headerConfig.type, remaining);
                        }
                        return;
                    }
                }

                // Not a header — add the whole paragraph's outerHTML
                if (fullText) {
                    if (currentSectionType) {
                        addToSection(currentSectionType, element.outerHTML);
                    } else {
                        introContent.push(element.outerHTML);
                    }
                }
                return;
            }

            // --- Lists — keep as HTML ---
            if (['ul', 'ol'].includes(tagName)) {
                const listHtml = element.outerHTML;
                if (currentSectionType) {
                    addToSection(currentSectionType, listHtml);
                } else {
                    introContent.push(listHtml);
                }
                return;
            }

            // --- Line breaks — treat next text as potential new section ---
            if (tagName === 'br') {
                return; // Just skip, the text node after it will be processed
            }

            // Recursively process children
            element.childNodes.forEach(child => processNode(child));
        }
    }

    // Process all body children
    doc.body.childNodes.forEach(node => processNode(node));

    // ---- Post-processing ----

    // Build final sections array
    const sections: ProductDescriptionSection[] = [];

    // Handle intro content — merge with overview or create new
    const introText = introContent.join(' ').trim();
    const overviewConfig = SECTION_CONFIGS.find(c => c.type === 'overview')!;

    const existingOverview = sectionMap.get('overview');
    if (existingOverview) {
        if (introText && introText.length > 10) {
            existingOverview.contents.unshift(introText);
        }
    } else if (introText && introText.length > 20) {
        sectionMap.set('overview', {
            config: overviewConfig,
            contents: [introText]
        });
    }

    // Assemble sections from the map
    sectionMap.forEach(({ config, contents }, type) => {
        const content = contents.join('\n').trim();
        if (!content) return;

        // Content-based re-classification: if this was put into a generic section
        // but content heuristics say otherwise, reclassify
        if (type === 'overview' && sections.length === 0) {
            const inferred = inferSectionFromContent(content);
            if (inferred && !sectionMap.has(inferred)) {
                const inferredConfig = SECTION_CONFIGS.find(c => c.type === inferred);
                if (inferredConfig) {
                    sections.push({
                        id: `section-${inferred}`,
                        title: inferred,
                        displayTitle: isRTL ? inferredConfig.displayTitle.ar : inferredConfig.displayTitle.en,
                        content: wrapInParagraphs(content),
                        icon: inferredConfig.icon,
                        priority: inferredConfig.priority,
                    });
                    return;
                }
            }
        }

        sections.push({
            id: `section-${type}`,
            title: type,
            displayTitle: isRTL ? config.displayTitle.ar : config.displayTitle.en,
            content: wrapInParagraphs(content),
            icon: config.icon,
            priority: config.priority,
        });
    });

    // Sort by priority (canonical order)
    sections.sort((a, b) => a.priority - b.priority);

    // If nothing was detected at all, return single overview
    if (sections.length === 0) {
        return [{
            id: 'section-overview',
            title: 'overview',
            displayTitle: isRTL ? overviewConfig.displayTitle.ar : overviewConfig.displayTitle.en,
            content: html,
            icon: overviewConfig.icon,
            priority: 1,
        }];
    }

    return sections;
}

/**
 * Wraps plain text in paragraph tags if it lacks HTML structure.
 */
function wrapInParagraphs(content: string): string {
    if (/<[a-z][\s\S]*>/i.test(content)) {
        return content;
    }
    return `<p>${content}</p>`;
}

// ============================================================================
// Component
// ============================================================================

/**
 * ProductDescriptionAccordion
 *
 * A smart, structured accordion that:
 * - Automatically detects and categorizes sections using keyword scoring + regex
 * - Handles 11 section types with proper icons
 * - Deduplicates same section types
 * - Maintains canonical ordering
 * - Supports RTL for Arabic
 * - Provides visual hierarchy with icons
 */
export function ProductDescriptionAccordion({
    descriptionHtml,
    className,
    isRTL = false,
}: ProductDescriptionAccordionProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const sections = useMemo((): ProductDescriptionSection[] => {
        if (!mounted) return [];
        return parseDescriptionHtml(descriptionHtml, isRTL);
    }, [descriptionHtml, isRTL, mounted]);

    // SSR/hydration guard — show raw HTML during SSR
    if (!mounted) {
        return (
            <div
                className={cn(
                    "prose prose-sm dark:prose-invert max-w-none",
                    isRTL && "text-right",
                    className
                )}
                dangerouslySetInnerHTML={{ __html: descriptionHtml }}
            />
        );
    }

    // If only one section or no structured content, show inline
    if (sections.length <= 1) {
        return (
            <div
                className={cn(
                    "prose prose-sm dark:prose-invert max-w-none",
                    "prose-headings:text-lg prose-headings:font-bold prose-headings:mt-4 prose-headings:mb-2",
                    "prose-p:leading-relaxed prose-p:text-neutral-600 dark:prose-p:text-neutral-400",
                    "prose-ul:my-2 prose-li:my-0.5",
                    isRTL && "text-right",
                    className
                )}
                dangerouslySetInnerHTML={{ __html: sections[0]?.content || descriptionHtml }}
            />
        );
    }

    return (
        <div className={cn("space-y-3", className)} dir={isRTL ? "rtl" : "ltr"}>
            <Accordion
                type="multiple"
                defaultValue={sections.slice(0, 1).map(s => s.id)}
                className="w-full"
            >
                {sections.map((section) => (
                    <AccordionItem
                        key={section.id}
                        value={section.id}
                        className="border border-neutral-200 dark:border-neutral-700 rounded-xl mb-3 overflow-hidden bg-transparent shadow-none"
                    >
                        <AccordionTrigger
                            className={cn(
                                "px-5 py-4 hover:no-underline",
                                "text-base font-bold",
                                isRTL ? "flex-row-reverse text-right" : ""
                            )}
                        >
                            <div className={cn(
                                "flex items-center gap-3",
                                isRTL && "flex-row-reverse"
                            )}>
                                <div className="p-2 rounded-lg bg-neutral-100 dark:bg-neutral-800">
                                    {section.icon}
                                </div>
                                <span className="text-neutral-900 dark:text-neutral-100">{section.displayTitle}</span>
                            </div>
                        </AccordionTrigger>
                        <AccordionContent className="px-5 pb-5 pt-0">
                            {/* Divider */}
                            <div className="h-px bg-gradient-to-r from-transparent via-neutral-200 dark:via-neutral-700 to-transparent mb-4" />

                            {/* Content with enhanced typography */}
                            <div
                                className={cn(
                                    // Base prose styling
                                    "text-[15px] leading-[1.8] text-neutral-600 dark:text-neutral-400",

                                    // Headings inside content
                                    "[&_h1]:text-lg [&_h1]:font-bold [&_h1]:text-neutral-800 dark:[&_h1]:text-neutral-200 [&_h1]:mt-4 [&_h1]:mb-2",
                                    "[&_h2]:text-base [&_h2]:font-semibold [&_h2]:text-neutral-700 dark:[&_h2]:text-neutral-300 [&_h2]:mt-3 [&_h2]:mb-2",
                                    "[&_h3]:text-base [&_h3]:font-medium [&_h3]:text-neutral-700 dark:[&_h3]:text-neutral-300 [&_h3]:mt-2 [&_h3]:mb-1",

                                    // Paragraphs
                                    "[&_p]:mb-3 [&_p]:leading-relaxed",

                                    // Bold/strong text styling
                                    "[&_strong]:font-semibold [&_strong]:text-neutral-800 dark:[&_strong]:text-neutral-200",

                                    // Lists — styled bullets
                                    "[&_ul]:list-none [&_ul]:my-3 [&_ul]:space-y-2",
                                    "[&_ul>li]:relative [&_ul>li]:ps-5",
                                    "[&_ul>li]:before:content-['•'] [&_ul>li]:before:absolute [&_ul>li]:before:start-0 [&_ul>li]:before:text-amber-500 [&_ul>li]:before:font-bold",
                                    "[&_li]:text-neutral-600 dark:[&_li]:text-neutral-400 [&_li]:leading-relaxed",

                                    // Ordered lists
                                    "[&_ol]:list-decimal [&_ol]:my-3 [&_ol]:ps-5 [&_ol]:space-y-2",
                                    "[&_ol>li]:marker:text-amber-500 [&_ol>li]:marker:font-semibold",

                                    // Links
                                    "[&_a]:text-blue-600 dark:[&_a]:text-blue-400 [&_a]:underline [&_a]:hover:text-blue-500",
                                )}
                                dangerouslySetInnerHTML={{ __html: section.content }}
                            />
                        </AccordionContent>
                    </AccordionItem>
                ))}
            </Accordion>
        </div>
    );
}

export default ProductDescriptionAccordion;

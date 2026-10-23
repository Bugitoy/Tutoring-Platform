/**
 * Thanodi — curricula, subject categories and subjects.
 *
 * Structure (matches the tutor "What you teach" screen):
 *   Level (primary | secondary)
 *     └─ System (national = Botswana public curriculum | international = private-school curricula)
 *          └─ Curriculum (PSLE, JCE, BGCSE, BSSE, IGCSE, IB MYP, IB DP, A Level, …)
 *               └─ Category (subject area)
 *                    └─ Subject
 *
 * A tutor offering = { curriculumId, subjectId } or { curriculumId, entireCurriculum: true }.
 *
 * Sources (checked 22 Oct 2026):
 *  - PSLE: BEC PSLE diagnostic report (2023)
 *  - JCE: BEC 2025 JCE summary of provisional results (17 syllabuses, core subjects named)
 *  - BGCSE: BEC "BGCSE Syllabi" page (30 syllabi with codes)
 *  - BSSE: BEC 2025 BGCSE/BSSE summary of results (Phase II OBE syllabuses, grouped
 *          "Fundamentals and Sciences" and "Electives")
 *  - Cambridge Primary: Cambridge International curriculum page (13 subjects with codes)
 *  - Cambridge IGCSE and AS & A Level: Cambridge "What syllabuses are available?" (Jan 2020).
 *          Codes are left out on purpose because several have changed since; confirm
 *          the current list before launch.
 *  - IB DP / MYP: ibo.org curriculum pages. IB PYP subject areas: IB PYP framework.
 */

export type Level = 'primary' | 'secondary';
export type System = 'national' | 'international';
export type Status = 'current' | 'being-introduced' | 'being-phased-out';

export interface Subject {
  id: string;            // stable slug, unique within its curriculum
  name: string;          // display name
  categoryId: string;
  code?: string;         // exam-board syllabus code, where known and current
  core?: boolean;        // compulsory for all students in this curriculum
  note?: string;
}

export interface Category {
  id: string;
  name: string;
}

export interface Curriculum {
  id: string;
  name: string;          // short name shown on cards
  fullName: string;
  family?: string;       // groups related curricula on one card, e.g. 'IB'
  level: Level;
  system: System;
  examBody: string;
  stage: string;         // grades / ages covered
  status: Status;
  allowEntireCurriculum: boolean;
  categories: Category[];
  subjects: Subject[];
  note?: string;
}

const s = (id: string, name: string, categoryId: string, extra: Partial<Subject> = {}): Subject =>
  ({ id, name, categoryId, ...extra });

/* ───────────────────────────── PRIMARY ───────────────────────────── */

const PSLE: Curriculum = {
  id: 'psle',
  name: 'PSLE',
  fullName: 'Primary School Leaving Examination (Botswana)',
  level: 'primary',
  system: 'national',
  examBody: 'Botswana Examinations Council (BEC)',
  stage: 'Standard 1–7',
  status: 'current',
  allowEntireCurriculum: true,
  categories: [
    { id: 'languages', name: 'Languages' },
    { id: 'maths-science', name: 'Mathematics & Science' },
    { id: 'social', name: 'Social & Moral Studies' },
    { id: 'practical', name: 'Practical & Creative' },
  ],
  subjects: [
    s('english', 'English', 'languages'),
    s('setswana', 'Setswana', 'languages'),
    s('mathematics', 'Mathematics', 'maths-science'),
    s('science', 'Science', 'maths-science'),
    s('social-studies', 'Social Studies', 'social'),
    s('reme', 'Religious & Moral Education (REME)', 'social'),
    s('agriculture', 'Agriculture', 'practical'),
    s('capa', 'Creative & Performing Arts (CAPA)', 'practical', {
      note: 'Taught in primary schools but not one of the 7 PSLE examined syllabuses (BEC 2023 report).',
    }),
  ],
};

const IB_PYP: Curriculum = {
  id: 'ib-pyp',
  name: 'IB PYP',
  fullName: 'International Baccalaureate Primary Years Programme',
  family: 'IB',
  level: 'primary',
  system: 'international',
  examBody: 'International Baccalaureate (no external exams)',
  stage: 'Ages 3–12',
  status: 'current',
  allowEntireCurriculum: true,
  categories: [{ id: 'subject-areas', name: 'PYP subject areas' }],
  subjects: [
    s('language', 'Language', 'subject-areas'),
    s('mathematics', 'Mathematics', 'subject-areas'),
    s('science', 'Science', 'subject-areas'),
    s('social-studies', 'Social Studies', 'subject-areas'),
    s('arts', 'Arts', 'subject-areas'),
    s('pspe', 'Personal, Social & Physical Education', 'subject-areas'),
  ],
  note: 'PYP is taught through transdisciplinary themes, so "entire curriculum" is the most common tutor choice.',
};

const CAMBRIDGE_PRIMARY: Curriculum = {
  id: 'cambridge-primary',
  name: 'Cambridge Primary',
  fullName: 'Cambridge Primary (Cambridge international track)',
  family: 'Cambridge',
  level: 'primary',
  system: 'international',
  examBody: 'Cambridge International (Primary Checkpoint at the end of stage 6)',
  stage: 'Stages 1–6, ages 5–11',
  status: 'current',
  allowEntireCurriculum: true,
  categories: [
    { id: 'languages', name: 'English & Languages' },
    { id: 'maths-science', name: 'Mathematics & Science' },
    { id: 'digital', name: 'Computing & Digital' },
    { id: 'humanities', name: 'Humanities' },
    { id: 'arts-wellbeing', name: 'Arts, PE & Wellbeing' },
  ],
  subjects: [
    s('english', 'English', 'languages', { code: '0058' }),
    s('esl', 'English as a Second Language', 'languages', { code: '0057' }),
    s('mfl', 'Modern Foreign Language', 'languages', { code: '0064' }),
    s('mathematics', 'Mathematics', 'maths-science', { code: '0096' }),
    s('science', 'Science', 'maths-science', { code: '0097' }),
    s('computing', 'Computing', 'digital', { code: '0059' }),
    s('digital-literacy', 'Digital Literacy', 'digital', { code: '0072' }),
    s('global-perspectives', 'Global Perspectives', 'humanities', { code: '0838' }),
    s('humanities', 'Humanities', 'humanities', { code: '0065' }),
    s('art-design', 'Art & Design', 'arts-wellbeing', { code: '0067' }),
    s('music', 'Music', 'arts-wellbeing', { code: '0068' }),
    s('pe', 'Physical Education', 'arts-wellbeing', { code: '0069' }),
    s('wellbeing', 'Wellbeing', 'arts-wellbeing', { code: '0034' }),
  ],
};

/* ───────────────────── SECONDARY · NATIONAL (PUBLIC) ───────────────────── */

const JCE: Curriculum = {
  id: 'jce',
  name: 'JCE',
  fullName: 'Junior Certificate Examination (Botswana)',
  level: 'secondary',
  system: 'national',
  examBody: 'Botswana Examinations Council (BEC)',
  stage: 'Form 1–3',
  status: 'current',
  allowEntireCurriculum: true,
  categories: [
    { id: 'languages', name: 'Languages' },
    { id: 'maths-science', name: 'Mathematics & Science' },
    { id: 'humanities', name: 'Humanities & Moral Studies' },
    { id: 'business', name: 'Business' },
    { id: 'technical', name: 'Technical & Practical' },
    { id: 'arts-pe', name: 'Arts & Physical Education' },
  ],
  subjects: [
    s('setswana', 'Setswana', 'languages', { core: true }),
    s('english', 'English', 'languages', { core: true }),
    s('french', 'French', 'languages'),
    s('mathematics', 'Mathematics', 'maths-science', { core: true }),
    s('integrated-science', 'Integrated Science', 'maths-science', { core: true }),
    s('general-science', 'General Science', 'maths-science', { note: 'Private candidates only.' }),
    s('social-studies', 'Social Studies', 'humanities', { core: true }),
    s('moral-education', 'Moral Education', 'humanities', { core: true }),
    s('religious-education', 'Religious Education', 'humanities'),
    s('commerce-office', 'Commerce and Office Procedure', 'business'),
    s('commerce-accounting', 'Commerce and Accounting', 'business'),
    s('agriculture', 'Agriculture', 'technical', { core: true }),
    s('design-technology', 'Design & Technology', 'technical'),
    s('home-economics', 'Home Economics', 'technical'),
    s('art', 'Art', 'arts-pe'),
    s('music', 'Music', 'arts-pe'),
    s('pe', 'Physical Education', 'arts-pe'),
  ],
};

const BGCSE: Curriculum = {
  id: 'bgcse',
  name: 'BGCSE',
  fullName: 'Botswana General Certificate of Secondary Education',
  level: 'secondary',
  system: 'national',
  examBody: 'Botswana Examinations Council (BEC)',
  stage: 'Form 4–5',
  status: 'being-phased-out',
  allowEntireCurriculum: true,
  categories: [
    { id: 'languages', name: 'Languages & Literature' },
    { id: 'mathematics', name: 'Mathematics' },
    { id: 'sciences', name: 'Sciences' },
    { id: 'humanities', name: 'Humanities & Social Sciences' },
    { id: 'business', name: 'Business' },
    { id: 'technology', name: 'Technology' },
    { id: 'agriculture', name: 'Agriculture' },
    { id: 'home-hospitality', name: 'Home Economics & Hospitality' },
    { id: 'arts-pe', name: 'Arts & Physical Education' },
  ],
  subjects: [
    s('english-language', 'English Language', 'languages', { code: '0561' }),
    s('setswana', 'Setswana', 'languages', { code: '0562' }),
    s('literature-english', 'Literature in English', 'languages', { code: '0587' }),
    s('mathematics', 'Mathematics', 'mathematics', { code: '0563' }),
    s('science-single', 'Science Single Award', 'sciences', { code: '0568' }),
    s('science-double', 'Science Double Award', 'sciences', { code: '0569' }),
    s('chemistry', 'Chemistry', 'sciences', { code: '0570' }),
    s('physics', 'Physics', 'sciences', { code: '0571' }),
    s('biology', 'Biology', 'sciences', { code: '0572' }),
    s('human-social-biology', 'Human & Social Biology', 'sciences', { code: '0573' }),
    s('history', 'History', 'humanities', { code: '0583' }),
    s('geography', 'Geography', 'humanities', { code: '0584' }),
    s('social-studies', 'Social Studies', 'humanities', { code: '0585' }),
    s('development-studies', 'Development Studies', 'humanities', { code: '0586' }),
    s('religious-education', 'Religious Education', 'humanities', { code: '0588' }),
    s('commerce', 'Commerce', 'business', { code: '0598' }),
    s('accounting', 'Accounting', 'business', { code: '0614' }),
    s('business-studies', 'Business Studies', 'business', { code: '0615' }),
    s('design-technology', 'Design & Technology', 'technology', { code: '0595' }),
    s('computer-studies', 'Computer Studies', 'technology', { code: '0597' }),
    s('agriculture', 'Agriculture', 'agriculture', { code: '0599' }),
    s('animal-production', 'Animal Production', 'agriculture', { code: '1255' }),
    s('field-crop-production', 'Field Crop Production', 'agriculture', { code: '1256' }),
    s('horticulture', 'Horticulture', 'agriculture', { code: '1257' }),
    s('food-nutrition', 'Food & Nutrition', 'home-hospitality', { code: '0611' }),
    s('fashion-fabric', 'Fashion & Fabric', 'home-hospitality', { code: '0612' }),
    s('home-management', 'Home Management', 'home-hospitality', { code: '0613' }),
    s('hospitality-tourism', 'Hospitality & Tourism Studies', 'home-hospitality', { code: '1254' }),
    s('pe', 'Physical Education', 'arts-pe', { code: '0616' }),
    s('music', 'Music', 'arts-pe', { code: '0617' }),
  ],
  note: 'Legacy BGCSE syllabuses are being replaced subject by subject by BSSE. In 2025, 21 of 46 syllabuses were legacy BGCSE.',
};

const BSSE: Curriculum = {
  id: 'bsse',
  name: 'BSSE',
  fullName: 'Botswana Senior Secondary Education (outcome-based syllabuses)',
  level: 'secondary',
  system: 'national',
  examBody: 'Botswana Examinations Council (BEC)',
  stage: 'Form 4–5',
  status: 'being-introduced',
  allowEntireCurriculum: true,
  categories: [
    { id: 'fundamentals', name: 'Fundamentals' },
    { id: 'sciences', name: 'Sciences' },
    { id: 'business', name: 'Business & Economics' },
    { id: 'humanities', name: 'Humanities' },
    { id: 'technical', name: 'Technical, Design & Agriculture' },
    { id: 'arts-pe', name: 'Arts & Physical Education' },
    { id: 'cambridge-additional', name: 'Additional (Cambridge syllabuses offered by BEC)' },
  ],
  subjects: [
    // BEC: "Fundamentals and Sciences"
    s('english-language', 'English Language', 'fundamentals', { code: '1234' }),
    s('setswana', 'Setswana', 'fundamentals', { code: '1235' }),
    s('general-mathematics', 'General Mathematics', 'fundamentals'),
    s('scientific-mathematics', 'Scientific Mathematics', 'fundamentals'),
    s('physics', 'Physics', 'sciences', { code: '1427' }),
    s('chemistry', 'Chemistry', 'sciences'),
    s('biology', 'Biology', 'sciences'),
    s('general-science', 'General Science', 'sciences', { code: '1430' }),
    // BEC: "Electives"
    s('accounting', 'Accounting', 'business'),
    s('business-management', 'Business Management', 'business'),
    s('economics', 'Economics', 'business', { code: '1443' }),
    s('entrepreneurship', 'Entrepreneurship', 'business'),
    s('geography', 'Geography', 'humanities'),
    s('history', 'History', 'humanities'),
    s('agricultural-science', 'Agricultural Science', 'technical'),
    s('food-studies', 'Food Studies', 'technical'),
    s('textile-clothing-design', 'Textile, Clothing and Design', 'technical'),
    s('innovative-design-aesthetics', 'Innovative Design and Aesthetics', 'technical'),
    s('music', 'Music', 'arts-pe'),
    s('pe', 'Physical Education', 'arts-pe'),
    s('visual-arts', 'Visual Arts', 'arts-pe'),
    // Offered through BEC from Cambridge
    s('additional-mathematics', 'Additional Mathematics', 'cambridge-additional'),
    s('statistics', 'Statistics', 'cambridge-additional'),
    s('french', 'French', 'cambridge-additional'),
  ],
  note:
    'These are the 21 Phase II BSSE syllabuses first examined in 2025, plus 3 Cambridge syllabuses. BEC counts 25 BSSE syllabuses in total. The other 4 are Phase I syllabuses it doesn\'t name individually. They are probably Hospitality & Tourism Studies, Animal Production, Field Crop Production and Horticulture (new-style 125x codes), currently listed under BGCSE. Confirm with BEC.',
};

/* ─────────────────── SECONDARY · INTERNATIONAL (PRIVATE) ─────────────────── */

const IGCSE: Curriculum = {
  id: 'igcse',
  name: 'IGCSE',
  fullName: 'Cambridge IGCSE',
  family: 'Cambridge',
  level: 'secondary',
  system: 'international',
  examBody: 'Cambridge International',
  stage: 'Ages 14–16',
  status: 'current',
  allowEntireCurriculum: true,
  categories: [
    { id: 'english', name: 'English Language & Literature' },
    { id: 'mathematics', name: 'Mathematics' },
    { id: 'sciences', name: 'Sciences' },
    { id: 'humanities', name: 'Humanities & Social Sciences' },
    { id: 'creative-professional', name: 'Creative & Professional' },
    { id: 'languages', name: 'Languages' },
  ],
  subjects: [
    s('english-first', 'English – First Language', 'english'),
    s('english-second', 'English – Second Language', 'english'),
    s('literature-english', 'Literature in English', 'english'),
    s('world-literature', 'World Literature', 'english'),
    s('mathematics', 'Mathematics', 'mathematics'),
    s('additional-mathematics', 'Additional Mathematics', 'mathematics'),
    s('international-mathematics', 'International Mathematics', 'mathematics'),
    s('biology', 'Biology', 'sciences'),
    s('chemistry', 'Chemistry', 'sciences'),
    s('physics', 'Physics', 'sciences'),
    s('combined-science', 'Combined Science', 'sciences'),
    s('coordinated-sciences', 'Co-ordinated Sciences (Double Award)', 'sciences'),
    s('physical-science', 'Physical Science', 'sciences'),
    s('environmental-management', 'Environmental Management', 'sciences'),
    s('agriculture', 'Agriculture', 'sciences'),
    s('development-studies', 'Development Studies', 'humanities'),
    s('economics', 'Economics', 'humanities'),
    s('geography', 'Geography', 'humanities'),
    s('global-perspectives', 'Global Perspectives', 'humanities'),
    s('history', 'History', 'humanities'),
    s('religious-studies', 'Religious Studies', 'humanities'),
    s('sociology', 'Sociology', 'humanities'),
    s('islamiyat', 'Islamiyat', 'humanities'),
    s('latin', 'Latin', 'humanities'),
    s('sanskrit', 'Sanskrit', 'humanities'),
    s('pakistan-studies', 'Pakistan Studies', 'humanities'),
    s('accounting', 'Accounting', 'creative-professional'),
    s('business-studies', 'Business Studies', 'creative-professional'),
    s('computer-science', 'Computer Science', 'creative-professional'),
    s('ict', 'Information & Communication Technology', 'creative-professional'),
    s('enterprise', 'Enterprise', 'creative-professional'),
    s('art-design', 'Art & Design', 'creative-professional'),
    s('design-technology', 'Design & Technology', 'creative-professional'),
    s('drama', 'Drama', 'creative-professional'),
    s('music', 'Music', 'creative-professional'),
    s('pe', 'Physical Education', 'creative-professional'),
    s('food-nutrition', 'Food and Nutrition', 'creative-professional'),
    s('travel-tourism', 'Travel & Tourism', 'creative-professional'),
    s('afrikaans-second', 'Afrikaans – Second Language', 'languages'),
    s('arabic-first', 'Arabic – First Language', 'languages'),
    s('arabic-foreign', 'Arabic – Foreign Language', 'languages'),
    s('bahasa-indonesia', 'Bahasa Indonesia', 'languages'),
    s('chinese-first', 'Chinese – First Language', 'languages'),
    s('chinese-second', 'Chinese – Second Language', 'languages'),
    s('mandarin-foreign', 'Mandarin Chinese – Foreign Language', 'languages'),
    s('french-first', 'French – First Language', 'languages'),
    s('french-foreign', 'French – Foreign Language', 'languages'),
    s('german-first', 'German – First Language', 'languages'),
    s('german-foreign', 'German – Foreign Language', 'languages'),
    s('hindi-second', 'Hindi – Second Language', 'languages'),
    s('isizulu-second', 'IsiZulu – Second Language', 'languages'),
    s('italian-foreign', 'Italian – Foreign Language', 'languages'),
    s('malay-foreign', 'Malay – Foreign Language', 'languages'),
    s('portuguese-first', 'Portuguese – First Language', 'languages'),
    s('spanish-first', 'Spanish – First Language', 'languages'),
    s('spanish-foreign', 'Spanish – Foreign Language', 'languages'),
    s('spanish-literature', 'Spanish – Literature', 'languages'),
    s('swahili', 'Swahili', 'languages'),
    s('thai-first', 'Thai – First Language', 'languages'),
    s('turkish-first', 'Turkish – First Language', 'languages'),
    s('urdu-second', 'Urdu – Second Language', 'languages'),
  ],
  note: 'From Cambridge\'s 2020 syllabus list. Cambridge now says "over 70 subjects, including 30 languages". Check the current list and drop subjects nobody in Botswana takes.',
};

const IB_MYP: Curriculum = {
  id: 'ib-myp',
  name: 'IB MYP',
  fullName: 'International Baccalaureate Middle Years Programme',
  family: 'IB',
  level: 'secondary',
  system: 'international',
  examBody: 'International Baccalaureate',
  stage: 'Ages 11–16',
  status: 'current',
  allowEntireCurriculum: true,
  categories: [{ id: 'subject-groups', name: 'MYP subject groups' }],
  subjects: [
    s('language-literature', 'Language and Literature', 'subject-groups'),
    s('language-acquisition', 'Language Acquisition', 'subject-groups'),
    s('individuals-societies', 'Individuals and Societies', 'subject-groups'),
    s('sciences', 'Sciences', 'subject-groups'),
    s('mathematics', 'Mathematics', 'subject-groups'),
    s('arts', 'Arts', 'subject-groups'),
    s('phe', 'Physical and Health Education', 'subject-groups'),
    s('design', 'Design', 'subject-groups'),
    s('personal-project', 'Personal / Community Project support', 'subject-groups'),
  ],
  note: 'Schools define the courses inside each MYP group, so tutors pick groups rather than named courses.',
};

const IB_DP: Curriculum = {
  id: 'ib-dp',
  name: 'IB Diploma',
  fullName: 'International Baccalaureate Diploma Programme',
  family: 'IB',
  level: 'secondary',
  system: 'international',
  examBody: 'International Baccalaureate',
  stage: 'Ages 16–19',
  status: 'current',
  allowEntireCurriculum: true,
  categories: [
    { id: 'g1', name: 'Group 1 · Studies in Language and Literature' },
    { id: 'g2', name: 'Group 2 · Language Acquisition' },
    { id: 'g3', name: 'Group 3 · Individuals and Societies' },
    { id: 'g4', name: 'Group 4 · Sciences' },
    { id: 'g5', name: 'Group 5 · Mathematics' },
    { id: 'g6', name: 'Group 6 · The Arts' },
    { id: 'core', name: 'DP Core' },
  ],
  subjects: [
    s('lang-a-literature', 'Language A: Literature', 'g1'),
    s('lang-a-lang-lit', 'Language A: Language and Literature', 'g1'),
    s('literature-performance', 'Literature and Performance', 'g1', { note: 'Interdisciplinary: counts for Groups 1 and 6.' }),
    s('language-b', 'Language B', 'g2'),
    s('language-ab-initio', 'Language Ab Initio', 'g2'),
    s('classical-languages', 'Classical Languages', 'g2'),
    s('business-management', 'Business Management', 'g3'),
    s('digital-society', 'Digital Society', 'g3'),
    s('economics', 'Economics', 'g3'),
    s('geography', 'Geography', 'g3'),
    s('global-politics', 'Global Politics', 'g3'),
    s('history', 'History', 'g3'),
    s('philosophy', 'Philosophy', 'g3'),
    s('psychology', 'Psychology', 'g3'),
    s('social-cultural-anthropology', 'Social and Cultural Anthropology', 'g3'),
    s('world-religions', 'World Religions', 'g3'),
    s('biology', 'Biology', 'g4'),
    s('chemistry', 'Chemistry', 'g4'),
    s('physics', 'Physics', 'g4'),
    s('computer-science', 'Computer Science', 'g4'),
    s('design-technology', 'Design Technology', 'g4'),
    s('sehs', 'Sports, Exercise and Health Science', 'g4'),
    s('ess', 'Environmental Systems and Societies', 'g4', { note: 'Interdisciplinary: counts for Groups 3 and 4.' }),
    s('maths-aa', 'Mathematics: Analysis and Approaches', 'g5'),
    s('maths-ai', 'Mathematics: Applications and Interpretation', 'g5'),
    s('dance', 'Dance', 'g6'),
    s('film', 'Film', 'g6'),
    s('music', 'Music', 'g6'),
    s('theatre', 'Theatre', 'g6'),
    s('visual-arts', 'Visual Arts', 'g6'),
    s('tok', 'Theory of Knowledge', 'core'),
    s('extended-essay', 'Extended Essay', 'core'),
    s('cas', 'Creativity, Activity, Service', 'core'),
  ],
  note: 'Most DP subjects run at SL and HL. Consider storing level (SL/HL) on the offering.',
};

const A_LEVEL: Curriculum = {
  id: 'a-level',
  name: 'A Levels',
  fullName: 'Cambridge International AS & A Level',
  family: 'Cambridge',
  level: 'secondary',
  system: 'international',
  examBody: 'Cambridge International',
  stage: 'Ages 16–19',
  status: 'current',
  allowEntireCurriculum: true,
  categories: [
    { id: 'english', name: 'English Language & Literature' },
    { id: 'mathematics', name: 'Mathematics' },
    { id: 'sciences', name: 'Sciences' },
    { id: 'humanities', name: 'Humanities & Social Sciences' },
    { id: 'creative-professional', name: 'Creative & Professional' },
    { id: 'languages', name: 'Languages' },
  ],
  subjects: [
    s('english-language', 'English – Language', 'english'),
    s('english-literature', 'English – Literature', 'english'),
    s('english-lang-lit', 'English – Language and Literature (AS only)', 'english'),
    s('mathematics', 'Mathematics', 'mathematics'),
    s('further-mathematics', 'Further Mathematics', 'mathematics'),
    s('biology', 'Biology', 'sciences'),
    s('chemistry', 'Chemistry', 'sciences'),
    s('physics', 'Physics', 'sciences'),
    s('marine-science', 'Marine Science', 'sciences'),
    s('environmental-management', 'Environmental Management (AS only)', 'sciences'),
    s('economics', 'Economics', 'humanities'),
    s('geography', 'Geography', 'humanities'),
    s('history', 'History', 'humanities'),
    s('law', 'Law', 'humanities'),
    s('psychology', 'Psychology', 'humanities'),
    s('sociology', 'Sociology', 'humanities'),
    s('global-perspectives-research', 'Global Perspectives & Research', 'humanities'),
    s('english-general-paper', 'English General Paper (AS only)', 'humanities'),
    s('classical-studies', 'Classical Studies', 'humanities'),
    s('divinity', 'Divinity', 'humanities'),
    s('hinduism', 'Hinduism', 'humanities'),
    s('islamic-studies', 'Islamic Studies', 'humanities'),
    s('accounting', 'Accounting', 'creative-professional', { note: 'Not in Cambridge\'s 2020 list. Confirm it is offered before including.' }),
    s('business', 'Business', 'creative-professional'),
    s('computer-science', 'Computer Science', 'creative-professional'),
    s('information-technology', 'Information Technology', 'creative-professional'),
    s('art-design', 'Art & Design', 'creative-professional'),
    s('design-technology', 'Design & Technology', 'creative-professional'),
    s('design-textiles', 'Design & Textiles', 'creative-professional'),
    s('digital-media-design', 'Digital Media & Design', 'creative-professional'),
    s('drama', 'Drama', 'creative-professional'),
    s('media-studies', 'Media Studies', 'creative-professional'),
    s('music', 'Music', 'creative-professional'),
    s('pe', 'Physical Education', 'creative-professional'),
    s('thinking-skills', 'Thinking Skills', 'creative-professional'),
    s('travel-tourism', 'Travel & Tourism', 'creative-professional'),
    s('afrikaans', 'Afrikaans', 'languages'),
    s('arabic', 'Arabic', 'languages'),
    s('chinese', 'Chinese', 'languages'),
    s('french', 'French', 'languages'),
    s('german', 'German', 'languages'),
    s('hindi', 'Hindi', 'languages'),
    s('japanese', 'Japanese – Language', 'languages'),
    s('portuguese', 'Portuguese', 'languages'),
    s('spanish', 'Spanish', 'languages'),
    s('tamil', 'Tamil', 'languages'),
    s('telugu', 'Telugu', 'languages'),
    s('urdu', 'Urdu', 'languages'),
  ],
  note: 'From Cambridge\'s 2020 syllabus list (Cambridge now cites 55 subjects). AS-only language variants are folded into one subject per language.',
};

/* ───────────────────────────── EXPORTS ───────────────────────────── */

export const CURRICULA: Curriculum[] = [
  PSLE, IB_PYP, CAMBRIDGE_PRIMARY,
  JCE, BGCSE, BSSE,
  IGCSE, IB_MYP, IB_DP, A_LEVEL,
];

/** The tree the tutor screen walks: level → system → curricula. */
export const TREE = {
  primary: {
    label: 'Primary',
    systems: {
      national: { label: 'Botswana national', curricula: ['psle'] },
      international: { label: 'International', curricula: ['ib-pyp', 'cambridge-primary'] },
    },
  },
  secondary: {
    label: 'Secondary',
    systems: {
      national: { label: 'Public · Botswana national', curricula: ['jce', 'bgcse', 'bsse'] },
      international: { label: 'Private · international', curricula: ['igcse', 'ib-myp', 'ib-dp', 'a-level'] },
    },
  },
} as const;

/** What a tutor stores for each thing they teach. */
export interface TutorOffering {
  curriculumId: string;
  entireCurriculum?: boolean; // only valid when curriculum.allowEntireCurriculum
  subjectId?: string;         // required unless entireCurriculum
  ibLevel?: 'SL' | 'HL';      // IB Diploma only
}

export const getCurriculum = (id: string) => CURRICULA.find((c) => c.id === id);
export const subjectsByCategory = (id: string) => {
  const c = getCurriculum(id);
  if (!c) return [];
  return c.categories.map((cat) => ({ ...cat, subjects: c.subjects.filter((x) => x.categoryId === cat.id) }));
};

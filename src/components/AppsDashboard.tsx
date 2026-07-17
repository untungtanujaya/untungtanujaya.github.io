import { useState } from 'react';
import { ArrowLeft, Activity, Brain } from 'lucide-react';

export interface AppsDashboardProps {
  navigate: (path: string) => void;
  lang: 'en' | 'id';
}

export default function AppsDashboard({ navigate: propNavigate, lang: initialLang = 'en' }: AppsDashboardProps) {
  const navigate = (path: string) => {
    if (typeof propNavigate === 'function') {
      propNavigate(path);
    } else {
      window.location.href = path;
    }
  };
  const [lang, setLang] = useState<'en' | 'id'>(initialLang);
  const isEn = lang === 'en';

  const translations = {
    title: isEn ? 'Clinical Specialty Apps' : 'Aplikasi Spesialis Klinis',
    subtitle: isEn 
      ? 'Isolated Client-Side Calculators & Assessment Tools' 
      : 'Kalkulator Mandiri & Alat Penilaian Sisi Klien',
    backHome: isEn ? 'Back to Home' : 'Kembali ke Beranda',
    
    radiologyTitle: isEn ? 'Radiology Calculators' : 'Kalkulator Radiologi',
    radiologyDesc: isEn 
      ? 'Thyroid nodules, lung nodules risk assessment, contrast safety, prostate imaging scoring, pediatric renal function, and radiological dose estimators.'
      : 'Nodul tiroid, evaluasi risiko nodul paru, keamanan kontras, skor MRI prostat, fungsi ginjal anak, dan estimasi dosis radiasi.',
    radiologyLaunch: isEn ? 'Launch Radiology Tools \u2192' : 'Buka Alat Radiologi \u2192',

    psychiatryTitle: isEn ? 'Psychiatry Assessment Scales' : 'Skala Penilaian Psikiatri',
    psychiatryDesc: isEn 
      ? 'Diagnostic screenings, withdrawal scales, movement disorder trackers, consciousness metrics, and clinical note generators for mental health examinations.'
      : 'Skrining diagnostik, skala putus zat, pelacak gangguan gerakan, metrik kesadaran, dan pembuat catatan pemeriksaan kesehatan mental.',
    psychiatryLaunch: isEn ? 'Launch Psychiatry Scales \u2192' : 'Buka Skala Psikiatri \u2192'
  };

  const radiologyList = isEn ? [
    'ACR TI-RADS Score (Thyroid Nodule)',
    'Lung-RADS v2022 solitary nodule classification',
    'Mayo Clinic SPN Malignancy Risk calculator',
    'Mehran Contrast-Induced Nephropathy Risk Score',
    'PI-RADS v2.1 Prostate MRI scoring',
    'Pediatric eGFR (Bedside Schwartz Equation)',
    'CT Effective Dose Estimator (DLP to mSv conversion)'
  ] : [
    'Skor ACR TI-RADS (Nodul Tiroid)',
    'Klasifikasi nodul paru Lung-RADS v2022',
    'Kalkulator Risiko Keganasan SPN Mayo Clinic',
    'Skor Risiko Nefropati Akibat Kontras Mehran',
    'Penilaian PI-RADS v2.1 MRI Prostat',
    'eGFR Anak (Persamaan Schwartz Bedside)',
    'Estimasi Dosis Efektif CT (Konversi DLP ke mSv)'
  ];

  const psychiatryList = isEn ? [
    'PHQ-9 Depression Severity Scale',
    'GAD-7 Anxiety Severity Scale',
    'CAGE Alcohol Screening Questionnaire',
    'Clinical Opiate Withdrawal Scale (COWS)',
    'Glasgow Coma Scale (GCS) evaluation',
    'Mental Status Examination (MSE) note builder',
    'Abnormal Involuntary Movement Scale (AIMS)'
  ] : [
    'Skala Keparahan Depresi PHQ-9',
    'Skala Keparahan Kecemasan GAD-7',
    'Kuesioner Skrining Alkohol CAGE',
    'Skala Putus Obat Opiat Klinis (COWS)',
    'Evaluasi Glasgow Coma Scale (GCS)',
    'Pembuat Catatan Pemeriksaan Status Mental (MSE)',
    'Skala Gerakan Involunter Abnormal (AIMS)'
  ];

  return (
    <div className="w-full flex flex-col gap-6 text-[var(--text-primary)]">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-[var(--border-color)]">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">{translations.title}</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1 font-mono">
            {translations.subtitle}
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setLang(l => l === 'en' ? 'id' : 'en')}
            className="text-xs font-semibold px-3 py-1.5 rounded-full bg-[var(--card-bg-inset)] border border-[var(--border-color)] hover:border-[var(--pastel-teal)] transition-all cursor-pointer font-mono"
            aria-label="Toggle Language"
          >
            {lang === 'en' ? '🇮🇩 Bahasa Indonesia' : '🇬🇧 English'}
          </button>
          <button 
            onClick={() => navigate('/')} 
            aria-label={translations.backHome}
            className="text-sm font-semibold px-4.5 py-1.5 rounded-full bg-[var(--card-bg-inset)] border border-[var(--border-color)] hover:border-[var(--pastel-blue)] hover:text-[var(--pastel-blue)] hover:bg-[rgba(144,202,249,0.05)] transition-all duration-300 flex items-center gap-2"
          >
            <ArrowLeft size={14} /> {translations.backHome}
          </button>
        </div>
      </div>

      {/* Specialty launcher grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mt-4">
        {/* Radiology Bento Card */}
        <div 
          onClick={() => navigate('/apps/radiology')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') navigate('/apps/radiology'); }}
          aria-label={translations.radiologyTitle}
          className="bento-card p-4 md:p-8 cursor-pointer flex flex-col justify-between gap-4 md:gap-6 group hover:border-[var(--pastel-teal)] transition-all duration-300"
        >
          <div className="flex flex-col gap-3 md:gap-4">
            <div className="flex items-center gap-2.5 md:gap-3">
              <div className="p-2 rounded bg-[rgba(128,203,196,0.1)] text-[var(--pastel-teal)]">
                <Activity size={20} className="md:w-6 md:h-6" />
              </div>
              <h2 className="text-sm md:text-xl font-bold group-hover:text-[var(--pastel-teal)] transition-colors">
                {translations.radiologyTitle}
              </h2>
            </div>
            
            <p className="text-[10px] md:text-xs text-[var(--text-secondary)] leading-relaxed font-mono hidden sm:block">
              {translations.radiologyDesc}
            </p>

            <ul className="hidden md:flex flex-col gap-2 mt-2 text-xs list-disc list-inside text-[var(--text-muted)]">
              {radiologyList.map((item, idx) => (
                <li key={idx} className="font-mono">{item}</li>
              ))}
            </ul>
          </div>

          <div className="text-[10px] md:text-xs font-semibold text-[var(--pastel-teal)] flex items-center gap-1.5 mt-2">
            {translations.radiologyLaunch}
          </div>
        </div>

        {/* Psychiatry Bento Card */}
        <div 
          onClick={() => navigate('/apps/psychiatry')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') navigate('/apps/psychiatry'); }}
          aria-label={translations.psychiatryTitle}
          className="bento-card p-4 md:p-8 cursor-pointer flex flex-col justify-between gap-4 md:gap-6 group hover:border-[var(--pastel-purple)] transition-all duration-300"
        >
          <div className="flex flex-col gap-3 md:gap-4">
            <div className="flex items-center gap-2.5 md:gap-3">
              <div className="p-2 rounded bg-[rgba(179,157,219,0.1)] text-[var(--pastel-purple)]">
                <Brain size={20} className="md:w-6 md:h-6" />
              </div>
              <h2 className="text-sm md:text-xl font-bold group-hover:text-[var(--pastel-purple)] transition-colors">
                {translations.psychiatryTitle}
              </h2>
            </div>

            <p className="text-[10px] md:text-xs text-[var(--text-secondary)] leading-relaxed font-mono hidden sm:block">
              {translations.psychiatryDesc}
            </p>

            <ul className="hidden md:flex flex-col gap-2 mt-2 text-xs list-disc list-inside text-[var(--text-muted)]">
              {psychiatryList.map((item, idx) => (
                <li key={idx} className="font-mono">{item}</li>
              ))}
            </ul>
          </div>

          <div className="text-[10px] md:text-xs font-semibold text-[var(--pastel-purple)] flex items-center gap-1.5 mt-2">
            {translations.psychiatryLaunch}
          </div>
        </div>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { 
  ArrowLeft, 
  Check, 
  Clipboard 
} from 'lucide-react';

export interface MedicalToolsProps {
  navigate: (path: string) => void;
  specialty: 'radiology' | 'psychiatry';
  slug?: string;
  lang: 'en' | 'id';
}

export default function MedicalTools({ navigate: propNavigate, specialty, slug, lang: initialLang = 'en' }: MedicalToolsProps) {
  const navigate = (path: string) => {
    if (typeof propNavigate === 'function') {
      propNavigate(path);
    } else {
      window.location.href = path;
    }
  };
  const [lang, setLang] = useState<'en' | 'id'>(initialLang);
  const isEn = lang === 'en';

  // Copy to clipboard helper
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(id);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const ui = {
    backToApps: isEn ? 'Back to Apps' : 'Kembali ke Aplikasi',
    backToHome: isEn ? 'Back to Home' : 'Kembali ke Beranda',
    launch: isEn ? 'Launch App \u2192' : 'Buka Aplikasi \u2192',
    radTitle: isEn ? 'Radiology Apps' : 'Aplikasi Radiologi',
    radDesc: isEn 
      ? 'Diagnostic calculators and decision support algorithms for medical imaging workflows.' 
      : 'Kalkulator diagnostik dan algoritma pendukung keputusan untuk alur kerja pencitraan medis.',
    psychTitle: isEn ? 'Psychiatry Scales' : 'Skala Psikiatri',
    psychDesc: isEn 
      ? 'Diagnostic screenings, rating scales, and documentation aids for psychiatric assessment.' 
      : 'Skrining diagnostik, skala penilaian, dan bantuan dokumentasi untuk penilaian psikiatri.'
  };

  // 7 Radiology tools list data
  const radiologyApps = [
    {
      slug: 'acr-ti-rads',
      name: 'ACR TI-RADS',
      desc: isEn ? 'Thyroid nodule risk stratification and management.' : 'Stratifikasi risiko nodul tiroid & rekomendasinya.',
      badge: 'Thyroid'
    },
    {
      slug: 'lung-rads',
      name: 'Lung-RADS v2022',
      desc: isEn ? 'Solitary pulmonary nodule classification and screening.' : 'Klasifikasi nodul paru soliter & pemantauan skrining.',
      badge: 'Lung'
    },
    {
      slug: 'spn-malignancy',
      name: isEn ? 'Mayo SPN Risk' : 'Risiko SPN Mayo',
      desc: isEn ? 'Solitary pulmonary nodule cancer probability calculator.' : 'Probabilitas kanker pada nodul paru soliter (Model Mayo).',
      badge: 'Nodule Risk'
    },
    {
      slug: 'mehran-cin',
      name: isEn ? 'Mehran Score' : 'Skor Mehran',
      desc: isEn ? 'Contrast-induced nephropathy risk evaluation post-PCI.' : 'Evaluasi risiko nefropati akibat kontras pasca-PCI.',
      badge: 'Contrast Risk'
    },
    {
      slug: 'pi-rads',
      name: 'PI-RADS v2.1',
      desc: isEn ? 'Prostate MRI imaging scoring and zone findings.' : 'Penilaian MRI prostat berdasarkan temuan zona anatomi.',
      badge: 'Prostate'
    },
    {
      slug: 'pediatric-egfr',
      name: isEn ? 'Pediatric eGFR' : 'eGFR Anak',
      desc: isEn ? 'GFR estimator using height and creatinine (Schwartz).' : 'Estimasi GFR anak berbasis tinggi badan & kreatinin.',
      badge: 'Renal Function'
    },
    {
      slug: 'ct-dose',
      name: isEn ? 'CT Effective Dose' : 'Dosis Efektif CT',
      desc: isEn ? 'Estimates effective dose (mSv) from Dose Length Product.' : 'Estimasi dosis radiasi efektif (mSv) dari nilai DLP.',
      badge: 'Dose Estimator'
    }
  ];

  // 7 Psychiatry tools list data
  const psychiatryApps = [
    {
      slug: 'phq-9',
      name: 'PHQ-9',
      desc: isEn ? 'Patient Health Questionnaire depression severity scale.' : 'Kuesioner penilai tingkat keparahan depresi pasien.',
      badge: 'Depression'
    },
    {
      slug: 'gad-7',
      name: 'GAD-7',
      desc: isEn ? 'Generalized Anxiety Disorder assessment scale.' : 'Skala penilaian tingkat kecemasan umum pasien.',
      badge: 'Anxiety'
    },
    {
      slug: 'cage',
      name: 'CAGE',
      desc: isEn ? 'Quick screening tool for alcohol use disorder.' : 'Alat skrining cepat penyalahgunaan alkohol.',
      badge: 'Alcohol'
    },
    {
      slug: 'cows',
      name: 'COWS',
      desc: isEn ? 'Clinical Opiate Withdrawal Scale assessment.' : 'Skala penilaian gejala putus obat opiat klinis.',
      badge: 'Withdrawal'
    },
    {
      slug: 'gcs',
      name: 'GCS',
      desc: isEn ? 'Glasgow Coma Scale evaluation (3-15 rating).' : 'Skala koma Glasgow pengukur tingkat kesadaran.',
      badge: 'Consciousness'
    },
    {
      slug: 'mse-builder',
      name: 'MSE Builder',
      desc: isEn ? 'Mental Status Examination note snippet generator.' : 'Pembuat catatan terstruktur hasil pemeriksaan status mental.',
      badge: 'Documentation'
    },
    {
      slug: 'aims',
      name: 'AIMS',
      desc: isEn ? 'Abnormal Involuntary Movement Scale tracker.' : 'Pelacakan keparahan Tardive Dyskinesia.',
      badge: 'Dyskinesia'
    }
  ];

  // --- DETAIL VIEW LAYER ---
  if (slug) {
    let calculatorComponent = null;

    if (specialty === 'radiology') {
      switch (slug) {
        case 'acr-ti-rads': calculatorComponent = <TiRadsCard lang={lang} />; break;
        case 'lung-rads': calculatorComponent = <LungRadsCard lang={lang} />; break;
        case 'spn-malignancy': calculatorComponent = <SpnMalignancyCard lang={lang} />; break;
        case 'mehran-cin': calculatorComponent = <CinRiskCard lang={lang} />; break;
        case 'pi-rads': calculatorComponent = <PiRadsCard lang={lang} />; break;
        case 'pediatric-egfr': calculatorComponent = <PediatricEGfrCard lang={lang} />; break;
        case 'ct-dose': calculatorComponent = <CtDoseCard lang={lang} />; break;
        default: navigate('/apps/radiology/'); return null;
      }
    } else {
      switch (slug) {
        case 'phq-9': calculatorComponent = <Phq9Card lang={lang} />; break;
        case 'gad-7': calculatorComponent = <Gad7Card lang={lang} />; break;
        case 'cage': calculatorComponent = <CageCard lang={lang} />; break;
        case 'cows': calculatorComponent = <CowsCard lang={lang} />; break;
        case 'gcs': calculatorComponent = <GcsCard lang={lang} />; break;
        case 'mse-builder': calculatorComponent = <MseBuilderCard lang={lang} handleCopy={handleCopy} copiedText={copiedText} />; break;
        case 'aims': calculatorComponent = <AimsCard lang={lang} />; break;
        default: navigate('/apps/psychiatry/'); return null;
      }
    }

    return (
      <div className="w-full flex flex-col gap-6 text-[var(--text-primary)]">
        {/* Navigation back triggers */}
        <div className="flex flex-wrap justify-between items-center gap-4 pb-4 border-b border-[var(--border-color)]">
          <div className="flex flex-wrap gap-2">
            <button 
              onClick={() => navigate(`/apps/${specialty}/`)} 
              aria-label={ui.backToApps}
              className="px-4 py-2 rounded-xl border border-[var(--border-color)] text-[var(--text-primary)] hover:border-[var(--text-primary)] font-semibold text-xs transition-all flex items-center gap-2 cursor-pointer bg-[var(--card-bg-inset)]"
            >
              <ArrowLeft size={14} /> {ui.backToApps}
            </button>
            <button
              onClick={() => setLang(l => l === 'en' ? 'id' : 'en')}
              className="px-4 py-2 rounded-xl border border-[var(--border-color)] text-[var(--text-primary)] hover:border-[var(--text-primary)] font-semibold text-xs transition-all cursor-pointer bg-[var(--card-bg-inset)] font-mono"
            >
              {lang === 'en' ? '🇮🇩 Bahasa Indonesia' : '🇬🇧 English'}
            </button>
          </div>
        </div>

        {/* Render single detailed interactive calculator */}
        <div className="flex justify-center mt-2 w-full max-w-2xl mx-auto">
          {calculatorComponent}
        </div>
      </div>
    );
  }

  // --- LIST VIEW LAYER ---
  const activeApps = specialty === 'radiology' ? radiologyApps : psychiatryApps;
  const pageTitle = specialty === 'radiology' ? ui.radTitle : ui.psychTitle;
  const pageDesc = specialty === 'radiology' ? ui.radDesc : ui.psychDesc;

  const isRadiology = specialty === 'radiology';
  const accentColor = isRadiology ? 'var(--pastel-teal)' : 'var(--pastel-purple)';
  const badgeBgColor = isRadiology ? 'rgba(128,203,196,0.1)' : 'rgba(179,157,219,0.1)';

  return (
    <div className="w-full flex flex-col gap-6 text-[var(--text-primary)]">
      {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-[var(--border-color)]">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">{pageTitle}</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-2 font-mono">
            {pageDesc}
          </p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setLang(l => l === 'en' ? 'id' : 'en')}
            className="px-4 py-2 rounded-xl border border-[var(--border-color)] text-[var(--text-primary)] hover:border-[var(--text-primary)] font-semibold text-xs transition-all cursor-pointer bg-[var(--card-bg-inset)] font-mono"
          >
            {lang === 'en' ? '🇮🇩 Bahasa Indonesia' : '🇬🇧 English'}
          </button>
          <button 
            onClick={() => navigate('/apps/')} 
            aria-label={ui.backToApps}
            className="px-4 py-2 rounded-xl border border-[var(--border-color)] text-[var(--text-primary)] hover:border-[var(--text-primary)] font-semibold text-xs transition-all flex items-center gap-2 cursor-pointer bg-[var(--card-bg-inset)]"
          >
            <ArrowLeft size={14} /> {ui.backToApps}
          </button>
        </div>
      </div>

      {/* List of calculators */}
      <div className="flex flex-col gap-1 mt-2 border-t border-[var(--border-color)]">
        {activeApps.map((app) => (
          <div
            key={app.slug}
            onClick={() => navigate(`/apps/${specialty}/${app.slug}/`)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') navigate(`/apps/${specialty}/${app.slug}/`); }}
            className="flex justify-between items-center py-4 px-2 border-b border-[var(--border-color)] group hover:bg-[rgba(255,255,255,0.02)] transition-all cursor-pointer rounded-lg"
            onMouseEnter={() => setHoveredCard(app.slug)}
            onMouseLeave={() => setHoveredCard(null)}
          >
            <div className="flex flex-col gap-1">
              <h2 
                className="text-sm font-bold transition-colors"
                style={{ color: hoveredCard === app.slug ? accentColor : 'var(--text-primary)' }}
              >
                {app.name}
              </h2>
              <p className="text-[10px] text-[var(--text-secondary)] font-mono leading-normal line-clamp-3">
                {app.desc}
              </p>
            </div>
            
            <div 
              className="text-[10px] font-semibold flex items-center gap-1.5 shrink-0 ml-4"
              style={{ color: hoveredCard === app.slug ? accentColor : 'var(--text-muted)' }}
            >
              {ui.launch}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// RADIOLOGY CALCULATORS
// -------------------------------------------------------------

function TiRadsCard({ lang }: { lang: 'en' | 'id' }) {
  const isEn = lang === 'en';
  const [comp, setComp] = useState(0);
  const [echo, setEcho] = useState(0);
  const [shape, setShape] = useState(0);
  const [margin, setMargin] = useState(0);
  const [foci, setFoci] = useState(0);

  const totalPoints = comp + echo + shape + margin + foci;

  let category = isEn ? 'TR1 (Benign)' : 'TR1 (Jinak)';
  let action = isEn ? 'No FNA or follow-up required' : 'Tidak perlu FNA atau pemantauan';
  let badgeColor = 'var(--pastel-green)';

  if (totalPoints >= 8) {
    category = isEn ? 'TR5 (Highly Suspicious)' : 'TR5 (Sangat Mencurigakan)';
    action = isEn ? 'FNA if \u2265 1.0 cm; Follow-up if \u2265 0.5 cm' : 'FNA jika \u2265 1,0 cm; Pemantauan jika \u2265 0,5 cm';
    badgeColor = '#ef5350';
  } else if (totalPoints === 7) {
    category = isEn ? 'TR4 (Moderately Suspicious)' : 'TR4 (Cukup Mencurigakan)';
    action = isEn ? 'FNA if \u2265 1.5 cm; Follow-up if \u2265 1.0 cm' : 'FNA jika \u2265 1,5 cm; Pemantauan jika \u2265 1,0 cm';
    badgeColor = '#ffb74d';
  } else if (totalPoints >= 4) {
    category = isEn ? 'TR3 (Mildly Suspicious)' : 'TR3 (Sedikit Mencurigakan)';
    action = isEn ? 'FNA if \u2265 2.5 cm; Follow-up if \u2265 1.5 cm' : 'FNA jika \u2265 2,5 cm; Pemantauan jika \u2265 1,5 cm';
    badgeColor = 'var(--pastel-blue)';
  } else if (totalPoints === 3) {
    category = isEn ? 'TR2 (Not Suspicious)' : 'TR2 (Tidak Mencurigakan)';
    action = isEn ? 'No FNA or follow-up required' : 'Tidak perlu FNA atau pemantauan';
    badgeColor = 'var(--pastel-teal)';
  }

  const t = {
    title: isEn ? 'ACR TI-RADS Thyroid Nodule' : 'Skor ACR TI-RADS Nodul Tiroid',
    comp: isEn ? 'Composition' : 'Komposisi',
    echo: isEn ? 'Echogenicity' : 'Echogenesitas',
    shape: isEn ? 'Shape' : 'Bentuk',
    margin: isEn ? 'Margin' : 'Batas Nodul',
    foci: isEn ? 'Echogenic Foci' : 'Fokus Ekogenik',
    score: isEn ? 'Score' : 'Skor',
    points: isEn ? 'pts' : 'poin'
  };

  return (
    <div className="bento-card p-5 flex flex-col justify-between gap-4 w-full">
      <div>
        <div className="flex justify-between items-center pb-2 border-b border-[var(--border-color)]">
          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-[rgba(128,203,196,0.1)] text-[var(--pastel-teal)] font-mono">
            TI-RADS (ACR 2017)
          </span>
          <span className="text-xs font-mono text-[var(--text-muted)]">ACR 2017</span>
        </div>
        
        <h3 className="text-base font-bold mt-2 text-[var(--text-primary)]">{t.title}</h3>

        <div className="flex flex-col gap-4 mt-4 text-xs">
          <div>
            <label htmlFor="tirads-comp" className="text-[var(--text-secondary)] block mb-1">{t.comp}</label>
            <select id="tirads-comp" value={comp} onChange={(e) => setComp(Number(e.target.value))} className="w-full bg-[var(--card-bg-inset)] text-[var(--text-primary)] border border-[var(--border-color)] rounded py-2 px-3 text-xs focus:border-[var(--pastel-teal)] focus:outline-none">
              <option value="0">{isEn ? 'Cystic or spongiform (0 pts)' : 'Kistik atau spongiform (0 poin)'}</option>
              <option value="1">{isEn ? 'Mixed solid/cystic (1 pt)' : 'Campuran padat/kistik (1 poin)'}</option>
              <option value="2">{isEn ? 'Solid or almost solid (2 pts)' : 'Padat atau hampir padat (2 poin)'}</option>
            </select>
          </div>

          <div>
            <label htmlFor="tirads-echo" className="text-[var(--text-secondary)] block mb-1">{t.echo}</label>
            <select id="tirads-echo" value={echo} onChange={(e) => setEcho(Number(e.target.value))} className="w-full bg-[var(--card-bg-inset)] text-[var(--text-primary)] border border-[var(--border-color)] rounded py-2 px-3 text-xs focus:border-[var(--pastel-teal)] focus:outline-none">
              <option value="0">{isEn ? 'Anechoic (0 pts)' : 'Anekoik (0 poin)'}</option>
              <option value="1">{isEn ? 'Hyperechoic/isoechoic (1 pt)' : 'Hiperekogenik/isorekogenik (1 poin)'}</option>
              <option value="2">{isEn ? 'Hypoechoic (2 pts)' : 'Hipoekogenik (2 poin)'}</option>
              <option value="3">{isEn ? 'Very hypoechoic (3 pts)' : 'Sangat hipoekogenik (3 poin)'}</option>
            </select>
          </div>

          <div>
            <label htmlFor="tirads-shape" className="text-[var(--text-secondary)] block mb-1">{t.shape}</label>
            <select id="tirads-shape" value={shape} onChange={(e) => setShape(Number(e.target.value))} className="w-full bg-[var(--card-bg-inset)] text-[var(--text-primary)] border border-[var(--border-color)] rounded py-2 px-3 text-xs focus:border-[var(--pastel-teal)] focus:outline-none">
              <option value="0">{isEn ? 'Wider-than-tall (0 pts)' : 'Lebih lebar daripada tinggi (0 poin)'}</option>
              <option value="3">{isEn ? 'Taller-than-wide (3 pts)' : 'Lebih tinggi daripada lebar (3 poin)'}</option>
            </select>
          </div>

          <div>
            <label htmlFor="tirads-margin" className="text-[var(--text-secondary)] block mb-1">{t.margin}</label>
            <select id="tirads-margin" value={margin} onChange={(e) => setMargin(Number(e.target.value))} className="w-full bg-[var(--card-bg-inset)] text-[var(--text-primary)] border border-[var(--border-color)] rounded py-2 px-3 text-xs focus:border-[var(--pastel-teal)] focus:outline-none">
              <option value="0">{isEn ? 'Smooth / Ill-defined (0 pts)' : 'Halus / Batas tidak tegas (0 poin)'}</option>
              <option value="2">{isEn ? 'Lobulated or irregular (2 pts)' : 'Berlobus atau tidak teratur (2 poin)'}</option>
              <option value="3">{isEn ? 'Extra-thyroidal extension (3 pts)' : 'Ekstensi ekstra-tiroid (3 poin)'}</option>
            </select>
          </div>

          <div>
            <label htmlFor="tirads-foci" className="text-[var(--text-secondary)] block mb-1">{t.foci}</label>
            <select id="tirads-foci" value={foci} onChange={(e) => setFoci(Number(e.target.value))} className="w-full bg-[var(--card-bg-inset)] text-[var(--text-primary)] border border-[var(--border-color)] rounded py-2 px-3 text-xs focus:border-[var(--pastel-teal)] focus:outline-none">
              <option value="0">{isEn ? 'None or large colloid (0 pts)' : 'Tidak ada / koloid besar (0 poin)'}</option>
              <option value="1">{isEn ? 'Macrocalcifications (1 pt)' : 'Makrokalsifikasi (1 poin)'}</option>
              <option value="2">{isEn ? 'Peripheral calcifications (2 pts)' : 'Kalsifikasi perifer (2 poin)'}</option>
              <option value="3">{isEn ? 'Punctate echogenic foci (3 pts)' : 'Fokus ekogenik pungtata (3 poin)'}</option>
            </select>
          </div>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-[var(--border-color)] flex flex-col gap-2">
        <div className="flex justify-between items-center">
          <span className="text-sm font-semibold text-[var(--text-primary)]">{t.score}: {totalPoints} {t.points}</span>
          <span className="text-xs font-bold px-2 py-0.5 rounded border" style={{ backgroundColor: 'rgba(255,255,255,0.03)', borderColor: badgeColor, color: badgeColor }}>
            {category}
          </span>
        </div>
        <div className="text-[11px] text-[var(--text-secondary)] font-mono leading-relaxed bg-[var(--card-bg-inset)] p-2 rounded border border-[var(--border-color)] mt-1">
          {action}
        </div>
      </div>
    </div>
  );
}

function LungRadsCard({ lang }: { lang: 'en' | 'id' }) {
  const isEn = lang === 'en';
  const [noduleType, setNoduleType] = useState<'solid' | 'part' | 'non'>('solid');
  const [size, setSize] = useState<number>(5);
  const [growth, setGrowth] = useState<boolean>(false);

  let category = 'Lung-RADS 1/2';
  let desc = isEn ? 'Benign nodule or screening finding. Continue annual screening.' : 'Nodul jinak atau temuan skrining biasa. Lanjutkan skrining tahunan.';
  let border = 'var(--pastel-green)';

  if (noduleType === 'solid') {
    if (size >= 15 || (size >= 8 && growth)) {
      category = 'Lung-RADS 4B';
      desc = isEn ? 'Highly suspicious. Diagnostic chest CT, PET/CT and/or tissue sampling.' : 'Kecurigaan tinggi. Direkomendasikan CT dada diagnostik, PET/CT, dan/atau biopsi jaringan.';
      border = '#ef5350';
    } else if (size >= 8 || (size >= 6 && growth)) {
      category = 'Lung-RADS 4A';
      desc = isEn ? 'Suspicious nodule. Recommend 3-month follow-up CT or PET/CT.' : 'Nodul mencurigakan. Direkomendasikan evaluasi CT 3 bulan atau PET/CT.';
      border = '#ffb74d';
    } else if (size >= 6) {
      category = 'Lung-RADS 3';
      desc = isEn ? 'Probably benign. Recommend low-dose CT in 6 months.' : 'Kemungkinan jinak. Direkomendasikan CT dosis rendah dalam 6 bulan.';
      border = 'var(--pastel-blue)';
    }
  } else if (noduleType === 'part') {
    if (size >= 6 && growth) {
      category = 'Lung-RADS 4B';
      desc = isEn ? 'Growing solid component. Highly suspicious. PET/CT or biopsy.' : 'Komponen padat tumbuh. Kecurigaan tinggi. Evaluasi PET/CT atau biopsi.';
      border = '#ef5350';
    } else if (size >= 8) {
      category = 'Lung-RADS 4B';
      desc = isEn ? 'Solid component \u2265 8mm. Recommend chest CT / biopsy.' : 'Komponen padat \u2265 8mm. Direkomendasikan CT dada / biopsi.';
      border = '#ef5350';
    } else if (size >= 4) {
      category = 'Lung-RADS 4A';
      desc = isEn ? 'Solid component 4 to < 8mm. Recommend 3-month CT.' : 'Komponen padat 4 hingga < 8mm. Direkomendasikan CT evaluasi 3 bulan.';
      border = '#ffb74d';
    } else if (size >= 6) {
      category = 'Lung-RADS 3';
      desc = isEn ? 'Probably benign. Solid component < 4mm. CT in 6 months.' : 'Kemungkinan jinak. Komponen padat < 4mm. CT evaluasi dalam 6 bulan.';
      border = 'var(--pastel-blue)';
    }
  } else {
    if (size >= 30) {
      category = 'Lung-RADS 3';
      desc = isEn ? 'Probably benign. Ground glass \u2265 30mm. Repeat CT in 6 months.' : 'Kemungkinan jinak. Ground glass \u2265 30mm. Ulangi CT dalam 6 bulan.';
      border = 'var(--pastel-blue)';
    }
  }

  const t = {
    title: isEn ? 'Lung-RADS Nodule Assessment' : 'Evaluasi Nodul Paru Lung-RADS',
    comp: isEn ? 'Nodule Composition' : 'Komposisi Nodul',
    size: isEn ? 'Mean Diameter (mm)' : 'Diameter Rata-rata (mm)',
    growth: isEn ? 'Significant Growth?' : 'Pertumbuhan Signifikan?',
    classification: isEn ? 'Classification:' : 'Klasifikasi:'
  };

  return (
    <div className="bento-card p-5 flex flex-col justify-between gap-4 w-full">
      <div>
        <div className="flex justify-between items-center pb-2 border-b border-[var(--border-color)]">
          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-[rgba(144,202,249,0.1)] text-[var(--pastel-blue)] font-mono">
            Lung-RADS (v2022)
          </span>
          <span className="text-xs font-mono text-[var(--text-muted)]">v2022</span>
        </div>

        <h3 className="text-base font-bold mt-2 text-[var(--text-primary)]">{t.title}</h3>

        <div className="flex flex-col gap-4 mt-4 text-xs">
          <div>
            <span className="text-[var(--text-secondary)] block mb-1">{t.comp}</span>
            <div className="grid grid-cols-3 gap-1 bg-[var(--card-bg-inset)] p-0.5 border border-[var(--border-color)] rounded" role="radiogroup" aria-label="Nodule Composition Type">
              {(['solid', 'part', 'non'] as const).map((tVal) => (
                <button
                  key={tVal}
                  type="button"
                  role="radio"
                  aria-checked={noduleType === tVal}
                  onClick={() => setNoduleType(tVal)}
                  className={`py-2 px-1 rounded text-[11px] font-semibold uppercase tracking-wider transition-all ${
                    noduleType === tVal 
                      ? 'bg-[var(--pastel-teal)] text-[var(--bg-color)]' 
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  {tVal === 'solid' ? (isEn ? 'Solid' : 'Padat') : tVal === 'part' ? (isEn ? 'Part-Solid' : 'Sebagian Padat') : (isEn ? 'Non-Solid' : 'Non-Padat')}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="lungrads-size" className="text-[var(--text-secondary)] block mb-1">{t.size}</label>
            <input 
              id="lungrads-size"
              type="number"
              value={size}
              onChange={(e) => setSize(Math.max(0, Number(e.target.value)))}
              className="w-full bg-[var(--card-bg-inset)] text-[var(--text-primary)] border border-[var(--border-color)] rounded py-2 px-3 text-xs focus:border-[var(--pastel-teal)] focus:outline-none font-mono"
            />
          </div>

          <div className="flex justify-between items-center py-2.5 px-3.5 bg-[var(--card-bg-inset)] rounded border border-[var(--border-color)]">
            <label htmlFor="lungrads-growth" className="text-[var(--text-secondary)] cursor-pointer">{t.growth}</label>
            <input 
              id="lungrads-growth"
              type="checkbox"
              checked={growth}
              onChange={(e) => setGrowth(e.target.checked)}
              className="w-4 h-4 accent-[var(--pastel-teal)] cursor-pointer"
            />
          </div>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-[var(--border-color)] flex flex-col gap-2">
        <div className="flex justify-between items-center">
          <span className="text-xs text-[var(--text-secondary)] font-mono">{t.classification}</span>
          <span className="text-xs font-bold px-2 py-0.5 rounded border" style={{ backgroundColor: 'rgba(255,255,255,0.03)', borderColor: border, color: border }}>
            {category}
          </span>
        </div>
        <div className="text-[11px] text-[var(--text-secondary)] font-mono leading-relaxed bg-[var(--card-bg-inset)] p-2 rounded border border-[var(--border-color)] mt-1">
          {desc}
        </div>
      </div>
    </div>
  );
}

function SpnMalignancyCard({ lang }: { lang: 'en' | 'id' }) {
  const isEn = lang === 'en';
  const [age, setAge] = useState(60);
  const [smoke, setSmoke] = useState(1);
  const [cancer, setCancer] = useState(0);
  const [diam, setDiam] = useState(12);
  const [spic, setSpic] = useState(0);
  const [upper, setUpper] = useState(1);

  // Mayo clinic model formula
  const x = -6.8272 + (0.0391 * age) + (0.7917 * smoke) + (1.3388 * cancer) + (0.1274 * diam) + (1.0407 * spic) + (0.7838 * upper);
  const probability = (Math.exp(x) / (1 + Math.exp(x))) * 100;

  const t = {
    title: isEn ? 'Mayo Solitary Nodule Malignancy Risk' : 'Risiko Keganasan Nodul Paru Soliter Mayo',
    age: isEn ? 'Age (years)' : 'Usia (tahun)',
    diam: isEn ? 'Diameter (mm)' : 'Diameter (mm)',
    smoke: isEn ? 'History of Smoking?' : 'Riwayat Merokok?',
    cancer: isEn ? 'Extrathoracic Cancer?' : 'Riwayat Kanker Ekstratoraks?',
    spic: isEn ? 'Spiculated Margins?' : 'Batas Spikulasi (Spikula)?',
    upper: isEn ? 'Upper Lobe Location?' : 'Lokasi di Lobus Atas?',
    risk: isEn ? 'Calculated Malignancy Risk:' : 'Probabilitas Keganasan:'
  };

  return (
    <div className="bento-card p-5 flex flex-col justify-between gap-4 w-full">
      <div>
        <div className="flex justify-between items-center pb-2 border-b border-[var(--border-color)]">
          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-[rgba(165,214,167,0.1)] text-[var(--pastel-green)] font-mono">
            Mayo Model (SPN)
          </span>
          <span className="text-xs font-mono text-[var(--text-muted)]">Mayo Clinic</span>
        </div>

        <h3 className="text-base font-bold mt-2 text-[var(--text-primary)]">{t.title}</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 text-xs">
          <div>
            <label htmlFor="spn-age" className="text-[var(--text-secondary)] block mb-1">{t.age}</label>
            <input 
              id="spn-age"
              type="number"
              value={age}
              onChange={(e) => setAge(Number(e.target.value))}
              className="w-full bg-[var(--card-bg-inset)] text-[var(--text-primary)] border border-[var(--border-color)] rounded py-2 px-3 text-xs focus:border-[var(--pastel-teal)] focus:outline-none font-mono"
            />
          </div>

          <div>
            <label htmlFor="spn-diam" className="text-[var(--text-secondary)] block mb-1">{t.diam}</label>
            <input 
              id="spn-diam"
              type="number"
              value={diam}
              onChange={(e) => setDiam(Number(e.target.value))}
              className="w-full bg-[var(--card-bg-inset)] text-[var(--text-primary)] border border-[var(--border-color)] rounded py-2 px-3 text-xs focus:border-[var(--pastel-teal)] focus:outline-none font-mono"
            />
          </div>
        </div>

        <div className="flex flex-col gap-4 mt-4 text-xs">
          <div className="flex justify-between items-center py-2.5 px-3.5 bg-[var(--card-bg-inset)] rounded border border-[var(--border-color)]">
            <label htmlFor="spn-smoke" className="text-[var(--text-secondary)] cursor-pointer">{t.smoke}</label>
            <input 
              id="spn-smoke"
              type="checkbox"
              checked={smoke === 1}
              onChange={(e) => setSmoke(e.target.checked ? 1 : 0)}
              className="w-4 h-4 accent-[var(--pastel-teal)] cursor-pointer"
            />
          </div>

          <div className="flex justify-between items-center py-2.5 px-3.5 bg-[var(--card-bg-inset)] rounded border border-[var(--border-color)]">
            <label htmlFor="spn-cancer" className="text-[var(--text-secondary)] cursor-pointer">{t.cancer}</label>
            <input 
              id="spn-cancer"
              type="checkbox"
              checked={cancer === 1}
              onChange={(e) => setCancer(e.target.checked ? 1 : 0)}
              className="w-4 h-4 accent-[var(--pastel-teal)] cursor-pointer"
            />
          </div>

          <div className="flex justify-between items-center py-2.5 px-3.5 bg-[var(--card-bg-inset)] rounded border border-[var(--border-color)]">
            <label htmlFor="spn-spic" className="text-[var(--text-secondary)] cursor-pointer">{t.spic}</label>
            <input 
              id="spn-spic"
              type="checkbox"
              checked={spic === 1}
              onChange={(e) => setSpic(e.target.checked ? 1 : 0)}
              className="w-4 h-4 accent-[var(--pastel-teal)] cursor-pointer"
            />
          </div>

          <div className="flex justify-between items-center py-2.5 px-3.5 bg-[var(--card-bg-inset)] rounded border border-[var(--border-color)]">
            <label htmlFor="spn-upper" className="text-[var(--text-secondary)] cursor-pointer">{t.upper}</label>
            <input 
              id="spn-upper"
              type="checkbox"
              checked={upper === 1}
              onChange={(e) => setUpper(e.target.checked ? 1 : 0)}
              className="w-4 h-4 accent-[var(--pastel-teal)] cursor-pointer"
            />
          </div>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-[var(--border-color)] flex justify-between items-center">
        <span className="text-xs text-[var(--text-secondary)] font-mono">{t.risk}</span>
        <span className="text-lg font-extrabold text-[var(--pastel-green)] font-mono">
          {probability.toFixed(1)}%
        </span>
      </div>
    </div>
  );
}

function CinRiskCard({ lang }: { lang: 'en' | 'id' }) {
  const isEn = lang === 'en';
  const [hypo, setHypo] = useState(0);
  const [iabp, setIabp] = useState(0);
  const [chf, setChf] = useState(0);
  const [age, setAge] = useState(0);
  const [anemia, setAnemia] = useState(0);
  const [diab, setDiab] = useState(0);
  const [contrast, setContrast] = useState(150);
  const [egfrPts, setEgfrPts] = useState(0);

  const contrastPts = Math.floor(contrast / 100);
  const totalScore = hypo + iabp + chf + age + anemia + diab + contrastPts + egfrPts;

  let risk = isEn ? 'Low (7.5%)' : 'Rendah (7,5%)';
  let dial = '0.04%';
  let badge = 'var(--pastel-green)';

  if (totalScore >= 16) {
    risk = isEn ? 'Very High (57.3%)' : 'Sangat Tinggi (57,3%)';
    dial = '12.6%';
    badge = '#ef5350';
  } else if (totalScore >= 11) {
    risk = isEn ? 'High (26.1%)' : 'Tinggi (26,1%)';
    dial = '1.09%';
    badge = '#ffb74d';
  } else if (totalScore >= 6) {
    risk = isEn ? 'Moderate (14.0%)' : 'Sedang (14,0%)';
    dial = '0.12%';
    badge = 'var(--pastel-blue)';
  }

  const t = {
    title: isEn ? 'Mehran Contrast Nephropathy Score' : 'Skor Mehran Risiko Nefropati Akibat Kontras',
    hypo: isEn ? 'Hypotension' : 'Hipotensi (Tekanan Rendah)',
    iabp: isEn ? 'IABP Pump' : 'Pompa Jantung IABP',
    chf: isEn ? 'CHF History' : 'Riwayat Gagal Jantung Kongestif',
    age: isEn ? 'Age > 75 yrs' : 'Usia > 75 Tahun',
    anemia: isEn ? 'Anemia' : 'Anemia (Kurang Darah)',
    diab: isEn ? 'Diabetes' : 'Diabetes (Kencing Manis)',
    egfr: isEn ? 'eGFR (mL/min/1.73m²)' : 'Kadar eGFR (mL/menit/1.73m²)',
    contrast: isEn ? 'Contrast Vol (mL)' : 'Volume Kontras (mL)',
    score: isEn ? 'Score' : 'Skor',
    points: isEn ? 'pts' : 'poin',
    dialysis: isEn ? 'Dialysis risk:' : 'Risiko Dialisis:'
  };

  return (
    <div className="bento-card p-5 flex flex-col justify-between gap-4 w-full">
      <div>
        <div className="flex justify-between items-center pb-2 border-b border-[var(--border-color)]">
          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-[rgba(179,157,219,0.1)] text-[var(--pastel-purple)] font-mono">
            Mehran Score (CIN)
          </span>
          <span className="text-xs font-mono text-[var(--text-muted)]">Mehran 2004</span>
        </div>

        <h3 className="text-base font-bold mt-2 text-[var(--text-primary)]">{t.title}</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mt-4 text-xs">
          <div className="flex justify-between items-center py-2.5 px-3.5 bg-[var(--card-bg-inset)] rounded border border-[var(--border-color)]">
            <label htmlFor="cin-hypo" className="cursor-pointer">{t.hypo}</label>
            <input id="cin-hypo" type="checkbox" checked={hypo > 0} onChange={(e) => setHypo(e.target.checked ? 5 : 0)} className="w-3.5 h-3.5 cursor-pointer" />
          </div>
          
          <div className="flex justify-between items-center py-2.5 px-3.5 bg-[var(--card-bg-inset)] rounded border border-[var(--border-color)]">
            <label htmlFor="cin-iabp" className="cursor-pointer">{t.iabp}</label>
            <input id="cin-iabp" type="checkbox" checked={iabp > 0} onChange={(e) => setIabp(e.target.checked ? 5 : 0)} className="w-3.5 h-3.5 cursor-pointer" />
          </div>

          <div className="flex justify-between items-center py-2.5 px-3.5 bg-[var(--card-bg-inset)] rounded border border-[var(--border-color)]">
            <label htmlFor="cin-chf" className="cursor-pointer">{t.chf}</label>
            <input id="cin-chf" type="checkbox" checked={chf > 0} onChange={(e) => setChf(e.target.checked ? 5 : 0)} className="w-3.5 h-3.5 cursor-pointer" />
          </div>

          <div className="flex justify-between items-center py-2.5 px-3.5 bg-[var(--card-bg-inset)] rounded border border-[var(--border-color)]">
            <label htmlFor="cin-age" className="cursor-pointer">{t.age}</label>
            <input id="cin-age" type="checkbox" checked={age > 0} onChange={(e) => setAge(e.target.checked ? 4 : 0)} className="w-3.5 h-3.5 cursor-pointer" />
          </div>

          <div className="flex justify-between items-center py-2.5 px-3.5 bg-[var(--card-bg-inset)] rounded border border-[var(--border-color)]">
            <label htmlFor="cin-anemia" className="cursor-pointer">{t.anemia}</label>
            <input id="cin-anemia" type="checkbox" checked={anemia > 0} onChange={(e) => setAnemia(e.target.checked ? 3 : 0)} className="w-3.5 h-3.5 cursor-pointer" />
          </div>

          <div className="flex justify-between items-center py-2.5 px-3.5 bg-[var(--card-bg-inset)] rounded border border-[var(--border-color)]">
            <label htmlFor="cin-diab" className="cursor-pointer">{t.diab}</label>
            <input id="cin-diab" type="checkbox" checked={diab > 0} onChange={(e) => setDiab(e.target.checked ? 3 : 0)} className="w-3.5 h-3.5 cursor-pointer" />
          </div>
        </div>

        <div className="flex flex-col gap-4 mt-4 text-xs">
          <div>
            <label htmlFor="cin-egfr" className="text-[var(--text-secondary)] block mb-0.5">{t.egfr}</label>
            <select id="cin-egfr" value={egfrPts} onChange={(e) => setEgfrPts(Number(e.target.value))} className="w-full bg-[var(--card-bg-inset)] text-[var(--text-primary)] border border-[var(--border-color)] rounded py-2 px-3 text-xs focus:outline-none">
              <option value="0">&ge; 60 ({isEn ? '0 pts' : '0 poin'})</option>
              <option value="2">40 - 59 ({isEn ? '2 pts' : '2 poin'})</option>
              <option value="4">20 - 39 ({isEn ? '4 pts' : '4 poin'})</option>
              <option value="6">&lt; 20 ({isEn ? '6 pts' : '6 poin'})</option>
            </select>
          </div>

          <div>
            <label htmlFor="cin-contrast" className="text-[var(--text-secondary)] block mb-0.5">{t.contrast}</label>
            <input 
              id="cin-contrast"
              type="number"
              value={contrast}
              onChange={(e) => setContrast(Number(e.target.value))}
              className="w-full bg-[var(--card-bg-inset)] text-[var(--text-primary)] border border-[var(--border-color)] rounded py-2 px-3 text-xs focus:outline-none font-mono"
            />
          </div>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-[var(--border-color)] flex flex-col gap-1.5">
        <div className="flex justify-between items-center">
          <span className="text-xs text-[var(--text-secondary)] font-mono">{t.score}: {totalScore} {t.points}</span>
          <span className="text-xs font-bold px-2 py-0.5 rounded border" style={{ borderColor: badge, color: badge }}>
            {risk}
          </span>
        </div>
        <div className="flex justify-between text-[11px] font-mono text-[var(--text-muted)] bg-[var(--card-bg-inset)] py-2 px-3 rounded border border-[var(--border-color)]">
          <span>{t.dialysis}</span>
          <span className="font-bold text-[var(--text-primary)]">{dial}</span>
        </div>
      </div>
    </div>
  );
}

function PiRadsCard({ lang }: { lang: 'en' | 'id' }) {
  const isEn = lang === 'en';
  const [zone, setZone] = useState<'pz' | 'tz'>('pz');
  const [dwi, setDwi] = useState<number>(3);
  const [dce, setDce] = useState<'pos' | 'neg'>('neg');
  const [t2, setT2] = useState<number>(3);

  let score = 3;
  if (zone === 'pz') {
    if (dwi === 3 && dce === 'pos') {
      score = 4;
    } else {
      score = dwi;
    }
  } else {
    if (t2 === 3) {
      score = dwi >= 4 ? 4 : 3;
    } else if (t2 === 2) {
      score = dwi >= 4 ? 3 : 2;
    } else {
      score = t2;
    }
  }

  const outputLabels: Record<number, string> = isEn ? {
    1: '1 - Very Low Risk',
    2: '2 - Low Risk',
    3: '3 - Intermediate Risk',
    4: '4 - High Risk',
    5: '5 - Very High Risk'
  } : {
    1: '1 - Risiko Sangat Rendah',
    2: '2 - Risiko Rendah',
    3: '3 - Risiko Intermediet/Sedang',
    4: '4 - Risiko Tinggi',
    5: '5 - Risiko Sangat Tinggi'
  };

  const t = {
    title: isEn ? 'PI-RADS v2.1 Prostate MRI Assessment' : 'Evaluasi MRI Prostat PI-RADS v2.1',
    zone: isEn ? 'Anatomical Zone' : 'Zona Anatomi',
    dwi: isEn ? 'DWI/ADC Finding (Primary)' : 'Temuan DWI/ADC (Utama)',
    dce: isEn ? 'DCE Contrast Finding' : 'Temuan Kontras DCE',
    t2: isEn ? 'T2W Finding (Primary)' : 'Temuan T2W (Utama)',
    secdwi: isEn ? 'Secondary DWI/ADC Score' : 'Skor DWI/ADC Sekunder',
    score: isEn ? 'PI-RADS v2.1 Score:' : 'Skor PI-RADS v2.1:'
  };

  return (
    <div className="bento-card p-5 flex flex-col justify-between gap-4 w-full">
      <div>
        <div className="flex justify-between items-center pb-2 border-b border-[var(--border-color)]">
          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-[rgba(128,203,196,0.1)] text-[var(--pastel-teal)] font-mono">
            PI-RADS v2.1
          </span>
          <span className="text-xs font-mono text-[var(--text-muted)]">v2.1</span>
        </div>

        <h3 className="text-base font-bold mt-2 text-[var(--text-primary)]">{t.title}</h3>

        <div className="flex flex-col gap-4 mt-4 text-xs">
          <div>
            <span className="text-[var(--text-secondary)] block mb-1">{t.zone}</span>
            <div className="grid grid-cols-2 gap-1 bg-[var(--card-bg-inset)] p-0.5 border border-[var(--border-color)] rounded" role="radiogroup" aria-label="Anatomical Zone Type">
              <button
                type="button"
                role="radio"
                aria-checked={zone === 'pz'}
                onClick={() => setZone('pz')}
                className={`py-2.5 px-1 rounded text-xs font-semibold transition-all ${
                  zone === 'pz' ? 'bg-[var(--pastel-teal)] text-[var(--bg-color)]' : 'text-[var(--text-secondary)]'
                }`}
              >
                {isEn ? 'Peripheral Zone (PZ)' : 'Zona Perifer (PZ)'}
              </button>
              <button
                type="button"
                role="radio"
                aria-checked={zone === 'tz'}
                onClick={() => setZone('tz')}
                className={`py-2.5 px-1 rounded text-xs font-semibold transition-all ${
                  zone === 'tz' ? 'bg-[var(--pastel-teal)] text-[var(--bg-color)]' : 'text-[var(--text-secondary)]'
                }`}
              >
                {isEn ? 'Transition Zone (TZ)' : 'Zona Transisi (TZ)'}
              </button>
            </div>
          </div>

          {zone === 'pz' ? (
            <>
              <div>
                <label htmlFor="pirads-dwi" className="text-[var(--text-secondary)] block mb-1">{t.dwi}</label>
                <select id="pirads-dwi" value={dwi} onChange={(e) => setDwi(Number(e.target.value))} className="w-full bg-[var(--card-bg-inset)] border border-[var(--border-color)] rounded py-2 px-3 text-xs focus:outline-none">
                  <option value="1">{isEn ? '1 - Normal / No abnormalities' : '1 - Normal / Tanpa kelainan'}</option>
                  <option value="2">{isEn ? '2 - Indistinct focal hypointensity' : '2 - Hipointensitas fokal tidak tegas'}</option>
                  <option value="3">{isEn ? '3 - Focal mild/moderate hyperintensity' : '3 - Hiperintensitas fokal ringan/sedang'}</option>
                  <option value="4">{isEn ? '4 - Focal marked hyperintensity < 1.5cm' : '4 - Hiperintensitas fokal jelas < 1,5cm'}</option>
                  <option value="5">{isEn ? '5 - Focal marked hyperintensity \u2265 1.5cm' : '5 - Hiperintensitas fokal jelas \u2265 1,5cm'}</option>
                </select>
              </div>

              <div>
                <label htmlFor="pirads-dce" className="text-[var(--text-secondary)] block mb-1">{t.dce}</label>
                <select id="pirads-dce" value={dce} onChange={(e) => setDce(e.target.value as any)} className="w-full bg-[var(--card-bg-inset)] border border-[var(--border-color)] rounded py-2 px-3 text-xs focus:outline-none">
                  <option value="neg">{isEn ? 'Negative (No early enhancement)' : 'Negatif (Tanpa penyangatan dini)'}</option>
                  <option value="pos">{isEn ? 'Positive (Focal + early enhancement)' : 'Positif (Focal + penyangatan dini)'}</option>
                </select>
              </div>
            </>
          ) : (
            <>
              <div>
                <label htmlFor="pirads-t2" className="text-[var(--text-secondary)] block mb-1">{t.t2}</label>
                <select id="pirads-t2" value={t2} onChange={(e) => setT2(Number(e.target.value))} className="w-full bg-[var(--card-bg-inset)] border border-[var(--border-color)] rounded py-2 px-3 text-xs focus:outline-none">
                  <option value="1">{isEn ? '1 - Normal / Homogeneous signal' : '1 - Normal / Sinyal homogen'}</option>
                  <option value="2">{isEn ? '2 - Circumscribed hypointense nodules' : '2 - Nodul hipointens berbatas tegas'}</option>
                  <option value="3">{isEn ? '3 - Heterogeneous, ill-defined intensity' : '3 - Intensitas heterogen, batas tidak tegas'}</option>
                  <option value="4">{isEn ? '4 - Eradicated boundaries, hypointense < 1.5cm' : '4 - Batas kabur, hipointens < 1,5cm'}</option>
                  <option value="5">{isEn ? '5 - Eradicated boundaries, hypointense \u2265 1.5cm' : '5 - Batas kabur, hipointens \u2265 1,5cm'}</option>
                </select>
              </div>

              <div>
                <label htmlFor="pirads-secdwi" className="text-[var(--text-secondary)] block mb-1">{t.secdwi}</label>
                <select id="pirads-secdwi" value={dwi} onChange={(e) => setDwi(Number(e.target.value))} className="w-full bg-[var(--card-bg-inset)] border border-[var(--border-color)] rounded py-2 px-3 text-xs focus:outline-none">
                  <option value="1">{isEn ? 'DWI 1 or 2' : 'DWI 1 atau 2'}</option>
                  <option value="3">{isEn ? 'DWI 3' : 'DWI 3'}</option>
                  <option value="4">{isEn ? 'DWI 4 or 5' : 'DWI 4 atau 5'}</option>
                </select>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-[var(--border-color)] flex justify-between items-center">
        <span className="text-xs text-[var(--text-secondary)] font-mono">{t.score}</span>
        <span className="text-xs font-bold text-[var(--pastel-teal)] font-mono bg-[var(--card-bg-inset)] px-2.5 py-1 rounded border border-[var(--border-color)]">
          {outputLabels[score] || score}
        </span>
      </div>
    </div>
  );
}

function PediatricEGfrCard({ lang }: { lang: 'en' | 'id' }) {
  const isEn = lang === 'en';
  const [height, setHeight] = useState(110);
  const [creat, setCreat] = useState(0.5);

  const egfr = creat > 0 ? (0.413 * height) / creat : 0;

  let ckdStage = isEn ? 'Normal / Mild (CKD 1)' : 'Normal / Ringan (CKD 1)';
  let color = 'var(--pastel-green)';
  if (egfr < 15) {
    ckdStage = isEn ? 'Kidney Failure (CKD 5)' : 'Gagal Ginjal (CKD 5)';
    color = '#ef5350';
  } else if (egfr < 30) {
    ckdStage = isEn ? 'Severe Decrease (CKD 4)' : 'Penurunan Berat (CKD 4)';
    color = '#ffb74d';
  } else if (egfr < 60) {
    ckdStage = isEn ? 'Moderate Decrease (CKD 3)' : 'Penurunan Sedang (CKD 3)';
    color = 'var(--pastel-blue)';
  } else if (egfr < 90) {
    ckdStage = isEn ? 'Mild Decrease (CKD 2)' : 'Penurunan Ringan (CKD 2)';
    color = 'var(--pastel-teal)';
  }

  const t = {
    title: isEn ? 'Pediatric eGFR (Bedside Schwartz)' : 'eGFR Anak (Persamaan Schwartz Bedside)',
    height: isEn ? 'Height (cm)' : 'Tinggi Badan (cm)',
    creat: isEn ? 'Serum Creatinine (mg/dL)' : 'Kreatinin Serum (mg/dL)',
    egfr: isEn ? 'eGFR:' : 'eGFR:',
    ckd: isEn ? 'CKD Stage:' : 'Stadium CKD:'
  };

  return (
    <div className="bento-card p-5 flex flex-col justify-between gap-4 w-full">
      <div>
        <div className="flex justify-between items-center pb-2 border-b border-[var(--border-color)]">
          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-[rgba(144,202,249,0.1)] text-[var(--pastel-blue)] font-mono">
            Pediatric eGFR
          </span>
          <span className="text-xs font-mono text-[var(--text-muted)]">Schwartz</span>
        </div>

        <h3 className="text-base font-bold mt-2 text-[var(--text-primary)]">{t.title}</h3>

        <div className="flex flex-col gap-4 mt-4 text-xs">
          <div>
            <label htmlFor="egfr-height" className="text-[var(--text-secondary)] block mb-1">{t.height}</label>
            <input 
              id="egfr-height"
              type="number"
              value={height}
              onChange={(e) => setHeight(Number(e.target.value))}
              className="w-full bg-[var(--card-bg-inset)] text-[var(--text-primary)] border border-[var(--border-color)] rounded py-2 px-3 text-xs focus:outline-none font-mono"
            />
          </div>

          <div>
            <label htmlFor="egfr-creat" className="text-[var(--text-secondary)] block mb-1">{t.creat}</label>
            <input 
              id="egfr-creat"
              type="number"
              step="0.01"
              value={creat}
              onChange={(e) => setCreat(Number(e.target.value))}
              className="w-full bg-[var(--card-bg-inset)] text-[var(--text-primary)] border border-[var(--border-color)] rounded py-2 px-3 text-xs focus:outline-none font-mono"
            />
          </div>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-[var(--border-color)] flex flex-col gap-1.5">
        <div className="flex justify-between items-center">
          <span className="text-xs text-[var(--text-secondary)] font-mono">{t.egfr}</span>
          <span className="text-lg font-extrabold text-[var(--pastel-blue)] font-mono">
            {egfr.toFixed(1)} mL/min/1.73m²
          </span>
        </div>
        <div className="flex justify-between items-center text-[10px] font-mono px-2 py-1 bg-[var(--card-bg-inset)] rounded border border-[var(--border-color)] mt-1">
          <span className="text-[var(--text-muted)]">{t.ckd}</span>
          <span className="font-bold" style={{ color }}>{ckdStage}</span>
        </div>
      </div>
    </div>
  );
}

function CtDoseCard({ lang }: { lang: 'en' | 'id' }) {
  const isEn = lang === 'en';
  const [region, setRegion] = useState<'head' | 'neck' | 'chest' | 'abd' | 'pel'>('chest');
  const [dlp, setDlp] = useState(400);

  const kFactors = {
    head: 0.0021,
    neck: 0.0059,
    chest: 0.014,
    abd: 0.015,
    pel: 0.019
  };

  const k = kFactors[region];
  const effectiveDose = dlp * k;
  const cxrEquivalent = effectiveDose / 0.1;

  const t = {
    title: isEn ? 'CT Effective Radiation Dose Estimator' : 'Estimasi Dosis Radiasi Efektif CT Scan',
    region: isEn ? 'Body Region' : 'Wilayah Tubuh',
    dlp: isEn ? 'DLP (mGy-cm)' : 'DLP (mGy-cm)',
    eff: isEn ? 'Effective Dose:' : 'Dosis Efektif:',
    desc: isEn 
      ? `Equivalent to \u2248 ${Math.round(cxrEquivalent)} chest X-rays. (Annual natural background \u2248 3 mSv).`
      : `Setara dengan \u2248 ${Math.round(cxrEquivalent)} Rontgen dada. (Latar belakang alami tahunan \u2248 3 mSv).`
  };

  return (
    <div className="bento-card p-5 flex flex-col justify-between gap-4 w-full">
      <div>
        <div className="flex justify-between items-center pb-2 border-b border-[var(--border-color)]">
          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-[rgba(165,214,167,0.1)] text-[var(--pastel-green)] font-mono">
            CT Dose (mSv)
          </span>
          <span className="text-xs font-mono text-[var(--text-muted)]">DLP to mSv</span>
        </div>

        <h3 className="text-base font-bold mt-2 text-[var(--text-primary)]">{t.title}</h3>

        <div className="flex flex-col gap-4 mt-4 text-xs">
          <div>
            <label htmlFor="ctdose-region" className="text-[var(--text-secondary)] block mb-1">{t.region}</label>
            <select id="ctdose-region" value={region} onChange={(e) => setRegion(e.target.value as any)} className="w-full bg-[var(--card-bg-inset)] text-[var(--text-primary)] border border-[var(--border-color)] rounded py-2 px-3 text-xs focus:outline-none">
              <option value="head">{isEn ? 'Head (k = 0.0021)' : 'Kepala (k = 0.0021)'}</option>
              <option value="neck">{isEn ? 'Neck (k = 0.0059)' : 'Leher (k = 0.0059)'}</option>
              <option value="chest">{isEn ? 'Chest (k = 0.0140)' : 'Dada (k = 0.0140)'}</option>
              <option value="abd">{isEn ? 'Abdomen (k = 0.0150)' : 'Perut (k = 0.0150)'}</option>
              <option value="pel">{isEn ? 'Pelvis (k = 0.0190)' : 'Panggul (k = 0.0190)'}</option>
            </select>
          </div>

          <div>
            <label htmlFor="ctdose-dlp" className="text-[var(--text-secondary)] block mb-1">{t.dlp}</label>
            <input 
              id="ctdose-dlp"
              type="number"
              value={dlp}
              onChange={(e) => setDlp(Math.max(0, Number(e.target.value)))}
              className="w-full bg-[var(--card-bg-inset)] text-[var(--text-primary)] border border-[var(--border-color)] rounded py-2 px-3 text-xs focus:outline-none font-mono"
            />
          </div>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-[var(--border-color)] flex flex-col gap-2">
        <div className="flex justify-between items-center">
          <span className="text-xs text-[var(--text-secondary)] font-mono">{t.eff}</span>
          <span className="text-base font-extrabold text-[var(--pastel-green)] font-mono">
            {effectiveDose.toFixed(2)} mSv
          </span>
        </div>
        <div className="text-[10px] text-[var(--text-muted)] font-mono leading-normal bg-[var(--card-bg-inset)] p-2 rounded border border-[var(--border-color)]">
          {t.desc}
        </div>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// PSYCHIATRY SCALES
// -------------------------------------------------------------

function Phq9Card({ lang }: { lang: 'en' | 'id' }) {
  const isEn = lang === 'en';
  const [answers, setAnswers] = useState<number[]>(new Array(9).fill(0));

  const totalScore = answers.reduce((a, b) => a + b, 0);

  let severity = isEn ? 'Minimal Depression' : 'Depresi Minimal';
  let color = 'var(--pastel-green)';
  if (totalScore >= 20) {
    severity = isEn ? 'Severe Depression' : 'Depresi Berat';
    color = '#ef5350';
  } else if (totalScore >= 15) {
    severity = isEn ? 'Moderately Severe' : 'Depresi Sedang-Berat';
    color = '#ffb74d';
  } else if (totalScore >= 10) {
    severity = isEn ? 'Moderate Depression' : 'Depresi Sedang';
    color = 'var(--pastel-blue)';
  } else if (totalScore >= 5) {
    severity = isEn ? 'Mild Depression' : 'Depresi Ringan';
    color = 'var(--pastel-teal)';
  }

  const qLabels = isEn ? [
    'Anhedonia (little interest or pleasure in doing things)',
    'Feeling down, depressed, or hopeless',
    'Trouble falling or staying asleep, or sleeping too much',
    'Feeling tired or having little energy',
    'Poor appetite or overeating',
    'Feeling bad about yourself or that you are a failure',
    'Trouble concentrating on things (e.g. reading, TV)',
    'Moving/speaking slowly, or fidgety/restless',
    'Thoughts of self-harm or suicide'
  ] : [
    'Anhedonia (kurang minat atau kesenangan dalam melakukan sesuatu)',
    'Merasa sedih, tertekan, atau putus asa',
    'Sulit tidur, sering terbangun, atau terlalu banyak tidur',
    'Merasa lelah atau kurang berenergi',
    'Kurang nafsu makan atau makan berlebihan',
    'Merasa buruk tentang diri sendiri atau merasa gagal',
    'Sulit berkonsentrasi pada aktivitas (misal membaca, nonton TV)',
    'Bergerak/berbicara terlalu lambat, atau gelisah/tidak tenang',
    'Pikiran untuk menyakiti diri sendiri atau bunuh diri'
  ];

  const handleSelect = (idx: number, val: number) => {
    const updated = [...answers];
    updated[idx] = val;
    setAnswers(updated);
  };

  const t = {
    title: isEn ? 'PHQ-9 Patient Health Questionnaire' : 'Kuesioner PHQ-9 Kesehatan Pasien',
    score: isEn ? 'Score' : 'Skor',
    points: isEn ? 'pts' : 'poin'
  };

  return (
    <div className="bento-card p-5 flex flex-col justify-between gap-4 w-full">
      <div>
        <div className="flex justify-between items-center pb-2 border-b border-[var(--border-color)]">
          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-[rgba(179,157,219,0.1)] text-[var(--pastel-purple)] font-mono">
            PHQ-9 Depression
          </span>
          <span className="text-xs font-mono text-[var(--text-muted)]">Screening</span>
        </div>

        <h3 className="text-base font-bold mt-2 text-[var(--text-primary)]">{t.title}</h3>

        <div className="flex flex-col gap-4 mt-4">
          {qLabels.map((q, idx) => (
            <div key={idx} className="flex flex-col gap-1 pb-2 border-b border-[rgba(255,255,255,0.03)]" role="radiogroup" aria-label={`PHQ9 Question ${idx+1}: ${q}`}>
              <span className="text-[11px] text-[var(--text-secondary)]">{idx+1}. {q}</span>
              <div className="grid grid-cols-4 gap-1 p-0.5 bg-[var(--card-bg-inset)] rounded border border-[var(--border-color)] text-[10px]">
                {[0, 1, 2, 3].map((val) => (
                  <button
                    key={val}
                    type="button"
                    role="radio"
                    aria-checked={answers[idx] === val}
                    aria-label={`Score +${val}`}
                    onClick={() => handleSelect(idx, val)}
                    className={`py-2 px-1 rounded font-mono font-bold transition-all text-xs ${
                      answers[idx] === val 
                        ? 'bg-[var(--pastel-purple)] text-[var(--bg-color)]' 
                        : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    +{val}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-[var(--border-color)] flex justify-between items-center">
        <span className="text-xs font-mono text-[var(--text-secondary)]">{t.score}: {totalScore} {t.points}</span>
        <span className="text-xs font-bold px-2 py-0.5 rounded border" style={{ borderColor: color, color }}>
          {severity}
        </span>
      </div>
    </div>
  );
}

function Gad7Card({ lang }: { lang: 'en' | 'id' }) {
  const isEn = lang === 'en';
  const [answers, setAnswers] = useState<number[]>(new Array(7).fill(0));

  const totalScore = answers.reduce((a, b) => a + b, 0);

  let severity = isEn ? 'Minimal Anxiety' : 'Kecemasan Minimal';
  let color = 'var(--pastel-green)';
  if (totalScore >= 15) {
    severity = isEn ? 'Severe Anxiety' : 'Kecemasan Berat';
    color = '#ef5350';
  } else if (totalScore >= 10) {
    severity = isEn ? 'Moderate Anxiety' : 'Kecemasan Sedang';
    color = '#ffb74d';
  } else if (totalScore >= 5) {
    severity = isEn ? 'Mild Anxiety' : 'Kecemasan Ringan';
    color = 'var(--pastel-teal)';
  }

  const qLabels = isEn ? [
    'Feeling nervous, anxious, or on edge',
    'Not being able to stop or control worrying',
    'Worrying too much about different things',
    'Trouble relaxing',
    'Being so restless that it is hard to sit still',
    'Becoming easily annoyed or irritable',
    'Feeling afraid, as if something awful might happen'
  ] : [
    'Merasa gugup, cemas, atau gelisah',
    'Tidak mampu menghentikan atau mengendalikan rasa khawatir',
    'Terlalu mengkhawatirkan banyak hal yang berbeda',
    'Kesulitan untuk rileks/santai',
    'Sangat gelisah hingga sulit untuk duduk diam',
    'Menjadi mudah tersinggung atau gusar',
    'Merasa takut, seolah-olah sesuatu yang buruk akan terjadi'
  ];

  const handleSelect = (idx: number, val: number) => {
    const updated = [...answers];
    updated[idx] = val;
    setAnswers(updated);
  };

  const t = {
    title: isEn ? 'GAD-7 Generalized Anxiety Scale' : 'Skala Kecemasan Umum GAD-7',
    score: isEn ? 'Score' : 'Skor',
    points: isEn ? 'pts' : 'poin'
  };

  return (
    <div className="bento-card p-5 flex flex-col justify-between gap-4 w-full">
      <div>
        <div className="flex justify-between items-center pb-2 border-b border-[var(--border-color)]">
          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-[rgba(179,157,219,0.1)] text-[var(--pastel-purple)] font-mono">
            GAD-7 Anxiety
          </span>
          <span className="text-xs font-mono text-[var(--text-muted)]">Assessment</span>
        </div>

        <h3 className="text-base font-bold mt-2 text-[var(--text-primary)]">{t.title}</h3>

        <div className="flex flex-col gap-4 mt-4">
          {qLabels.map((q, idx) => (
            <div key={idx} className="flex flex-col gap-1 pb-2 border-b border-[rgba(255,255,255,0.03)]" role="radiogroup" aria-label={`GAD7 Question ${idx+1}: ${q}`}>
              <span className="text-[11px] text-[var(--text-secondary)]">{idx+1}. {q}</span>
              <div className="grid grid-cols-4 gap-1 p-0.5 bg-[var(--card-bg-inset)] rounded border border-[var(--border-color)] text-[10px]">
                {[0, 1, 2, 3].map((val) => (
                  <button
                    key={val}
                    type="button"
                    role="radio"
                    aria-checked={answers[idx] === val}
                    aria-label={`Score +${val}`}
                    onClick={() => handleSelect(idx, val)}
                    className={`py-2 px-1 rounded font-mono font-bold transition-all text-xs ${
                      answers[idx] === val 
                        ? 'bg-[var(--pastel-purple)] text-[var(--bg-color)]' 
                        : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    +{val}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-[var(--border-color)] flex justify-between items-center">
        <span className="text-xs font-mono text-[var(--text-secondary)]">{t.score}: {totalScore} {t.points}</span>
        <span className="text-xs font-bold px-2 py-0.5 rounded border" style={{ borderColor: color, color }}>
          {severity}
        </span>
      </div>
    </div>
  );
}

function CageCard({ lang }: { lang: 'en' | 'id' }) {
  const isEn = lang === 'en';
  const [q1, setQ1] = useState(0);
  const [q2, setQ2] = useState(0);
  const [q3, setQ3] = useState(0);
  const [q4, setQ4] = useState(0);

  const totalScore = q1 + q2 + q3 + q4;

  const t = {
    title: isEn ? 'CAGE Alcohol Questionnaire' : 'Kuesioner Skrining Alkohol CAGE',
    q1: isEn ? '1. Have you ever felt you should Cut down?' : '1. Apakah Anda pernah merasa harus Mengurangi minum?',
    q2: isEn ? '2. Have people Annoyed you by criticizing?' : '2. Apakah orang pernah Membuat Anda Kesal karena mengkritik?',
    q3: isEn ? '3. Have you ever felt Guilty about drinking?' : '3. Apakah Anda pernah merasa Bersalah tentang kebiasaan minum?',
    q4: isEn ? '4. Eye-opener in morning to steady nerves?' : '4. Penenang di pagi hari (Eye-opener) untuk menstabilkan saraf?',
    score: isEn ? 'Score' : 'Skor',
    points: isEn ? 'pts' : 'poin',
    positive: isEn ? 'Clinically Significant' : 'Signifikan secara Klinis',
    negative: isEn ? 'Normal / Low Risk' : 'Normal / Risiko Rendah',
    recommendPositive: isEn 
      ? 'Score \u2265 2 indicates high risk of alcohol abuse. Further diagnostic evaluation recommended.' 
      : 'Skor \u2265 2 menunjukkan risiko tinggi penyalahgunaan alkohol. Direkomendasikan evaluasi diagnostik lanjut.',
    recommendNegative: isEn 
      ? 'Low probability of alcohol dependency.' 
      : 'Probabilitas rendah ketergantungan alkohol.'
  };

  return (
    <div className="bento-card p-5 flex flex-col justify-between gap-4 w-full">
      <div>
        <div className="flex justify-between items-center pb-2 border-b border-[var(--border-color)]">
          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-[rgba(144,202,249,0.1)] text-[var(--pastel-blue)] font-mono">
            CAGE Screening
          </span>
          <span className="text-xs font-mono text-[var(--text-muted)]">Alcohol</span>
        </div>

        <h3 className="text-base font-bold mt-2 text-[var(--text-primary)]">{t.title}</h3>

        <div className="flex flex-col gap-3 mt-4 text-[11px]">
          <div className="flex justify-between items-center py-2.5 px-3.5 bg-[var(--card-bg-inset)] rounded border border-[var(--border-color)]">
            <label htmlFor="cage-q1" className="text-[var(--text-secondary)] cursor-pointer">{t.q1}</label>
            <input id="cage-q1" type="checkbox" checked={q1 === 1} onChange={(e) => setQ1(e.target.checked ? 1 : 0)} className="w-4 h-4 cursor-pointer" />
          </div>

          <div className="flex justify-between items-center py-2.5 px-3.5 bg-[var(--card-bg-inset)] rounded border border-[var(--border-color)]">
            <label htmlFor="cage-q2" className="text-[var(--text-secondary)] cursor-pointer">{t.q2}</label>
            <input id="cage-q2" type="checkbox" checked={q2 === 1} onChange={(e) => setQ2(e.target.checked ? 1 : 0)} className="w-4 h-4 cursor-pointer" />
          </div>

          <div className="flex justify-between items-center py-2.5 px-3.5 bg-[var(--card-bg-inset)] rounded border border-[var(--border-color)]">
            <label htmlFor="cage-q3" className="text-[var(--text-secondary)] cursor-pointer">{t.q3}</label>
            <input id="cage-q3" type="checkbox" checked={q3 === 1} onChange={(e) => setQ3(e.target.checked ? 1 : 0)} className="w-4 h-4 cursor-pointer" />
          </div>

          <div className="flex justify-between items-center py-2.5 px-3.5 bg-[var(--card-bg-inset)] rounded border border-[var(--border-color)]">
            <label htmlFor="cage-q4" className="text-[var(--text-secondary)] cursor-pointer">{t.q4}</label>
            <input id="cage-q4" type="checkbox" checked={q4 === 1} onChange={(e) => setQ4(e.target.checked ? 1 : 0)} className="w-4 h-4 cursor-pointer" />
          </div>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-[var(--border-color)] flex flex-col gap-2">
        <div className="flex justify-between items-center">
          <span className="text-xs text-[var(--text-secondary)] font-mono">{t.score}: {totalScore} {t.points}</span>
          <span className={`text-xs font-bold px-2 py-0.5 rounded border ${
            totalScore >= 2 ? 'bg-[rgba(239,83,80,0.1)] text-[#ef5350] border-[#ef5350]' : 'bg-[rgba(165,214,167,0.1)] text-[var(--pastel-green)] border-[var(--pastel-green)]'
          }`}>
            {totalScore >= 2 ? t.positive : t.negative}
          </span>
        </div>
        <div className="text-[10px] text-[var(--text-muted)] font-mono leading-relaxed bg-[var(--card-bg-inset)] p-2 rounded border border-[var(--border-color)]">
          {totalScore >= 2 ? t.recommendPositive : t.recommendNegative}
        </div>
      </div>
    </div>
  );
}

function CowsCard({ lang }: { lang: 'en' | 'id' }) {
  const isEn = lang === 'en';
  const [pulse, setPulse] = useState(0);
  const [sweat, setSweat] = useState(0);
  const [rest, setRest] = useState(0);
  const [pupil, setPupil] = useState(0);
  const [aches, setAches] = useState(0);
  const [gi, setGi] = useState(0);
  const [tremor, setTremor] = useState(0);
  const [yawn, setYawn] = useState(0);
  const [anx, setAnx] = useState(0);
  const [goose, setGoose] = useState(0);

  const totalScore = pulse + sweat + rest + pupil + aches + gi + tremor + yawn + anx + goose;

  let severity = isEn ? 'Mild Withdrawal' : 'Putus Obat Ringan';
  let color = 'var(--pastel-green)';

  if (totalScore > 36) {
    severity = isEn ? 'Severe Withdrawal' : 'Putus Obat Berat';
    color = '#ef5350';
  } else if (totalScore >= 25) {
    severity = isEn ? 'Moderately Severe' : 'Putus Obat Sedang-Berat';
    color = '#ffb74d';
  } else if (totalScore >= 13) {
    severity = isEn ? 'Moderate Withdrawal' : 'Putus Obat Sedang';
    color = 'var(--pastel-blue)';
  } else if (totalScore < 5) {
    severity = isEn ? 'No / Negligible' : 'Tidak Ada / Diabaikan';
    color = 'var(--text-muted)';
  }

  const t = {
    title: isEn ? 'Clinical Opiate Withdrawal Scale (COWS)' : 'Skala Putus Obat Opiat Klinis (COWS)',
    pulse: isEn ? 'Resting Heart Rate' : 'Denyut Jantung Istirahat',
    sweat: isEn ? 'Sweating (past 1/2 hour)' : 'Keringat (1/2 jam terakhir)',
    rest: isEn ? 'Restlessness (observation)' : 'Kegelisahan (observasi)',
    pupil: isEn ? 'Pupil Size' : 'Ukuran Pupil',
    aches: isEn ? 'Bone or Joint Aches' : 'Nyeri Tulang atau Sendi',
    gi: isEn ? 'GI Upset (past 1/2 hour)' : 'Gangguan Lambung/Pencernaan',
    tremor: isEn ? 'Tremor (outstretched hands)' : 'Tremor (tangan menjulur)',
    yawn: isEn ? 'Yawning (observation)' : 'Menguap (observasi)',
    anx: isEn ? 'Anxiety or Irritability' : 'Kecemasan atau Iritabilitas',
    goose: isEn ? 'Gooseflesh Skin' : 'Kulit Merinding (Gooseflesh)',
    score: isEn ? 'Score' : 'Skor',
    points: isEn ? 'pts' : 'poin'
  };

  return (
    <div className="bento-card p-5 flex flex-col justify-between gap-4 w-full">
      <div>
        <div className="flex justify-between items-center pb-2 border-b border-[var(--border-color)]">
          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-[rgba(165,214,167,0.1)] text-[var(--pastel-green)] font-mono">
            COWS (Withdrawal)
          </span>
          <span className="text-xs font-mono text-[var(--text-muted)]">Opiate</span>
        </div>

        <h3 className="text-base font-bold mt-2 text-[var(--text-primary)]">{t.title}</h3>

        <div className="flex flex-col gap-4 mt-4 text-xs">
          <div>
            <label htmlFor="cows-pulse" className="text-[var(--text-secondary)] block mb-0.5">{t.pulse}</label>
            <select id="cows-pulse" value={pulse} onChange={(e) => setPulse(Number(e.target.value))} className="w-full bg-[var(--card-bg-inset)] border border-[var(--border-color)] rounded py-2 px-3 text-xs focus:outline-none">
              <option value="0">{isEn ? 'Pulse \u2264 80 bpm (0)' : 'Nadi \u2264 80 bpm (0)'}</option>
              <option value="1">Pulse 81-100 bpm (1)</option>
              <option value="2">Pulse 101-120 bpm (2)</option>
              <option value="4">Pulse &gt; 120 bpm (4)</option>
            </select>
          </div>

          <div>
            <label htmlFor="cows-sweat" className="text-[var(--text-secondary)] block mb-0.5">{t.sweat}</label>
            <select id="cows-sweat" value={sweat} onChange={(e) => setSweat(Number(e.target.value))} className="w-full bg-[var(--card-bg-inset)] border border-[var(--border-color)] rounded py-2 px-3 text-xs focus:outline-none">
              <option value="0">{isEn ? 'No chills or sweating (0)' : 'Tidak menggigil/berkeringat (0)'}</option>
              <option value="1">{isEn ? 'Subjective chills or flushing (1)' : 'Menggigil/panas subjektif (1)'}</option>
              <option value="2">{isEn ? 'Flushed, moist face / sweat on brow (2)' : 'Wajah merah/lembab, dahi berkeringat (2)'}</option>
              <option value="3">{isEn ? 'Beads of sweat on brow/face (3)' : 'Butiran keringat jelas di dahi/wajah (3)'}</option>
              <option value="4">{isEn ? 'Sweat streaming down face (4)' : 'Keringat mengalir deras di wajah (4)'}</option>
            </select>
          </div>

          <div>
            <label htmlFor="cows-rest" className="text-[var(--text-secondary)] block mb-0.5">{t.rest}</label>
            <select id="cows-rest" value={rest} onChange={(e) => setRest(Number(e.target.value))} className="w-full bg-[var(--card-bg-inset)] border border-[var(--border-color)] rounded py-2 px-3 text-xs focus:outline-none">
              <option value="0">{isEn ? 'Able to sit still (0)' : 'Bisa duduk tenang (0)'}</option>
              <option value="1">{isEn ? 'Reports difficulty sitting still (1)' : 'Mengaku sulit duduk tenang (1)'}</option>
              <option value="3">{isEn ? 'Frequent shifting or squirming (3)' : 'Sering bergeser atau menggeliat (3)'}</option>
              <option value="5">{isEn ? 'Unable to sit still for more than a few seconds (5)' : 'Tidak bisa duduk tenang sama sekali (5)'}</option>
            </select>
          </div>

          <div>
            <label htmlFor="cows-pupil" className="text-[var(--text-secondary)] block mb-0.5">{t.pupil}</label>
            <select id="cows-pupil" value={pupil} onChange={(e) => setPupil(Number(e.target.value))} className="w-full bg-[var(--card-bg-inset)] border border-[var(--border-color)] rounded py-2 px-3 text-xs focus:outline-none">
              <option value="0">{isEn ? 'Pupils pinned or normal (0)' : 'Pupil mengecil atau normal (0)'}</option>
              <option value="1">{isEn ? 'Pupils larger than normal (1)' : 'Pupil lebih besar dari normal (1)'}</option>
              <option value="2">{isEn ? 'Pupils moderately dilated (2)' : 'Pupil dilatasi sedang (2)'}</option>
              <option value="5">{isEn ? 'Pupils extremely dilated / only rim of iris (5)' : 'Pupil sangat melebar/hanya terlihat pinggiran iris (5)'}</option>
            </select>
          </div>

          <div>
            <label htmlFor="cows-aches" className="text-[var(--text-secondary)] block mb-0.5">{t.aches}</label>
            <select id="cows-aches" value={aches} onChange={(e) => setAches(Number(e.target.value))} className="w-full bg-[var(--card-bg-inset)] border border-[var(--border-color)] rounded py-2 px-3 text-xs focus:outline-none">
              <option value="0">{isEn ? 'Not present (0)' : 'Tidak ada (0)'}</option>
              <option value="1">{isEn ? 'Mild diffuse discomfort (1)' : 'Ketidaknyamanan difus ringan (1)'}</option>
              <option value="2">{isEn ? 'Severe diffuse aches (2)' : 'Pegal difus parah (2)'}</option>
              <option value="4">{isEn ? 'Unable to sit still because of joint/muscle pain (4)' : 'Tidak bisa tenang karena nyeri sendi/otot (4)'}</option>
            </select>
          </div>

          <div>
            <label htmlFor="cows-gi" className="text-[var(--text-secondary)] block mb-0.5">{t.gi}</label>
            <select id="cows-gi" value={gi} onChange={(e) => setGi(Number(e.target.value))} className="w-full bg-[var(--card-bg-inset)] border border-[var(--border-color)] rounded py-2 px-3 text-xs focus:outline-none">
              <option value="0">{isEn ? 'No GI symptoms (0)' : 'Tidak ada gejala pencernaan (0)'}</option>
              <option value="1">{isEn ? 'Stomach cramps / nausea (1)' : 'Kram perut / mual (1)'}</option>
              <option value="2">{isEn ? 'Frequent diarrhea or loose stools (2)' : 'Sering diare atau feses cair (2)'}</option>
              <option value="3">{isEn ? 'Vomiting or diarrhea (3)' : 'Muntah atau diare (3)'}</option>
              <option value="5">{isEn ? 'Multiple episodes of diarrhea / vomiting (5)' : 'Beberapa kali muntah / diare parah (5)'}</option>
            </select>
          </div>

          <div>
            <label htmlFor="cows-tremor" className="text-[var(--text-secondary)] block mb-0.5">{t.tremor}</label>
            <select id="cows-tremor" value={tremor} onChange={(e) => setTremor(Number(e.target.value))} className="w-full bg-[var(--card-bg-inset)] border border-[var(--border-color)] rounded py-2 px-3 text-xs focus:outline-none">
              <option value="0">{isEn ? 'No tremor (0)' : 'Tidak ada tremor (0)'}</option>
              <option value="1">{isEn ? 'Tremor felt, not observed (1)' : 'Tremor terasa tapi tidak tampak (1)'}</option>
              <option value="2">{isEn ? 'Slight tremor visible (2)' : 'Tremor ringan terlihat (2)'}</option>
              <option value="4">{isEn ? 'Gross tremor / muscle twitching (4)' : 'Tremor kasar / otot berkedut parah (4)'}</option>
            </select>
          </div>

          <div>
            <label htmlFor="cows-yawn" className="text-[var(--text-secondary)] block mb-0.5">{t.yawn}</label>
            <select id="cows-yawn" value={yawn} onChange={(e) => setYawn(Number(e.target.value))} className="w-full bg-[var(--card-bg-inset)] border border-[var(--border-color)] rounded py-2 px-3 text-xs focus:outline-none">
              <option value="0">{isEn ? 'No yawning (0)' : 'Tidak menguap (0)'}</option>
              <option value="1">{isEn ? 'Yawning 1-2 times during interview (1)' : 'Menguap 1-2 kali selama wawancara (1)'}</option>
              <option value="2">{isEn ? 'Yawning 3 or more times (2)' : 'Menguap 3 kali atau lebih (2)'}</option>
              <option value="4">{isEn ? 'Yawning continuously (4)' : 'Menguap terus-menerus (4)'}</option>
            </select>
          </div>

          <div>
            <label htmlFor="cows-anx" className="text-[var(--text-secondary)] block mb-0.5">{t.anx}</label>
            <select id="cows-anx" value={anx} onChange={(e) => setAnx(Number(e.target.value))} className="w-full bg-[var(--card-bg-inset)] border border-[var(--border-color)] rounded py-2 px-3 text-xs focus:outline-none">
              <option value="0">{isEn ? 'None (0)' : 'Tidak ada (0)'}</option>
              <option value="1">{isEn ? 'Patient reports slight anxiety / tension (1)' : 'Pasien mengeluh cemas/tegang ringan (1)'}</option>
              <option value="2">{isEn ? 'Patient is obviously anxious or irritable (2)' : 'Pasien tampak cemas atau iritabel (2)'}</option>
              <option value="4">{isEn ? 'Severe anxiety / talks of suicide / combative (4)' : 'Cemas berat / bicara bunuh diri / tidak kooperatif (4)'}</option>
            </select>
          </div>

          <div>
            <label htmlFor="cows-goose" className="text-[var(--text-secondary)] block mb-0.5">{t.goose}</label>
            <select id="cows-goose" value={goose} onChange={(e) => setGoose(Number(e.target.value))} className="w-full bg-[var(--card-bg-inset)] border border-[var(--border-color)] rounded py-2 px-3 text-xs focus:outline-none">
              <option value="0">{isEn ? 'Skin is smooth (0)' : 'Kulit halus (0)'}</option>
              <option value="3">{isEn ? 'Piloerection can be felt / hair stands up (3)' : 'Bulu kuduk terasa berdiri (3)'}</option>
              <option value="5">{isEn ? 'Prominent piloerection / goosebumps obvious (5)' : 'Merinding sangat menonjol / goosebumps jelas (5)'}</option>
            </select>
          </div>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-[var(--border-color)] flex justify-between items-center">
        <span className="text-xs font-mono text-[var(--text-secondary)]">{t.score}: {totalScore} {t.points}</span>
        <span className="text-xs font-bold px-2 py-0.5 rounded border" style={{ borderColor: color, color }}>
          {severity}
        </span>
      </div>
    </div>
  );
}

function GcsCard({ lang }: { lang: 'en' | 'id' }) {
  const isEn = lang === 'en';
  const [eye, setEye] = useState(4);
  const [verbal, setVerbal] = useState(5);
  const [motor, setMotor] = useState(6);

  const total = eye + verbal + motor;

  let classification = isEn ? 'Mild Head Injury' : 'Cedera Kepala Ringan';
  let color = 'var(--pastel-green)';
  if (total <= 8) {
    classification = isEn ? 'Severe Injury (Coma)' : 'Cedera Kepala Berat (Koma)';
    color = '#ef5350';
  } else if (total <= 12) {
    classification = isEn ? 'Moderate Injury' : 'Cedera Kepala Sedang';
    color = '#ffb74d';
  }

  const t = {
    title: isEn ? 'Glasgow Coma Scale (GCS) Score' : 'Skor Skala Koma Glasgow (GCS)',
    eye: isEn ? 'Eye Opening (E)' : 'Respons Membuka Mata (E)',
    verbal: isEn ? 'Verbal Response (V)' : 'Respons Verbal (V)',
    motor: isEn ? 'Motor Response (M)' : 'Respons Motorik (M)',
    score: isEn ? 'Score' : 'Skor'
  };

  return (
    <div className="bento-card p-5 flex flex-col justify-between gap-4 w-full">
      <div>
        <div className="flex justify-between items-center pb-2 border-b border-[var(--border-color)]">
          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-[rgba(128,203,196,0.1)] text-[var(--pastel-teal)] font-mono">
            Glasgow Coma Scale
          </span>
          <span className="text-xs font-mono text-[var(--text-muted)]">GCS</span>
        </div>

        <h3 className="text-base font-bold mt-2 text-[var(--text-primary)]">{t.title}</h3>

        <div className="flex flex-col gap-4 mt-4 text-xs">
          <div>
            <label htmlFor="gcs-eye" className="text-[var(--text-secondary)] block mb-1">{t.eye}</label>
            <select id="gcs-eye" value={eye} onChange={(e) => setEye(Number(e.target.value))} className="w-full bg-[var(--card-bg-inset)] border border-[var(--border-color)] rounded py-2 px-3 text-xs focus:outline-none">
              <option value="4">{isEn ? '4 - Spontaneous' : '4 - Spontan'}</option>
              <option value="3">{isEn ? '3 - To sound' : '3 - Terhadap suara'}</option>
              <option value="2">{isEn ? '2 - To pressure' : '2 - Terhadap nyeri/tekanan'}</option>
              <option value="1">{isEn ? '1 - None' : '1 - Tidak ada respon'}</option>
            </select>
          </div>

          <div>
            <label htmlFor="gcs-verbal" className="text-[var(--text-secondary)] block mb-1">{t.verbal}</label>
            <select id="gcs-verbal" value={verbal} onChange={(e) => setVerbal(Number(e.target.value))} className="w-full bg-[var(--card-bg-inset)] border border-[var(--border-color)] rounded py-2 px-3 text-xs focus:outline-none">
              <option value="5">{isEn ? '5 - Oriented' : '5 - Orientasi baik'}</option>
              <option value="4">{isEn ? '4 - Confused' : '4 - Bingung (disorientasi)'}</option>
              <option value="3">{isEn ? '3 - Inappropriate words' : '3 - Kata-kata tidak tepat/kacau'}</option>
              <option value="2">{isEn ? '2 - Incomprehensible sounds' : '2 - Suara menggumam/tanpa arti'}</option>
              <option value="1">{isEn ? '1 - None' : '1 - Tidak ada respon'}</option>
            </select>
          </div>

          <div>
            <label htmlFor="gcs-motor" className="text-[var(--text-secondary)] block mb-1">{t.motor}</label>
            <select id="gcs-motor" value={motor} onChange={(e) => setMotor(Number(e.target.value))} className="w-full bg-[var(--card-bg-inset)] border border-[var(--border-color)] rounded py-2 px-3 text-xs focus:outline-none">
              <option value="6">{isEn ? '6 - Obeys commands' : '6 - Mematuhi perintah'}</option>
              <option value="5">{isEn ? '5 - Localising pain' : '5 - Melokalisir nyeri'}</option>
              <option value="4">{isEn ? '4 - Normal flexion (withdrawal)' : '4 - Menarik diri dari nyeri'}</option>
              <option value="3">{isEn ? '3 - Abnormal flexion (decorticate)' : '3 - Fleksi abnormal (dekortikasi)'}</option>
              <option value="2">{isEn ? '2 - Extension (decerebrate)' : '2 - Ekstensi abnormal (deserebrasi)'}</option>
              <option value="1">{isEn ? '1 - None' : '1 - Tidak ada respon'}</option>
            </select>
          </div>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-[var(--border-color)] flex flex-col gap-1">
        <div className="flex justify-between items-center">
          <span className="text-xs text-[var(--text-secondary)] font-mono">{t.score}: {total} / 15</span>
          <span className="text-xs font-bold px-2 py-0.5 rounded border" style={{ borderColor: color, color }}>
            {classification}
          </span>
        </div>
      </div>
    </div>
  );
}

interface MseBuilderProps {
  lang: 'en' | 'id';
  handleCopy: (text: string, id: string) => void;
  copiedText: string | null;
}

function MseBuilderCard({ lang, handleCopy, copiedText }: MseBuilderProps) {
  const isEn = lang === 'en';
  const [appearance, setAppearance] = useState(isEn ? 'neatly groomed and dressed appropriately' : 'tampak rapi dan berpakaian sesuai');
  const [behavior, setBehavior] = useState(isEn ? 'cooperative, establishing good eye contact' : 'kooperatif dengan kontak mata yang baik');
  const [speech, setSpeech] = useState(isEn ? 'normal rate, volume, and modulation' : 'kecepatan, volume, dan modulasi suara normal');
  const [mood, setMood] = useState(isEn ? 'euthymic' : 'eutimik');
  const [thoughtProcess, setThoughtProcess] = useState(isEn ? 'linear, logical, and goal-directed' : 'linear, logis, dan terarah');
  const [thoughtContent, setThoughtContent] = useState(isEn ? 'denies suicidal or homicidal ideation, no evidence of delusions or hallucinations' : 'menyangkal ide bunuh diri/menyakiti orang lain, tidak ada delusi atau halusinasi');
  const [cognition, setCognition] = useState(isEn ? 'intact to gross examination' : 'utuh pada pemeriksaan kasar');
  const [judgment, setJudgment] = useState(isEn ? 'good (appropriate awareness and decisions)' : 'baik (kesadaran dan keputusan tepat)');

  const generatedNote = isEn ? `MENTAL STATUS EXAMINATION:
The patient is ${appearance} and is ${behavior} during the interview. Speech is ${speech}. Mood is described as ${mood} with a congruent, reactive affect. Thought process is ${thoughtProcess}. Thought content is notable for: ${thoughtContent}. Cognition appears ${cognition}. Insight and judgment are assessed as ${judgment}.` : `PEMERIKSAAN STATUS MENTAL:
Pasien ${appearance} dan tampak ${behavior} selama wawancara. Bicara pasien ${speech}. Afek dan mood dinilai ${mood} dengan kesesuaian afek. Proses berpikir pasien ${thoughtProcess}. Isi pikiran pasien dicatat: ${thoughtContent}. Fungsi kognitif tampak ${cognition}. Insight (pemahaman diri) dan judgment (penilaian klinis) dinilai ${judgment}.`;

  const t = {
    title: isEn ? 'Mental Status Exam Note Builder' : 'Penyusun Catatan Status Mental (MSE)',
    app: isEn ? 'Appearance' : 'Penampilan fisik',
    beh: isEn ? 'Behavior' : 'Perilaku/Sikap',
    sp: isEn ? 'Speech' : 'Cara Bicara',
    mood: isEn ? 'Mood / Affect' : 'Mood / Afek',
    thought: isEn ? 'Thought Process' : 'Proses Berpikir',
    cog: isEn ? 'Cognition' : 'Kognisi (Daya Ingat)',
    content: isEn ? 'Thought Content' : 'Isi Pikiran',
    insight: isEn ? 'Insight / Judgment' : 'Insight & Penilaian',
    output: isEn ? 'Structured MSE Output:' : 'Output Teks Catatan MSE:',
    copy: isEn ? 'Copy Note' : 'Salin Catatan',
    copied: isEn ? 'Copied!' : 'Tersalin!'
  };

  return (
    <div className="bento-card p-5 flex flex-col justify-between gap-4 w-full">
      <div>
        <div className="flex justify-between items-center pb-2 border-b border-[var(--border-color)]">
          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-[rgba(179,157,219,0.1)] text-[var(--pastel-purple)] font-mono">
            MSE Note Builder
          </span>
          <span className="text-xs font-mono text-[var(--text-muted)]">Helper</span>
        </div>

        <h3 className="text-base font-bold mt-2 text-[var(--text-primary)]">{t.title}</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4 text-[11px]">
          <div>
            <label htmlFor="mse-app" className="text-[var(--text-secondary)] block mb-0.5">{t.app}</label>
            <select id="mse-app" value={appearance} onChange={(e) => setAppearance(e.target.value)} className="w-full bg-[var(--card-bg-inset)] border border-[var(--border-color)] rounded py-2 px-3 text-xs focus:outline-none">
              {isEn ? (
                <>
                  <option value="neatly groomed and dressed appropriately">Neatly Groomed / Appropriate</option>
                  <option value="casual and appropriately dressed">Casual / Appropriate</option>
                  <option value="disheveled with poor hygiene">Disheveled / Poor Hygiene</option>
                </>
              ) : (
                <>
                  <option value="tampak rapi dan berpakaian sesuai">Rapi / Sesuai</option>
                  <option value="tampak kasual dan berpakaian pantas">Kasual / Pantas</option>
                  <option value="tampak lusuh dengan kebersihan diri kurang">Lusuh / Higiene Kurang</option>
                </>
              )}
            </select>
          </div>

          <div>
            <label htmlFor="mse-beh" className="text-[var(--text-secondary)] block mb-0.5">{t.beh}</label>
            <select id="mse-beh" value={behavior} onChange={(e) => setBehavior(e.target.value)} className="w-full bg-[var(--card-bg-inset)] border border-[var(--border-color)] rounded py-2 px-3 text-xs focus:outline-none">
              {isEn ? (
                <>
                  <option value="cooperative, establishing good eye contact">Cooperative / Good Eye Contact</option>
                  <option value="guarded, reluctant to answer questions">Guarded / Hesitant</option>
                  <option value="hostile and easily agitated">Hostile / Agitated</option>
                </>
              ) : (
                <>
                  <option value="kooperatif dengan kontak mata yang baik">Kooperatif / Kontak Mata Baik</option>
                  <option value="curiga, enggan menjawab pertanyaan">Waspada / Ragu-ragu</option>
                  <option value="bermusuhan dan mudah terpancing marah">Bermusuhan / Agitatif</option>
                </>
              )}
            </select>
          </div>

          <div>
            <label htmlFor="mse-sp" className="text-[var(--text-secondary)] block mb-0.5">{t.sp}</label>
            <select id="mse-sp" value={speech} onChange={(e) => setSpeech(e.target.value)} className="w-full bg-[var(--card-bg-inset)] border border-[var(--border-color)] rounded py-2 px-3 text-xs focus:outline-none">
              {isEn ? (
                <>
                  <option value="normal rate, volume, and modulation">Normal Rate & Volume</option>
                  <option value="pressured and rapid">Pressured & Rapid</option>
                  <option value="slowed, monotonic, and quiet">Slowed & Quiet</option>
                </>
              ) : (
                <>
                  <option value="kecepatan, volume, dan modulasi suara normal">Normal (Kecepatan & Volume)</option>
                  <option value="cepat, meledak-ledak, dan pressured">Cepat & Tertekan (Pressured)</option>
                  <option value="lambat, monoton, dan lirih">Lambat & Lirih</option>
                </>
              )}
            </select>
          </div>

          <div>
            <label htmlFor="mse-mood" className="text-[var(--text-secondary)] block mb-0.5">{t.mood}</label>
            <select id="mse-mood" value={mood} onChange={(e) => setMood(e.target.value)} className="w-full bg-[var(--card-bg-inset)] border border-[var(--border-color)] rounded py-2 px-3 text-xs focus:outline-none">
              {isEn ? (
                <>
                  <option value="euthymic">Euthymic</option>
                  <option value="depressed and dysphoric">Depressed</option>
                  <option value="anxious and tense">Anxious</option>
                </>
              ) : (
                <>
                  <option value="eutimik">Eutimik (Normal)</option>
                  <option value="depresi dan disforik">Depresi</option>
                  <option value="cemas dan tegang">Cemas</option>
                </>
              )}
            </select>
          </div>

          <div>
            <label htmlFor="mse-thought" className="text-[var(--text-secondary)] block mb-0.5">{t.thought}</label>
            <select id="mse-thought" value={thoughtProcess} onChange={(e) => setThoughtProcess(e.target.value)} className="w-full bg-[var(--card-bg-inset)] border border-[var(--border-color)] rounded py-2 px-3 text-xs focus:outline-none">
              {isEn ? (
                <>
                  <option value="linear, logical, and goal-directed">Linear & Goal-directed</option>
                  <option value="circumstantial but ultimately goal-directed">Circumstantial</option>
                  <option value="tangential, frequently drifting from topics">Tangential</option>
                </>
              ) : (
                <>
                  <option value="linear, logis, dan terarah">Linear, Logis & Terarah</option>
                  <option value="sirkumstansial (berputar-putar tapi sampai tujuan)">Sirkumstansial</option>
                  <option value="tangensial (melebar tanpa pernah sampai tujuan)">Tangensial</option>
                </>
              )}
            </select>
          </div>

          <div>
            <label htmlFor="mse-cog" className="text-[var(--text-secondary)] block mb-0.5">{t.cog}</label>
            <select id="mse-cog" value={cognition} onChange={(e) => setCognition(e.target.value)} className="w-full bg-[var(--card-bg-inset)] border border-[var(--border-color)] rounded py-2 px-3 text-xs focus:outline-none">
              {isEn ? (
                <>
                  <option value="intact to gross examination">Intact</option>
                  <option value="mildly impaired with distractibility">Mildly Impaired</option>
                  <option value="severely impaired / unable to recall orientation">Severely Impaired</option>
                </>
              ) : (
                <>
                  <option value="utuh pada pemeriksaan kasar">Utuh (Intact)</option>
                  <option value="terganggu ringan dengan distraksi">Terganggu Ringan</option>
                  <option value="terganggu berat / disorientasi total">Terganggu Berat (Disorientasi)</option>
                </>
              )}
            </select>
          </div>

          <div className="md:col-span-2">
            <label htmlFor="mse-content" className="text-[var(--text-secondary)] block mb-0.5">{t.content}</label>
            <select id="mse-content" value={thoughtContent} onChange={(e) => setThoughtContent(e.target.value)} className="w-full bg-[var(--card-bg-inset)] border border-[var(--border-color)] rounded py-2 px-3 text-xs focus:outline-none">
              {isEn ? (
                <>
                  <option value="denies suicidal or homicidal ideation, no evidence of delusions or hallucinations">Normal (Denies SI/HI, no delusions)</option>
                  <option value="reports passive suicidal ideation without active plan or intent">Passive Suicidal Ideation</option>
                  <option value="demonstrates paranoid delusions and auditory hallucinations">Paranoid Delusions & Auditory Hallucinations</option>
                </>
              ) : (
                <>
                  <option value="menyangkal ide bunuh diri/menyakiti orang lain, tidak ada delusi atau halusinasi">Normal (Menyangkal SI/HI, tanpa waham)</option>
                  <option value="mengeluhkan ide bunuh diri pasif tanpa rencana aktif">Ide Bunuh Diri Pasif</option>
                  <option value="menunjukkan waham curiga dan halusinasi auditori">Waham Curiga & Halusinasi Auditori</option>
                </>
              )}
            </select>
          </div>

          <div className="md:col-span-2">
            <label htmlFor="mse-insight" className="text-[var(--text-secondary)] block mb-0.5">{t.insight}</label>
            <select id="mse-insight" value={judgment} onChange={(e) => setJudgment(e.target.value)} className="w-full bg-[var(--card-bg-inset)] border border-[var(--border-color)] rounded py-2 px-3 text-xs focus:outline-none font-mono">
              {isEn ? (
                <>
                  <option value="good (appropriate awareness and decisions)">Good</option>
                  <option value="fair (limited awareness of illness, but safe behaviors)">Fair</option>
                  <option value="poor (denies psychiatric condition and safety risks)">Poor</option>
                </>
              ) : (
                <>
                  <option value="baik (kesadaran dan keputusan tepat)">Baik</option>
                  <option value="sedang (kesadaran terbatas, perilaku aman)">Sedang</option>
                  <option value="buruk (menolak kondisi sakit, ada risiko keamanan)">Buruk</option>
                </>
              )}
            </select>
          </div>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-[var(--border-color)] flex flex-col gap-2">
        <div className="flex justify-between items-center text-xs">
          <span className="text-[var(--text-secondary)] font-mono">{t.output}</span>
          <button 
            type="button" 
            onClick={() => handleCopy(generatedNote, 'mse')}
            aria-label="Copy Generated Mental Status Exam Note"
            className="text-[10px] px-3 py-1.5 rounded border border-[var(--border-color)] hover:border-[var(--pastel-purple)] text-[var(--text-secondary)] hover:text-[var(--pastel-purple)] flex items-center gap-1 transition-all"
          >
            {copiedText === 'mse' ? (
              <>
                <Check size={10} /> {t.copied}
              </>
            ) : (
              <>
                <Clipboard size={10} /> {t.copy}
              </>
            )}
          </button>
        </div>
        <pre className="text-[10px] text-[var(--text-secondary)] font-mono leading-relaxed bg-[var(--card-bg-inset)] p-2.5 rounded border border-[var(--border-color)] overflow-x-auto select-all whitespace-pre-wrap">
          {generatedNote}
        </pre>
      </div>
    </div>
  );
}

function AimsCard({ lang }: { lang: 'en' | 'id' }) {
  const isEn = lang === 'en';
  const [answers, setAnswers] = useState<number[]>(new Array(7).fill(0));

  const totalScore = answers.reduce((a, b) => a + b, 0);

  const areasAbove2 = answers.slice(0, 6).filter(x => x >= 2).length;
  const areasAbove3 = answers.slice(0, 6).filter(x => x >= 3).length;
  const tdSuspected = areasAbove2 >= 2 || areasAbove3 >= 1;

  const handleSelect = (idx: number, val: number) => {
    const updated = [...answers];
    updated[idx] = val;
    setAnswers(updated);
  };

  const qLabels = isEn ? [
    'Facial / Oral (muscles of expression)',
    'Lips / Mouth (puckering, sucking)',
    'Jaw (biting, chewing, lateral movements)',
    'Tongue (darting in/out, tremor)',
    'Upper Extremity (arms, wrists, fingers)',
    'Lower Extremity (legs, knees, ankles)',
    'Trunk (neck, shoulders, hips rocking)'
  ] : [
    'Fasial / Oral (otot ekspresi wajah)',
    'Bibir / Mulut (mengerut, menghisap)',
    'Rahang (menggigit, mengunyah, gerakan lateral)',
    'Lidah (menjulur keluar/masuk, tremor)',
    'Ekstremitas Atas (lengan, pergelangan, jari)',
    'Ekstremitas Bawah (kaki, lutut, pergelangan kaki)',
    'Batang Tubuh (leher, bahu, pinggul bergoyang)'
  ];

  const t = {
    title: isEn ? 'AIMS Abnormal Involuntary Movement Scale' : 'Skala Gerakan Involunter Abnormal AIMS',
    score: isEn ? 'Score' : 'Skor',
    points: isEn ? 'pts' : 'poin',
    suspected: isEn ? 'TD Suspected' : 'Waspada Tardive Dyskinesia',
    negative: isEn ? 'Negative' : 'Negatif (Normal)'
  };

  return (
    <div className="bento-card p-5 flex flex-col justify-between gap-4 w-full">
      <div>
        <div className="flex justify-between items-center pb-2 border-b border-[var(--border-color)]">
          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-[rgba(179,157,219,0.1)] text-[var(--pastel-purple)] font-mono">
            AIMS Dyskinesia
          </span>
          <span className="text-xs font-mono text-[var(--text-muted)]">Scale</span>
        </div>

        <h3 className="text-base font-bold mt-2 text-[var(--text-primary)]">{t.title}</h3>

        <div className="flex flex-col gap-4 mt-4">
          {qLabels.map((q, idx) => (
            <div key={idx} className="flex flex-col gap-1 pb-2 border-b border-[rgba(255,255,255,0.03)] text-xs" role="radiogroup" aria-label={`AIMS Question ${idx+1}: ${q}`}>
              <span className="text-[11px] text-[var(--text-secondary)]">{idx+1}. {q}</span>
              <div className="grid grid-cols-5 gap-1 p-0.5 bg-[var(--card-bg-inset)] rounded border border-[var(--border-color)] text-[10px]">
                {[0, 1, 2, 3, 4].map((val) => (
                  <button
                    key={val}
                    type="button"
                    role="radio"
                    aria-checked={answers[idx] === val}
                    aria-label={`Score ${val}`}
                    onClick={() => handleSelect(idx, val)}
                    className={`py-2 px-1 rounded font-mono font-bold transition-all text-xs ${
                      answers[idx] === val 
                        ? 'bg-[var(--pastel-purple)] text-[var(--bg-color)]' 
                        : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    {val}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-[var(--border-color)] flex flex-col gap-1">
        <div className="flex justify-between items-center">
          <span className="text-xs font-mono text-[var(--text-secondary)]">{t.score}: {totalScore} {t.points}</span>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
            tdSuspected 
              ? 'bg-[rgba(239,83,80,0.1)] text-[#ef5350] border-[#ef5350]' 
              : 'bg-[rgba(165,214,167,0.1)] text-[var(--pastel-green)] border-[var(--pastel-green)]'
          }`}>
            {tdSuspected ? t.suspected : t.negative}
          </span>
        </div>
      </div>
    </div>
  );
}

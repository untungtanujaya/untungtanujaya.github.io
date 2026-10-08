export const specialties = ['radiology', 'psychiatry'] as const;
export const tools = [
  ['radiology', 'acr-ti-rads', 'ACR TI-RADS', 'Thyroid nodule assessment', '甲状腺结节评估'],
  ['radiology', 'lung-rads', 'Lung-RADS v2022', 'Pulmonary nodule classification', '肺结节分类'],
  ['radiology', 'spn-malignancy', 'Mayo SPN Risk', 'Solitary pulmonary nodule risk', '孤立性肺结节风险'],
  ['radiology', 'mehran-cin', 'Mehran Score', 'Contrast-related renal risk', '造影剂相关肾脏风险'],
  ['radiology', 'pi-rads', 'PI-RADS v2.1', 'Prostate MRI scoring', '前列腺 MRI 评分'],
  ['radiology', 'pediatric-egfr', 'Pediatric eGFR', 'Bedside Schwartz equation', '儿童肾小球滤过率估算'],
  ['radiology', 'ct-dose', 'CT Effective Dose', 'DLP to effective dose', 'CT 有效剂量估算'],
  ['psychiatry', 'phq-9', 'PHQ-9', 'Depression severity scale', '抑郁症状量表'],
  ['psychiatry', 'gad-7', 'GAD-7', 'Anxiety severity scale', '焦虑症状量表'],
  ['psychiatry', 'cage', 'CAGE', 'Alcohol screening questionnaire', '饮酒筛查问卷'],
  ['psychiatry', 'cows', 'COWS', 'Opiate withdrawal scale', '阿片类药物戒断量表'],
  ['psychiatry', 'gcs', 'Glasgow Coma Scale', 'Consciousness assessment', '意识水平评估'],
  ['psychiatry', 'mse-builder', 'MSE Builder', 'Mental status examination notes', '精神状态检查记录'],
  ['psychiatry', 'aims', 'AIMS', 'Involuntary movement scale', '不自主运动量表'],
] as const;

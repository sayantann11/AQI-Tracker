import { AQICategoryId, AQICategoryInfo } from '@/types/aqi';

export const AQI_CATEGORIES: Record<AQICategoryId, AQICategoryInfo> = {
  good: {
    id: 'good',
    label: 'Good',
    min: 0,
    max: 50,
    color: '#10b981',
    bgColor: 'rgba(16, 185, 129, 0.12)',
    borderColor: 'rgba(16, 185, 129, 0.35)',
    textColor: '#34d399',
    healthStatement: 'Minimal health impact.',
    actionAdvice: 'Air quality is considered satisfactory, and air pollution poses little or no risk. Great time for outdoor activities.',
    sensitiveGroupAdvice: 'Enjoy regular outdoor activities without precaution.',
    maskRecommended: false,
    purifierRecommended: false,
    outdoorExerciseAdvice: 'safe',
  },
  satisfactory: {
    id: 'satisfactory',
    label: 'Satisfactory',
    min: 51,
    max: 100,
    color: '#84cc16',
    bgColor: 'rgba(132, 204, 22, 0.12)',
    borderColor: 'rgba(132, 204, 22, 0.35)',
    textColor: '#a3e635',
    healthStatement: 'Minor breathing discomfort to sensitive people.',
    actionAdvice: 'Air quality is acceptable; however, unusually sensitive individuals may experience slight respiratory irritation.',
    sensitiveGroupAdvice: 'People with respiratory or cardiac conditions should observe how they feel.',
    maskRecommended: false,
    purifierRecommended: false,
    outdoorExerciseAdvice: 'safe',
  },
  moderate: {
    id: 'moderate',
    label: 'Moderate',
    min: 101,
    max: 200,
    color: '#eab308',
    bgColor: 'rgba(234, 179, 8, 0.12)',
    borderColor: 'rgba(234, 179, 8, 0.35)',
    textColor: '#facc15',
    healthStatement: 'Breathing discomfort to people with asthma, heart and lung diseases.',
    actionAdvice: 'Healthy individuals may notice slight throat irritation during intense outdoor exertion.',
    sensitiveGroupAdvice: 'Children, the elderly, and those with asthma or cardiac conditions should reduce strenuous outdoor exertion.',
    maskRecommended: false,
    purifierRecommended: true,
    outdoorExerciseAdvice: 'caution',
  },
  poor: {
    id: 'poor',
    label: 'Poor',
    min: 201,
    max: 300,
    color: '#f97316',
    bgColor: 'rgba(249, 115, 22, 0.12)',
    borderColor: 'rgba(249, 115, 22, 0.35)',
    textColor: '#fb923c',
    healthStatement: 'Breathing discomfort to most people on prolonged exposure.',
    actionAdvice: 'Everyone may begin to experience health effects; members of sensitive groups may experience more serious health effects.',
    sensitiveGroupAdvice: 'Avoid prolonged outdoor exertion. Wear an N95 certified mask if stepping outside near major traffic.',
    maskRecommended: true,
    purifierRecommended: true,
    outdoorExerciseAdvice: 'avoid',
  },
  very_poor: {
    id: 'very_poor',
    label: 'Very Poor',
    min: 301,
    max: 400,
    color: '#ef4444',
    bgColor: 'rgba(239, 68, 68, 0.15)',
    borderColor: 'rgba(239, 68, 68, 0.4)',
    textColor: '#f87171',
    healthStatement: 'Respiratory illness on prolonged exposure.',
    actionAdvice: 'Health alert: The risk of health effects is substantially increased for all population segments. Keep windows closed.',
    sensitiveGroupAdvice: 'Remain indoors. Keep HEPA purifiers running. Wear an N95/FFP2 mask when commuting outdoors.',
    maskRecommended: true,
    purifierRecommended: true,
    outdoorExerciseAdvice: 'strictly_avoid',
  },
  severe: {
    id: 'severe',
    label: 'Severe',
    min: 401,
    max: 500,
    color: '#991b1b',
    bgColor: 'rgba(153, 27, 27, 0.25)',
    borderColor: 'rgba(153, 27, 27, 0.5)',
    textColor: '#fca5a5',
    healthStatement: 'Affects healthy people and seriously impacts those with existing diseases.',
    actionAdvice: 'Emergency health warning: High risk of acute respiratory and cardiovascular distress. Avoid all outdoor physical activity.',
    sensitiveGroupAdvice: 'Strictly remain indoors with filtered air. High-grade N95 or N99 masks mandatory for necessary outdoor travel.',
    maskRecommended: true,
    purifierRecommended: true,
    outdoorExerciseAdvice: 'strictly_avoid',
  },
};

/**
 * Returns the matching CPCB AQI Category for a given numerical AQI value.
 */
export function getAQICategory(aqi: number | null): AQICategoryInfo {
  if (aqi === null || isNaN(aqi)) {
    return {
      id: 'moderate',
      label: 'Unavailable',
      min: 0,
      max: 0,
      color: '#64748b',
      bgColor: 'rgba(100, 116, 139, 0.1)',
      borderColor: 'rgba(100, 116, 139, 0.2)',
      textColor: '#94a3b8',
      healthStatement: 'Monitoring station offline or insufficient data.',
      actionAdvice: 'Check back shortly or refer to the nearest operational station.',
      sensitiveGroupAdvice: 'Monitor nearby operational stations.',
      maskRecommended: false,
      purifierRecommended: false,
      outdoorExerciseAdvice: 'caution',
    };
  }

  const rounded = Math.round(aqi);

  if (rounded <= 50) return AQI_CATEGORIES.good;
  if (rounded <= 100) return AQI_CATEGORIES.satisfactory;
  if (rounded <= 200) return AQI_CATEGORIES.moderate;
  if (rounded <= 300) return AQI_CATEGORIES.poor;
  if (rounded <= 400) return AQI_CATEGORIES.very_poor;
  return AQI_CATEGORIES.severe;
}

'use client';

import React from 'react';
import { AQICategoryInfo } from '@/types/aqi';
import {
  ShieldAlert,
  Activity,
  Heart,
  Home,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  HelpCircle,
} from 'lucide-react';

interface HealthAdvisoryProps {
  category: AQICategoryInfo;
}

export const HealthAdvisory: React.FC<HealthAdvisoryProps> = ({ category }) => {
  return (
    <section id="health-guide" className="py-12 border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div>
          <span className="text-xs font-mono uppercase text-emerald-400 font-semibold tracking-wider">
            Health Guidance
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Official Indian NAQI Health Advisory
          </h2>
          <p className="text-xs sm:text-sm text-gray-400 mt-1 max-w-xl">
            Actionable guidance based on official Central Pollution Control Board public health
            frameworks for the current <strong className="text-white">"{category.label}"</strong> air quality band.
          </p>
        </div>

        {/* 4 Action Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Outdoor Exercise */}
          <div className="p-5 rounded-2xl bg-[#0e141f] border border-white/10 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                <Activity className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-white text-xs uppercase tracking-wide">Outdoor Exercise</h3>
            </div>
            <div className="pt-1">
              {category.outdoorExerciseAdvice === 'safe' && (
                <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-semibold">
                  <CheckCircle2 className="w-4 h-4" /> Normal Outdoor Activity
                </div>
              )}
              {category.outdoorExerciseAdvice === 'caution' && (
                <div className="flex items-center gap-1.5 text-amber-400 text-xs font-semibold">
                  <AlertTriangle className="w-4 h-4" /> Reduce Heavy Exertion
                </div>
              )}
              {(category.outdoorExerciseAdvice === 'avoid' || category.outdoorExerciseAdvice === 'strictly_avoid') && (
                <div className="flex items-center gap-1.5 text-rose-400 text-xs font-semibold">
                  <XCircle className="w-4 h-4" /> Strictly Avoid Outdoor Workouts
                </div>
              )}
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">
              {category.outdoorExerciseAdvice === 'safe'
                ? 'Air quality is clear. Ideal conditions for morning jogs, cycling, and sports.'
                : category.outdoorExerciseAdvice === 'caution'
                ? 'Sensitive individuals should shift intense running indoors or take frequent breaks.'
                : 'Heavy outdoor exertion increases particulate deposition deep into pulmonary bronchioles. Exercise indoors.'}
            </p>
          </div>

          {/* Mask Guidance */}
          <div className="p-5 rounded-2xl bg-[#0e141f] border border-white/10 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-400">
                <ShieldAlert className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-white text-xs uppercase tracking-wide">Respiratory Protection</h3>
            </div>
            <div className="pt-1">
              <div
                className={`flex items-center gap-1.5 text-xs font-semibold ${
                  category.maskRecommended ? 'text-amber-400' : 'text-emerald-400'
                }`}
              >
                {category.maskRecommended ? (
                  <>
                    <AlertTriangle className="w-4 h-4" /> N95 Mask Recommended
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" /> Mask Not Required
                  </>
                )}
              </div>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">
              {category.maskRecommended
                ? 'Wear a snug-fitting, certified N95 or FFP2 respirator when commuting near traffic corridors. Cloth and surgical masks do not filter PM2.5.'
                : 'Ambient particulate levels are within tolerable thresholds. Outdoor masks are not required for the general public.'}
            </p>
          </div>

          {/* Sensitive Groups */}
          <div className="p-5 rounded-2xl bg-[#0e141f] border border-white/10 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-rose-500/10 flex items-center justify-center text-rose-400">
                <Heart className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-white text-xs uppercase tracking-wide">Sensitive Groups</h3>
            </div>
            <div className="pt-1 text-xs text-gray-200 font-medium">
              Children, elderly, cardiac & asthma patients
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">
              {category.sensitiveGroupAdvice}
            </p>
          </div>

          {/* Indoor Air & Ventilation */}
          <div className="p-5 rounded-2xl bg-[#0e141f] border border-white/10 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                <Home className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-white text-xs uppercase tracking-wide">Indoor Environment</h3>
            </div>
            <div className="pt-1">
              <div
                className={`flex items-center gap-1.5 text-xs font-semibold ${
                  category.purifierRecommended ? 'text-cyan-400' : 'text-emerald-400'
                }`}
              >
                {category.purifierRecommended ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" /> Keep HEPA Purifier Running
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" /> Natural Ventilation Safe
                  </>
                )}
              </div>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">
              {category.purifierRecommended
                ? 'Keep windows shut during peak morning smog hours (5 AM - 9 AM). Run True-HEPA air purifiers in sealed living spaces.'
                : 'Safe to open windows for cross-ventilation and fresh airflow throughout the day.'}
            </p>
          </div>
        </div>

        {/* Official Medical Disclaimer */}
        <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-xs text-gray-400 flex items-start gap-2.5">
          <HelpCircle className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong className="text-gray-300">Disclaimer:</strong> This health advisory is compiled directly from the
            official public guidelines of the Central Pollution Control Board (CPCB) and the Ministry of Environment, Forest
            and Climate Change (MoEFCC). It is intended for public health awareness and does not replace medical advice. If
            you experience acute shortness of breath or persistent chest discomfort, consult a qualified physician.
          </p>
        </div>
      </div>
    </section>
  );
};

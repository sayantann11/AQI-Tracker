'use client';

import React from 'react';
import { StationMeasurement, PollutantId } from '@/types/aqi';
import { getAQICategory } from '@/lib/aqi/category';
import { Info, AlertCircle, CheckCircle } from 'lucide-react';

interface PollutantCardsProps {
  station: StationMeasurement;
}

const POLLUTANT_DESCRIPTIONS: Record<PollutantId, string> = {
  pm25: 'Combustion particles, organic compounds, metals (<2.5 µm). Penetrates deep into lung alveoli and bloodstream.',
  pm10: 'Inhalable dust, pollen, and smoke particles (<10 µm). Aggravates asthma and irritates the upper respiratory tract.',
  no2: 'Emissions from vehicular exhaust and power plants. Causes inflammation of the airways and worsens bronchitis.',
  so2: 'Fossil fuel combustion from industrial power plants. Causes throat tightness and acute bronchoconstriction.',
  co: 'Incomplete combustion from vehicles. Reduces blood oxygen delivery to the heart and brain.',
  o3: 'Ground-level photochemical smog formed by sunlight reacting with pollutants. Triggers chest pain and coughing.',
  nh3: 'Agricultural runoff and industrial emissions. Pungent gas causing ocular, nasal, and respiratory tract irritation.',
};

export const PollutantCards: React.FC<PollutantCardsProps> = ({ station }) => {
  const pollutantOrder: PollutantId[] = ['pm25', 'pm10', 'no2', 'so2', 'co', 'o3', 'nh3'];

  return (
    <section id="pollutants" className="py-12 border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-mono uppercase text-emerald-400 font-semibold tracking-wider">
              Telemetry Breakdown
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Monitored Pollutants
            </h2>
            <p className="text-xs sm:text-sm text-gray-400 mt-1 max-w-xl">
              Live concentrations and calculated CPCB sub-indices at {station.name}. Only verified
              sensor streams reported by the monitoring station are displayed.
            </p>
          </div>

          <div className="text-[11px] font-mono text-gray-400 bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl self-start sm:self-auto">
            <span>CPCB Indian Breakpoint Standard</span>
          </div>
        </div>

        {/* Grid of Pollutant Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {pollutantOrder.map((pid) => {
            const reading = station.pollutants[pid];
            const isAvailable = reading && reading.isAvailable && reading.value !== null;
            const subCategory = getAQICategory(reading?.subIndex ?? null);

            return (
              <div
                key={pid}
                className="p-5 rounded-2xl bg-[#0e141f] border border-white/10 hover:border-white/20 transition-all shadow-md space-y-3 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-xl font-bold font-mono text-white tracking-tight">
                        {reading.formula}
                      </span>
                      <p className="text-xs text-gray-400 leading-snug">{reading.name}</p>
                    </div>

                    {isAvailable ? (
                      <span
                        className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded border"
                        style={{
                          backgroundColor: subCategory.bgColor,
                          color: subCategory.textColor,
                          borderColor: subCategory.borderColor,
                        }}
                      >
                        Sub-Index: {reading.subIndex}
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono text-gray-400 bg-white/5 px-2 py-0.5 rounded border border-white/5">
                        {reading?.pollutantStatus === 'not_monitored' ? 'Not Monitored' : 'Sensor Offline'}
                      </span>
                    )}
                  </div>

                  {/* Reading Value */}
                  <div className="pt-3 pb-2">
                    {isAvailable ? (
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-3xl font-extrabold font-mono text-white">
                          {reading.value}
                        </span>
                        <span className="text-xs font-mono text-gray-400">{reading.unit}</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 text-xs text-gray-500 font-mono py-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>
                          {reading?.pollutantStatus === 'not_monitored'
                            ? 'Not monitored at station'
                            : 'Sensor stream pending'}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Sub-Index Progress Bar */}
                  {isAvailable && reading.subIndex !== null && (
                    <div className="space-y-1">
                      <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{
                            width: `${Math.min(100, (reading.subIndex / 500) * 100)}%`,
                            backgroundColor: subCategory.color,
                          }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-[10px] font-mono text-gray-500">
                        <span>0</span>
                        <span style={{ color: subCategory.textColor }}>{subCategory.label}</span>
                        <span>500</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Brief scientific note */}
                <p className="text-[11px] text-gray-400 leading-relaxed border-t border-white/5 pt-2 mt-2">
                  {POLLUTANT_DESCRIPTIONS[pid]}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

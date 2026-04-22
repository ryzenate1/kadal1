'use client';

import React, { useEffect, useMemo, useState } from 'react';

interface MacroCalculatorProps {
  omega3Per100g: string;  // e.g., "1.2g"
  proteinPer100g: string; // e.g., "22g"
  caloriesPer100g: string; // e.g., "134 kcal"
  className?: string;
}

const MacroCalculator: React.FC<MacroCalculatorProps> = ({
  omega3Per100g,
  proteinPer100g,
  caloriesPer100g,
  className = ''
}) => {
  const [weight, setWeight] = useState<number>(250);
  const [calculatedMacros, setCalculatedMacros] = useState({
    omega3: 0,
    protein: 0,
    calories: 0
  });

  const parseNumber = (value: string) => {
    const raw = String(value || '').trim();
    const numeric = raw.replace(/[^\d.]/g, '');
    const parsed = Number.parseFloat(numeric);
    return Number.isFinite(parsed) ? parsed : 0;
  };

  // Parse the per 100g values (accepts "22g" or "22")
  const omega3Base = useMemo(() => parseNumber(omega3Per100g), [omega3Per100g]);
  const proteinBase = useMemo(() => parseNumber(proteinPer100g), [proteinPer100g]);
  const caloriesBase = useMemo(() => parseNumber(caloriesPer100g), [caloriesPer100g]);
  const hasAnyNutrition = omega3Base > 0 || proteinBase > 0 || caloriesBase > 0;

  useEffect(() => {
    const multiplier = weight / 100;
    setCalculatedMacros({
      omega3: parseFloat((omega3Base * multiplier).toFixed(2)),
      protein: parseFloat((proteinBase * multiplier).toFixed(1)),
      calories: Math.round(caloriesBase * multiplier)
    });
  }, [weight, omega3Base, proteinBase, caloriesBase]);

  const handleWeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = Number(e.target.value);
    const safe = Number.isFinite(raw) ? raw : 0;
    const value = Math.max(1, Math.min(5000, safe));
    setWeight(value);
  };

  const quickWeights = [250, 500, 750, 1000];

  return (
    <div className={`rounded-2xl border border-gray-100 bg-white p-4 ${className}`}>
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold text-gray-900">Macro Calculator</h3>
        <p className="text-xs text-gray-500">Per 100g reference</p>
      </div>

      {/* Weight Input */}
      <div className="mb-4">
        <label className="block text-xs font-semibold text-gray-600 mt-3 mb-2">
          Serving size (grams)
        </label>
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={weight}
            onChange={handleWeightChange}
            min="1"
            max="5000"
            className="flex-1 h-11 px-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-300 text-center font-semibold text-gray-900"
            placeholder="Enter weight"
          />
          <span className="text-xs text-gray-500 font-semibold">g</span>
        </div>
        
        {/* Quick Weight Buttons */}
        <div className="flex gap-2 mt-2">
          {quickWeights.map((quickWeight) => (
            <button
              key={quickWeight}
              type="button"
              onClick={() => setWeight(quickWeight)}
              className={`px-3 py-1.5 text-xs rounded-full border transition-colors font-semibold ${
                weight === quickWeight
                  ? 'bg-red-50 text-red-700 border-red-200'
                  : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
              }`}
            >
              {quickWeight}g
            </button>
          ))}
        </div>
      </div>

      {/* Calculated Results */}
      <div className="grid grid-cols-3 gap-3">
        <div className="text-center p-3 rounded-xl border border-gray-100 bg-gray-50">
          <div className="text-base font-bold text-gray-900">{calculatedMacros.omega3}g</div>
          <div className="text-[11px] text-gray-600 font-semibold mt-0.5">Omega-3</div>
        </div>
        
        <div className="text-center p-3 rounded-xl border border-gray-100 bg-gray-50">
          <div className="text-base font-bold text-gray-900">{calculatedMacros.protein}g</div>
          <div className="text-[11px] text-gray-600 font-semibold mt-0.5">Protein</div>
        </div>
        
        <div className="text-center p-3 rounded-xl border border-gray-100 bg-gray-50">
          <div className="text-base font-bold text-gray-900">{calculatedMacros.calories}</div>
          <div className="text-[11px] text-gray-600 font-semibold mt-0.5">Calories</div>
        </div>
      </div>

      {/* Health Benefits Note */}
      <div className="mt-3 rounded-xl border border-gray-100 bg-white px-3 py-2">
        <p className="text-xs text-gray-600 text-center">
          Based on {weight}g serving • Approximate values for raw fish
        </p>
      </div>

      {!hasAnyNutrition && (
        <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2">
          <p className="text-xs text-amber-800 text-center">
            Nutrition data isn’t available for this fish yet — calculator will show 0s.
          </p>
        </div>
      )}
    </div>
  );
};

export default MacroCalculator;

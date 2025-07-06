'use client';

import React, { useState, useEffect } from 'react';
import { Calculator, TrendingUp } from 'lucide-react';

interface MacroCalculatorProps {
  omega3Per100g: string;  // e.g., "1.2g"
  proteinPer100g: string; // e.g., "22g"
  caloriesPer100g: string; // e.g., "134 kcal"
  className?: string;
  isVisible?: boolean;
}

const MacroCalculator: React.FC<MacroCalculatorProps> = ({
  omega3Per100g,
  proteinPer100g,
  caloriesPer100g,
  className = '',
  isVisible = true
}) => {
  const [weight, setWeight] = useState<number>(250);
  const [calculatedMacros, setCalculatedMacros] = useState({
    omega3: 0,
    protein: 0,
    calories: 0
  });

  // Parse the per 100g values
  const omega3Base = parseFloat(omega3Per100g.replace('g', ''));
  const proteinBase = parseFloat(proteinPer100g.replace('g', ''));
  const caloriesBase = parseFloat(caloriesPer100g.replace(' kcal', ''));

  useEffect(() => {
    const multiplier = weight / 100;
    setCalculatedMacros({
      omega3: parseFloat((omega3Base * multiplier).toFixed(2)),
      protein: parseFloat((proteinBase * multiplier).toFixed(1)),
      calories: Math.round(caloriesBase * multiplier)
    });
  }, [weight, omega3Base, proteinBase, caloriesBase]);

  const handleWeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.max(1, Math.min(5000, Number(e.target.value)));
    setWeight(value);
  };

  const quickWeights = [250, 500, 750, 1000];

  if (!isVisible) return null;

  return (
    <div className={`bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4 ${className}`}>
      <div className="flex items-center gap-2 mb-4">
        <Calculator className="w-5 h-5 text-blue-600" />
        <h3 className="font-semibold text-blue-900">Nutrition Calculator</h3>
        <TrendingUp className="w-4 h-4 text-green-600" />
      </div>

      {/* Weight Input */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Enter weight in grams:
        </label>
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={weight}
            onChange={handleWeightChange}
            min="1"
            max="5000"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-center font-medium"
            placeholder="Enter weight"
          />
          <span className="text-sm text-gray-600 font-medium">grams</span>
        </div>
        
        {/* Quick Weight Buttons */}
        <div className="flex gap-2 mt-2">
          {quickWeights.map((quickWeight) => (
            <button
              key={quickWeight}
              onClick={() => setWeight(quickWeight)}
              className={`px-3 py-1 text-xs rounded-full transition-colors ${
                weight === quickWeight
                  ? 'bg-blue-100 text-blue-700 ring-1 ring-blue-400'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {quickWeight}g
            </button>
          ))}
        </div>
      </div>

      {/* Calculated Results */}
      <div className="grid grid-cols-3 gap-3">
        <div className="text-center p-3 bg-white rounded-lg border border-blue-100">
          <div className="text-lg font-bold text-blue-700">
            {calculatedMacros.omega3}g
          </div>
          <div className="text-xs text-blue-600 font-medium">Omega-3</div>
          <div className="text-xs text-gray-500 mt-1">
            Heart healthy
          </div>
        </div>
        
        <div className="text-center p-3 bg-white rounded-lg border border-green-100">
          <div className="text-lg font-bold text-green-700">
            {calculatedMacros.protein}g
          </div>
          <div className="text-xs text-green-600 font-medium">Protein</div>
          <div className="text-xs text-gray-500 mt-1">
            Muscle building
          </div>
        </div>
        
        <div className="text-center p-3 bg-white rounded-lg border border-orange-100">
          <div className="text-lg font-bold text-orange-700">
            {calculatedMacros.calories}
          </div>
          <div className="text-xs text-orange-600 font-medium">Calories</div>
          <div className="text-xs text-gray-500 mt-1">
            Energy
          </div>
        </div>
      </div>

      {/* Health Benefits Note */}
      <div className="mt-3 p-2 bg-green-50 border border-green-200 rounded-lg">
        <p className="text-xs text-green-800 text-center">
          💡 Based on {weight}g serving • Values are approximate per 100g raw fish
        </p>
      </div>
    </div>
  );
};

export default MacroCalculator;

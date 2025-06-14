import * as React from 'react';

interface SliderProps {
  value: number[];
  onValueChange: (value: number[]) => void;
  min: number;
  max: number;
  step?: number;
  disabled?: boolean;
  className?: string;
}

export function Slider({
  value,
  onValueChange,
  min,
  max,
  step = 1,
  disabled = false,
  className = ''
}: SliderProps) {
  const percentage = ((value[0] - min) / (max - min)) * 100;

  return (
    <div className={`relative w-full h-5 flex items-center ${className}`}>
      <div className="w-full h-[3px] bg-gray-200 rounded-full">
        <div
          className="h-full bg-[#155EEF] rounded-full"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value[0]}
        onChange={(e) => onValueChange([parseFloat(e.target.value)])}
        className="absolute w-full h-2 opacity-0 cursor-pointer"
        disabled={disabled}
      />
      <div
        className="absolute w-2.5 h-2.5 bg-[#155EEF] rounded-full shadow"
        style={{ left: `calc(${percentage}% - 0.5rem)` }}
      />
    </div>
  );
}
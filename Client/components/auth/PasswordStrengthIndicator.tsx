import React from 'react';
import {
  evaluatePasswordStrength,
  getStrengthColor,
  getStrengthText,
  getStrengthPercentage,
} from '@/utils/password-strength';

interface PasswordStrengthIndicatorProps {
  password: string;
  className?: string;
}

export function PasswordStrengthIndicator({
  password,
  className = '',
}: PasswordStrengthIndicatorProps) {
  if (!password) return null;

  const strength = evaluatePasswordStrength(password);
  const strengthColor = getStrengthColor(strength);
  const strengthText = getStrengthText(strength);
  const percentage = getStrengthPercentage(strength);

  return (
    <div className={`mt-1 ${className}`}>
      <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full ${strengthColor} transition-all duration-300`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <p className={`text-sm mt-1 ${strengthColor.replace('bg-', 'text-')}`}>
        {strengthText} password
      </p>
    </div>
  );
}

export { evaluatePasswordStrength };

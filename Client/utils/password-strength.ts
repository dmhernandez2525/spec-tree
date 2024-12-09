export type PasswordStrength = 'very-weak' | 'weak' | 'medium' | 'strong';

export function evaluatePasswordStrength(pass: string): PasswordStrength {
  if (!pass) return 'very-weak';

  const hasUppercase = /[A-Z]/.test(pass);
  const hasLowercase = /[a-z]/.test(pass);
  const hasDigit = /\d/.test(pass);
  const hasSpecial = /[@$!%*?&]/.test(pass);

  const lengthValid = pass.length >= 8;

  if (!lengthValid) {
    return 'very-weak';
  }

  let score = 0;
  if (hasUppercase) score++;
  if (hasLowercase) score++;
  if (hasDigit) score++;
  if (hasSpecial) score++;

  if (score <= 1) return 'weak';
  if (score === 2) return 'weak';
  if (score === 3) return 'medium';
  return 'strong';
}

export function getStrengthColor(strength: PasswordStrength): string {
  switch (strength) {
    case 'very-weak':
      return 'bg-red-500';
    case 'weak':
      return 'bg-orange-500';
    case 'medium':
      return 'bg-yellow-500';
    case 'strong':
      return 'bg-green-500';
  }
}

export function getStrengthText(strength: PasswordStrength): string {
  switch (strength) {
    case 'very-weak':
      return 'Very Weak';
    case 'weak':
      return 'Weak';
    case 'medium':
      return 'Medium';
    case 'strong':
      return 'Strong';
  }
}

export function getStrengthPercentage(strength: PasswordStrength): number {
  switch (strength) {
    case 'very-weak':
      return 25;
    case 'weak':
      return 50;
    case 'medium':
      return 75;
    case 'strong':
      return 100;
  }
}

// components/shared/icons.tsx
import {
  Twitter,
  Facebook,
  Instagram,
  Linkedin,
  Github,
  Mail,
  Phone,
  AlertCircle,
  ChevronDown,
  type LucideIcon,
} from 'lucide-react';

export type Icon = LucideIcon;

export const Icons = {
  twitter: Twitter,
  facebook: Facebook,
  instagram: Instagram,
  linkedin: Linkedin,
  gitHub: Github,
  mail: Mail,
  phone: Phone,
  alert: AlertCircle,
  chevronDown: ChevronDown,
} as const;

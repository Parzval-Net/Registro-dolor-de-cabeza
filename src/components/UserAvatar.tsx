import React from 'react';
import { 
  Brain, 
  Heart, 
  Sparkles, 
  ShieldCheck, 
  Leaf, 
  HeartHandshake 
} from 'lucide-react';

export const AVATAR_OPTIONS = [
  {
    id: 'calm-mind',
    name: 'Mente Serena',
    gradient: 'linear-gradient(135deg, #818cf8 0%, #6366f1 100%)',
    bgColor: '#818cf8',
    icon: Brain,
    iconColor: 'white'
  },
  {
    id: 'healing-heart',
    name: 'Corazón Vital',
    gradient: 'linear-gradient(135deg, #f472b6 0%, #ec4899 100%)',
    bgColor: '#f472b6',
    icon: Heart,
    iconColor: 'white'
  },
  {
    id: 'free-spirit',
    name: 'Conexión Emocional',
    gradient: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
    bgColor: '#fbbf24',
    icon: HeartHandshake,
    iconColor: 'white'
  },
  {
    id: 'safe-shield',
    name: 'Protección Activa',
    gradient: 'linear-gradient(135deg, #38bdf8 0%, #0284c7 100%)',
    bgColor: '#38bdf8',
    icon: ShieldCheck,
    iconColor: 'white'
  },
  {
    id: 'zen-nature',
    name: 'Balance Natural',
    gradient: 'linear-gradient(135deg, #34d399 0%, #059669 100%)',
    bgColor: '#34d399',
    icon: Leaf,
    iconColor: 'white'
  },
  {
    id: 'clear-spark',
    name: 'Energía Clara',
    gradient: 'linear-gradient(135deg, #a78bfa 0%, #8b5cf6 100%)',
    bgColor: '#a78bfa',
    icon: Sparkles,
    iconColor: 'white'
  }
];

interface UserAvatarProps {
  avatarId?: string;
  size?: number;
  className?: string;
  onClick?: () => void;
  style?: React.CSSProperties;
}

export default function UserAvatar({ avatarId = 'calm-mind', size = 36, className = '', onClick, style = {} }: UserAvatarProps) {
  const avatar = AVATAR_OPTIONS.find(opt => opt.id === avatarId) || AVATAR_OPTIONS[0];
  const IconComponent = avatar.icon;

  const combinedStyle: React.CSSProperties = {
    width: `${size}px`,
    height: `${size}px`,
    borderRadius: '50%',
    background: avatar.gradient,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
    cursor: onClick ? 'pointer' : 'default',
    border: '1.5px solid rgba(255, 255, 255, 0.65)',
    transition: 'all 0.2s ease',
    ...style
  };

  return (
    <div 
      className={`user-avatar-container shrink-0 ${className}`} 
      style={combinedStyle}
      onClick={onClick}
      title={avatar.name}
    >
      <IconComponent 
        style={{
          width: `${size * 0.52}px`,
          height: `${size * 0.52}px`,
          color: avatar.iconColor
        }}
        className="stroke-[2.5]"
      />
    </div>
  );
}

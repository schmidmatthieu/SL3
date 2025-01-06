'use client';

import { useTranslation } from 'react-i18next';
import { Room } from '@/types/room';
import { Badge } from '@/components/core/ui/badge';
import { cn } from '@/lib/utils';
import { Clock, Radio, Ban, CheckCircle2, PauseCircle } from 'lucide-react';
import { motion } from 'framer-motion';

interface RoomStatusBadgeProps {
  status: Room['status'];
}

const getStatusConfig = (status: Room['status']) => {
  switch (status) {
    case 'live':
      return {
        icon: Radio,
        baseColor: 'bg-third text-black',
        pulseColor: 'bg-third/50',
        animation: {
          rotate: false,
          scale: true,
          pulse: true
        }
      };
    case 'upcoming':
      return {
        icon: Clock,
        baseColor: 'bg-blue-500 text-white dark:bg-blue-600',
        pulseColor: 'bg-blue-400/50',
        animation: {
          rotate: false,
          scale: false,
          pulse: false
        }
      };
    case 'paused':
      return {
        icon: PauseCircle,
        baseColor: 'bg-yellow-500 text-black',
        pulseColor: 'bg-yellow-400/50',
        animation: {
          rotate: false,
          scale: true,
          pulse: true
        }
      };
    case 'ended':
      return {
        icon: CheckCircle2,
        baseColor: 'bg-secondary text-black',
        pulseColor: 'bg-secondary/50',
        animation: {
          rotate: false,
          scale: false,
          pulse: false
        }
      };
    case 'cancelled':
      return {
        icon: Ban,
        baseColor: 'bg-destructive text-destructive-foreground dark:bg-destructive/90',
        pulseColor: 'bg-destructive/50',
        animation: {
          rotate: false,
          scale: false,
          pulse: false
        }
      };
    default:
      return {
        icon: Clock,
        baseColor: 'bg-secondary text-black',
        pulseColor: 'bg-secondary/50',
        animation: {
          rotate: false,
          scale: false,
          pulse: false
        }
      };
  }
};

export function RoomStatusBadge({ status }: RoomStatusBadgeProps) {
  const { t } = useTranslation('components/event-detail');
  const config = getStatusConfig(status);
  const Icon = config.icon;

  return (
    <div className="relative inline-flex items-center">
      {config.animation.pulse && (
        <motion.span
          className={cn(
            "absolute inset-0 rounded-full",
            config.pulseColor
          )}
          initial={{ scale: 0.95, opacity: 0.5 }}
          animate={{ 
            scale: [0.95, 1.05, 0.95],
            opacity: [0.5, 0.8, 0.5]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      )}
      <Badge 
        className={cn(
          config.baseColor,
          "relative flex items-center gap-1.5 px-3 py-1 transition-all duration-200",
          "hover:scale-105",
          "font-medium"
        )}
      >
        <motion.div
          animate={config.animation.scale ? {
            scale: [1, 1.2, 1]
          } : undefined}
          transition={config.animation.scale ? {
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut"
          } : undefined}
        >
          <Icon className="w-3.5 h-3.5" />
        </motion.div>
        <span>{t(`rooms.status.${status}`)}</span>
      </Badge>
    </div>
  );
}

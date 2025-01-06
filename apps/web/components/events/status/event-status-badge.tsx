'use client';

import { cn } from '@/lib/utils';
import { Event, EventStatus } from '@/types/event';
import { useTranslation } from 'react-i18next';
import { Badge } from '@/components/ui/badge';
import { useEventStatus } from '@/hooks/useEventStatus';
import { motion } from 'framer-motion';
import { Radio, Clock, Ban, CheckCircle2 } from 'lucide-react';

interface EventStatusBadgeProps {
  event: Event;
  className?: string;
  showLabel?: boolean;
}

const getStatusConfig = (status: EventStatus) => {
  console.log('getStatusConfig - status:', status);
  switch (status.toLowerCase()) {
    case 'active':
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
    case 'scheduled':
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
      console.log('Unknown status:', status);
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

export function EventStatusBadge({ event, className, showLabel = true }: EventStatusBadgeProps) {
  console.log('EventStatusBadge - event:', event);
  const { t } = useTranslation('components/event-detail');
  const currentStatus = useEventStatus(event);
  console.log('EventStatusBadge - currentStatus:', currentStatus);
  const config = getStatusConfig(currentStatus);
  const Icon = config.icon;

  const getDisplayStatus = (status: EventStatus) => {
    const statusKey = status.toLowerCase();
    console.log('getDisplayStatus - statusKey:', statusKey);
    if (statusKey === 'active') {
      return t('events.status.live');
    }
    if (statusKey === 'scheduled') {
      return t('events.status.upcoming');
    }

    const translation = t(`events.status.${statusKey}`);
    console.log('getDisplayStatus - translation:', translation);
    return translation;
  };

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
          "font-medium",
          className
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
        {showLabel && <span>{getDisplayStatus(currentStatus)}</span>}
      </Badge>
    </div>
  );
}

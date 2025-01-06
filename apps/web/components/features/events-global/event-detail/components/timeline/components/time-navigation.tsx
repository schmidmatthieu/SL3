import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { Button } from '@/components/core/ui/button';
import { cn } from '@/lib/utils';
import { LOCALES } from '../constants';

interface TimeNavigationProps {
  currentDate: Date;
  canNavigateBack: boolean;
  canNavigateForward: boolean;
  navigateBackward: () => void;
  navigateForward: () => void;
  goToNow: () => void;
}

export const TimeNavigation = ({
  currentDate,
  canNavigateBack,
  canNavigateForward,
  navigateBackward,
  navigateForward,
  goToNow,
}: TimeNavigationProps) => {
  const { t, i18n } = useTranslation('components/event-detail');
  const locale = LOCALES[i18n.language as keyof typeof LOCALES] || LOCALES.en;

  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2">
        <div className="flex items-center">
          <Button
            variant="outline"
            size="icon"
            onClick={navigateBackward}
            disabled={!canNavigateBack}
            className={cn(!canNavigateBack && 'opacity-50')}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={navigateForward}
            disabled={!canNavigateForward}
            className={cn(!canNavigateForward && 'opacity-50')}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={goToNow}
          className="h-8 select-none"
        >
          {t('timeline.today')}
        </Button>
      </div>

      <div className="text-sm text-primary-600 dark:text-primary-300 font-semibold">
        {format(currentDate, 'EEEE d MMMM', { locale })}
      </div>
    </div>
  );
};

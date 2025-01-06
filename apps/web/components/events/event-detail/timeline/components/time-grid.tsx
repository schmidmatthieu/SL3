import { HOURS_IN_DAY } from '../constants';

interface TimeGridProps {
  currentHourStart: number;
  hoursVisible: number;
}

export const TimeGrid = ({ currentHourStart, hoursVisible }: TimeGridProps) => {
  return (
    <div
      className="absolute inset-0"
      style={{
        width: '100%',
      }}
    >
      {Array.from({ length: hoursVisible }).map((_, i) => {
        const hour = currentHourStart + i;
        return (
          <div
            key={hour}
            className="absolute top-0 bottom-0 border-l border-border/10"
            style={{
              left: `${(i / hoursVisible) * 100}%`,
            }}
          />
        );
      })}
    </div>
  );
};

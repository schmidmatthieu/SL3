interface TimeHeaderProps {
  currentHourStart: number;
  hoursVisible: number;
}

export const TimeHeader = ({ currentHourStart, hoursVisible }: TimeHeaderProps) => {
  return (
    <div className="sticky top-0 border-b border-border/50 bg-background/30 backdrop-blur-sm">
      <div className="flex">
        {Array.from({ length: hoursVisible }).map((_, i) => {
          const hour = currentHourStart + i;
          return (
            <div
              key={hour}
              className="flex-1 text-xs text-muted-foreground p-2 text-center border-r border-border/50 last:border-r-0"
            >
              {`${String(hour).padStart(2, '0')}:00`}
            </div>
          );
        })}
      </div>
    </div>
  );
};

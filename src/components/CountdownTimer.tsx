import { useState, useEffect } from 'react';
import { AlarmClock } from 'lucide-react';

interface CountdownTimerProps {
  initialMinutes: number;
  initialSeconds: number;
  backgroundColor: string;
  textColor: string;
  activeText: string;
  finishedText: string;
  fixedTop?: boolean;
  onClick?: () => void;
  className?: string;
}

export const CountdownTimer = ({
  initialMinutes,
  initialSeconds,
  backgroundColor,
  textColor,
  activeText,
  finishedText,
  fixedTop = false,
  onClick,
  className = '',
}: CountdownTimerProps) => {
  const [timeLeft, setTimeLeft] = useState(initialMinutes * 60 + initialSeconds);
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    if (timeLeft <= 0) {
      setIsFinished(true);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setIsFinished(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className={`w-full bg-transparent ${fixedTop ? 'sticky top-0 z-50' : ''}`}>
      <div className="max-w-[1120px] mx-auto px-4 lg:px-6">
        <div
          className={`mt-4 mb-6 rounded-xl min-h-[56px] px-4 py-3 flex items-center justify-center gap-3 ${className}`}
          onClick={onClick}
          style={{ backgroundColor, color: textColor }}
        >
          <AlarmClock size={22} style={{ color: textColor }} />
          <span className="text-lg font-semibold tabular-nums">
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </span>
          {(isFinished ? finishedText : activeText) && (
            <span className="text-sm opacity-90">
              {isFinished ? finishedText : activeText}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};


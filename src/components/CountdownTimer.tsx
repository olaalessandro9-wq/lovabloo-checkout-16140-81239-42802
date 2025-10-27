// src/components/CountdownTimer.tsx
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
          className={`mt-4 mb-3 lg:mb-6 rounded-xl min-h-[64px] px-5 py-4 flex items-center justify-between gap-3 shadow-sm ${className}`}
          onClick={onClick}
          style={{ backgroundColor, color: textColor }}
        >
          {/* Left: tempo + texto */}
          <div className="flex items-center gap-3">
            <span className="text-2xl lg:text-lg font-semibold tabular-nums">
              {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </span>
            {(isFinished ? finishedText : activeText) && (
              <span className="text-sm opacity-90 ml-2 hidden sm:inline">
                {isFinished ? finishedText : activeText}
              </span>
            )}
          </div>

          {/* Right: ícone do cronômetro */}
          <AlarmClock size={26} style={{ color: textColor }} />
        </div>
      </div>
    </div>
  );
};

export default CountdownTimer;


import { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';

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
    <div
      className={`p-4 rounded-lg ${className} ${fixedTop ? 'sticky top-0 z-50' : ''}`}
      onClick={onClick}
      style={{
        backgroundColor,
      }}
    >
      {/* Ícone fixo + tempo — alinhado e com cor dinâmica */}
      <div className="flex items-center justify-center gap-3">
        <Bell size={28} style={{ color: textColor }} aria-hidden="true" />
        <div className="text-center">
          <div className="text-2xl font-bold" style={{ color: textColor }}>
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </div>
          <p className="text-sm mt-1" style={{ color: textColor, opacity: 0.9 }}>
            {isFinished ? finishedText : activeText}
          </p>
        </div>
      </div>
    </div>
  );
};


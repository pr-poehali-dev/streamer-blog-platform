import { useEffect, useRef, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

interface ScratchCardProps {
  steamKey: string;
  onRevealed?: () => void;
}

export default function ScratchCard({ steamKey, onRevealed }: ScratchCardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isScratching, setIsScratching] = useState(false);
  const [scratchCount, setScratchCount] = useState(0);
  const [isRevealed, setIsRevealed] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 400;
    canvas.height = 200;

    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#8B5CF6');
    gradient.addColorStop(0.5, '#D946EF');
    gradient.addColorStop(1, '#F97316');

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 24px Montserrat';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('СТИРАЙ МЫШКОЙ', canvas.width / 2, canvas.height / 2 - 20);
    
    ctx.font = '16px Roboto';
    ctx.fillText('500 движений до ключа', canvas.width / 2, canvas.height / 2 + 20);

    for (let i = 0; i < 50; i++) {
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.fillRect(x, y, 20, 2);
      ctx.fillRect(x, y, 2, 20);
    }
  }, []);

  const scratch = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (isRevealed) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    let clientX: number;
    let clientY: number;

    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(x, y, 20, 0, Math.PI * 2);
    ctx.fill();

    const newCount = scratchCount + 1;
    setScratchCount(newCount);
    setProgress(Math.min((newCount / 500) * 100, 100));

    if (newCount >= 500 && !isRevealed) {
      setIsRevealed(true);
      if (onRevealed) onRevealed();
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  const handleMouseDown = () => setIsScratching(true);
  const handleMouseUp = () => setIsScratching(false);
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isScratching) scratch(e);
  };

  return (
    <Card className="bg-gradient-to-br from-card to-card/50 border-primary/20 overflow-hidden">
      <CardContent className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Icon name="Gift" size={24} className="text-primary" />
            <h3 className="text-xl font-bold">Бонусный Steam ключ</h3>
          </div>
          <Badge variant="outline" className="bg-gradient-to-r from-primary to-secondary text-white border-0">
            {isRevealed ? 'Открыт!' : `${Math.floor(progress)}%`}
          </Badge>
        </div>

        <div className="relative bg-muted rounded-lg overflow-hidden">
          <canvas
            ref={canvasRef}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleMouseDown}
            onTouchEnd={handleMouseUp}
            onTouchMove={(e) => {
              if (isScratching) scratch(e);
            }}
            className="w-full cursor-pointer touch-none"
            style={{ display: isRevealed ? 'none' : 'block' }}
          />
          
          {isRevealed && (
            <div className="w-full h-[200px] flex flex-col items-center justify-center space-y-4 animate-fade-in">
              <div className="text-center space-y-2">
                <Icon name="Trophy" size={48} className="text-yellow-500 mx-auto animate-bounce" />
                <h4 className="text-2xl font-bold text-primary">Поздравляем!</h4>
                <p className="text-muted-foreground">Ваш Steam ключ:</p>
              </div>
              <div className="bg-background px-6 py-3 rounded-lg border-2 border-primary">
                <code className="text-2xl font-mono font-bold text-primary tracking-wider">
                  {steamKey}
                </code>
              </div>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(steamKey);
                  alert('Ключ скопирован в буфер обмена!');
                }}
                className="flex items-center space-x-2 text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                <Icon name="Copy" size={16} />
                <span>Скопировать ключ</span>
              </button>
            </div>
          )}
        </div>

        {!isRevealed && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Прогресс стирания</span>
              <span>{scratchCount} / 500 движений</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        <div className="flex items-start space-x-2 text-sm text-muted-foreground">
          <Icon name="Info" size={16} className="mt-0.5 flex-shrink-0" />
          <p>
            {isRevealed 
              ? 'Активируйте ключ в Steam → Игры → Активировать продукт'
              : 'Водите мышкой по серой области, чтобы стереть защитное покрытие'
            }
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

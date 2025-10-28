import { ImageIcon, VideoIcon, TypeIcon, TimerIcon } from "@/components/icons";
import { CountdownTimer } from "@/components/CountdownTimer";

interface CheckoutComponentRendererProps {
  component: {
    id?: string;
    type: string;
    content: any;
  };
}

const CheckoutComponentRenderer = ({ component }: CheckoutComponentRendererProps) => {
  if (!component || !component.type) return null;

  switch (component.type) {
    case 'image': {
      const src = typeof component.content?.imageUrl === 'string'
        ? component.content.imageUrl
        : (typeof component.content?.url === 'string' ? component.content.url : '');

      if (!src) {
        return (
          <div className="w-full border border-dashed rounded-lg p-6 text-center text-sm opacity-70 mb-6">
            Imagem – clique para adicionar
          </div>
        );
      }

      const maxW = component.content?.maxWidth ?? 720;
      const fit = component.content?.fit ?? "cover";
      const roundedImage = component.content?.roundedImage ?? true; // agora por padrão arredondado médio
      // cardBgClass: destaque do bloco (ajustável)
      const cardBgClass = component.content?.cardBgClass || "bg-white dark:bg-gray-800";

      return (
        <div className="w-full flex justify-center">
          {/* reduzir levemente o max-width para encurtar horizontalmente */}
          <div className="w-full max-w-[680px] mx-auto px-4">
            <div className={`bg-white dark:bg-gray-800 p-0.5 rounded-sm shadow-sm ring-1 ring-gray-100 dark:ring-gray-700 mb-0.5`}>
              {/* Manter 16/9 para preservar área visível da imagem */}
              <div className="aspect-[16/9] relative overflow-hidden">
                <img
                  key={component.id}
                  src={src}
                  alt={component.content?.alt || 'Imagem'}
                  className={`absolute inset-0 w-full h-full object-${fit} object-center ${roundedImage ? 'rounded-sm' : 'rounded-none'}`}
                  loading="eager"
                  fetchPriority="high"
                  decoding="async"
                  style={{ width: '100%', height: '100%' }}
                  onError={(e) => {
                    const imgEl = e.currentTarget as HTMLImageElement;
                    imgEl.onerror = null;
                    imgEl.src = '/images/placeholder-top.png';
                    console.error('Erro ao carregar imagem:', src);
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      );
    }

    case 'video':
      return (
        <div className="w-full mb-6">
          {component.content?.url ? (
            <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
              <iframe
                src={component.content.url}
                className="absolute top-0 left-0 w-full h-full rounded-lg"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          ) : (
            <div className="w-full aspect-video bg-muted rounded-lg flex items-center justify-center">
              <VideoIcon className="w-16 h-16 text-muted-foreground" />
              <span className="ml-2 text-muted-foreground">Vídeo não configurado</span>
            </div>
          )}
        </div>
      );

    case 'text':
      return (
        <div className="w-full mb-6">
          {component.content?.text ? (
            <div
              className="prose prose-sm max-w-none"
              style={{
                textAlign: component.content.alignment || 'left',
                fontSize: component.content.size || '16px',
                color: component.content.color || 'inherit',
              }}
              dangerouslySetInnerHTML={{ __html: component.content.text }}
            />
          ) : (
            <div className="w-full p-4 bg-muted rounded-lg flex items-center justify-center text-muted-foreground">
              <TypeIcon className="w-6 h-6 mr-2" />
              Texto não configurado
            </div>
          )}
        </div>
      );

    case 'timer':
      return (
        <CountdownTimer
          initialMinutes={component.content?.minutes || 15}
          initialSeconds={component.content?.seconds || 0}
          backgroundColor={component.content?.timerColor || "#EF4444"}
          textColor={component.content?.textColor || "#FFFFFF"}
          activeText={component.content?.activeText || "Oferta por tempo limitado"}
          finishedText={component.content?.finishedText || "Oferta finalizada"}
          fixedTop={component.content?.fixedTop || false}
          className="w-full"
        />
      );

    case 'guarantee':
      return (
        <div className="w-full mb-6 p-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <h3 className="font-bold text-green-900 dark:text-green-100 mb-2">
                {component.content?.title || 'Garantia de Satisfação'}
              </h3>
              <p className="text-sm text-green-800 dark:text-green-200">
                {component.content?.text || 'Garantia de 7 dias. Se não gostar, devolvemos seu dinheiro.'}
              </p>
            </div>
          </div>
        </div>
      );

    case 'testimonial':
      return (
        <div className="w-full mb-6 p-6 bg-card border border-border rounded-lg">
          <div className="flex items-start gap-4">
            {component.content?.avatar && (
              <img
                src={component.content.avatar}
                alt={component.content.name || 'Cliente'}
                className="w-12 h-12 rounded-full object-cover"
              />
            )}
            <div className="flex-1">
              <p className="text-foreground mb-2 italic">
                "{component.content?.text || 'Depoimento do cliente'}"
              </p>
              <div className="font-semibold text-sm text-muted-foreground">
                {component.content?.name || 'Nome do Cliente'}
              </div>
            </div>
          </div>
        </div>
      );

    default:
      return null;
  }
};

export default CheckoutComponentRenderer;

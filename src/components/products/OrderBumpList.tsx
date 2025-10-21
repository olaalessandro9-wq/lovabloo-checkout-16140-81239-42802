import { Button } from "@/components/ui/button";
import { Trash2, GripVertical, Gift } from "lucide-react";
import type { OrderBump } from "./OrderBumpDialog";

interface OrderBumpListProps {
  orderBumps: OrderBump[];
  onAdd: () => void;
  onRemove: (id: string) => void;
  maxOrderBumps?: number;
}

export function OrderBumpList({ orderBumps, onAdd, onRemove, maxOrderBumps = 5 }: OrderBumpListProps) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-2">Order bump</h3>
        <p className="text-sm text-muted-foreground mb-6">
          Aprenda mais sobre os order bumps
        </p>
      </div>

      {orderBumps.length > 0 && (
        <div className="space-y-3">
          {orderBumps.map((orderBump, index) => (
            <div 
              key={orderBump.id} 
              className="bg-card border border-border rounded-lg p-4 flex items-start justify-between hover:border-primary/50 transition-colors"
            >
              <div className="flex items-start gap-3 flex-1">
                <div className="flex items-center gap-2">
                  <GripVertical className="w-4 h-4 text-muted-foreground cursor-move" />
                  <div className="w-8 h-8 bg-primary/10 rounded flex items-center justify-center">
                    <span className="text-sm font-medium text-primary">{index + 1}</span>
                  </div>
                </div>
                
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-foreground mb-1">
                        {orderBump.titulo}
                      </h4>
                      <p className="text-xs text-muted-foreground mb-2">
                        {orderBump.descricao}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span>Produto: {orderBump.produto}</span>
                        <span>•</span>
                        <span>Oferta: {orderBump.oferta}</span>
                        {orderBump.aplicarDesconto && (
                          <>
                            <span>•</span>
                            <span className="text-primary">Com desconto</span>
                          </>
                        )}
                      </div>
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onRemove(orderBump.id)}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {orderBumps.length === 0 && (
        <div className="bg-muted rounded-lg p-8 text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Gift className="w-8 h-8 text-primary" />
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Nenhum order bump configurado ainda.
          </p>
          <p className="text-xs text-muted-foreground">
            Order bumps são produtos complementares oferecidos durante o checkout para aumentar o valor do pedido.
          </p>
        </div>
      )}

      <div className="flex items-center justify-between pt-4">
        <Button 
          onClick={onAdd}
          disabled={orderBumps.length >= maxOrderBumps}
          className="bg-primary hover:bg-primary/90"
        >
          Adicionar
        </Button>
        <span className="text-sm text-muted-foreground">
          {orderBumps.length}/{maxOrderBumps}
        </span>
      </div>
    </div>
  );
}

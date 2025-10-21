import { useState, useEffect } from "react";
import { X, Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import type { Coupon } from "./CouponsTable";

interface CouponDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (coupon: Coupon) => void;
  coupon: Coupon | null;
}

export const CouponDialog = ({
  open,
  onOpenChange,
  onSave,
  coupon,
}: CouponDialogProps) => {
  const [code, setCode] = useState("");
  const [discount, setDiscount] = useState("");
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [applyToOrderBumps, setApplyToOrderBumps] = useState(false);

  useEffect(() => {
    if (coupon) {
      setCode(coupon.code);
      setDiscount(coupon.discount.toString());
      setStartDate(coupon.startDate);
      setEndDate(coupon.endDate);
      setApplyToOrderBumps(coupon.applyToOrderBumps);
    } else {
      setCode("");
      setDiscount("");
      setStartDate(undefined);
      setEndDate(undefined);
      setApplyToOrderBumps(false);
    }
  }, [coupon, open]);

  const handleSave = () => {
    if (!code || !discount || !startDate || !endDate) return;

    const numDiscount = parseFloat(discount);
    if (isNaN(numDiscount) || numDiscount < 0 || numDiscount > 100) return;

    const updatedCoupon: Coupon = {
      id: coupon?.id || `coupon-${Date.now()}`,
      code: code.toUpperCase(),
      discount: numDiscount,
      startDate,
      endDate,
      applyToOrderBumps,
      usageCount: coupon?.usageCount || 0,
    };

    onSave(updatedCoupon);
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg bg-card border-border overflow-y-auto">
        <SheetHeader className="border-b border-border pb-4">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-foreground">Adicionar Cupom</SheetTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
              className="h-8 w-8"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-sm text-muted-foreground text-left pt-2">
            Adicione aqui os cupons para o seu produto.
          </p>
        </SheetHeader>

        <div className="space-y-6 py-6">
          {/* Código do cupom */}
          <div className="space-y-2">
            <Label htmlFor="coupon-code" className="text-foreground">
              Código
            </Label>
            <Input
              id="coupon-code"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="Digite o código do cupom"
              className="bg-background border-border uppercase"
            />
          </div>

          {/* Desconto */}
          <div className="space-y-2">
            <Label htmlFor="discount" className="text-foreground flex items-center justify-between">
              Desconto
              <span className="text-muted-foreground text-xs">%</span>
            </Label>
            <Input
              id="discount"
              type="number"
              min="0"
              max="100"
              step="0.01"
              value={discount}
              onChange={(e) => setDiscount(e.target.value)}
              placeholder="0"
              className="bg-background border-border"
            />
          </div>

          {/* Data de início */}
          <div className="space-y-2">
            <Label className="text-foreground">Data de início do cupom</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal bg-background border-border",
                    !startDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {startDate ? format(startDate, "dd/MM/yyyy") : "Selecione a data"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-card border-border" align="start">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={setStartDate}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Data de expiração */}
          <div className="space-y-2">
            <Label className="text-foreground">Data de expiração do cupom</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal bg-background border-border",
                    !endDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {endDate ? format(endDate, "dd/MM/yyyy") : "Selecione a data"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-card border-border" align="start">
                <Calendar
                  mode="single"
                  selected={endDate}
                  onSelect={setEndDate}
                  disabled={(date) => startDate ? date < startDate : false}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
            <p className="text-xs text-muted-foreground">
              Deixe sem valor para a validade ser eterna
            </p>
          </div>

          {/* Aplicar aos Order Bumps */}
          <div className="flex items-center justify-between p-4 bg-primary/5 border border-primary/20 rounded-lg">
            <Label htmlFor="apply-order-bumps" className="text-foreground font-medium cursor-pointer">
              Aplicar desconto aos Order Bumps
            </Label>
            <Switch
              id="apply-order-bumps"
              checked={applyToOrderBumps}
              onCheckedChange={setApplyToOrderBumps}
            />
          </div>
        </div>

        {/* Ações */}
        <div className="flex gap-3 border-t border-border pt-4">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="flex-1"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            disabled={!code || !discount || !startDate || !endDate}
            className="flex-1 bg-primary hover:bg-primary/90"
          >
            Adicionar
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};

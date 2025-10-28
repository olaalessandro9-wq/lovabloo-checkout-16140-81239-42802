import { useState } from "react";
import { Search, Plus, MoreVertical, Copy, Trash2, Settings, Palette } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { formatCentsToBRL } from "@/utils/money";

export interface Checkout {
  id: string;
  name: string;
  price: number;
  visits: number;
  offer: string;
  isDefault: boolean;
  linkId: string;
}

interface CheckoutTableProps {
  checkouts: Checkout[];
  onAdd: () => void;
  onDuplicate: (checkout: Checkout) => void;
  onDelete: (id: string) => void;
  onConfigure: (checkout: Checkout) => void;
  onCustomize: (checkout: Checkout) => void;
}

export const CheckoutTable = ({
  checkouts,
  onAdd,
  onDuplicate,
  onDelete,
  onConfigure,
  onCustomize,
}: CheckoutTableProps) => {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCheckouts = checkouts.filter((checkout) =>
    checkout.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Pesquisar"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-background border-border"
          />
        </div>
        <Button onClick={onAdd} className="gap-2 bg-primary hover:bg-primary/90">
          <Plus className="w-4 h-4" />
          Adicionar Checkout
        </Button>
      </div>

      {filteredCheckouts.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-border rounded-lg">
          <p className="text-muted-foreground">
            Nenhum checkout configurado ainda
          </p>
        </div>
      ) : (
        <>
          <div className="border border-border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="text-foreground font-semibold">Nome</TableHead>
                  <TableHead className="text-foreground font-semibold">Preço</TableHead>
                  <TableHead className="text-foreground font-semibold">Visitas</TableHead>
                  <TableHead className="text-foreground font-semibold">Oferta</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCheckouts.map((checkout) => (
                  <TableRow key={checkout.id} className="hover:bg-muted/30">
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {checkout.name}
                        {checkout.isDefault && (
                          <Badge variant="secondary" className="text-xs">
                            Padrão
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-primary font-semibold">
                      {formatCentsToBRL(checkout.price)}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {checkout.visits}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {checkout.offer}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48 bg-card border-border">
                          <DropdownMenuItem
                            onClick={() => onCustomize(checkout)}
                            className="gap-2 cursor-pointer"
                          >
                            <Palette className="w-4 h-4" />
                            Personalizar
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => onConfigure(checkout)}
                            className="gap-2 cursor-pointer"
                          >
                            <Settings className="w-4 h-4" />
                            Configurações
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => onDuplicate(checkout)}
                            className="gap-2 cursor-pointer"
                          >
                            <Copy className="w-4 h-4" />
                            Duplicar
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => onDelete(checkout.id)}
                            className="gap-2 cursor-pointer text-destructive focus:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                            Deletar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Paginação */}
          <div className="flex items-center justify-center gap-2">
            <Button variant="outline" size="icon" className="h-8 w-8" disabled>
              <span className="sr-only">Anterior</span>
              ‹
            </Button>
            <Button variant="default" size="icon" className="h-8 w-8">
              1
            </Button>
            <Button variant="outline" size="icon" className="h-8 w-8" disabled>
              <span className="sr-only">Próximo</span>
              ›
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

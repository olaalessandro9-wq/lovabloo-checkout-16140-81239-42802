import { useState } from "react";
import { Search, Plus, MoreVertical, Copy, EyeOff, Power, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { useToast } from "@/hooks/use-toast";

export interface CheckoutLink {
  id: string;
  name: string;
  url: string;
  offer: string;
  type: string;
  price: number;
  status: "active" | "inactive";
  hiddenFromAffiliates: boolean;
  isDefault: boolean;
}

interface LinksTableProps {
  links: CheckoutLink[];
  onAdd: () => void;
  onToggleAffiliateVisibility: (id: string) => void;
  onToggleStatus: (id: string) => void;
  onCustomize: (link: CheckoutLink) => void;
  onDelete: (id: string) => void;
}

export function LinksTable({
  links,
  onAdd,
  onToggleAffiliateVisibility,
  onToggleStatus,
  onCustomize,
  onDelete,
}: LinksTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  const filteredLinks = links.filter((link) =>
    link.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    link.url.toLowerCase().includes(searchTerm.toLowerCase()) ||
    link.offer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url);
    toast({
      title: "Link copiado",
      description: "O link foi copiado para a área de transferência",
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Pesquisar"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 bg-background border-border text-foreground"
          />
        </div>
        <Button onClick={onAdd} className="gap-2 bg-primary hover:bg-primary/90">
          <Plus className="w-4 h-4" />
          Adicionar Link
        </Button>
      </div>

      <div className="border border-border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50">
              <TableHead className="w-12">
                <input type="checkbox" className="rounded border-border" />
              </TableHead>
              <TableHead className="text-foreground">Nome</TableHead>
              <TableHead className="text-foreground">URL</TableHead>
              <TableHead className="text-foreground">Oferta</TableHead>
              <TableHead className="text-foreground">Tipo</TableHead>
              <TableHead className="text-foreground">Preço</TableHead>
              <TableHead className="text-foreground">Status</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredLinks.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                  Nenhum link encontrado
                </TableCell>
              </TableRow>
            ) : (
              filteredLinks.map((link) => (
                <TableRow key={link.id} className="hover:bg-muted/30">
                  <TableCell>
                    <input type="checkbox" className="rounded border-border" />
                  </TableCell>
                  <TableCell className="font-medium text-foreground">
                    {link.name}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => copyToClipboard(link.url)}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                      <span className="text-sm text-muted-foreground truncate max-w-[200px]">
                        {link.url}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-foreground">{link.offer}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                      {link.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-foreground">
                    R$ {link.price.toFixed(2)}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={link.status === "active" ? "default" : "secondary"}
                      className={
                        link.status === "active"
                          ? "bg-green-500/10 text-green-600 border-green-500/20"
                          : "bg-muted text-muted-foreground"
                      }
                    >
                      {link.status === "active" ? "Ativo" : "Inativo"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuItem onClick={() => onToggleAffiliateVisibility(link.id)}>
                          <EyeOff className="w-4 h-4 mr-2" />
                          {link.hiddenFromAffiliates ? "Mostrar aos" : "Esconder dos"} Afiliados
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onToggleStatus(link.id)}>
                          <Power className="w-4 h-4 mr-2" />
                          {link.status === "active" ? "Desativar" : "Ativar"}
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => onDelete(link.id)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-center gap-2">
        <Button variant="outline" size="icon" disabled>
          &lt;
        </Button>
        <Button variant="default" size="icon" className="bg-primary">
          1
        </Button>
        <Button variant="outline" size="icon" disabled>
          &gt;
        </Button>
      </div>
    </div>
  );
}

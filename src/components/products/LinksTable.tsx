import { useState } from "react";
import { Search, Copy, Star, ExternalLink, Power } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export interface PaymentLink {
  id: string;
  slug: string;
  url: string;
  offer_name: string;
  offer_price: number;
  is_default: boolean;
  status: "active" | "inactive";
  checkouts: {
    id: string;
    name: string;
  }[];
}

interface LinksTableProps {
  links: PaymentLink[];
  onToggleStatus: (id: string) => void;
}

export function LinksTable({ links, onToggleStatus }: LinksTableProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredLinks = links.filter((link) =>
    link.offer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    link.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success("Link copiado para a área de transferência!");
  };

  const openLink = (url: string) => {
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Pesquisar links..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 bg-background border-border text-foreground"
          />
        </div>
      </div>

      {filteredLinks.length === 0 ? (
        <div className="border border-border rounded-lg p-12 text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
            <ExternalLink className="w-6 h-6 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Nenhum link de pagamento encontrado
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            {searchTerm 
              ? "Nenhum link corresponde à sua pesquisa."
              : "Crie ofertas na aba Geral para gerar links de pagamento automaticamente."}
          </p>
        </div>
      ) : (
        <div className="border border-border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50">
                <TableHead className="text-foreground">Oferta</TableHead>
                <TableHead className="text-foreground">Preço</TableHead>
                <TableHead className="text-foreground">Link</TableHead>
                <TableHead className="text-foreground">Checkouts Associados</TableHead>
                <TableHead className="text-foreground">Status</TableHead>
                <TableHead className="w-24 text-center">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLinks.map((link) => (
                <TableRow key={link.id} className="hover:bg-muted/30">
                  <TableCell className="font-medium text-foreground">
                    <div className="flex items-center gap-2">
                      {link.offer_name}
                      {link.is_default && (
                        <Badge variant="secondary" className="text-xs gap-1">
                          <Star className="w-3 h-3" />
                          Padrão
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-foreground font-medium">
                    R$ {link.offer_price.toFixed(2)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 max-w-md">
                      <code className="text-xs bg-muted px-2 py-1 rounded text-muted-foreground truncate flex-1">
                        {link.url}
                      </code>
                    </div>
                  </TableCell>
                  <TableCell>
                    {link.checkouts.length === 0 ? (
                      <span className="text-sm text-muted-foreground italic">
                        Nenhum checkout associado
                      </span>
                    ) : (
                      <div className="flex flex-wrap gap-1">
                        {link.checkouts.map((checkout) => (
                          <Badge
                            key={checkout.id}
                            variant="outline"
                            className="text-xs"
                          >
                            {checkout.name}
                          </Badge>
                        ))}
                      </div>
                    )}
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
                      {link.status === "active" ? "Ativo" : "Desativado"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => copyToClipboard(link.url)}
                        title="Copiar link"
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => openLink(link.url)}
                        title="Abrir link"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => onToggleStatus(link.id)}
                        title={link.status === "active" ? "Desativar" : "Ativar"}
                      >
                        <Power className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
        <p className="text-sm text-blue-400">
          <strong>💡 Dica:</strong> Os links de pagamento são gerados automaticamente quando você cria ofertas na aba Geral. Cada oferta tem seu próprio link único que pode ser associado a múltiplos checkouts.
        </p>
      </div>
    </div>
  );
}


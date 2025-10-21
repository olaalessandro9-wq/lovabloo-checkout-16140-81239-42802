import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Search, RefreshCw, Download, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const mockCustomers = [
  {
    id: "c#6c9a7...",
    offer: "RATEIO COMMUNITY",
    client: "gabrielovariol029@gmail.com",
    phone: "+5593991495709",
    createdAt: "05/09/2025, 10:22",
    value: "R$ 19,9",
    status: "Pago",
  },
  {
    id: "c#6cjp...",
    offer: "RATEIO COMMUNITY",
    client: "alessanderlasm@gmail.com",
    phone: "+5591994501825",
    createdAt: "05/09/2025, 09:39",
    value: "R$ 19,9",
    status: "Pendente",
  },
  {
    id: "c#6c9ec...",
    offer: "RATEIO COMMUNITY",
    client: "gabrielovariol029@gmail.com",
    phone: "+5593991495709",
    createdAt: "05/09/2025, 09:27",
    value: "R$ 19,9",
    status: "Pendente",
  },
  {
    id: "c#6crs1...",
    offer: "RATEIO COMMUNITY",
    client: "codadedouzadaniel94@gmail.com",
    phone: "+5591985056279",
    createdAt: "05/09/2025, 09:14",
    value: "R$ 29,89",
    status: "Pago",
  },
  {
    id: "c#6cnjk...",
    offer: "RATEIO COMMUNITY",
    client: "oliveiralsa_1@hotmail.com",
    phone: "+5561980000041",
    createdAt: "05/09/2025, 09:13",
    value: "R$ 29,89",
    status: "Pendente",
  },
];

export function RecentCustomersTable() {
  return (
    <Card className="p-6 bg-gradient-card border-primary/20">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground">Últimos Clientes</h3>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Pesquisar..."
                className="pl-9 pr-4 py-2 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <Button variant="outline" size="sm" className="gap-2">
              <RefreshCw className="w-4 h-4" />
              Atualizar lista
            </Button>
            <Button variant="outline" size="sm" className="gap-2">
              <Download className="w-4 h-4" />
              Exportar Excel
            </Button>
          </div>
        </div>

        <div className="border border-border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50">
                <TableHead className="text-muted-foreground">ID</TableHead>
                <TableHead className="text-muted-foreground">Oferta</TableHead>
                <TableHead className="text-muted-foreground">Cliente</TableHead>
                <TableHead className="text-muted-foreground">Telefone</TableHead>
                <TableHead className="text-muted-foreground">Criado em</TableHead>
                <TableHead className="text-muted-foreground">Valor</TableHead>
                <TableHead className="text-muted-foreground">Status</TableHead>
                <TableHead className="text-muted-foreground">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockCustomers.map((customer) => (
                <TableRow key={customer.id} className="hover:bg-muted/30">
                  <TableCell className="font-mono text-sm text-foreground">{customer.id}</TableCell>
                  <TableCell className="text-sm text-foreground">{customer.offer}</TableCell>
                  <TableCell className="text-sm text-foreground">{customer.client}</TableCell>
                  <TableCell className="text-sm text-foreground">{customer.phone}</TableCell>
                  <TableCell className="text-sm text-foreground">{customer.createdAt}</TableCell>
                  <TableCell className="text-sm text-foreground">{customer.value}</TableCell>
                  <TableCell>
                    <Badge 
                      variant={customer.status === "Pago" ? "default" : "secondary"}
                      className={customer.status === "Pago" ? "bg-success/20 text-success hover:bg-success/30" : ""}
                    >
                      {customer.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" className="gap-2 text-primary hover:text-primary">
                      <Eye className="w-4 h-4" />
                      Ver Detalhes
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>Mostrando 41 de 41 registros — Período: 01/06/2025 - 20/10/2025</span>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" disabled>
              Previous
            </Button>
            {[1, 2, 3, 4, 5].map((page) => (
              <Button
                key={page}
                variant={page === 1 ? "default" : "ghost"}
                size="sm"
                className={page === 1 ? "bg-primary" : ""}
              >
                {page}
              </Button>
            ))}
            <Button variant="ghost" size="sm">
              Next
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}

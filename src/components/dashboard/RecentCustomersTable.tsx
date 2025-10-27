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

// Dados zerados - aguardando dados reais do banco
const mockCustomers: Array<{
  id: string;
  offer: string;
  client: string;
  phone: string;
  createdAt: string;
  value: string;
  status: "Pago" | "Pendente";
}> = [];

export function RecentCustomersTable() {
  return (
    <Card className="p-6 border-border/50">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold" style={{ color: 'var(--text)' }}>Últimos Clientes</h3>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Pesquisar..."
                className="pl-9 pr-4 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                style={{ color: 'var(--text)' }}
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

        <div className="border border-border rounded-lg overflow-hidden bg-card">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30 hover:bg-muted/30">
                <TableHead style={{ color: 'var(--subtext)' }}>ID</TableHead>
                <TableHead style={{ color: 'var(--subtext)' }}>Oferta</TableHead>
                <TableHead style={{ color: 'var(--subtext)' }}>Cliente</TableHead>
                <TableHead style={{ color: 'var(--subtext)' }}>Telefone</TableHead>
                <TableHead style={{ color: 'var(--subtext)' }}>Criado em</TableHead>
                <TableHead style={{ color: 'var(--subtext)' }}>Valor</TableHead>
                <TableHead style={{ color: 'var(--subtext)' }}>Status</TableHead>
                <TableHead style={{ color: 'var(--subtext)' }}>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockCustomers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-12">
                    <div className="flex flex-col items-center gap-2" style={{ color: 'var(--subtext)' }}>
                      <svg className="w-12 h-12 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                      </svg>
                      <p className="text-base font-medium" style={{ color: 'var(--text)' }}>Nenhum cliente ainda</p>
                      <p className="text-sm">Quando você tiver clientes, eles aparecerão aqui com suas compras.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                mockCustomers.map((customer) => (
                <TableRow key={customer.id} className="hover:bg-muted/30">
                  <TableCell className="font-mono text-sm" style={{ color: 'var(--text)' }}>{customer.id}</TableCell>
                  <TableCell className="text-sm" style={{ color: 'var(--text)' }}>{customer.offer}</TableCell>
                  <TableCell className="text-sm" style={{ color: 'var(--text)' }}>{customer.client}</TableCell>
                  <TableCell className="text-sm" style={{ color: 'var(--text)' }}>{customer.phone}</TableCell>
                  <TableCell className="text-sm" style={{ color: 'var(--text)' }}>{customer.createdAt}</TableCell>
                  <TableCell className="text-sm" style={{ color: 'var(--text)' }}>{customer.value}</TableCell>
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
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {mockCustomers.length > 0 && (
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Mostrando {mockCustomers.length} de {mockCustomers.length} registros</span>
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
        )}
      </div>
    </Card>
  );
}

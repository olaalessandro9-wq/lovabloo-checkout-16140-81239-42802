import { MainLayout } from "@/components/layout/MainLayout";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Download, RefreshCw, Check, X, Ban, MoreVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const initialAffiliates = [
  {
    id: 1,
    name: "João Silva",
    email: "joao.silva@email.com",
    sales: 45,
    revenue: "R$ 12.450,00",
    status: "Aprovado" as const,
    joinDate: "15/01/2024",
  },
  {
    id: 2,
    name: "Maria Santos",
    email: "maria.santos@email.com",
    sales: 38,
    revenue: "R$ 9.850,00",
    status: "Aprovado" as const,
    joinDate: "22/01/2024",
  },
  {
    id: 3,
    name: "Pedro Oliveira",
    email: "pedro.oliveira@email.com",
    sales: 52,
    revenue: "R$ 15.200,00",
    status: "Aprovado" as const,
    joinDate: "10/01/2024",
  },
  {
    id: 4,
    name: "Ana Costa",
    email: "ana.costa@email.com",
    sales: 0,
    revenue: "R$ 0,00",
    status: "Pendente" as const,
    joinDate: "05/02/2024",
  },
  {
    id: 5,
    name: "Carlos Lima",
    email: "carlos.lima@email.com",
    sales: 0,
    revenue: "R$ 0,00",
    status: "Recusado" as const,
    joinDate: "28/01/2024",
  },
  {
    id: 6,
    name: "Fernanda Alves",
    email: "fernanda.alves@email.com",
    sales: 0,
    revenue: "R$ 0,00",
    status: "Bloqueado" as const,
    joinDate: "12/02/2024",
  },
];

const Afiliados = () => {
  const [affiliates, setAffiliates] = useState(initialAffiliates);
  const [statusFilter, setStatusFilter] = useState("Todos");
  const { toast } = useToast();

  const handleApprove = (id: number) => {
    setAffiliates(prev =>
      prev.map(aff => aff.id === id ? { ...aff, status: "Aprovado" as const } : aff)
    );
    toast({
      title: "Afiliado aprovado",
      description: "O afiliado foi aprovado com sucesso.",
    });
  };

  const handleReject = (id: number) => {
    setAffiliates(prev =>
      prev.map(aff => aff.id === id ? { ...aff, status: "Recusado" as const } : aff)
    );
    toast({
      title: "Afiliado recusado",
      description: "O pedido do afiliado foi recusado.",
    });
  };

  const handleBlock = (id: number) => {
    setAffiliates(prev =>
      prev.map(aff => aff.id === id ? { ...aff, status: "Bloqueado" as const } : aff)
    );
    toast({
      title: "Afiliado bloqueado",
      description: "O afiliado foi bloqueado.",
    });
  };

  const filteredAffiliates = statusFilter === "Todos" 
    ? affiliates 
    : affiliates.filter(aff => aff.status === statusFilter);

  const stats = {
    total: affiliates.length,
    approved: affiliates.filter(a => a.status === "Aprovado").length,
    pending: affiliates.filter(a => a.status === "Pendente").length,
    blocked: affiliates.filter(a => a.status === "Bloqueado").length,
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Afiliados</h1>
          <p className="text-muted-foreground mt-1">
            Monitore e gerencie seus afiliados
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <p className="text-sm text-muted-foreground">Total de Afiliados</p>
            <p className="text-2xl font-bold text-foreground mt-1">{stats.total}</p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-muted-foreground">Aprovados</p>
            <p className="text-2xl font-bold text-foreground mt-1">{stats.approved}</p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-muted-foreground">Pendentes</p>
            <p className="text-2xl font-bold text-foreground mt-1">{stats.pending}</p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-muted-foreground">Bloqueados</p>
            <p className="text-2xl font-bold text-foreground mt-1">{stats.blocked}</p>
          </Card>
        </div>

        {/* Table */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-foreground">
              Lista de Afiliados
            </h2>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <RefreshCw className="w-4 h-4 mr-2" />
                Atualizar
              </Button>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Exportar
              </Button>
            </div>
          </div>

          <div className="mb-4 flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Buscar por nome ou email..."
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filtrar por status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Todos">Todos</SelectItem>
                <SelectItem value="Aprovado">Aprovados</SelectItem>
                <SelectItem value="Pendente">Pendentes</SelectItem>
                <SelectItem value="Recusado">Recusados</SelectItem>
                <SelectItem value="Bloqueado">Bloqueados</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Vendas</TableHead>
                  <TableHead>Receita</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Data de Cadastro</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAffiliates.map((affiliate) => (
                  <TableRow key={affiliate.id}>
                    <TableCell className="font-medium">
                      {affiliate.name}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {affiliate.email}
                    </TableCell>
                    <TableCell>{affiliate.sales}</TableCell>
                    <TableCell>{affiliate.revenue}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          affiliate.status === "Aprovado"
                            ? "default"
                            : affiliate.status === "Pendente"
                            ? "secondary"
                            : "outline"
                        }
                      >
                        {affiliate.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {affiliate.joinDate}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-background">
                          {affiliate.status === "Pendente" && (
                            <>
                              <DropdownMenuItem onClick={() => handleApprove(affiliate.id)}>
                                <Check className="w-4 h-4 mr-2" />
                                Aprovar
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleReject(affiliate.id)}>
                                <X className="w-4 h-4 mr-2" />
                                Recusar
                              </DropdownMenuItem>
                            </>
                          )}
                          {affiliate.status !== "Bloqueado" && (
                            <DropdownMenuItem onClick={() => handleBlock(affiliate.id)}>
                              <Ban className="w-4 h-4 mr-2" />
                              Bloquear
                            </DropdownMenuItem>
                          )}
                          {affiliate.status === "Bloqueado" && (
                            <DropdownMenuItem onClick={() => handleApprove(affiliate.id)}>
                              <Check className="w-4 h-4 mr-2" />
                              Desbloquear
                            </DropdownMenuItem>
                          )}
                          {affiliate.status === "Recusado" && (
                            <DropdownMenuItem onClick={() => handleApprove(affiliate.id)}>
                              <Check className="w-4 h-4 mr-2" />
                              Aprovar
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>
    </MainLayout>
  );
};

export default Afiliados;

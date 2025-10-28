import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, MoreVertical } from "lucide-react";
import { formatCentsToBRL } from "@/utils/money";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AddProductDialog } from "./AddProductDialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

interface Product {
  id: string;
  name: string;
  price: number;
  status: "active" | "blocked";
}

export function ProductsTable() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("products");

  useEffect(() => {
    loadProducts();
  }, [user]);

  const loadProducts = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setProducts((data || []) as Product[]);
    } catch (error: any) {
      toast.error("Erro ao carregar produtos");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (productId: string) => {
    navigate(`/produtos/editar?id=${productId}`);
  };

  const handleDuplicate = async (product: Product) => {
    if (!user) return;

    try {
      const res = await fetch("/api/products/duplicate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product.id })
      });
      
      const json = await res.json();

      if (!res.ok) {
        toast.error("Erro ao duplicar produto", { description: json.error || "Erro desconhecido" });
        throw new Error(json.error || "Erro ao duplicar produto");
      } else {
        toast.success("Produto duplicado com sucesso!", { description: "O novo produto está na lista." });
        loadProducts();
      }
    } catch (error: any) {
      console.error(error);
      // O toast.error já foi chamado acima, mas se for outro erro:
      if (!error.message.includes("Erro ao duplicar produto")) {
        toast.error("Erro ao duplicar produto", { description: "Verifique o console para detalhes." });
      }
    }
  };

  const handleDelete = async (productId: string) => {
    try {
      // Usar a nova API para deletar produto e assets
      const res = await fetch("/api/products/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId })
      });

      const json = await res.json();
      
      if (!res.ok) {
        toast.error("Erro ao excluir produto", { description: json.error || "Erro desconhecido" });
        throw new Error(json.error || "Erro ao excluir produto");
      }

      toast.success("Produto excluído com sucesso", { description: "O produto e seus assets foram removidos." });
      loadProducts();
    } catch (error: any) {
      console.error(error);
      // O toast.error já foi chamado acima, mas se for outro erro:
      if (!error.message.includes("Erro ao excluir produto")) {
        toast.error("Erro ao excluir produto", { description: "Verifique o console para detalhes." });
      }
    }
  };

  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
    (statusFilter === "all" || product.status === statusFilter)
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header com botão Adicionar Produto */}
      <div className="flex justify-end">
        <Button 
          className="bg-success hover:bg-success/90 text-white"
          onClick={() => setIsAddDialogOpen(true)}
        >
          Adicionar Produto
        </Button>
      </div>

      {/* Tabs estilo Cakto */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-transparent border-b border-border rounded-none w-full justify-start h-auto p-0 space-x-8">
          <TabsTrigger 
            value="products"
            className="bg-transparent data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0 pb-3"
          >
            Meus Produtos
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Barra de pesquisa e filtros */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Pesquisar"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-card border-border"
          />
        </div>
        <div className="flex gap-2 items-center">
          <span className="text-sm text-muted-foreground">Status</span>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[200px] bg-card border-border">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border">
              <SelectItem value="all">Ativo e Bloqueado</SelectItem>
              <SelectItem value="active">Ativo</SelectItem>
              <SelectItem value="blocked">Bloqueado</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Tabela de produtos */}
      <div className="rounded-lg border border-border overflow-hidden bg-card">
        <table className="w-full">
          <thead className="border-b border-border bg-muted/30">
            <tr>
              <th className="text-left p-4 text-sm font-medium text-muted-foreground">Nome</th>
              <th className="text-left p-4 text-sm font-medium text-muted-foreground">Preço</th>
              <th className="text-left p-4 text-sm font-medium text-muted-foreground">Status</th>
              <th className="w-12"></th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-8 text-center text-muted-foreground">
                  Nenhum produto encontrado
                </td>
              </tr>
            ) : (
              filteredProducts.map((product) => (
                <tr 
                  key={product.id} 
                  className="border-b border-border hover:bg-muted/20 transition-colors cursor-pointer"
                  onClick={() => handleEdit(product.id)}
                >
                  <td className="p-4 text-foreground">{product.name}</td>
                  <td className="p-4 text-foreground">{formatCentsToBRL(product.price)}</td>
                  <td className="p-4">
                    <Badge 
                      variant={product.status === "active" ? "default" : "secondary"}
                      className={product.status === "active" ? "bg-success/20 text-success hover:bg-success/30" : ""}
                    >
                      {product.status === "active" ? "Ativo" : "Bloqueado"}
                    </Badge>
                  </td>
                  <td className="p-4" onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-popover border-border">
                        <DropdownMenuItem onClick={() => handleEdit(product.id)}>
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDuplicate(product)}>
                          Duplicar
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-destructive"
                          onClick={() => handleDelete(product.id)}
                        >
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Paginação */}
      {filteredProducts.length > 0 && (
        <div className="flex justify-center">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="w-8 h-8">
              {"<"}
            </Button>
            <Button size="icon" className="w-8 h-8 bg-primary">
              1
            </Button>
            <Button variant="ghost" size="icon" className="w-8 h-8">
              {">"}
            </Button>
          </div>
        </div>
      )}

      <AddProductDialog 
        open={isAddDialogOpen} 
        onOpenChange={setIsAddDialogOpen}
        onProductAdded={loadProducts}
      />
    </div>
  );
}


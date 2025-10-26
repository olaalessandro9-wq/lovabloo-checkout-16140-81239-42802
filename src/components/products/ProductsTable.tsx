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
      // 1. Buscar todos os dados do produto original
      const { data: originalProduct, error: productError } = await supabase
        .from("products")
        .select("*")
        .eq("id", product.id)
        .single();

      if (productError) throw productError;

      // 2. Copiar imagem se existir
      let newImageUrl = null;
      if (originalProduct.image_url) {
        try {
          // Extrair o caminho da imagem original
          let originalImagePath = originalProduct.image_url;
          
          // Se for URL completa, extrair apenas o caminho
          if (originalImagePath.includes('supabase.co/storage/v1/object/public/product-images/')) {
            originalImagePath = originalImagePath.split('product-images/')[1];
          }

          // Baixar a imagem original
          const { data: imageData, error: downloadError } = await supabase.storage
            .from('product-images')
            .download(originalImagePath);

          if (downloadError) {
            console.warn('Erro ao baixar imagem original:', downloadError);
            // Continuar sem imagem se houver erro
          } else if (imageData) {
            // Gerar novo nome para a imagem
            const fileExt = originalImagePath.split('.').pop();
            const newFileName = `${user.id}/${Date.now()}_copy.${fileExt}`;

            // Fazer upload da cópia
            const { error: uploadError } = await supabase.storage
              .from('product-images')
              .upload(newFileName, imageData, { upsert: true });

            if (uploadError) {
              console.warn('Erro ao fazer upload da cópia da imagem:', uploadError);
            } else {
              // Obter URL pública da nova imagem
              const { data: urlData } = supabase.storage
                .from('product-images')
                .getPublicUrl(newFileName);
              
              newImageUrl = urlData.publicUrl;
            }
          }
        } catch (error) {
          console.warn('Erro ao copiar imagem:', error);
          // Continuar sem imagem se houver erro
        }
      }

      // 3. Criar novo produto com todos os dados (exceto id e timestamps)
      const { data: newProduct, error: insertError } = await supabase
        .from("products")
        .insert({
          name: `${originalProduct.name} (Cópia)`,
          description: originalProduct.description,
          price: originalProduct.price,
          status: originalProduct.status,
          image_url: newImageUrl, // Usar a nova URL da imagem copiada
          support_email: originalProduct.support_email,
          support_name: originalProduct.support_name,
          user_id: user.id,
        })
        .select()
        .single();

      if (insertError) throw insertError;

      // 4. Copiar ofertas adicionais (não copiar a oferta padrão pois será criada automaticamente)
      const { data: originalOffers, error: offersError } = await supabase
        .from("offers")
        .select("*")
        .eq("product_id", product.id)
        .eq("is_default", false); // Só ofertas adicionais

      if (offersError) throw offersError;

      if (originalOffers && originalOffers.length > 0) {
        const newOffers = originalOffers.map(offer => ({
          product_id: newProduct.id,
          name: offer.name,
          price: offer.price,
          is_default: false,
        }));

        const { error: offersInsertError } = await supabase
          .from("offers")
          .insert(newOffers);

        if (offersInsertError) throw offersInsertError;
      }

      // 5. Copiar checkouts (exceto o padrão que será criado automaticamente)
      const { data: originalCheckouts, error: checkoutsError } = await supabase
        .from("checkouts")
        .select("*")
        .eq("product_id", product.id)
        .eq("is_default", false); // Só checkouts adicionais

      if (checkoutsError) throw checkoutsError;

      if (originalCheckouts && originalCheckouts.length > 0) {
        const newCheckouts = originalCheckouts.map(checkout => ({
          product_id: newProduct.id,
          name: checkout.name,
          is_default: false,
        }));

        const { error: checkoutsInsertError } = await supabase
          .from("checkouts")
          .insert(newCheckouts);

        if (checkoutsInsertError) throw checkoutsInsertError;
      }

      toast.success("Produto duplicado com sucesso!");
      loadProducts();
    } catch (error: any) {
      toast.error("Erro ao duplicar produto");
      console.error(error);
    }
  };

  const handleDelete = async (productId: string) => {
    try {
      // 1. Buscar dados do produto antes de deletar (para pegar a URL da imagem)
      const { data: product, error: fetchError } = await supabase
        .from("products")
        .select("image_url, user_id")
        .eq("id", productId)
        .single();

      if (fetchError) throw fetchError;

      // 2. Deletar o produto (CASCADE vai deletar ofertas, links, checkouts, etc.)
      const { error: deleteError } = await supabase
        .from("products")
        .delete()
        .eq("id", productId);

      if (deleteError) throw deleteError;

      // 3. Deletar a imagem do Storage (se existir)
      if (product?.image_url) {
        try {
          // Extrair o caminho da imagem da URL
          // Formato: https://xxx.supabase.co/storage/v1/object/public/product-images/user_id/filename.ext
          let imagePath = product.image_url;
          
          // Se for URL completa, extrair apenas o caminho após 'product-images/'
          if (imagePath.includes('product-images/')) {
            imagePath = imagePath.split('product-images/')[1];
          } else if (imagePath.includes('/')) {
            // Se for caminho relativo, pegar apenas o nome do arquivo
            const fileName = imagePath.split('/').pop();
            imagePath = `${product.user_id}/${fileName}`;
          } else {
            // Se for apenas o nome do arquivo
            imagePath = `${product.user_id}/${imagePath}`;
          }

          // Deletar do bucket
          const { error: storageError } = await supabase.storage
            .from('product-images')
            .remove([imagePath]);

          if (storageError) {
            console.warn('Erro ao deletar imagem do Storage:', storageError);
            // Não lançar erro, pois o produto já foi deletado
          }
        } catch (storageError) {
          console.warn('Erro ao processar deleção de imagem:', storageError);
          // Não lançar erro, pois o produto já foi deletado
        }
      }

      toast.success("Produto excluído com sucesso");
      loadProducts();
    } catch (error: any) {
      toast.error("Erro ao excluir produto");
      console.error(error);
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


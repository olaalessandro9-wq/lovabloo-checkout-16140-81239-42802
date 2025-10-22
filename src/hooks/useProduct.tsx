import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

export interface ProductData {
  id?: string;
  name: string;
  description: string;
  price: string;
  image_url: string | null;
  support_name: string;
  support_email: string;
  status: "active" | "blocked";
}

export const useProduct = () => {
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const productId = searchParams.get("id");
  
  const [product, setProduct] = useState<ProductData | null>(null);
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);

  useEffect(() => {
    if (productId && user) {
      loadProduct();
    }
  }, [productId, user]);

  const loadProduct = async (showLoading = true) => {
    if (!productId || !user) return;

    if (showLoading) {
      setLoading(true);
    }
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", productId)
        .eq("user_id", user.id)
        .single();

      if (error) throw error;
      
      setProduct({
        id: data.id,
        name: data.name || "",
        description: data.description || "",
        price: data.price?.toString() || "",
        image_url: data.image_url,
        support_name: data.support_name || "",
        support_email: data.support_email || "",
        status: data.status as "active" | "blocked",
      });
    } catch (error: any) {
      toast.error("Erro ao carregar produto");
      console.error("Error loading product:", error);
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  };

  const uploadImage = async (): Promise<string | null> => {
    if (!imageFile || !user || !productId) return null;

    try {
      const fileExt = imageFile.name.split(".").pop();
      const fileName = `${user.id}/${productId}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("product-images")
        .upload(fileName, imageFile, { upsert: true });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from("product-images")
        .getPublicUrl(fileName);

      return data.publicUrl;
    } catch (error: any) {
      toast.error("Erro ao fazer upload da imagem");
      console.error("Error uploading image:", error);
      return null;
    }
  };

  const saveProduct = async (productData: Partial<ProductData>) => {
    // Validar se o usuário está autenticado
    if (!user) {
      toast.error("Você precisa estar autenticado para criar produtos");
      console.error("User not authenticated");
      return;
    }

    // Validar campos obrigatórios
    if (!productData.name || productData.name.trim() === "") {
      toast.error("O nome do produto é obrigatório");
      return;
    }

    if (!productData.price || parseFloat(productData.price) <= 0) {
      toast.error("O preço do produto deve ser maior que zero");
      return;
    }

    try {
      // Usar image_url do productData se fornecido (permite null para remover)
      let imageUrl = productData.image_url !== undefined ? productData.image_url : product?.image_url;
      
      if (imageFile) {
        const uploadedUrl = await uploadImage();
        if (uploadedUrl) imageUrl = uploadedUrl;
      }

      const dataToSave = {
        name: productData.name.trim(),
        description: productData.description?.trim() || "",
        support_name: productData.support_name?.trim() || "",
        support_email: productData.support_email?.trim() || "",
        status: productData.status || "active",
        image_url: imageUrl,
        price: parseFloat(productData.price),
        user_id: user.id,
      };

      console.log("Saving product with data:", dataToSave);

      if (productId) {
        // Atualizar produto existente
        const { error } = await supabase
          .from("products")
          .update(dataToSave)
          .eq("id", productId)
          .eq("user_id", user.id);

        if (error) {
          console.error("Error updating product:", error);
          throw error;
        }
        toast.success("Produto atualizado com sucesso");
      } else {
        // Criar novo produto
        const { data, error } = await supabase
          .from("products")
          .insert([dataToSave])
          .select()
          .single();

        if (error) {
          console.error("Error creating product:", error);
          console.error("Error details:", {
            message: error.message,
            details: error.details,
            hint: error.hint,
            code: error.code,
          });
          throw error;
        }
        
        toast.success("Produto criado com sucesso");
        
        if (data) {
          setProduct({
            id: data.id,
            name: data.name || "",
            description: data.description || "",
            price: data.price?.toString() || "",
            image_url: data.image_url,
            support_name: data.support_name || "",
            support_email: data.support_email || "",
            status: data.status as "active" | "blocked",
          });
          
          // Redirecionar para a página de edição do produto criado
          window.location.href = `/product/edit?id=${data.id}`;
        }
      }

      if (productId) {
        await loadProduct(false);
      }
    } catch (error: any) {
      // Melhorar mensagens de erro
      if (error.code === "PGRST301") {
        toast.error("Você não tem permissão para criar produtos. Verifique sua autenticação.");
      } else if (error.code === "23502") {
        toast.error("Campos obrigatórios não foram preenchidos");
      } else if (error.message?.includes("JWT")) {
        toast.error("Sessão expirada. Faça login novamente.");
      } else {
        toast.error(`Erro ao salvar produto: ${error.message || "Erro desconhecido"}`);
      }
      console.error("Error saving product:", error);
      throw error; // Re-throw para o componente tratar
    }
  };

  const deleteProduct = async () => {
    if (!productId || !user) return false;

    try {
      console.log("[deleteProduct] Iniciando exclusão do produto:", productId);
      
      // 1. Buscar ofertas do produto
      console.log("[deleteProduct] Buscando ofertas...");
      const { data: offers, error: offersError } = await supabase
        .from("offers")
        .select("id")
        .eq("product_id", productId);
      
      if (offersError) {
        console.error("[deleteProduct] Erro ao buscar ofertas:", offersError);
        throw offersError;
      }
      
      console.log("[deleteProduct] Ofertas encontradas:", offers?.length || 0);

      // 2. Buscar checkouts do produto PRIMEIRO (para excluir antes dos links)
      console.log("[deleteProduct] Buscando checkouts...");
      const { data: checkouts, error: checkoutsError } = await supabase
        .from("checkouts")
        .select("id")
        .eq("product_id", productId);
      
      if (checkoutsError) {
        console.error("[deleteProduct] Erro ao buscar checkouts:", checkoutsError);
        throw checkoutsError;
      }
      
      console.log("[deleteProduct] Checkouts encontrados:", checkouts?.length || 0);

      // 3. Excluir checkouts ANTES de excluir links (para evitar trigger)
      if (checkouts && checkouts.length > 0) {
        const checkoutIds = checkouts.map(c => c.id);
        console.log("[deleteProduct] IDs dos checkouts:", checkoutIds);

        // Excluir associações checkout_links
        console.log("[deleteProduct] Excluindo checkout_links...");
        const { error: checkoutLinksError } = await supabase
          .from("checkout_links")
          .delete()
          .in("checkout_id", checkoutIds);
        
        if (checkoutLinksError) {
          console.error("[deleteProduct] Erro ao excluir checkout_links:", checkoutLinksError);
          throw checkoutLinksError;
        }

        // Excluir checkouts
        console.log("[deleteProduct] Excluindo checkouts...");
        const { error: checkoutsDeleteError } = await supabase
          .from("checkouts")
          .delete()
          .in("id", checkoutIds);
        
        if (checkoutsDeleteError) {
          console.error("[deleteProduct] Erro ao excluir checkouts:", checkoutsDeleteError);
          throw checkoutsDeleteError;
        }
      }

      // 4. Agora excluir links e ofertas (sem trigger porque checkouts já foram excluídos)
      if (offers && offers.length > 0) {
        const offerIds = offers.map(o => o.id);
        console.log("[deleteProduct] IDs das ofertas:", offerIds);

        // Buscar links das ofertas
        console.log("[deleteProduct] Buscando links de pagamento...");
        const { data: links, error: linksError } = await supabase
          .from("payment_links")
          .select("id")
          .in("offer_id", offerIds);
        
        if (linksError) {
          console.error("[deleteProduct] Erro ao buscar links:", linksError);
          throw linksError;
        }
        
        console.log("[deleteProduct] Links encontrados:", links?.length || 0);

        // Excluir payment_links
        if (links && links.length > 0) {
          const linkIds = links.map(l => l.id);
          console.log("[deleteProduct] IDs dos links:", linkIds);

          console.log("[deleteProduct] Excluindo payment_links...");
          const { error: paymentLinksError } = await supabase
            .from("payment_links")
            .delete()
            .in("id", linkIds);
          
          if (paymentLinksError) {
            console.error("[deleteProduct] Erro ao excluir payment_links:", paymentLinksError);
            throw paymentLinksError;
          }
        }

        // Excluir ofertas
        console.log("[deleteProduct] Excluindo ofertas...");
        const { error: offersDeleteError } = await supabase
          .from("offers")
          .delete()
          .in("id", offerIds);
        
        if (offersDeleteError) {
          console.error("[deleteProduct] Erro ao excluir ofertas:", offersDeleteError);
          throw offersDeleteError;
        }
      }

      // 7. Excluir order bumps
      console.log("[deleteProduct] Excluindo order bumps...");
      const { error: orderBumpsError } = await supabase
        .from("order_bumps")
        .delete()
        .eq("product_id", productId);
      
      if (orderBumpsError) {
        console.error("[deleteProduct] Erro ao excluir order bumps:", orderBumpsError);
        // Não lançar erro se a tabela não existir
        if (!orderBumpsError.message?.includes("does not exist")) {
          throw orderBumpsError;
        }
      }

      // 8. Excluir cupons
      console.log("[deleteProduct] Excluindo cupons...");
      const { error: couponsError } = await supabase
        .from("coupons")
        .delete()
        .eq("product_id", productId);
      
      if (couponsError) {
        console.error("[deleteProduct] Erro ao excluir cupons:", couponsError);
        // Não lançar erro se a tabela não existir
        if (!couponsError.message?.includes("does not exist")) {
          throw couponsError;
        }
      }

      // 9. Finalmente, excluir o produto
      console.log("[deleteProduct] Excluindo produto...");
      const { error } = await supabase
        .from("products")
        .delete()
        .eq("id", productId)
        .eq("user_id", user.id);

      if (error) {
        console.error("[deleteProduct] Erro ao excluir produto:", error);
        throw error;
      }
      
      console.log("[deleteProduct] Produto excluído com sucesso!");
      toast.success("Produto excluído com sucesso");
      return true;
    } catch (error: any) {
      console.error("[deleteProduct] Erro geral:", error);
      toast.error(`Erro ao excluir produto: ${error.message || "Erro desconhecido"}`);
      return false;
    }
  };

  return {
    product,
    loading,
    imageFile,
    setImageFile,
    saveProduct,
    deleteProduct,
    loadProduct,
    productId,
  };
};


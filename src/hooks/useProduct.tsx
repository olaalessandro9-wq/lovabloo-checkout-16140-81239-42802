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
    if (productId) {
      loadProduct();
    }
  }, [productId]);

  const loadProduct = async () => {
    if (!productId || !user) return;

    setLoading(true);
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
      console.error(error);
    } finally {
      setLoading(false);
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
      console.error(error);
      return null;
    }
  };

  const saveProduct = async (productData: Partial<ProductData>) => {
    if (!user) return;

    setLoading(true);
    try {
      let imageUrl = product?.image_url;
      
      if (imageFile) {
        const uploadedUrl = await uploadImage();
        if (uploadedUrl) imageUrl = uploadedUrl;
      }

      const dataToSave = {
        name: productData.name || "",
        description: productData.description,
        support_name: productData.support_name,
        support_email: productData.support_email,
        status: productData.status,
        image_url: imageUrl,
        price: productData.price ? parseFloat(productData.price) : 0,
        user_id: user.id,
      };

      if (productId) {
        const { error } = await supabase
          .from("products")
          .update(dataToSave)
          .eq("id", productId);

        if (error) throw error;
        toast.success("Produto atualizado com sucesso");
      } else {
        const { data, error } = await supabase
          .from("products")
          .insert([dataToSave])
          .select()
          .single();

        if (error) throw error;
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
        }
      }

      await loadProduct();
    } catch (error: any) {
      toast.error("Erro ao salvar produto");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const deleteProduct = async () => {
    if (!productId) return;

    try {
      const { error } = await supabase
        .from("products")
        .delete()
        .eq("id", productId);

      if (error) throw error;
      toast.success("Produto excluído com sucesso");
      return true;
    } catch (error: any) {
      toast.error("Erro ao excluir produto");
      console.error(error);
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
    productId,
  };
};

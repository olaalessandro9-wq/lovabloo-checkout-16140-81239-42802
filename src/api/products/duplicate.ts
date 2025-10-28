import { supabase } from "@/integrations/supabase/client";
import { copyImagePublicUrlToNewFile } from "@/lib/supabaseStorage";
import { v4 as uuidv4 } from "uuid";

// Adaptado para um ambiente serverless/backend que usa a função 'supabase' do cliente
// e assume que a autenticação e o roteamento são tratados externamente (ex: Next.js API Routes, Express)

export async function duplicateProductHandler(productId: string, userId: string) {
  // Usar transação se o ambiente permitir (melhor consistência)
  // Como o Supabase não tem transação nativa multi-tabela, faremos em sequência e trataremos erros.

  try {
    // 1) Buscar produto original e relacionamentos
    const { data: product, error: productError } = await supabase.from("products").select("*").eq("id", productId).single();
    if (productError || !product) throw new Error("Product not found or database error: " + productError?.message);

    // 2) Criar novo produto (clone campos, gerar novo slug/nome)
    const newProduct = { ...product };
    delete newProduct.id;
    newProduct.name = `${product.name} (Cópia)`;
    newProduct.slug = `${product.slug}-copy-${Date.now()}`; // garantir novo slug único
    // Ajustar campos como created_at, updated_at, user_id se necessário.
    // newProduct.user_id = userId; 

    const { data: insertedProduct, error: insertProductError } = await supabase.from("products").insert([newProduct]).select().single();
    if (insertProductError) throw insertProductError;

    const newProductId = insertedProduct.id;

    // 3) Buscar todos os checkouts relacionados ao produto original
    const { data: checkouts, error: checkoutsError } = await supabase.from("checkouts").select("*").eq("product_id", productId);
    if (checkoutsError) throw checkoutsError;

    // Mapeia checkouts: clona cada checkout e seus componentes
    for (const co of checkouts || []) {
      const checkoutClone = { ...co };
      delete checkoutClone.id;
      checkoutClone.product_id = newProductId;
      checkoutClone.name = `${co.name} (Cópia)`;
      
      // Inserir clone do checkout
      const { data: newCheckout, error: insertCheckoutError } = await supabase.from("checkouts").insert([checkoutClone]).select().single();
      if (insertCheckoutError) throw insertCheckoutError;

      // 4) Clonar componentes (assumindo tabela "checkout_components")
      const { data: components, error: componentsError } = await supabase.from("checkout_components").select("*").eq("checkout_id", co.id);
      if (componentsError) throw componentsError;

      for (const comp of components || []) {
        const compClone = JSON.parse(JSON.stringify(comp));
        delete compClone.id;
        compClone.checkout_id = newCheckout.id;

        // Se component tem imageUrl, copiar imagem no storage e atualizar URL
        if (compClone.content?.imageUrl && compClone.content.imageUrl.startsWith("http")) {
          try {
            const copy = await copyImagePublicUrlToNewFile(compClone.content.imageUrl, "product-images");
            if (copy?.publicUrl) {
              compClone.content.imageUrl = copy.publicUrl;
              compClone.content._storage_path = copy.path; // Salvar o path para exclusão futura
            }
          } catch (err) {
            console.error("Erro ao copiar imagem durante a duplicação:", err);
            // Continua, mas registra o erro. A imagem antiga será referenciada.
          }
        }

        // Inserir componente clonado
        await supabase.from("checkout_components").insert([compClone]);
      }

      // 5) Copiar links (assumindo tabela "checkout_links")
      const { data: links, error: linksError } = await supabase.from("checkout_links").select("*").eq("checkout_id", co.id);
      if (linksError) throw linksError;

      for (const link of links || []) {
        const linkClone = { ...link };
        delete linkClone.id;
        linkClone.checkout_id = newCheckout.id;
        // Gerar novo public slug/url
        linkClone.slug = `${linkClone.slug}-copy-${uuidv4().slice(0,6)}`;
        await supabase.from("checkout_links").insert([linkClone]);
      }
    }

    return { success: true, product: insertedProduct };
  } catch (err: any) {
    console.error("Erro na duplicação de produto:", err);
    // Em caso de erro, idealmente reverteria a transação.
    // Como não há transação multi-tabela, o rollback manual seria complexo.
    // Retornamos o erro e o usuário deve lidar com a possível inconsistência.
    throw new Error(err.message || "Erro interno ao duplicar produto.");
  }
}

// Exemplo de como exportar para um router Express/Next.js
// router.post("/:id/duplicate", async (req, res) => {
//   try {
//     const result = await duplicateProductHandler(req.params.id, req.user.id);
//     res.json(result);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

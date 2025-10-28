import { copyPublicObjectToNewPath } from "@/lib/supabase/storageHelpers";

export async function cloneCustomizationWithImages(
  supabase: any,
  customization: any,
  newProductId: number | string
): Promise<any> {
  if (!customization) return customization;

  async function visit(node: any): Promise<any> {
    if (Array.isArray(node)) return Promise.all(node.map(visit));
    if (node && typeof node === "object") {
      const clone: Record<string, any> = {};
      for (const [k, v] of Object.entries(node)) {
        if (k === "imageUrl" && typeof v === "string" && v) {
          clone[k] = await copyPublicObjectToNewPath(supabase, v, newProductId, "image");
        } else if (k === "src" && typeof v === "string" && v) {
          clone[k] = await copyPublicObjectToNewPath(supabase, v, newProductId, "asset");
        } else clone[k] = await visit(v as any);
      }
      return clone;
    }
    return node;
  }

  return visit(customization);
}

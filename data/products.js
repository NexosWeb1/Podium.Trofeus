/* ============================================================
   products.js: fallback local do catálogo.

   Vazio por decisão de projeto: nada de produtos fictícios.
   Cadastre os troféus reais pelo painel (admin.html).

   No modo local eles ficam no localStorage do navegador. Com o
   Supabase configurado, vão para a tabela `produtos`.

   Shape de um produto:
     { id, category, name, description, price, image, imageAlt,
       hasImage?, featured?, colors?, specs? }
   ============================================================ */

export const PRODUCTS = [];

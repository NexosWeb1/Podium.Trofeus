/* ============================================================
   store.js: camada de dados do catálogo (assíncrona).
   Dois back-ends com a MESMA API:
     - Supabase (nuvem) quando supabase-config.js está preenchido.
     - localStorage (navegador) como fallback, para uso/teste local.
   O resto do app (catálogo, modal, form, admin) só fala com este módulo.
   Produto (shape usado no app):
     { id, category, name, description, price, image, featured,
       specs, colors, hasImage }
   ============================================================ */

import { PRODUCTS as SEED } from '../data/products.js';
import {
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  IMAGE_BUCKET,
  isSupabaseConfigured,
} from './supabase-config.js';

const LS_KEY = 'podium_trofeus_catalog_v1';
const useCloud = isSupabaseConfigured();

/* ---------------- Supabase (lazy) ---------------- */
let _client = null;
async function sb() {
  if (_client) return _client;
  const { createClient } = await import(
    'https://esm.sh/@supabase/supabase-js@2.45.4'
  );
  _client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  return _client;
}

/** Converte linha do Supabase -> shape do app. */
function fromRow(r) {
  return {
    id: r.id,
    category: r.categoria,
    name: r.nome,
    description: r.descricao || '',
    // O numeric do Postgres pode chegar como string, dependendo do driver.
    price: r.preco === null || r.preco === undefined ? null : Number(r.preco),
    image: r.imagem_url || '',
    featured: !!r.destaque,
    specs: r.specs || null,
    colors: Array.isArray(r.cores) ? r.cores : [],
    hasImage: !!r.imagem_url,
  };
}

/**
 * Converte shape do app -> colunas do Supabase.
 * Chaves ausentes no patch NAO entram no UPDATE: sem isso, um
 * updateProduct(id, { featured: true }) apagaria nome, categoria e preco.
 */
function toRow(p) {
  const row = {};
  if (p.name !== undefined) row.nome = p.name;
  if (p.category !== undefined) row.categoria = p.category;
  if (p.description !== undefined) row.descricao = p.description || '';
  if (p.price !== undefined) {
    row.preco = p.price === null || p.price === '' ? null : Number(p.price);
  }
  if (p.image !== undefined) row.imagem_url = p.image || null;
  if (p.featured !== undefined) row.destaque = !!p.featured;
  if (p.specs !== undefined) row.specs = p.specs || null;
  if (p.colors !== undefined) row.cores = p.colors && p.colors.length ? p.colors : null;
  return row;
}

/* ---------------- localStorage helpers ---------------- */
function lsRead() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) {
      const arr = JSON.parse(raw);
      if (Array.isArray(arr)) return arr;
    }
  } catch (e) {
    /* ignore */
  }
  return SEED.map((p) => ({ ...p }));
}

function lsWrite(arr) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(arr));
  } catch (e) {
    // No modo local as fotos ficam como dataURL base64 dentro da mesma chave.
    // O teto do localStorage (~5 MB) da para 20 a 30 fotos comprimidas.
    if (e && (e.name === 'QuotaExceededError' || e.code === 22)) {
      throw new Error(
        'O armazenamento local do navegador encheu (as fotos ficam salvas nele). ' +
          'Configure o Supabase em js/supabase-config.js para guardar as imagens na nuvem.'
      );
    }
    throw e;
  }
}

/**
 * Id local. O antigo re-serializava o catalogo inteiro a cada insert e
 * dependia de performance.now(), cuja resolucao e limitada a ~100us em
 * navegadores endurecidos: dois cadastros rapidos podiam colidir.
 */
function uid() {
  if (globalThis.crypto && globalThis.crypto.randomUUID) {
    return `p_${globalThis.crypto.randomUUID()}`;
  }
  return `p_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`;
}

/* ---------------- API pública ---------------- */

export const IS_CLOUD = useCloud;

/** Lista os produtos (ordenados: destaques primeiro). */
export async function listProducts() {
  if (useCloud) {
    const c = await sb();
    const { data, error } = await c
      .from('produtos')
      .select('*')
      .order('destaque', { ascending: false })
      .order('criado_em', { ascending: true });
    if (error) throw error;
    return (data || []).map(fromRow);
  }
  return lsRead();
}

/** Cria um produto. `product.image` pode ser URL/dataURL já pronta. */
export async function addProduct(product) {
  if (useCloud) {
    const c = await sb();
    const { data, error } = await c.from('produtos').insert(toRow(product)).select().single();
    if (error) throw error;
    return fromRow(data);
  }
  const arr = lsRead();
  const prod = {
    ...product,
    id: product.id || uid(),
    price: product.price === undefined || product.price === '' ? null : product.price,
    hasImage: !!product.image,
  };
  arr.push(prod);
  lsWrite(arr);
  return prod;
}

/** Atualiza um produto pelo id. */
export async function updateProduct(id, patch) {
  if (useCloud) {
    const c = await sb();
    // Guarda a foto atual antes de sobrescrever, para poder apagá-la do
    // Storage depois. Sem isso cada troca de imagem deixa um arquivo órfão
    // ocupando espaço para sempre.
    let imagemAntiga = null;
    if (patch.image !== undefined) {
      const { data: atual } = await c
        .from('produtos')
        .select('imagem_url')
        .eq('id', id)
        .single();
      imagemAntiga = atual?.imagem_url || null;
    }

    const { data, error } = await c
      .from('produtos')
      .update(toRow(patch))
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;

    if (imagemAntiga && imagemAntiga !== data.imagem_url) {
      await removeStoredImage(imagemAntiga);
    }
    return fromRow(data);
  }
  const arr = lsRead();
  const i = arr.findIndex((p) => p.id === id);
  if (i < 0) return null;
  arr[i] = { ...arr[i], ...patch, id, hasImage: !!(patch.image ?? arr[i].image) };
  lsWrite(arr);
  return arr[i];
}

/** Remove um produto pelo id, junto com a foto dele no Storage. */
export async function deleteProduct(id) {
  if (useCloud) {
    const c = await sb();
    const { data: atual } = await c
      .from('produtos')
      .select('imagem_url')
      .eq('id', id)
      .single();

    const { error } = await c.from('produtos').delete().eq('id', id);
    if (error) throw error;

    // Só depois que a linha some: se a remoção da imagem falhar, o pior
    // caso é um arquivo órfão, e não um produto apontando para o nada.
    if (atual?.imagem_url) await removeStoredImage(atual.imagem_url);
    return;
  }
  lsWrite(lsRead().filter((p) => p.id !== id));
}

/**
 * Sobe uma imagem e retorna a URL para salvar no produto.
 * Nuvem: envia ao Storage e retorna a URL pública.
 * Local: retorna a própria dataURL (já comprimida pelo chamador).
 */
export async function uploadImage(fileOrDataUrl, filenameHint = 'produto') {
  if (useCloud) {
    const c = await sb();
    const file =
      fileOrDataUrl instanceof Blob ? fileOrDataUrl : await dataUrlToBlob(fileOrDataUrl);
    const ext = (file.type.split('/')[1] || 'jpg').replace('jpeg', 'jpg');
    const path = `${slugify(filenameHint)}-${Date.now().toString(36)}.${ext}`;
    const { error } = await c.storage.from(IMAGE_BUCKET).upload(path, file, {
      cacheControl: '3600',
      upsert: false,
    });
    if (error) throw error;
    const { data } = c.storage.from(IMAGE_BUCKET).getPublicUrl(path);
    return data.publicUrl;
  }
  // Local: a dataURL já é a "URL".
  return typeof fileOrDataUrl === 'string' ? fileOrDataUrl : await blobToDataUrl(fileOrDataUrl);
}

/* ---------------- Autenticação (admin) ---------------- */

// Senha do modo local (front-only). Vale so enquanto o Supabase nao esta
// configurado; na nuvem quem autentica e o Supabase Auth.
const LOCAL_PASS = 'podium2026';

export async function signIn(email, password) {
  if (useCloud) {
    const c = await sb();
    const { data, error } = await c.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data.user;
  }
  // Modo local: valida só a senha (o e-mail é ignorado).
  if (password !== LOCAL_PASS) throw new Error('Senha incorreta');
  sessionStorage.setItem('podium_trofeus_admin', '1');
  return { email: email || 'admin-local' };
}

export async function signOut() {
  if (useCloud) {
    const c = await sb();
    await c.auth.signOut();
    return;
  }
  sessionStorage.removeItem('podium_trofeus_admin');
}

export async function currentUser() {
  if (useCloud) {
    const c = await sb();
    const { data } = await c.auth.getUser();
    return data.user || null;
  }
  return sessionStorage.getItem('podium_trofeus_admin') ? { email: 'admin-local' } : null;
}

/* ---------------- Storage: limpeza ---------------- */

/**
 * Extrai o caminho dentro do bucket a partir da URL pública.
 * Devolve null para dataURL, URL externa ou qualquer coisa que não
 * tenha saído deste Storage: nesse caso não há o que apagar.
 */
function storagePathFromUrl(url) {
  if (typeof url !== 'string') return null;
  const marca = `/storage/v1/object/public/${IMAGE_BUCKET}/`;
  const i = url.indexOf(marca);
  if (i < 0) return null;
  const path = url.slice(i + marca.length).split('?')[0];
  try {
    return decodeURIComponent(path) || null;
  } catch (e) {
    return path || null;
  }
}

/** Apaga a imagem do Storage. Falha aqui não derruba a operação principal. */
async function removeStoredImage(url) {
  const path = storagePathFromUrl(url);
  if (!path) return;
  try {
    const c = await sb();
    const { error } = await c.storage.from(IMAGE_BUCKET).remove([path]);
    if (error) throw error;
  } catch (e) {
    console.warn('Não foi possível remover a imagem antiga do Storage:', path, e);
  }
}

/* ---------------- utilidades ---------------- */
function slugify(s) {
  return (s || 'img')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40);
}

function blobToDataUrl(blob) {
  return new Promise((res, rej) => {
    const fr = new FileReader();
    fr.onload = () => res(fr.result);
    fr.onerror = rej;
    fr.readAsDataURL(blob);
  });
}

async function dataUrlToBlob(dataUrl) {
  const r = await fetch(dataUrl);
  return r.blob();
}

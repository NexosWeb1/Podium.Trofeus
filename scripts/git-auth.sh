#!/usr/bin/env bash
# ============================================================
# git-auth.sh: carrega o .env e autentica o Git nesta sessão.
#
# Uso (na raiz do projeto, no Git Bash):
#   source scripts/git-auth.sh
#
# Precisa ser `source`. Rodando como `./scripts/git-auth.sh` as
# variáveis morrem junto com o subshell e o push continua pedindo senha.
#
# O token fica só na memória desta sessão. Nada é gravado no
# .git/config, então ele não aparece num `git remote -v` nem vai
# para quem clonar o repositório.
# ============================================================

_raiz="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

if [ ! -f "$_raiz/.env" ]; then
  echo "Nao encontrei o .env em $_raiz"
  echo "Rode:  cp .env.example .env   e preencha o token."
  return 1 2>/dev/null || exit 1
fi

# Parse linha a linha, e NAO `source`. Um valor sem aspas e com espaco
# (GIT_AUTHOR_NAME=Diogo Santos) faria o shell tentar executar "Santos".
while IFS= read -r _linha || [ -n "$_linha" ]; do
  case "$_linha" in
    ''|'#'*|*[!A-Za-z0-9_]*=*) : ;;
  esac
  # ignora vazio, comentario e linha sem '='
  [ -z "${_linha//[[:space:]]/}" ] && continue
  case "${_linha#"${_linha%%[![:space:]]*}"}" in '#'*) continue ;; esac
  case "$_linha" in *=*) : ;; *) continue ;; esac

  _nome="${_linha%%=*}"
  _valor="${_linha#*=}"
  # tira espaco das pontas
  _nome="${_nome#"${_nome%%[![:space:]]*}"}"; _nome="${_nome%"${_nome##*[![:space:]]}"}"
  _valor="${_valor#"${_valor%%[![:space:]]*}"}"; _valor="${_valor%"${_valor##*[![:space:]]}"}"
  # tira aspas envolventes, se houver
  case "$_valor" in
    \"*\") _valor="${_valor#\"}"; _valor="${_valor%\"}" ;;
    \'*\') _valor="${_valor#\'}"; _valor="${_valor%\'}" ;;
  esac

  case "$_nome" in
    [A-Za-z_]*) [ -n "$_valor" ] && export "$_nome=$_valor" ;;
  esac
done < "$_raiz/.env"

if [ -z "$GITHUB_TOKEN" ]; then
  echo "GITHUB_TOKEN esta vazio no .env. Preencha e rode de novo."
  return 1 2>/dev/null || exit 1
fi

# O gh CLI le o GH_TOKEN.
export GH_TOKEN="$GITHUB_TOKEN"

if [ -d "$_raiz/.git" ]; then
  [ -n "$GIT_AUTHOR_NAME" ] && git -C "$_raiz" config --local user.name "$GIT_AUTHOR_NAME"
  [ -n "$GIT_AUTHOR_EMAIL" ] && git -C "$_raiz" config --local user.email "$GIT_AUTHOR_EMAIL"
  _nome="$(git -C "$_raiz" config --local user.name 2>/dev/null)"
  _mail="$(git -C "$_raiz" config --local user.email 2>/dev/null)"
  [ -n "$_nome" ] && echo "Autoria deste repo: $_nome <$_mail>"
fi

echo "Token carregado nesta sessao (${GITHUB_TOKEN:0:4}********${GITHUB_TOKEN: -4})."
echo "Confira com:  gh auth status"

unset _raiz _nome _mail _linha _valor

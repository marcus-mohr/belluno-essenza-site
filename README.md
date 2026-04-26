# Belluno Essenza

Site estático premium da Belluno Essenza, construído com HTML, CSS e JavaScript, com catálogo dinâmico carregado a partir de `data/produtos.json`.

## Estado atual da campanha

- Catálogo ativo sincronizado com `data/produtos.xlsx` contendo 1 produto ativo: coleção especial de Dia das Mães 2026.
- Seção editorial da campanha na home (`index.html`, âncora `#colecao-dia-das-maes`) usando assets em `assets/produtos`.
- Instagram oficial atualizado para `https://instagram.com/belluno.essenza`.

## Estrutura do projeto

```text
/
  index.html
  catalogo.html
  produto.html
  sobre.html
  contato.html
  style.css
  main.js
  robots.txt
  sitemap.xml
  README.md
  requirements.txt
  /assets
    /branding
    /produtos
    /icons
  /data
    produtos.xlsx
    produtos.json
  /scripts
    sync-products.py
    bootstrap-sample-data.py
```

## Como visualizar o site localmente

Como o catálogo e a página de produto carregam `data/produtos.json` via `fetch`, o ideal é abrir o projeto com um servidor local simples.

O projeto também gera automaticamente um fallback em `data/produtos-data.js`, então home, catálogo e página de produto continuam funcionando mesmo quando os arquivos HTML são abertos diretamente do disco.

### Opção recomendada

```bash
python -m http.server 8000
```

Depois abra no navegador:

```text
http://localhost:8000
```

## Instalação mínima

Se ainda não instalou a dependência da planilha:

```bash
python -m pip install -r requirements.txt
```

## Fluxo para adicionar novos produtos

Este é o fluxo principal de manutenção do catálogo.

### 1. Adicione as imagens

Salve os arquivos do produto em:

```text
assets/produtos/
```

Regra recomendada:

- nomeie a imagem principal com o mesmo valor do `slug`

Exemplos:

```text
assets/produtos/vela-ambar-premium.png
assets/produtos/vela-ambar-premium-1.jpg
assets/produtos/vela-ambar-premium-2.jpg
```

### 2. Edite a planilha

Abra:

```text
data/produtos.xlsx
```

Preencha uma nova linha usando estas colunas:

- `ativo`
- `destaque`
- `ordem`
- `slug`
- `nome`
- `subtitulo`
- `categoria`
- `familia_olfativa`
- `preco`
- `preco_promocional`
- `volume`
- `tempo_queima`
- `descricao_curta`
- `descricao_completa`
- `notas_topo`
- `notas_coracao`
- `notas_base`
- `modo_de_uso`
- `composicao`
- `imagem_principal`
- `galeria_1`
- `galeria_2`
- `galeria_3`
- `sku`
- `estoque`
- `selo`
- `meta_title`
- `meta_description`

### 3. Rode a sincronização

Na raiz do projeto:

```bash
python scripts/sync-products.py
```

Esse comando:

- lê `data/produtos.xlsx`
- ignora produtos com `ativo = não`
- ordena pelo campo `ordem`
- respeita exatamente o valor de `slug` quando ele estiver preenchido
- gera um slug válido a partir de `nome` quando o campo `slug` estiver vazio
- usa `imagem_principal` quando ela estiver preenchida e o arquivo existir
- se `imagem_principal` estiver vazio, tenta encontrar automaticamente a imagem principal usando `slug + extensão`
- aceita como imagem principal extensões `.png`, `.jpg`, `.jpeg`, `.webp` e `.svg`
- valida se as imagens citadas existem em `assets/produtos`
- avisa no terminal quando houver imagem faltando
- gera `data/produtos.json`
- gera também `data/produtos-data.js` para fallback local do catálogo e da página de produto

### 4. Atualize o navegador

Recarregue o site no navegador e o novo produto aparecerá:

- na home, se estiver com `destaque = sim`
- no catálogo
- na página dinâmica de produto por `slug`

## Regras importantes da planilha

- Use `sim` ou `não` em `ativo` e `destaque`.
- Se `slug` ficar vazio, ele será gerado automaticamente a partir de `nome`.
- Para a imagem principal, a convenção ideal é usar o mesmo nome do `slug`.
- Exemplo: `slug = vela-em-vidro-ambar` -> imagem `assets/produtos/vela-em-vidro-ambar.png`.
- Em `imagem_principal`, `galeria_1`, `galeria_2` e `galeria_3`, informe apenas o nome do arquivo dentro de `assets/produtos`.
- Exemplo: use `minha-vela.jpg`, não `assets/produtos/minha-vela.jpg`.
- Se `imagem_principal` ficar em branco e existir um arquivo com o mesmo nome do `slug`, o script tentará usar esse arquivo automaticamente.

## Contatos e personalizações rápidas

Alguns dados institucionais desta primeira versão estão em:

- `main.js`
- `index.html`
- `sobre.html`
- `contato.html`

Se quiser trocar:

- e-mail
- Instagram
- mensagem padrão do WhatsApp
- domínio final

esses são os primeiros arquivos a editar.

## Script opcional de bootstrap

Se quiser recriar a planilha de exemplo e os placeholders visuais iniciais do projeto:

```bash
python scripts/bootstrap-sample-data.py
python scripts/sync-products.py
```

O script `bootstrap-sample-data.py` é opcional. O fluxo normal do dia a dia continua sendo apenas editar `data/produtos.xlsx` e rodar `python scripts/sync-products.py`.

## Observações

- O site usa logo, favicon e referências visuais reais da Belluno Essenza copiadas para `assets/branding`.
- As imagens SVG em `assets/produtos` funcionam como placeholders premium até a chegada das fotos reais.
- A página `produto.html` lê o `slug` via query string, por exemplo:

```text
produto.html?slug=capim-limao
```

- O catálogo e a home consomem `data/produtos.json`, nunca a planilha diretamente no frontend.

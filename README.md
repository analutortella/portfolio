# Portfólio · Analu Tortella

Site estático (HTML, CSS e JS puros, sem build) do portfólio de Analu Tortella, editora de vídeo.

## Estrutura

```
analu-portfolio/
├── index.html              # Home (página única)
├── README.md
├── .gitignore
└── assets/
    ├── css/
    │   └── styles.css      # Tokens de cor/tipografia no topo (:root)
    ├── js/
    │   └── main.js         # WhatsApp, menu mobile, carrossel, modal do showreel
    ├── img/
    │   ├── favicon.svg
    │   ├── reels/          # Thumbs dos reels da Meta
    │   ├── autorais/       # Vendinha de Quinta e vídeos de @analu_de_quinta
    │   └── clients/        # Logos (SVG de preferência)
    ├── video/              # Loop local opcional (o hero usa o showreel do YouTube)
    └── docs/
        └── cv-analu-tortella.pdf
```

## Rodar localmente

Rode um servidor local para testar os embeds do YouTube (abrir o arquivo diretamente pode impedir o envio do referenciador exigido pelo player):

```bash
python -m http.server 8000
# http://localhost:8000
```

## Publicar no GitHub Pages

```bash
git init
git add .
git commit -m "feat: versão inicial do portfólio"
git branch -M main
git remote add origin git@github.com:<usuario>/analu-portfolio.git
git push -u origin main
```

No GitHub: **Settings → Pages → Source: Deploy from a branch → main / (root)**.

## Pendências de conteúdo

- [ ] Identificar os temas dos reels 8 a 10 da Meta
- [ ] Completar a descrição de “Rizoma Urbano” (tema e desafio de montagem)
- [ ] Adicionar o link da playlist das web séries da Seja Digital
- [ ] PDF do CV em `assets/docs/`
- [ ] Corrigir o link do LinkedIn no rodapé (ainda está como `href="#"`)
- [ ] Depoimentos (com autorização de quem escreveu)
- [ ] Confirmar direito de exibir as peças da Meta e da Seja Digital

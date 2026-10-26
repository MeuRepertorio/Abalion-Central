# FORMA Studio Pro 2.0

Editor visual de documentos e relatórios, com escrita orientada, prévia A4, mapa de seções e exportação Word/PDF.

## Usar agora

Abra `web/index.html` num navegador moderno ou publique a pasta `web/` no GitHub Pages. O aplicativo é um PWA: em site HTTPS pode ser instalado na tela inicial. **Não precisa de API ou de internet para editar.**

## Recursos

- Fontes, tamanhos, negrito, itálico, sublinhado, tachado, cores de texto e marca-texto.
- Listas, parágrafos, citações, links, tabelas, imagens locais, alinhamento e recuo.
- Margens independentes, A4/carta, retrato/paisagem, espaçamento e tipografia do documento.
- Modelos empresariais, técnicos, acadêmicos e executivos; aplicar outro modelo preserva texto.
- Mapa visual de seções, orientador de escrita, exemplos e repertório de relatórios.
- Exportação DOCX, JSON e Markdown; PDF via impressão; histórico estrutural e salvamento local.
- Aplicativo Windows em Electron, compilável no Windows. Workflow incluído para geração de instalador `.exe` em GitHub Actions.

## Segurança dos dados

Os conteúdos ficam **no dispositivo** em `localStorage`, salvo se o navegador bloquear armazenamento. Faça cópias frequentes via **Exportar todo o trabalho**. Site e Windows têm áreas de dados distintas, não sincronizadas automaticamente. **Não use um documento profissional como única cópia importante**.

## Versão para Windows

No computador Windows com Node.js 22+:

```bash
npm install
npm run desktop
npm run dist:win
```

Os instaladores produzidos ficam em `dist/`. Para compilar pelo GitHub Actions, use o workflow de Windows incluído na pasta `.github/workflows/`. **O instalador não está pré-compilado neste ZIP; esta execução foi feita fora do Windows e sem acesso ao registro do npm.**

## Limites conhecidos

- A exportação para DOCX foi testada, mas **não garante fidelidade completa** do formato Word em documentos complexos. Cabeçalho/rodapé são textos de abertura/fechamento; não se repetem em todas as páginas no Word.
- Numeração real de página e sumário com páginas calculadas ainda não foram implementados. O sumário atual lista as seções, sem páginas automáticas.
- Imagens PNG e JPEG são exportadas no DOCX. WebP aparece em prévia/PDF e requer conversão para PNG/JPEG para exportação Word.
- As opções avançadas de revisão usam heurísticas locais: não são análise semântica completa nem substituem checagem humana.
- A importação de DOCX cobre texto, títulos e tabelas simples, não comentários, alterações controladas ou layouts complexos.
- Layouts muito extensos podem exigir ajuste fino em Word antes da entrega.
- Aplicativo Windows sem assinatura de código pode receber alerta SmartScreen.

## Estrutura

`web/` — aplicativo offline + PWA · `desktop/` — Electron · `.github/workflows/` — build Windows · `qa/` — testes.
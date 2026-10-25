# Abalion — ativar controle real dos seis projetos

## O que ele faz

O painel **Publicar nos projetos** cria páginas reais nos repositórios GitHub selecionados. As páginas são mostradas nos sites pelo arquivo `assets/abalion-bridge.js`, instalado em cada projeto.

**Fluxo de execução:** Abalion (formulário visual) → issue pública preparada → confirmação na sua conta GitHub → GitHub Actions (automação) → commit(s) nos repositórios → GitHub Pages → nova área no site.

**Importante:** o projeto **não modifica outro site apenas por alterar um cartão local**. Tarefas, notas e progresso são locais e não sincronizados. As ações reais estão na área *Publicar nos projetos* e exigem a confirmação no GitHub. O código da automação é aberto e auditável.

## Ativação uma vez (somente pelo proprietário)

1. Crie um repositório público chamado `Abalion-Central` na conta `MeuRepertorio` e envie este pacote, **mantendo a pasta oculta `.github/workflows`**.
2. No repositório **Abalion-Central**, abra `Settings → Pages → Deploy from a branch → main → /(root)`.
3. No GitHub, entre em `Settings → Developer settings → Personal access tokens → Fine-grained tokens` e crie um token limitado à conta `MeuRepertorio`. Selecione **somente os seis repositórios públicos controlados** (Nexus-Public, Jovem-Empreendedor, Estudo-de-caso---Americanas, ATLAS, SGL-Studio, Entrevista-de-Emprego). Em **Repository permissions**, escolha **Contents: Read and write**. Deixe outras permissões no mínimo disponível. Use prazo de expiração curto e revise periodicamente.
4. No repositório **Abalion-Central**: `Settings → Secrets and variables → Actions → New repository secret`. Nome exato: `ABALION_TARGET_TOKEN`. Cole o token como valor e salve. **Nunca cole o token no HTML, em issues, em chats ou no README.**
5. Confirme que `Settings → Actions → General` permite executar workflows no repositório central.
6. Abra o site Abalion: `https://meurepertorio.github.io/Abalion-Central/`. Vá em **Publicar nos projetos** e selecione primeiro **ATLAS**. Digite título e conteúdo público, clique **ENVIAR AO GITHUB**. Na nova página, confira o comando e pressione **Submit new issue** (confirmação autenticada).
7. Abra `Abalion-Central → Actions`. Quando a ação terminar, confira o comentário na issue e o novo arquivo em `ATLAS/abalion/pages/`. Depois, no site público do ATLAS, a aba **Novidades** aparecerá com essa página. O GitHub Pages pode demorar a atualizar.

## Privacidade e limites

- As **issues são públicas**. Portanto, os conteúdos enviados por essa integração devem ser publicáveis. Não utilize para dados internos, financeiro confidencial, contratos, nomes privados, documentos pessoais ou senhas.
- A ação só aceita comandos criados por `MeuRepertorio` e enviados à central `Abalion-Central`. Os destinos são limitados aos seis repositórios públicos descritos no código.
- **Criar página** é uma ação real. O conteúdo é transformado em HTML seguro, e a lista de páginas de cada site é atualizada.
- Não há upload binário (PDF/imagens) pelo formulário nesta versão. O mesmo conteúdo textual pode ser publicado em **vários projetos** de uma só vez, criando um arquivo HTML em cada um.
- Alterações em tarefas/notas/progresso no painel Abalion **continuam locais** e exigem exportação/importação para mudar de aparelho. Esse estado não é controlado pelo GitHub.
- Se o token vencer, a automação para de publicar. Crie um novo token e substitua o secret no GitHub.
- As ações deixam registros no histórico do GitHub. Você pode reverter commits caso publique algo por engano.

## Problemas comuns

**GitHub 404 ao confirmar:** o repositório central ou a aba Issues ainda não foi criado/ativado.

**Workflow não iniciou:** confira se a pasta `.github/workflows/abalion-command.yml` está na branch `main`; habilite GitHub Actions e a aba Issues no repositório.

**Erro 'Falta configurar secret':** configure `ABALION_TARGET_TOKEN`.

**403 ao criar página:** o token não tem permissão de escrita naquele repositório ou expirou.

**Erro 'Projeto não preparado com bridge':** instale `assets/abalion-bridge.js`, `abalion/sections.json` e a tag `<script defer src="assets/abalion-bridge.js"></script>` no site de destino.

**Nova página ainda não apareceu:** aguarde a publicação no Pages; confira os commits e atualização de `abalion/sections.json` no repositório de destino.

## Projeto do controle

A automação está implementada em `automation/execute.py`. A execução é disparada pelo GitHub Actions via `.github/workflows/abalion-command.yml` e usa permissões mínimas para escrever somente nos repositórios públicos selecionados. Não executa código remoto nem aceita destinos arbitrários.
# Abalion — Universo Estratégico

Central visual para seis projetos, com navegação tipo constelação, quadro de tarefas, agenda, histórico, consulta ao GitHub e um módulo de **publicação real de novas páginas nos sites conectados**.

## Seis territórios

| Projeto | Site |
|---|---|
| Nexus | https://meurepertorio.github.io/Nexus-Public/ |
| Jovem Empreendedor | https://meurepertorio.github.io/Jovem-Empreendedor/ |
| Americanas | https://meurepertorio.github.io/Estudo-de-caso---Americanas/ |
| ATLAS | https://meurepertorio.github.io/ATLAS/ |
| SGL | https://meurepertorio.github.io/SGL-Studio/ (após publicação) |
| Entrevista de Emprego | https://meurepertorio.github.io/Entrevista-de-Emprego/ (após publicação) |

## Controle real

Diferente de um painel que salva somente textos locais, a área **Publicar nos projetos** faz alterações materiais. O usuário define uma nova página visualmente, seleciona os repositórios e confirma o comando autenticado no GitHub. A automação cria um arquivo HTML em cada repositório e atualiza seu catálogo de páginas para o site exibí-las.

Leia **[Configurar conexão](docs/CONFIGURAR_CONEXAO.md)** para ativar a automação. Ela necessita um token com permissão de escrita **guardado como secret no próprio GitHub**. O token não fica visível no site público.

## Limites honestos

- Sem o secret e o GitHub Actions habilitados, o botão **prepara a solicitação**, mas nada é publicado automaticamente.
- A interface utiliza uma confirmação do GitHub (*Submit new issue*) como camada de autorização; após a confirmação, a execução é automática.
- Quadro, tarefas, notas e status ficam no navegador do usuário até o backup JSON; não são sincronizados entre aparelhos.
- Comandos via issues são públicos; **não publique informações confidenciais**.
- Esta versão publica novas páginas HTML textuais; não aceita envio de arquivos binários por formulário.

## Publicação

Repositório público `MeuRepertorio/Abalion-Central`, `Settings → Pages → Deploy from a branch → main → /(root)`. Então visite `https://meurepertorio.github.io/Abalion-Central/`.

## Estrutura

```text
index.html                         Interface visual
assets/app.js                      Navegação, portfólio, tarefas e comandos
assets/style.css                   Identidade visual responsiva
assets/favicon.svg                 Símbolo
.github/workflows/abalion-command.yml  Automação autenticada
automation/execute.py             Executor de operações GitHub
 docs/CONFIGURAR_CONEXAO.md        Configuração de segurança
```

Nota: Abalion é um projeto pessoal de software em desenvolvimento, não uma ferramenta de administração de condomínios ou serviço público.
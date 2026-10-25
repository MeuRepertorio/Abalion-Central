"""Abalion real cross-repository publisher (GitHub Actions).

Triggered by a GitHub issue created by the authorized owner. A public issue
contains a user-approved, public HTML page's content. Never use for secrets.
"""
import base64
import datetime as dt
import html
import json
import os
import re
import sys
import unicodedata
import urllib.error
import urllib.request

CENTRAL_REPO = os.environ.get('GITHUB_REPOSITORY', 'MeuRepertorio/Abalion-Central')
USER = os.environ.get('ABALION_OWNER', 'MeuRepertorio').lower()
TOKEN = os.environ.get('ABALION_TARGET_TOKEN', '')
ISSUE_TOKEN = os.environ.get('GH_ISSUE_TOKEN', '')
EVENT_PATH = os.environ.get('GITHUB_EVENT_PATH', '')
ALLOWED = {
    'MeuRepertorio/ATLAS',
    'MeuRepertorio/Jovem-Empreendedor',
    'MeuRepertorio/Nexus-Public',
    'MeuRepertorio/Estudo-de-caso---Americanas',
    'MeuRepertorio/SGL-Studio',
    'MeuRepertorio/Entrevista-de-Emprego',
}
BEGIN = '<!-- ABALION_COMMAND_START -->'
END = '<!-- ABALION_COMMAND_END -->'


def request(repo, path, method='GET', payload=None, token=TOKEN):
    url = 'https://api.github.com/repos/' + repo + '/' + path
    body = None if payload is None else json.dumps(payload).encode('utf-8')
    headers = {'Accept': 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28', 'User-Agent': 'abalion-control'}
    if token:
        headers['Authorization'] = 'Bearer ' + token
    if body is not None:
        headers['Content-Type'] = 'application/json'
    req = urllib.request.Request(url, data=body, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req, timeout=20) as r:
            return r.status, json.loads(r.read().decode('utf-8') or '{}')
    except urllib.error.HTTPError as e:
        if e.code == 404:
            return 404, None
        raise RuntimeError(f'GitHub API error {e.code} em {path}: {e.read()[:400]!r}') from e


def comment(number, message):
    if ISSUE_TOKEN:
        request(CENTRAL_REPO, f'issues/{number}/comments', 'POST', {'body': message}, token=ISSUE_TOKEN)


def slugify(text):
    text = unicodedata.normalize('NFKD', text).encode('ascii', 'ignore').decode('ascii').lower()
    return re.sub(r'-+', '-', re.sub(r'[^a-z0-9]+', '-', text)).strip('-')[:45]


def put_text(repo, path, content, title):
    status, existing = request(repo, 'contents/' + path)
    payload = {'message': title, 'content': base64.b64encode(content.encode('utf-8')).decode('ascii'), 'branch': 'main'}
    if status == 200:
        payload['sha'] = existing['sha']
    status, result = request(repo, 'contents/' + path, 'PUT', payload)
    return result


def parse_command(body):
    if not isinstance(body, str) or BEGIN not in body or END not in body:
        raise ValueError('Não foi encontrado um comando visual do Abalion.')
    raw = body.split(BEGIN, 1)[1].split(END, 1)[0].strip()
    if len(raw) > 7500:
        raise ValueError('Conteúdo muito longo. Use no máximo 7.500 caracteres.')
    return json.loads(raw)


def render_page(title, summary, content, site_name):
    paragraphs = ''.join('<p>' + html.escape(x.strip()) + '</p>' for x in content.split('\n\n') if x.strip())
    return f'''<!DOCTYPE html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>{html.escape(title)} | {html.escape(site_name)}</title><style>
:root{{color-scheme:dark}}*{{box-sizing:border-box}}body{{margin:0;background:#0b1220;color:#e7efff;font:17px/1.75 system-ui,-apple-system,sans-serif}}main{{max-width:880px;margin:0 auto;padding:clamp(28px,6vw,88px) 24px}}a{{color:#92dbc7}}.tag{{letter-spacing:.14em;font-size:11px;color:#92dbc7}}h1{{font-size:clamp(36px,6vw,68px);line-height:1.04;letter-spacing:-.045em}}.summary{{font-size:20px;color:#b8c8d8}}.body{{border-top:1px solid #334558;padding-top:24px;margin-top:32px;white-space:normal}}.body p{{margin:0 0 22px}}nav{{padding:20px 24px;border-bottom:1px solid #334558}}nav a{{text-decoration:none}}footer{{margin-top:50px;font-size:12px;color:#94a5b5}}</style></head><body><nav><a href="../../index.html#abalion-materiais">← VOLTAR AO PROJETO</a></nav><main><div class="tag">PÁGINA ADICIONADA PELO ABALION</div><h1>{html.escape(title)}</h1><p class="summary">{html.escape(summary)}</p><div class="body">{paragraphs}</div><footer>Conteúdo enviado a este projeto via Abalion e registrado no histórico do GitHub.</footer></main></body></html>'''


def execute(command):
    if command.get('version') != 1 or command.get('action') != 'create_section':
        raise ValueError('Ação não suportada.')
    repos = command.get('repos') or [command.get('repo')]
    if not isinstance(repos, list) or not repos or len(repos) > 6 or any(repo not in ALLOWED for repo in repos):
        raise ValueError('Seleção de repositórios inválida ou não autorizada.')
    if len(set(repos)) != len(repos):
        raise ValueError('Repositórios repetidos.')
    title = str(command.get('title', '')).strip()
    summary = str(command.get('summary', '')).strip()
    content = str(command.get('content', '')).strip()
    if not (3 <= len(title) <= 90 and 0 <= len(summary) <= 180 and 15 <= len(content) <= 3600):
        raise ValueError('Preencha título (3–90), resumo (0–180) e conteúdo (15–3600).')
    slug = slugify(title)
    if not slug:
        raise ValueError('Título inválido.')
    path = f'abalion/pages/{slug}.html'
    sections_path = 'abalion/sections.json'
    outputs = []
    for repo in repos:
        status, current = request(repo, 'contents/' + sections_path)
        if status == 404:
            raise ValueError('Projeto ainda não preparado com o Abalion Bridge: ' + repo)
        try:
            catalog = json.loads(base64.b64decode(current['content']).decode('utf-8'))
        except (KeyError, ValueError) as e:
            raise ValueError('Catálogo de abas inválido em ' + repo) from e
        if not isinstance(catalog, dict) or not isinstance(catalog.get('sections'), list):
            raise ValueError('Formato do catálogo não reconhecido em ' + repo)
        if any(section.get('path') == path for section in catalog['sections']):
            raise ValueError('Já existe uma aba com esse título em ' + repo)
        page = render_page(title, summary, content, repo.rsplit('/', 1)[-1])
        put_text(repo, path, page, 'Abalion: cria página ' + title[:40])
        catalog['sections'].append({
            'title': title, 'summary': summary, 'path': path,
            'created_at': dt.datetime.now(dt.timezone.utc).date().isoformat(),
        })
        put_text(repo, sections_path, json.dumps(catalog, indent=2, ensure_ascii=False) + '\n',
                 'Abalion: adiciona aba ' + title[:40])
        outputs.append(f'https://github.com/{repo}/blob/main/{path}')
    return '\n'.join(outputs)



def main():
    with open(EVENT_PATH, encoding='utf-8') as fh:
        event = json.load(fh)
    issue = event.get('issue', {})
    number = issue.get('number')
    author = issue.get('user', {}).get('login', '')
    if author.lower() != USER:
        print('Ignorado: autor não autorizado.')
        return 0
    try:
        if not TOKEN:
            raise ValueError('Falta configurar o secret ABALION_TARGET_TOKEN no repositório da central.')
        c = parse_command(issue.get('body'))
        new_page = execute(c)
        comment(number, f'**Abalion concluiu a operação.** Arquivo criado: {new_page}\n\nO site aparecerá atualizado depois da implantação do GitHub Pages.')
        print('Publicado:', new_page)
        return 0
    except Exception as e:
        message = str(e)
        print('Falha:', message)
        comment(number, '**Abalion não aplicou a alteração:** ' + message)
        return 1


if __name__ == '__main__':
    sys.exit(main())
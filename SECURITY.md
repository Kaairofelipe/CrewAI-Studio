# Segurança

## Boas práticas obrigatórias

1. **Nunca** commitar `.env`, `.env.local` ou chaves de API.
2. **Rotação** de `AUTH_SECRET` (Kalaïnne) e chaves de LLM em caso de vazamento.
3. **Dependências**: manter `requirements.txt` e `kalainne-suite/web/package.json` atualizados; o [Dependabot](.github/dependabot.yml) abre PRs semanais.
4. **Auditoria local** (após alterar dependências):
   - Python: `pip install pip-audit` e `pip-audit -r requirements.txt` (o ficheiro fixa `urllib3` recente com `kubernetes>=35`; `pyOpenSSL` permanece abaixo da série 26 por causa de `snowflake-connector-python`)
   - Web: `cd kalainne-suite/web && npm audit`
   - Desktop: `cd kalainne-suite/desktop && npm audit`

## Relatório de vulnerabilidades (GitHub)

Use **Dependabot** e **Security advisories** do repositório:  
https://github.com/Kaairofelipe/CrewAI-Studio/security/dependabot

## Divulgação responsável

Para reportar vulnerabilidade grave, abra um issue privado ou contacte o mantenedor do fork.

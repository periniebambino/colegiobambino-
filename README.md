# COLÉGIO BAMBINO — Site 2027 — versão de publicação

**Endereço planejado:** https://www.colegiobambino.com.br/  
**Páginas:** Home, A escola, Berçário, Maternal, Pré-escola, Contato, Privacidade.

## O que funciona ao publicar
- Páginas HTML, CSS responsivo, menu mobile, perguntas frequentes, arquivos locais, fotos aprovadas, SEO técnico básico e botões WhatsApp.
- Formulário no modo WhatsApp: abre uma mensagem com os dados preenchidos para a família conferir e enviar.

## O que depende de configuração externa
- E-mail automático do formulário: integração opcional em `integracoes/formulario-worker/`; não funciona sem credenciais e validação Turnstile.
- Domínio, DNS, certificado HTTPS, Search Console, Google Analytics e Perfil da Empresa no Google: exigem acesso às contas.
- Confirmação da escola sobre a aplicação do Sistema COC por turma e permissões de fotografia.

## Publicação no GitHub Pages
1. Criar repositório (por exemplo `colegio-bambino`) e subir **o conteúdo desta pasta na raiz**, não a pasta ZIP.
2. Em Settings > Pages, selecionar `Deploy from a branch`, branch `main`, pasta `/(root)`.
3. Em Settings > Pages > Custom domain, usar `www.colegiobambino.com.br`. O arquivo `CNAME` já está presente.
4. No Registro.br, configurar `www` como CNAME apontando para `<USUARIO-DO-GITHUB>.github.io` (o usuário do GitHub efetivo, não o nome do repositório).
5. Para o domínio sem www (`colegiobambino.com.br`), seguir registros `A` e `AAAA` da documentação oficial e revisar DNS preexistentes antes de alterar.
6. Após a propagação DNS, habilitar `Enforce HTTPS`. Conferir certificado e redirecionamento.
7. Validar a página em desktop e mobile e registrar no Search Console.

Documentação oficial: https://docs.github.com/pt/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site

## Regras visuais
- Todas as fotografias distintas homologadas foram distribuídas uma vez no conteúdo editorial.
- Biblioteca de ícones exclusiva, sem gerar novos desenhos.
- Logo e mascote inalterados e marca 40 anos em destaque.
- E-mail da secretaria não deve aparecer na interface nem em arquivos públicos.

## Qualidade e testes
Execute `python testes/auditar.py` na raiz. Ele verifica links internos, arquivos de imagens, H1 e uso das fotos. Teste manualmente Chrome, Safari, Firefox, iOS e Android antes de aprovar.

**Importante:** nenhum pacote está automaticamente publicado no GitHub. As etapas acima exigem acesso ao GitHub e Registro.br.

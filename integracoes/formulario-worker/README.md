# Integração de e-mail (OPCIONAL, publicação separada)

O GitHub Pages não envia e-mails. Este Worker é uma opção de backend, que **não está implantada** e exige conta Cloudflare + Resend + domínio de envio verificado.

1. Criar Cloudflare Worker com `worker.js`, definir secrets `RESEND_API_KEY`, `MAIL_TO`, `MAIL_FROM`, `TURNSTILE_SECRET` no painel (não no GitHub). `MAIL_TO` é o e-mail da secretaria fornecido pela escola.
2. Criar widget Cloudflare Turnstile para `www.colegiobambino.com.br`, configurar a chave pública (site key) no HTML do formulário antes do botão:
   `<div class="cf-turnstile" data-sitekey="SUA_SITE_KEY"></div>`
   E carregar `<script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer></script>`
3. Inserir no `<head>` da página `contato/index.html` antes de `js/site.js` a configuração `window.BAMBINO_FORM_ENDPOINT` com a URL publicada do Worker (URL pública não é segredo).
4. Validar CORS, SPF/DKIM no provedor de e-mail, Turnstile e e-mail recebido REALMENTE antes de disponibilizar o modo e-mail.
5. Configurar limitação de requisições (rate limiting) para o Worker no painel Cloudflare e monitorar abusos.

Até a conclusão, o formulário abre o WhatsApp, e **não** mente que enviou e-mail. O número de telefone não está oculto, apenas o e-mail interno.

Fontes oficiais: https://developers.cloudflare.com/workers/tutorials/send-emails-with-resend/ e https://developers.cloudflare.com/turnstile/get-started/

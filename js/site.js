(() => {
  'use strict';
  const toggle = document.querySelector('.menu-toggle');
  const menu = document.getElementById('menu-site');
  const closeMenu = (returnFocus = false) => {
    if (!toggle || !menu) return;
    menu.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Abrir menu');
    if (returnFocus) toggle.focus();
  };
  if (toggle && menu) {
    toggle.addEventListener('click', () => {
      const isOpen = !menu.classList.contains('open');
      menu.classList.toggle('open', isOpen);
      toggle.setAttribute('aria-expanded', String(isOpen));
      toggle.setAttribute('aria-label', isOpen ? 'Fechar menu' : 'Abrir menu');
    });
    menu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => closeMenu()));
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && menu.classList.contains('open')) closeMenu(true);
    });
    document.addEventListener('click', event => {
      if (menu.classList.contains('open') && !menu.contains(event.target) && !toggle.contains(event.target)) closeMenu();
    });
    const mq = window.matchMedia('(min-width: 941px)');
    if (mq.addEventListener) mq.addEventListener('change', e => { if (e.matches) closeMenu(); });
  }
  document.querySelectorAll('[data-conversion="whatsapp"]').forEach(link => {
    link.addEventListener('click', () => {
      if (Array.isArray(window.dataLayer)) window.dataLayer.push({event:'bambino_whatsapp_click',page:location.pathname});
    });
  });
  const form = document.getElementById('contact-form');
  if (!form) return;
  const feedback = document.getElementById('form-feedback');
  const button = form.querySelector('button[type="submit"]');
  const endpoint = typeof window.BAMBINO_FORM_ENDPOINT === 'string' ? window.BAMBINO_FORM_ENDPOINT.trim() : '';
  const deliveryHint = form.querySelector('.form-delivery-hint');
  const spamField = form.querySelector('input[name=site]');
  if (!endpoint) {
    // Modo demonstracao: encaminha pelo WhatsApp. Nao afirma enviar e-mail.
    button.textContent = 'Continuar pelo WhatsApp';
    feedback.textContent = '';
    if (deliveryHint) deliveryHint.textContent = 'Ao continuar, o WhatsApp será aberto com seus dados. Revise e envie a mensagem no aplicativo.';
    form.addEventListener('submit', event => {
      event.preventDefault();
      if (!form.reportValidity()) return;
      if (spamField && spamField.value) return;
      const fields = Object.fromEntries(new FormData(form));
      const message = ['Olá! Gostaria de agendar uma visita ao Colégio Bambino para as matrículas de 2027.',
        'Responsável: ' + (fields.nome || ''),
        'WhatsApp para retorno: ' + (fields.whatsapp || fields.telefone || ''),
        'Etapa: ' + (fields.etapa || ''),
        fields.mensagem ? 'Mensagem: ' + fields.mensagem : ''
      ].filter(Boolean).join('\n');
      const url = 'https://wa.me/5511958424060?text=' + encodeURIComponent(message);
      window.location.href = url;
    });
    return;
  }
  if (deliveryHint) deliveryHint.textContent = 'Ao enviar, sua solicitação será encaminhada à secretaria. Você também pode agendar pelo WhatsApp.';
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    if (spamField && spamField.value) return;
    button.disabled = true;
    feedback.textContent = 'Enviando sua solicitação...';
    try {
      const payload = Object.fromEntries(new FormData(form));
      payload.origem = location.href;
      const response = await fetch(endpoint, {
        method: 'POST', headers: {'Content-Type':'application/json'},
        body: JSON.stringify(payload)
      });
      if (!response.ok) throw new Error('Falha no serviço de formulário');
      const result = await response.json().catch(() => ({}));
      if (result.ok !== true) throw new Error('Confirmação não recebida');
      form.reset();
      feedback.textContent = 'Solicitação recebida! Nossa secretaria entrará em contato para combinar sua visita.';
      if (Array.isArray(window.dataLayer)) window.dataLayer.push({event:'bambino_form_success',page:location.pathname});
    } catch (_) {
      feedback.textContent = 'Não foi possível enviar agora. Por favor, fale com nossa equipe pelo WhatsApp.';
    } finally { button.disabled = false; }
  });
})();

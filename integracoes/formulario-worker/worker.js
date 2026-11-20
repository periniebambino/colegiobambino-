/** Formulário Bambino: deploy em Cloudflare Workers; segredos no painel, nunca no GitHub. */
const allowed = 'https://www.colegiobambino.com.br';
function json(data, status=200, origin='') {
  const headers = {'content-type':'application/json; charset=utf-8','cache-control':'no-store','x-content-type-options':'nosniff'};
  if (origin === allowed) { headers['access-control-allow-origin']=allowed; headers['vary']='Origin'; }
  return new Response(JSON.stringify(data),{status,headers});
}
export default {
 async fetch(request,env) {
  const origin=request.headers.get('Origin') || '';
  if (origin !== allowed) return json({ok:false},403);
  if(request.method==='OPTIONS') return new Response(null,{status:204,headers:{'access-control-allow-origin':allowed,'access-control-allow-headers':'content-type','access-control-allow-methods':'POST,OPTIONS','access-control-max-age':'600'}});
  if(request.method!=='POST') return json({ok:false},405,origin);
  if(Number(request.headers.get('content-length') || 0)>12000) return json({ok:false},413,origin);
  let data;
  try { data=await request.json(); } catch {return json({ok:false},400,origin);}
  const str=(v,max=250)=>typeof v==='string'?v.trim().slice(0,max):'';
  const nome=str(data.nome,120),whatsapp=str(data.whatsapp,30),etapa=str(data.etapa,25),mensagem=str(data.mensagem,1000);
  if(data.site) return json({ok:true},200,origin); // honeypot, no email
  if(!nome || nome.length<2 || !/^\+?[\d\s()\-]{10,22}$/.test(whatsapp) || !['Berçário','Maternal','Pré I','Pré II'].includes(etapa) || !data.consentimento)
   return json({ok:false,erro:'dados_invalidos'},400,origin);
  // Ativar Turnstile: exigir token e validar no servidor. Não implantar sem configurar.
  const token=str(data['cf-turnstile-response'],2048);
  if(!env.TURNSTILE_SECRET || !token) return json({ok:false,erro:'protecao_nao_configurada'},503,origin);
  const verifyBody=new FormData();verifyBody.set('secret',env.TURNSTILE_SECRET);verifyBody.set('response',token);
  const verify=await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify',{method:'POST',body:verifyBody});
  const check=await verify.json();
  if(!check.success || check.hostname!=='www.colegiobambino.com.br') return json({ok:false,erro:'verificacao'},400,origin);
  if(!env.RESEND_API_KEY || !env.MAIL_TO || !env.MAIL_FROM) return json({ok:false,erro:'email_nao_configurado'},503,origin);
  const email=await fetch('https://api.resend.com/emails',{method:'POST',headers:{'authorization':`Bearer ${env.RESEND_API_KEY}`,'content-type':'application/json'},body:JSON.stringify({from:env.MAIL_FROM,to:[env.MAIL_TO],subject:'Nova solicitação de visita — Colégio Bambino',text:`Responsável: ${nome}\nWhatsApp: ${whatsapp}\nTurma: ${etapa}\nMensagem: ${mensagem||'Não informada'}\nOrigem: site Colégio Bambino\nConsentimento informado: sim`})});
  if(!email.ok) return json({ok:false,erro:'envio_falhou'},502,origin);
  return json({ok:true},200,origin);
 }
};

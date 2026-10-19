(() => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];

  // Navegação: fundo sólido ao rolar + menu mobile
  const nav = $('#nav'), burger = $('#burger'), menu = $('#menu');
  const onScroll = () => nav.classList.toggle('solid', scrollY > 40);
  onScroll(); addEventListener('scroll', onScroll, { passive: true });
  const closeMenu = () => { menu.classList.remove('open'); burger.setAttribute('aria-expanded', 'false'); };
  burger.addEventListener('click', () => {
    const open = menu.classList.toggle('open');
    burger.setAttribute('aria-expanded', open);
  });
  $$('a', menu).forEach(a => a.addEventListener('click', closeMenu));

  // Contadores do hero
  $$('[data-count]').forEach(el => {
    const end = +el.dataset.count, suf = el.dataset.suf || '', t0 = performance.now();
    const tick = t => {
      const p = Math.min((t - t0) / 1200, 1);
      el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3))) + (p === 1 ? suf : '');
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });

  // Inclinação 3D do celular do hero seguindo o mouse
  const tilt = $('#tilt');
  if (tilt && matchMedia('(hover:hover) and (min-width:861px)').matches) {
    const hero = $('.hero');
    hero.addEventListener('mousemove', e => {
      const x = e.clientX / innerWidth - .5, y = e.clientY / innerHeight - .5;
      tilt.style.transform = `perspective(900px) rotateY(${-8 + x * 10}deg) rotateX(${3 - y * 8}deg)`;
    });
  }

  // Como funciona
  const steps = [
    ['Material disponível', 'Um setor percebe que tem itens parados: cadeiras, monitores, kits de laboratório.'],
    ['Cadastro no ReAloca', 'Em poucos toques, o item entra na plataforma com categoria, quantidade e localização. O app avisa quando ele passa muito tempo sem uso.'],
    ['Outro setor encontra', 'Quem precisa busca por material ou setor e vê o que já existe na instituição, antes de abrir uma compra.'],
    ['Solicita o material', 'O setor escolhe a quantidade e toca em "Solicitar Transferência". O responsável recebe uma notificação.'],
    ['Redistribuição', 'O responsável aprova ou recusa. Aprovado, o material muda de setor e volta a ser útil.']
  ];
  const panel = $('#stepPanel');
  const showStep = i => {
    $$('.step').forEach((b, k) => { b.classList.toggle('on', k === i); b.setAttribute('aria-selected', k === i); });
    $('h3', panel).textContent = `${i + 1}. ${steps[i][0]}`;
    $('p', panel).textContent = steps[i][1];
    panel.classList.remove('swap'); void panel.offsetWidth; panel.classList.add('swap');
  };
  $$('.step').forEach((b, i) => b.addEventListener('click', () => showStep(i)));
  showStep(0);

  // Abas do MVP (alternam o celular em destaque)
  const texts = [
    'Busque pelo nome do material ou pelo setor, filtre por categoria e solicite a quantidade que precisa.',
    'Receba as solicitações em uma tela só e aprove ou recuse cada pedido com um toque.'
  ];
  const phones = $('.phones'), tabText = $('#tabText');
  const showTab = i => {
    $$('.tab').forEach((b, k) => { b.classList.toggle('on', k === i); b.setAttribute('aria-selected', k === i); });
    phones.dataset.t = i; tabText.textContent = texts[i];
  };
  $$('.tab').forEach((b, i) => b.addEventListener('click', () => showTab(i)));
  $('#pA').addEventListener('click', () => showTab(0));
  $('#pB').addEventListener('click', () => showTab(1));
  showTab(0);

  // Fotos reais: se escola.jpg, professores.jpg e patrimonio.jpg existirem na pasta, substituem as ilustrações
  $$('.aud figure[data-photo]').forEach(fig => {
    const svg = $('svg', fig), im = new Image();
    im.alt = svg.getAttribute('aria-label') || '';
    im.onload = () => svg.replaceWith(im);
    im.src = fig.dataset.photo;
  });

  // Formulário: gera um PDF no navegador e envia para o e-mail do grupo
  const DEST = 'gehartdavi@gmail.com';
  const form = $('#form'), msg = $('#msg'), btn = $('button[type=submit]', form);

  // <pdf>
  function makePDF(d) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ unit: 'mm', format: 'a4' });
    doc.setFillColor(20, 40, 67); doc.rect(0, 0, 210, 52, 'F');
    doc.setFillColor(212, 169, 92); doc.rect(0, 52, 210, 2.4, 'F');
    doc.setFont('helvetica', 'bold'); doc.setFontSize(30);
    doc.setTextColor(255, 255, 255); doc.text('Re', 20, 28);
    doc.setTextColor(240, 200, 120); doc.text('Aloca', 20 + doc.getTextWidth('Re'), 28);
    doc.setFont('helvetica', 'normal'); doc.setFontSize(11); doc.setTextColor(201, 214, 232);
    doc.text('Redistribuindo materiais, gerando possibilidades.', 20, 38);
    doc.setFont('helvetica', 'bold'); doc.setFontSize(19); doc.setTextColor(20, 40, 67);
    doc.text('Novo cadastro de interesse', 20, 76);
    doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.setTextColor(93, 107, 126);
    doc.text('Recebido em ' + d.data, 20, 83);
    let y = 100;
    [['Nome', d.nome], ['E-mail', d.email], ['Instituição ou setor', d.instituicao || 'Não informado'], ['Perfil', d.perfil]].forEach(([k, v]) => {
      doc.setFont('helvetica', 'bold'); doc.setFontSize(9); doc.setTextColor(184, 140, 60); doc.text(k.toUpperCase(), 20, y);
      doc.setFont('helvetica', 'normal'); doc.setFontSize(13); doc.setTextColor(29, 42, 61);
      const lines = doc.splitTextToSize(v, 170); doc.text(lines, 20, y + 7);
      y += 7 + lines.length * 6 + 5;
      doc.setDrawColor(232, 225, 210); doc.line(20, y, 190, y); y += 12;
    });
    doc.setFillColor(20, 40, 67); doc.rect(0, 285, 210, 12, 'F');
    doc.setFontSize(9); doc.setTextColor(240, 200, 120);
    doc.text('Gerado automaticamente pela landing page do ReAloca  |  Grupo 7  |  IFC Concórdia', 105, 292, { align: 'center' });
    return doc.output('blob');
  }
  // </pdf>

  const show = (text, cls, blob) => {
    msg.className = 'msg ' + (cls || ''); msg.textContent = text;
    if (blob) {
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob); a.download = 'cadastro-realoca.pdf';
      a.textContent = 'Baixar uma cópia do PDF'; msg.append(a);
    }
  };

  // Envio por formulário multipart oculto (método com anexo aceito pelo FormSubmit)
  const frame = document.createElement('iframe');
  frame.name = 'envio'; frame.hidden = true; document.body.append(frame);
  const out = document.createElement('form');
  Object.assign(out, { method: 'POST', enctype: 'multipart/form-data', action: 'https://formsubmit.co/' + DEST, target: 'envio', hidden: true });
  document.body.append(out);
  const send = (fields, file) => new Promise((ok, fail) => {
    out.innerHTML = '';
    for (const [k, v] of Object.entries(fields)) {
      const i = document.createElement('input'); i.type = 'hidden'; i.name = k; i.value = v; out.append(i);
    }
    const f = document.createElement('input'); f.type = 'file'; f.name = 'attachment';
    const dt = new DataTransfer(); dt.items.add(file); f.files = dt.files; out.append(f);
    const t = setTimeout(() => fail(new Error('Tempo esgotado')), 25000);
    frame.onload = () => { clearTimeout(t); ok(); };
    out.submit();
  });

  form.addEventListener('submit', async e => {
    e.preventDefault();
    const nome = form.nome, email = form.email;
    const okNome = nome.value.trim().length >= 2;
    const okMail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim());
    nome.classList.toggle('bad', !okNome);
    email.classList.toggle('bad', !okMail);
    if (!okNome || !okMail) {
      show(!okNome ? 'Informe seu nome para continuar.' : 'Digite um e-mail válido, como voce@instituicao.edu.br.', 'err');
      (!okNome ? nome : email).focus();
      return;
    }
    const d = {
      nome: nome.value.trim(), email: email.value.trim(),
      instituicao: form.instituicao.value.trim(), perfil: form.perfil.value,
      data: new Date().toLocaleString('pt-BR')
    };
    btn.disabled = true; btn.textContent = 'Enviando...';
    show('Gerando o PDF e enviando...');
    let pdf;
    try {
      pdf = makePDF(d);
      const file = new File([pdf], 'cadastro-realoca.pdf', { type: 'application/pdf' });
      await send({
        _subject: 'Novo cadastro no ReAloca: ' + d.nome, _template: 'table', _captcha: 'false', _honey: form._honey.value,
        Nome: d.nome, email: d.email, Instituicao: d.instituicao || 'Não informado', Perfil: d.perfil, Data: d.data
      }, file);
      show(`Obrigado, ${d.nome.split(' ')[0]}! Seu cadastro foi enviado.`, 'ok', pdf);
      form.reset();
    } catch (err) {
      console.error(err);
      show('Não foi possível enviar agora. Tente novamente em instantes.', 'err', pdf);
    } finally {
      btn.disabled = false; btn.textContent = 'Quero testar o ReAloca';
    }
  });
})();

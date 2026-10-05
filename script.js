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

  // Formulário
  const form = $('#form'), msg = $('#msg');
  form.addEventListener('submit', e => {
    e.preventDefault();
    const nome = form.nome, email = form.email;
    const okNome = nome.value.trim().length >= 2;
    const okMail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim());
    nome.classList.toggle('bad', !okNome);
    email.classList.toggle('bad', !okMail);
    msg.className = 'msg';
    if (!okNome || !okMail) {
      msg.classList.add('err');
      msg.textContent = !okNome ? 'Informe seu nome para continuar.' : 'Digite um e-mail válido, como voce@instituicao.edu.br.';
      (!okNome ? nome : email).focus();
      return;
    }
    msg.classList.add('ok');
    msg.textContent = `Obrigado, ${nome.value.trim().split(' ')[0]}! Entraremos em contato pelo e-mail informado.`;
    form.reset();
  });
})();

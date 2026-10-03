const homeScreen = document.getElementById('homeScreen');
const voteScreen = document.getElementById('voteScreen');
const startVotingButton = document.getElementById('startVotingButton');
const identityModal = document.getElementById('identityModal');
const voterSelect = document.getElementById('voterSelect');
const voterSelectButton = document.getElementById('voterSelectButton');
const voterSelectText = document.getElementById('voterSelectText');
const voterOptions = document.getElementById('voterOptions');
const confirmIdentity = document.getElementById('confirmIdentity');
const cancelIdentity = document.getElementById('cancelIdentity');
const previousButton = document.getElementById('previousButton');
const nextButton = document.getElementById('nextButton');
const toast = document.getElementById('toast');
const categoriesButton = document.getElementById('categoriesButton');
const pageTransition = document.getElementById('pageTransition');
const nomineeGrid = document.getElementById('nomineeGrid');
const categoryTitle = document.getElementById('categoryTitle');
const categoryDescription = document.getElementById('categoryDescription');
const progressText = document.getElementById('progressText');
const progressBar = document.getElementById('progressBar');
const heroTitle = document.querySelector('.hero-title');

const VOTERS = [
  'FERNANDO MELO VERISSIMO',
  'GEOVANA DE MELO MENDES',
  'HENRIQUE LECOMTE FERREIRA',
  'IAN GABRIEL TOBIAS DE ALMEIDA',
  'JOÃO PAULO BARBOSA SOUSA',
  'JOÃO VICTOR MESQUITA GOMES',
  'JÚLIA NOGUEIRA DE SOUZA PALMEIRA',
  'JULIANA GUIDASTRI AGUIAR',
  'LUIS GUILHERME TEIXEIRA MADUREIRA DE FREITAS',
  'MARIANA ALVES DOS SANTOS'
];

const CATEGORIES = [
  {
    title: 'Melhor Criador de Conteúdo',
    description: 'Vote em quem mais se destacou ao longo do ano com conteúdo relevante, criativo e autêntico.',
    nominees: [
      { name: 'INDICADO 1', photo: '' },
      { name: 'INDICADO 2', photo: '' },
      { name: 'INDICADO 3', photo: '' },
      { name: 'INDICADO 4', photo: '' },
      { name: 'INDICADO 5', photo: '' }
    ]
  }
];

let selectedVoter = '';
let selectedNominee = null;
let currentCategory = 0;
let toastTimer;
let transitionLocked = false;

function syncHeroTitle() {
  if (heroTitle) heroTitle.dataset.text = heroTitle.textContent.trim();
}

function startHomeIntro() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    homeScreen.classList.add('intro-complete');
    return;
  }
  homeScreen.classList.remove('intro-complete');
  requestAnimationFrame(() => {
    window.setTimeout(() => {
      homeScreen.classList.add('intro-complete');
    }, 1450);
  });
}

function renderVoters() {
  voterOptions.innerHTML = '';
  VOTERS.forEach((name, index) => {
    const option = document.createElement('button');
    option.type = 'button';
    option.className = 'select-option';
    option.setAttribute('role', 'option');
    option.setAttribute('aria-selected', 'false');
    option.dataset.value = name;
    option.textContent = name;
    option.addEventListener('click', () => selectVoter(name, option));
    option.addEventListener('keydown', (event) => handleOptionKeydown(event, index));
    voterOptions.appendChild(option);
  });
}

function selectVoter(name, option) {
  selectedVoter = name;
  voterSelectText.textContent = name;
  confirmIdentity.disabled = false;
  [...voterOptions.children].forEach((item) => {
    const active = item === option;
    item.classList.toggle('is-selected', active);
    item.setAttribute('aria-selected', String(active));
  });
  closeSelect();
  confirmIdentity.focus({ preventScroll: true });
}

function openSelect() {
  voterSelect.classList.add('is-open');
  voterSelectButton.setAttribute('aria-expanded', 'true');
  const target = voterOptions.querySelector('.is-selected') || voterOptions.firstElementChild;
  setTimeout(() => target?.focus({ preventScroll: true }), 60);
}

function closeSelect() {
  voterSelect.classList.remove('is-open');
  voterSelectButton.setAttribute('aria-expanded', 'false');
}

function toggleSelect() {
  voterSelect.classList.contains('is-open') ? closeSelect() : openSelect();
}

function handleOptionKeydown(event, index) {
  const options = [...voterOptions.children];
  if (event.key === 'ArrowDown') {
    event.preventDefault();
    options[(index + 1) % options.length].focus();
  } else if (event.key === 'ArrowUp') {
    event.preventDefault();
    options[(index - 1 + options.length) % options.length].focus();
  } else if (event.key === 'Escape') {
    event.preventDefault();
    closeSelect();
    voterSelectButton.focus();
  }
}

function openModal() {
  identityModal.classList.remove('is-closing');
  identityModal.classList.add('is-open');
  identityModal.setAttribute('aria-hidden', 'false');
  document.body.classList.add('modal-open');
  setTimeout(() => voterSelectButton.focus({ preventScroll: true }), 320);
}

function closeModal({ returnFocus = true } = {}) {
  closeSelect();
  identityModal.classList.add('is-closing');
  setTimeout(() => {
    identityModal.classList.remove('is-open', 'is-closing');
    identityModal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
    if (returnFocus) startVotingButton.focus({ preventScroll: true });
  }, 210);
}

function setScreen(target) {
  const showVote = target === 'vote';
  homeScreen.classList.toggle('is-active', !showVote);
  homeScreen.setAttribute('aria-hidden', String(showVote));
  voteScreen.classList.toggle('is-active', showVote);
  voteScreen.setAttribute('aria-hidden', String(!showVote));
  if (showVote) voteScreen.scrollTop = 0;
}

function transitionTo(target) {
  if (transitionLocked) return;
  transitionLocked = true;
  pageTransition.classList.remove('is-running');
  void pageTransition.offsetWidth;
  pageTransition.classList.add('is-running');

  window.setTimeout(() => setScreen(target), 490);
  window.setTimeout(() => {
    pageTransition.classList.remove('is-running');
    transitionLocked = false;
  }, 1100);
}

function renderCategory(index) {
  const category = CATEGORIES[index];
  if (!category) return;

  categoryTitle.textContent = category.title;
  categoryDescription.textContent = category.description;
  progressText.textContent = `${index + 1} / 12`;
  progressBar.style.width = `${((index + 1) / 12) * 100}%`;
  selectedNominee = null;

  const count = category.nominees.length;
  nomineeGrid.style.setProperty('--columns', Math.min(count, 5));
  nomineeGrid.innerHTML = '';
  nomineeGrid.classList.remove('has-selection');

  category.nominees.forEach((nominee, nomineeIndex) => {
    const card = document.createElement('button');
    card.type = 'button';
    card.className = 'nominee-card';
    card.setAttribute('role', 'radio');
    card.setAttribute('aria-checked', 'false');
    card.setAttribute('aria-label', `Selecionar ${nominee.name}`);

    const check = document.createElement('span');
    check.className = 'nominee-check';
    check.setAttribute('aria-hidden', 'true');
    check.textContent = '✓';

    const photo = document.createElement('div');
    photo.className = 'nominee-photo';

    if (nominee.photo) {
      const image = document.createElement('img');
      image.src = nominee.photo;
      image.alt = '';
      photo.appendChild(image);
    } else {
      const placeholder = document.createElement('span');
      placeholder.className = 'photo-placeholder';
      placeholder.setAttribute('aria-hidden', 'true');
      photo.appendChild(placeholder);
    }

    const name = document.createElement('span');
    name.className = 'nominee-name';
    name.textContent = nominee.name;

    card.append(check, photo, name);
    card.addEventListener('click', () => selectNominee(card, nomineeIndex));
    nomineeGrid.appendChild(card);
  });
}

function selectNominee(card, nomineeIndex) {
  const isAlreadySelected = selectedNominee === nomineeIndex && card.classList.contains('is-selected');

  [...nomineeGrid.children].forEach((item) => {
    item.classList.remove('is-selected');
    item.setAttribute('aria-checked', 'false');
  });

  if (isAlreadySelected) {
    nomineeGrid.classList.remove('has-selection');
    selectedNominee = null;
    return;
  }

  card.classList.add('is-selected');
  card.setAttribute('aria-checked', 'true');
  nomineeGrid.classList.add('has-selection');
  selectedNominee = nomineeIndex;

  if (window.matchMedia('(max-width: 760px)').matches) {
    requestAnimationFrame(() => {
      card.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    });
  }
}

function showToast(message) {
  clearTimeout(toastTimer);
  toast.textContent = message;
  toast.classList.add('is-visible');
  toastTimer = setTimeout(() => toast.classList.remove('is-visible'), 2400);
}

startVotingButton.addEventListener('click', openModal);
voterSelectButton.addEventListener('click', toggleSelect);

identityModal.addEventListener('click', (event) => {
  if (event.target.hasAttribute('data-close-modal')) closeModal();
});

document.addEventListener('click', (event) => {
  if (voterSelect.classList.contains('is-open') && !voterSelect.contains(event.target)) closeSelect();
});

cancelIdentity.addEventListener('click', () => closeModal());

confirmIdentity.addEventListener('click', () => {
  if (!selectedVoter) return;
  sessionStorage.setItem('oituawards_voter', selectedVoter);
  closeModal({ returnFocus: false });
  setTimeout(() => transitionTo('vote'), 135);
});

previousButton.addEventListener('click', () => transitionTo('home'));

nextButton.addEventListener('click', () => {
  showToast('As próximas categorias serão adicionadas na próxima etapa.');
});

categoriesButton.addEventListener('click', () => {
  showToast('A área de Categorias será desenvolvida na próxima etapa.');
});

document.querySelectorAll('[data-home]').forEach((element) => {
  element.addEventListener('click', (event) => {
    event.preventDefault();
    if (voteScreen.classList.contains('is-active')) transitionTo('home');
  });
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && voterSelect.classList.contains('is-open')) {
    closeSelect();
    voterSelectButton.focus();
    return;
  }
  if (event.key === 'Escape' && identityModal.classList.contains('is-open')) {
    closeModal();
  }
});

syncHeroTitle();
renderVoters();
renderCategory(currentCategory);
window.addEventListener('load', startHomeIntro, { once: true });

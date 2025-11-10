// Mobile Menu Toggle
document.getElementById('mobile-menu-button').addEventListener('click', () => {
  document.getElementById('mobile-menu').classList.toggle('hidden');
});

// Countdown Timer
function updateCountdown() {
  const eventDate = new Date('2025-11-10T08:00:00-03:00');
  const now = new Date();
  const diff = eventDate - now;
  const countdownElement = document.getElementById('countdown');
  if (!countdownElement) return;

  if (diff <= 0) {
    countdownElement.innerHTML = 'O evento começou!';
    return;
  }
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);
  document.getElementById('days').textContent = days.toString().padStart(2, '0');
  document.getElementById('hours').textContent = hours.toString().padStart(2, '0');
  document.getElementById('minutes').textContent = minutes.toString().padStart(2, '0');
  document.getElementById('seconds').textContent = seconds.toString().padStart(2, '0');
}

// Dynamic aria-current for navigation
function setActiveNavLink() {
  const navLinks = document.querySelectorAll('.nav-link');
  const currentHash = window.location.hash || '#sobre'; // Default to #sobre if no hash
  navLinks.forEach(link => {
    link.removeAttribute('aria-current');
    if (link.getAttribute('href') === currentHash) {
      link.setAttribute('aria-current', 'page');
    }
  });
}

// Programação Tabs
function setupTabs() {
  const tabButtons = document.querySelectorAll('.tab-button');
  const tabContents = document.querySelectorAll('.tab-content');

  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      const tabId = button.dataset.tab;

      tabButtons.forEach(btn => {
        btn.classList.remove('border-ufc-green', 'text-ufc-green');
        btn.classList.add('border-transparent', 'text-white/70', 'hover:text-white');
      });
      button.classList.add('border-ufc-green', 'text-ufc-green');
      button.classList.remove('border-transparent', 'text-white/70', 'hover:text-white');

      tabContents.forEach(content => {
        content.id === tabId ? content.classList.remove('hidden') : content.classList.add('hidden');
      });
    });
  });
}

// --- Programação Dinâmica ---
function setupProgramacaoSearch() {
  const searchInput = document.getElementById('search-programacao');
  const noResultsMessage = document.getElementById('no-results');

  searchInput.addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase().trim();
    let hasVisibleResults = false;

    const allSessions = document.querySelectorAll('#programacao-content .session-card');

    allSessions.forEach(session => {
      const presentations = session.querySelectorAll('li');
      let sessionHasVisibleItems = false;

      presentations.forEach(li => {
        const text = li.textContent.toLowerCase();
        const isVisible = text.includes(searchTerm);
        li.style.display = isVisible ? '' : 'none';
        if (isVisible) sessionHasVisibleItems = true;
      });

      if (sessionHasVisibleItems) {
        session.style.display = '';
        hasVisibleResults = true;
      } else {
        session.style.display = 'none';
      }
    });

    noResultsMessage.style.display = hasVisibleResults ? 'none' : 'block';
  });
}

async function loadProgramacao() {
  try {
    const response = await fetch('database/programacao.json');
    const sessoes = await response.json();

    sessoes.sort((a, b) => {
      const numA = parseInt(a.sessionTitle.match(/\d+/)?.[0] || '999', 10);
      const numB = parseInt(b.sessionTitle.match(/\d+/)?.[0] || '999', 10);
      return numA - numB;
    });

    sessoes.forEach(sessao => {
      const container = document.getElementById(`dia-${sessao.day}`);
      if (!container) return;

      const presentationsHTML = sessao.presentations.map(p =>
        `<li>
          <p class="font-medium text-white/95">${p.title}</p>
          ${p.author ? `<p class="text-sm text-white/70 pt-1 pl-4">- ${p.author}</p>` : ''}
        </li>`
      ).join('');

      const durationHTML = sessao.duration ? `| Duração: ${sessao.duration}` : '';

      const sessaoHTML = `
        <div class="session-card bg-ufc-mediumblue/50 rounded-xl p-6">
          <div class="border-b border-ufc-green/30 pb-4 mb-4">
            <p class="text-sm text-ufc-green font-semibold">${sessao.area}</p>
            <h3 class="text-xl font-bold">${sessao.type}: "${sessao.sessionTitle}"</h3>
            <p class="text-sm text-white/80">${sessao.dateTime} ${durationHTML}</p>
          </div>
          <ul class="space-y-4">
            ${presentationsHTML}
          </ul>
        </div>
      `;
      container.innerHTML += sessaoHTML;
    });

    setupProgramacaoSearch();

  } catch (error) {
    console.error('Erro ao carregar a programação:', error);
    const programacaoContent = document.getElementById('programacao-content');
    programacaoContent.innerHTML = '<p class="text-center text-red-400">Não foi possível carregar a programação. Tente novamente mais tarde.</p>';
  }
}

// Dynamic Timeline Status
async function loadCronograma() {
  const container = document.getElementById('cronograma-container');
  if (!container) return;

  try {
    const response = await fetch('database/cronograma.json');
    const items = await response.json();

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const statusConfig = {
      finished: { text: 'Encerrado', classes: 'bg-red-500/20 text-red-500' },
      inProgress: { text: 'Em andamento', classes: 'bg-green-500/20 text-green-500' },
      soon: { text: 'Em breve', classes: 'bg-yellow-500/20 text-yellow-500' }
    };

    const itemsHTML = items.map(item => {
      const dateText = item.date;
      const dateParts = dateText.split(' a ');
      let startDate, endDate, statusKey;

      try {
        if (dateParts.length === 2) {
          const [startDay, startMonth] = dateParts[0].split('/');
          const [endDay, endMonth, endYear] = dateParts[1].split('/');
          startDate = new Date(`${endYear}-${startMonth}-${startDay}`);
          endDate = new Date(`${endYear}-${endMonth}-${endDay}`);
        } else {
          const [day, month, year] = dateParts[0].split('/');
          startDate = new Date(`${year}-${month}-${day}`);
          endDate = new Date(startDate);
        }
        endDate.setHours(23, 59, 59, 999);

        if (today > endDate) statusKey = 'finished';
        else if (today >= startDate && today <= endDate) statusKey = 'inProgress';
        else statusKey = 'soon';

      } catch (e) {
        statusKey = 'soon';
        console.error(`Could not parse date: "${dateText}"`, e);
      }

      const status = statusConfig[statusKey];

      return `
        <div class="relative timeline-item pl-6 sm:pl-8">
          <div class="absolute left-0 top-1 w-3 sm:w-4 h-3 sm:h-4 bg-ufc-green rounded-full"></div>
          <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p class="text-xs sm:text-sm text-ufc-green">${item.date}</p>
              <h3 class="text-base sm:text-lg font-bold">${item.title}</h3>
            </div>
            <span class="mt-2 sm:mt-0 text-xs px-2 py-1 rounded-full ${status.classes}">${status.text}</span>
          </div>
        </div>
      `;
    }).join('');

    container.innerHTML = itemsHTML;

  } catch (error) {
    console.error('Erro ao carregar o cronograma:', error);
    container.innerHTML = '<p class="text-center text-red-400">Não foi possível carregar o cronograma.</p>';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  setInterval(updateCountdown, 1000);
  updateCountdown();
  setActiveNavLink();
  window.addEventListener('hashchange', setActiveNavLink);
  setupTabs();
  loadProgramacao();
  loadCronograma();
});
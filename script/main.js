// Mobile Menu Toggle
const mobileMenuButton = document.getElementById('mobile-menu-button');
const mobileMenu = document.getElementById('mobile-menu');

mobileMenuButton.addEventListener('click', () => {
  const isExpanded = mobileMenuButton.getAttribute('aria-expanded') === 'true';
  mobileMenuButton.setAttribute('aria-expanded', !isExpanded);
  mobileMenu.classList.toggle('hidden');
});

// Close mobile menu when a link is clicked
document.querySelectorAll('.mobile-nav-link').forEach(link => {
  link.addEventListener('click', () => {
    mobileMenu.classList.add('hidden');
    mobileMenuButton.setAttribute('aria-expanded', 'false');
  });
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
      const panelId = button.getAttribute('aria-controls');

      tabButtons.forEach(btn => {
        btn.classList.remove('border-ufc-green', 'text-ufc-green');
        btn.classList.add('border-transparent', 'text-white/70', 'hover:text-white');
        btn.setAttribute('aria-selected', 'false');
        btn.setAttribute('tabindex', '-1');
      });

      button.classList.add('border-ufc-green', 'text-ufc-green');
      button.classList.remove('border-transparent', 'text-white/70', 'hover:text-white');
      button.setAttribute('aria-selected', 'true');
      button.setAttribute('tabindex', '0');

      tabContents.forEach(content => {
        const isSelected = content.id === panelId;
        content.classList.toggle('hidden', !isSelected);
      });
    });
  });
}

function setupSessionFilter(sessoes) {
  const filterSelect = document.getElementById('session-filter');
  if (!filterSelect) return;

  // Popula o filtro com as sessões
  const sessionOptions = sessoes.map(sessao => 
    `<option value="${sessao.sessionTitle}">${sessao.sessionTitle} - ${sessao.room}</option>`
  ).join('');
  filterSelect.innerHTML += sessionOptions;

  // Adiciona o listener para o evento de mudança
  filterSelect.addEventListener('change', (e) => {
    const selectedSession = e.target.value;
    const allSessionCards = document.querySelectorAll('.session-card');

    allSessionCards.forEach(card => {
      if (selectedSession === 'all') {
        card.style.display = ''; // Mostra todos os cards
      } else {
        // Mostra apenas o card que corresponde à sessão selecionada
        const cardSessionTitle = card.getAttribute('data-session-title');
        card.style.display = cardSessionTitle === selectedSession ? '' : 'none';
      }
    });
  });
}

async function loadProgramacao() {
  try {
    const response = await fetch('database/programacao.json');
    const sessoes = await response.json();

    sessoes.sort((a, b) => {
      // Fallback to a high number if no number is found in the title
      const numA = parseInt(a.sessionTitle?.match(/\d+/)?.[0] || '9999', 10);
      const numB = parseInt(b.sessionTitle?.match(/\d+/)?.[0] || '9999', 10);
      if (numA !== numB) return numA - numB;
      return a.sessionTitle.localeCompare(b.sessionTitle); // Secondary sort by title
    });

    // Otimização: Agrupar sessões por dia para renderizar de uma vez
    const dailySessions = { 10: '', 11: '', 12: '' };

    for (const sessao of sessoes) {
      if (dailySessions[sessao.day] !== undefined) {
        // --- Lógica para calcular horário de início das apresentações ---
        const timeRegex = /(\d{2}:\d{2})/;
        const match = sessao.dateTime.match(timeRegex);
        let currentTime = null;

        if (match) {
          const [startHour, startMinute] = match[1].split(':').map(Number);
          currentTime = new Date();
          currentTime.setHours(startHour, startMinute, 0, 0);
        }

        const presentationDuration = {
          'Apresentação Oral': 15, // minutos
          'Pitch': 10, // minutos
        };
        const durationInMinutes = presentationDuration[sessao.type];
        // --- Fim da lógica de horário ---

        const presentationsHTML = sessao.presentations.map(p => {
          let timeHTML = '';
          if (currentTime && durationInMinutes) {
            const hours = currentTime.getHours().toString().padStart(2, '0');
            const minutes = currentTime.getMinutes().toString().padStart(2, '0');
            timeHTML = `<span class="text-xs text-ufc-green font-mono mr-2">[${hours}:${minutes}]</span>`;
            currentTime.setMinutes(currentTime.getMinutes() + durationInMinutes);
          }

          return `<li>
            <p class="font-medium text-white/95">${timeHTML}${p.title}</p>
            ${p.author ? `<p class="text-sm text-white/70 pt-1 pl-4">- ${p.author}</p>` : ''}
          </li>`;
        }).join('');

        const bancaHTML = sessao.banca && sessao.banca.length > 0
          ? `<div class="mt-4 pt-4 border-t border-ufc-green/20">
               <p class="text-sm font-semibold text-ufc-green mb-2">Banca Avaliadora:</p>
               <ul class="text-sm text-white/80 space-y-1">
                 ${sessao.banca.map(avaliador => `<li>- ${avaliador}</li>`).join('')}
               </ul>
             </div>`
          : '';

        dailySessions[sessao.day] += `
          <div class="session-card bg-ufc-mediumblue/50 rounded-xl p-6" data-session-title="${sessao.sessionTitle}">
            <div class="border-b border-ufc-green/30 pb-4 mb-4">
              <p class="text-sm text-ufc-green font-semibold">${sessao.area}</p>
              <h3 class="text-xl font-bold">${sessao.room}: ${sessao.sessionTitle} - ${sessao.type}</h3>
              <p class="text-sm text-white/80">${sessao.dateTime}</p>
            </div>
            <ul class="space-y-4">
              ${presentationsHTML}
            </ul>
            ${bancaHTML}
          </div>`;
      }
    }

    // Inserir o HTML no DOM de uma só vez para cada dia
    for (const day in dailySessions) {
      const container = document.getElementById(`panel-dia-${day}`);
      if (container) {
        container.innerHTML = dailySessions[day];
      }
    }

    setupSessionFilter(sessoes);

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

    // Para testar o status durante o evento, descomente a linha abaixo e comente a seguinte.
    // const today = new Date('2025-11-11T10:00:00-03:00'); // Data de teste
    const today = new Date(); // Data atual

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

// Back to Top Button
function setupBackToTopButton() {
  const backToTopButton = document.getElementById('back-to-top-btn');
  if (!backToTopButton) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 300) { // Mostra o botão após rolar 300px
      backToTopButton.classList.remove('hidden');
    } else {
      backToTopButton.classList.add('hidden');
    }
  });

  backToTopButton.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });
}

// Smooth Scrolling for Anchor Links
function setupSmoothScrolling() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const targetId = this.getAttribute('href');
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        targetElement.scrollIntoView({
          behavior: 'smooth'
        });
      }
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  setInterval(updateCountdown, 1000);
  updateCountdown();
  setActiveNavLink();
  window.addEventListener('hashchange', setActiveNavLink);
  setupTabs();
  setupSmoothScrolling();
  setupBackToTopButton();
  loadProgramacao();
  loadCronograma();
});
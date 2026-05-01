const weddingDate = new Date('2026-11-21T12:00:00+09:00');
const venue = {
  name: '더화이트베일',
  address: '서울 서초구 서초중앙로 14',
  lat: 37.491742,
  lng: 127.007709,
};

const galleryImages = [
  {
    src: 'https://cdn2.vividvows.co.kr/invitations/aAK6VTTqxHWi04L07pyK/main/first.jpg?token=5814e45c-3ece-43ab-8c5f-2ee0c23f47cc',
    alt: '웨딩 갤러리 이미지 1',
  },
  {
    src: 'https://cdn2.vividvows.co.kr/invitations/aAK6VTTqxHWi04L07pyK/main/first.jpg?token=5814e45c-3ece-43ab-8c5f-2ee0c23f47cc',
    alt: '웨딩 갤러리 이미지 2',
  },
  {
    src: 'https://cdn2.vividvows.co.kr/invitations/aAK6VTTqxHWi04L07pyK/main/first.jpg?token=5814e45c-3ece-43ab-8c5f-2ee0c23f47cc',
    alt: '웨딩 갤러리 이미지 3',
  },
  {
    src: 'https://cdn2.vividvows.co.kr/invitations/aAK6VTTqxHWi04L07pyK/main/first.jpg?token=5814e45c-3ece-43ab-8c5f-2ee0c23f47cc',
    alt: '웨딩 갤러리 이미지 4',
  },
  {
    src: 'https://cdn2.vividvows.co.kr/invitations/aAK6VTTqxHWi04L07pyK/main/first.jpg?token=5814e45c-3ece-43ab-8c5f-2ee0c23f47cc',
    alt: '웨딩 갤러리 이미지 5',
  },
  {
    src: 'https://cdn2.vividvows.co.kr/invitations/aAK6VTTqxHWi04L07pyK/main/first.jpg?token=5814e45c-3ece-43ab-8c5f-2ee0c23f47cc',
    alt: '웨딩 갤러리 이미지 6',
  },
];

function renderCalendar(target, date) {
  const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const leading = firstDay.getDay();
  const totalDays = lastDay.getDate();
  const prevLastDay = new Date(year, month, 0).getDate();
  const totalCells = Math.ceil((leading + totalDays) / 7) * 7;
  const cells = [];

  weekdays.forEach((day, index) => {
    const extraClass = index === 0 ? ' is-sunday' : index === 6 ? ' is-saturday' : '';
    cells.push(`<div class="calendar-cell weekday${extraClass}">${day}</div>`);
  });

  for (let i = 0; i < totalCells; i += 1) {
    let dayNumber;
    let monthOffset = 0;
    let classes = 'calendar-cell day';
    const dayOfWeek = i % 7;

    if (i < leading) {
      dayNumber = prevLastDay - leading + i + 1;
      monthOffset = -1;
      classes += ' is-muted';
    } else if (i >= leading + totalDays) {
      dayNumber = i - (leading + totalDays) + 1;
      monthOffset = 1;
      classes += ' is-muted';
    } else {
      dayNumber = i - leading + 1;
      if (dayNumber === date.getDate()) {
        classes += ' is-wedding-day';
      }
    }

    if (dayOfWeek === 0) classes += ' is-sunday';
    if (dayOfWeek === 6) classes += ' is-saturday';

    cells.push(`<div class="${classes}" data-month-offset="${monthOffset}">${dayNumber}</div>`);
  }

  target.innerHTML = cells.join('');
}

function updateCountdown() {
  const now = new Date();
  const diff = weddingDate.getTime() - now.getTime();
  const daysEl = document.getElementById('days');
  const hoursEl = document.getElementById('hours');
  const minutesEl = document.getElementById('minutes');
  const secondsEl = document.getElementById('seconds');
  const ddayCopy = document.getElementById('ddayCopy');

  if (diff <= 0) {
    daysEl.textContent = '0';
    hoursEl.textContent = '0';
    minutesEl.textContent = '0';
    secondsEl.textContent = '0';
    ddayCopy.innerHTML = '송명진 <span class="heart">❤</span> 한근희의 결혼식 날입니다.';
    return;
  }

  const totalSeconds = Math.floor(diff / 1000);
  const days = Math.floor(totalSeconds / (60 * 60 * 24));
  const hours = Math.floor((totalSeconds % (60 * 60 * 24)) / (60 * 60));
  const minutes = Math.floor((totalSeconds % (60 * 60)) / 60);
  const seconds = totalSeconds % 60;

  daysEl.textContent = String(days);
  hoursEl.textContent = String(hours);
  minutesEl.textContent = String(minutes);
  secondsEl.textContent = String(seconds);
  ddayCopy.innerHTML = `송명진 <span class="heart">❤</span> 한근희의 결혼식이 <b>${days}일</b> 남았습니다.`;
}

function bindCopyAddress() {
  const button = document.getElementById('copyAddressBtn');

  button.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(venue.address);
      button.textContent = '✓';
      setTimeout(() => {
        button.textContent = '⌘';
      }, 1500);
    } catch (error) {
      button.textContent = '!';
      setTimeout(() => {
        button.textContent = '⌘';
      }, 1500);
    }
  });
}

function initMap() {
  const note = document.getElementById('mapFallbackNote');
  note.hidden = true;
}

function renderGallery() {
  const galleryGrid = document.getElementById('galleryGrid');

  galleryGrid.innerHTML = galleryImages
    .map(
      (image, index) => `
        <button class="gallery-item" type="button" data-image="${image.src}" aria-label="갤러리 이미지 ${index + 1} 열기">
          <img src="${image.src}" alt="${image.alt}" />
        </button>
      `,
    )
    .join('');
}

function bindGallery() {
  const lightbox = document.getElementById('lightbox');
  const lightboxImage = document.getElementById('lightboxImage');
  const closeButton = document.getElementById('lightboxClose');
  const items = document.querySelectorAll('button.gallery-item');

  const open = (src, alt) => {
    lightboxImage.src = src;
    lightboxImage.alt = alt || '웨딩 갤러리 이미지';
    lightbox.hidden = false;
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.classList.add('lightbox-open');
  };

  const close = () => {
    lightbox.hidden = true;
    lightbox.setAttribute('aria-hidden', 'true');
    lightboxImage.src = '';
    lightboxImage.alt = '';
    document.body.classList.remove('lightbox-open');
  };

  items.forEach((item) => {
    item.addEventListener('click', () => {
      const image = item.querySelector('img');
      const src = item.dataset.image || image?.getAttribute('src');
      const alt = image?.getAttribute('alt') || '웨딩 갤러리 이미지';

      if (!src) return;
      open(src, alt);
    });
  });

  closeButton.addEventListener('click', close);
  lightbox.addEventListener('click', (event) => {
    if (event.target === lightbox) close();
  });

  lightboxImage.addEventListener('click', (event) => {
    event.stopPropagation();
  });

  window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !lightbox.hidden) close();
  });
}

function bindRevealAnimation() {
  const revealItems = document.querySelectorAll('.reveal');

  if (!('IntersectionObserver' in window)) {
    revealItems.forEach((item) => item.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.14 },
  );

  revealItems.forEach((item) => observer.observe(item));
}

window.addEventListener('DOMContentLoaded', () => {
  renderCalendar(document.getElementById('calendar'), weddingDate);
  renderGallery();
  updateCountdown();
  bindCopyAddress();
  initMap();
  bindGallery();
  bindRevealAnimation();
  setInterval(updateCountdown, 1000);
});

let inviteData = null;
let weddingDate = null;

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

async function loadData() {
  const [dataResponse, guestbookResponse, rsvpResponse] = await Promise.all([
    fetch('mock-data.json'),
    fetch('data/guestbook.json').catch(() => null),
    fetch('data/rsvp.json').catch(() => null),
  ]);

  inviteData = await dataResponse.json();

  if (guestbookResponse && guestbookResponse.ok) {
    inviteData.guestbook.entries = await guestbookResponse.json();
  }

  if (rsvpResponse && rsvpResponse.ok) {
    inviteData.attendance.responses = await rsvpResponse.json();
  }

  weddingDate = new Date(inviteData.wedding.date);
}

function renderMeta() {
  document.title = inviteData.wedding.title;
  document.querySelector('meta[name="description"]').setAttribute('content', `${inviteData.wedding.dateText}, ${inviteData.wedding.venue}에서 열리는 초대장입니다.`);
  document.querySelector('meta[property="og:title"]').setAttribute('content', inviteData.wedding.title);
  document.querySelector('meta[property="og:description"]').setAttribute('content', `${inviteData.wedding.dateText} · ${inviteData.wedding.venue}`);
}

function renderHero() {
  const { couple, hero, wedding } = inviteData;
  document.getElementById('titleOverlay').innerHTML = `
    <span>${escapeHtml(couple.groom.name)}</span>
    <span class="title-and">${escapeHtml(couple.connector)}</span>
    <span>${escapeHtml(couple.bride.name)}</span>
  `;
  const heroPhoto = document.getElementById('heroPhoto');
  heroPhoto.src = hero.image;
  heroPhoto.alt = hero.alt;
  document.getElementById('heroDateText').textContent = wedding.dateText;
  document.getElementById('heroTimeText').textContent = wedding.timeText;
  document.getElementById('heroVenue').textContent = wedding.venue;
}

function renderInvitation() {
  const { invitation, couple } = inviteData;
  document.getElementById('invitationTitleEn').textContent = invitation.titleEn;
  document.getElementById('invitationTitleKo').textContent = invitation.titleKo;
  document.getElementById('messageCopy').innerHTML = invitation.lines
    .map((line) => (line ? `<p>${escapeHtml(line)}</p>` : '<p class="blank"></p>'))
    .join('');

  document.getElementById('familyLines').innerHTML = `
    <p><span class="parent-label">신랑</span> ${escapeHtml(couple.groom.name)} <span class="family-muted">·</span> <span class="family-parent">${escapeHtml(couple.groom.father)}</span> · <span class="family-parent">${escapeHtml(couple.groom.mother)}</span>의 아들</p>
    <p><span class="parent-label">신부</span> ${escapeHtml(couple.bride.name)} <span class="family-muted">·</span> <span class="family-parent">${escapeHtml(couple.bride.father)}</span> · <span class="family-parent">${escapeHtml(couple.bride.mother)}</span>의 딸</p>
  `;

  document.getElementById('coupleSummary').innerHTML = `
    <span class="role">신랑</span>
    <span class="name">${escapeHtml(couple.groom.name)}</span>
    <span class="dot">·</span>
    <span class="role">신부</span>
    <span class="name">${escapeHtml(couple.bride.name)}</span>
  `;
}

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
  const { groom, bride } = inviteData.couple;

  if (diff <= 0) {
    daysEl.textContent = '0';
    hoursEl.textContent = '0';
    minutesEl.textContent = '0';
    secondsEl.textContent = '0';
    ddayCopy.innerHTML = `${escapeHtml(groom.name)} <span class="heart">❤</span> ${escapeHtml(bride.name)}의 결혼식 날입니다.`;
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
  ddayCopy.innerHTML = `${escapeHtml(groom.name)} <span class="heart">❤</span> ${escapeHtml(bride.name)}의 결혼식이 <b>${days}일</b> 남았습니다.`;
}

function renderLocation() {
  const { wedding, map } = inviteData;
  document.getElementById('locationTitle').textContent = wedding.venue;
  document.getElementById('locationAddress').textContent = wedding.address;
  document.getElementById('daySectionTitle').textContent = `${wedding.dateText} ${wedding.timeText}`;
  document.getElementById('map').innerHTML = `
    <div class="kakao-map-card">
      <div class="kakao-map-image-wrap">
        <a href="${map.mapLink}" target="_blank" rel="noreferrer">
          <img class="kakao-map-image" src="${map.image}" alt="${escapeHtml(wedding.address)} 카카오 지도" />
        </a>
      </div>
      <div class="kakao-map-footer">
        <a href="${map.kakaoHome}" target="_blank" rel="noreferrer" class="kakao-map-logo-link">
          <img src="https://t1.kakaocdn.net/localimg/localimages/07/2018/pc/common/logo_kakaomap.png" width="72" height="16" alt="카카오맵" class="kakao-map-logo" />
        </a>
        <a target="_blank" rel="noreferrer" href="${map.routeLink}" class="kakao-map-route-link">길찾기</a>
      </div>
    </div>
  `;
  document.getElementById('kakaoMapLink').href = map.mapLink;
  document.getElementById('naverMapLink').href = `https://map.naver.com/p/search/${encodeURIComponent(wedding.address)}`;
}

function bindCopyAddress() {
  const button = document.getElementById('copyAddressBtn');
  const address = inviteData.wedding.address;

  button.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(address);
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

function renderGallery() {
  const galleryGrid = document.getElementById('galleryGrid');

  galleryGrid.innerHTML = inviteData.gallery
    .map(
      (image, index) => `
        <button class="gallery-item" type="button" data-image="${image.src}" aria-label="갤러리 이미지 ${index + 1} 열기">
          <img src="${image.src}" alt="${escapeHtml(image.alt)}" />
        </button>
      `,
    )
    .join('');
}

function renderContacts() {
  const { groom, bride } = inviteData.couple;
  document.getElementById('contactGrid').innerHTML = `
    <div class="info-card">
      <span class="info-role">신랑</span>
      <strong>${escapeHtml(groom.name)}</strong>
      <a href="tel:${escapeHtml(groom.phone)}">${escapeHtml(groom.phone)}</a>
    </div>
    <div class="info-card">
      <span class="info-role">신부</span>
      <strong>${escapeHtml(bride.name)}</strong>
      <a href="tel:${escapeHtml(bride.phone)}">${escapeHtml(bride.phone)}</a>
    </div>
  `;

  document.getElementById('parentContactGrid').innerHTML = `
    <div class="info-card">
      <span class="info-role">신랑 아버지</span>
      <strong>${escapeHtml(groom.father)}</strong>
      <a href="tel:${escapeHtml(groom.fatherPhone)}">${escapeHtml(groom.fatherPhone)}</a>
    </div>
    <div class="info-card">
      <span class="info-role">신랑 어머니</span>
      <strong>${escapeHtml(groom.mother)}</strong>
      <a href="tel:${escapeHtml(groom.motherPhone)}">${escapeHtml(groom.motherPhone)}</a>
    </div>
    <div class="info-card">
      <span class="info-role">신부 아버지</span>
      <strong>${escapeHtml(bride.father)}</strong>
      <a href="tel:${escapeHtml(bride.fatherPhone)}">${escapeHtml(bride.fatherPhone)}</a>
    </div>
    <div class="info-card">
      <span class="info-role">신부 어머니</span>
      <strong>${escapeHtml(bride.mother)}</strong>
      <a href="tel:${escapeHtml(bride.motherPhone)}">${escapeHtml(bride.motherPhone)}</a>
    </div>
  `;
}

function renderAccounts() {
  document.getElementById('accountGrid').innerHTML = inviteData.accounts
    .map(
      (account, index) => `
        <div class="info-card is-copyable" data-copy-value="${escapeHtml(account.copyValue || `${account.bank} ${account.holder}`)}" data-account-index="${index}">
          <span class="info-role">${escapeHtml(account.label)}</span>
          <strong>${escapeHtml(account.bank)}</strong>
          <p>${escapeHtml(account.holder)}</p>
          <span class="info-card-hint">눌러서 계좌 복사</span>
        </div>
      `,
    )
    .join('');
}

function bindAccountCopy() {
  document.querySelectorAll('#accountGrid .info-card.is-copyable').forEach((card) => {
    card.addEventListener('click', async () => {
      const value = card.dataset.copyValue;
      if (!value) return;

      try {
        await navigator.clipboard.writeText(value);
        const hint = card.querySelector('.info-card-hint');
        const original = hint ? hint.textContent : '';
        card.classList.add('copy-success');
        if (hint) hint.textContent = '복사 완료';
        setTimeout(() => {
          card.classList.remove('copy-success');
          if (hint) hint.textContent = original || '눌러서 계좌 복사';
        }, 1600);
      } catch (error) {
        const hint = card.querySelector('.info-card-hint');
        const original = hint ? hint.textContent : '';
        if (hint) hint.textContent = '복사 실패';
        setTimeout(() => {
          if (hint) hint.textContent = original || '눌러서 계좌 복사';
        }, 1600);
      }
    });
  });
}

function renderGuestbook() {
  const guestbook = inviteData.guestbook;
  const list = document.getElementById('guestbookList');

  list.innerHTML = guestbook.entries
    .map(
      (entry) => `
        <div class="info-card">
          <span class="info-role">${escapeHtml(entry.name)}</span>
          <p>${escapeHtml(entry.message)}</p>
        </div>
      `,
    )
    .join('');
}

function renderAttendance() {
  const attendance = inviteData.attendance;
  const list = document.getElementById('attendanceList');

  list.innerHTML = attendance.responses
    .map(
      (entry) => `
        <div class="info-card">
          <span class="info-role">${escapeHtml(entry.name)} · ${escapeHtml(entry.side)}</span>
          <strong>${entry.attending ? '참석' : '불참'}</strong>
          <p>동반 인원: ${escapeHtml(entry.companions)}</p>
          <p>${escapeHtml(entry.note || '')}</p>
        </div>
      `,
    )
    .join('');
}

function downloadJson(filename, data) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

function buildIssueUrl(title, body, labels) {
  const url = new URL('https://github.com/rumblebot-0318/reki318-wedding-invite-vanillajs/issues/new');
  url.searchParams.set('title', title);
  url.searchParams.set('body', body);
  url.searchParams.set('labels', labels.join(','));
  return url.toString();
}

function bindModalForms() {
  const guestbookModal = document.getElementById('guestbookModal');
  const attendanceModal = document.getElementById('attendanceModal');
  const guestbookForm = document.getElementById('guestbookForm');
  const attendanceForm = document.getElementById('attendanceForm');

  const openModal = (modal) => {
    modal.hidden = false;
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('lightbox-open');
  };

  const closeModal = (modal) => {
    modal.hidden = true;
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('lightbox-open');
  };

  document.getElementById('openGuestbookModal').addEventListener('click', () => openModal(guestbookModal));
  document.getElementById('openAttendanceModal').addEventListener('click', () => openModal(attendanceModal));

  document.querySelectorAll('[data-close-modal]').forEach((button) => {
    button.addEventListener('click', () => {
      const modal = document.getElementById(button.dataset.closeModal);
      closeModal(modal);
    });
  });

  [guestbookModal, attendanceModal].forEach((modal) => {
    modal.addEventListener('click', (event) => {
      if (event.target === modal) closeModal(modal);
    });
  });

  guestbookForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const name = document.getElementById('guestbookName').value;
    const message = document.getElementById('guestbookMessage').value;
    const body = `### Name\n${name}\n\n### Message\n${message}`;
    window.open(buildIssueUrl(`[guestbook] ${name}`, body, ['guestbook']), '_blank', 'noopener,noreferrer');
    guestbookForm.reset();
    closeModal(guestbookModal);
  });

  attendanceForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const name = document.getElementById('attendanceName').value;
    const side = document.getElementById('attendanceSide').value;
    const status = document.getElementById('attendanceStatus').value === 'true' ? '참석' : '불참';
    const companions = document.getElementById('attendanceCompanions').value || '0';
    const note = document.getElementById('attendanceNote').value;
    const body = `### Name\n${name}\n\n### Side\n${side}\n\n### Attendance\n${status}\n\n### Number of companions\n${companions}\n\n### Note\n${note}`;
    window.open(buildIssueUrl(`[rsvp] ${name}`, body, ['rsvp']), '_blank', 'noopener,noreferrer');
    attendanceForm.reset();
    closeModal(attendanceModal);
  });

  window.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    if (!guestbookModal.hidden) closeModal(guestbookModal);
    if (!attendanceModal.hidden) closeModal(attendanceModal);
  });
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

async function init() {
  await loadData();
  renderMeta();
  renderHero();
  renderInvitation();
  renderLocation();
  renderCalendar(document.getElementById('calendar'), weddingDate);
  renderGallery();
  renderGuestbook();
  renderAttendance();
  renderContacts();
  renderAccounts();
  updateCountdown();
  bindCopyAddress();
  bindGallery();
  bindAccountCopy();
  bindModalForms();
  bindRevealAnimation();
  setInterval(updateCountdown, 1000);
}

window.addEventListener('DOMContentLoaded', () => {
  init().catch((error) => {
    console.error('Failed to initialize invitation page:', error);
  });
});

const weddingDate = new Date('2026-11-21T12:00:00+09:00');
const venue = {
  name: '더화이트베일',
  address: '서울 서초구 서초중앙로 14',
  lat: 37.491742,
  lng: 127.007709,
};

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

  weekdays.forEach((day) => {
    cells.push(`<div class="calendar-cell weekday">${day}</div>`);
  });

  for (let i = 0; i < totalCells; i += 1) {
    let dayNumber;
    let classes = 'calendar-cell day';

    if (i < leading) {
      dayNumber = prevLastDay - leading + i + 1;
      classes += ' is-muted';
    } else if (i >= leading + totalDays) {
      dayNumber = i - (leading + totalDays) + 1;
      classes += ' is-muted';
    } else {
      dayNumber = i - leading + 1;
      if (dayNumber === date.getDate()) {
        classes += ' is-wedding-day';
      }
    }

    cells.push(`<div class="${classes}">${dayNumber}</div>`);
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
    ddayCopy.textContent = '송명진 · 한근희의 결혼식 날입니다. 함께 축복해 주세요.';
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
  ddayCopy.textContent = `송명진 · 한근희의 결혼식까지 ${days}일 남았습니다.`;
}

function bindCopyAddress() {
  const button = document.getElementById('copyAddressBtn');

  button.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(venue.address);
      const original = button.textContent;
      button.textContent = '주소가 복사됐어요';
      setTimeout(() => {
        button.textContent = original;
      }, 1800);
    } catch (error) {
      button.textContent = '복사 실패';
      setTimeout(() => {
        button.textContent = '주소 복사';
      }, 1800);
    }
  });
}

function showStaticMapFallback() {
  const map = document.getElementById('map');
  const note = document.getElementById('mapFallbackNote');
  map.innerHTML = `
    <a href="https://map.kakao.com/link/search/${encodeURIComponent(venue.address)}" target="_blank" rel="noreferrer" style="display:block;width:100%;height:100%;text-decoration:none;color:inherit;position:relative;">
      <img src="https://map2.daum.net/map/mapservice?FORMAT=PNG&SCALE=2.5&MX=${venue.lng}&MY=${venue.lat}&S=0.011&IW=600&IH=400&LANG=0" alt="${venue.name} 정적 지도" style="width:100%;height:100%;object-fit:cover;" />
      <div style="position:absolute;left:16px;bottom:16px;background:rgba(255,251,247,0.92);padding:10px 12px;border-radius:14px;font-size:13px;line-height:1.5;box-shadow:0 10px 18px rgba(0,0,0,0.12);">
        <strong style="display:block;">${venue.name}</strong>
        <span>${venue.address}</span>
      </div>
    </a>
  `;
  note.hidden = false;
}

function initMap() {
  const start = () => {
    try {
      const container = document.getElementById('map');
      const options = {
        center: new kakao.maps.LatLng(venue.lat, venue.lng),
        level: 3,
      };

      const map = new kakao.maps.Map(container, options);
      const markerPosition = new kakao.maps.LatLng(venue.lat, venue.lng);
      const marker = new kakao.maps.Marker({ position: markerPosition });
      marker.setMap(map);

      const infoWindow = new kakao.maps.InfoWindow({
        content: `<div style="padding:10px 12px;font-size:12px;color:#2b3530;">${venue.name}<br />${venue.address}</div>`,
      });

      infoWindow.open(map, marker);
    } catch (error) {
      showStaticMapFallback();
    }
  };

  if (window.kakao && window.kakao.maps) {
    window.kakao.maps.load(start);
  } else {
    showStaticMapFallback();
  }
}

function bindGallery() {
  const lightbox = document.getElementById('lightbox');
  const lightboxImage = document.getElementById('lightboxImage');
  const closeButton = document.getElementById('lightboxClose');
  const items = document.querySelectorAll('.gallery-item');

  const close = () => {
    lightbox.hidden = true;
    lightboxImage.src = '';
  };

  items.forEach((item) => {
    item.addEventListener('click', () => {
      lightboxImage.src = item.dataset.image;
      lightbox.hidden = false;
    });
  });

  closeButton.addEventListener('click', close);
  lightbox.addEventListener('click', (event) => {
    if (event.target === lightbox) {
      close();
    }
  });
}

window.addEventListener('DOMContentLoaded', () => {
  renderCalendar(document.getElementById('calendar'), weddingDate);
  updateCountdown();
  bindCopyAddress();
  initMap();
  bindGallery();
  setInterval(updateCountdown, 1000);
});

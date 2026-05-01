# reki318-wedding-invite-vanillajs

바닐라 HTML/CSS/JavaScript로 다시 만든 모바일 청첩장 페이지입니다.

## 포함 내용

- 모바일 퍼스트 싱글 페이지
- `mock-data.json` 기반 데이터 렌더링
- 재사용 가능한 JavaScript 달력 렌더링
- 카운트다운 표시
- 이미지형 카카오 지도 표시
- 주소 복사 / 외부 지도 링크
- 워터마크 및 copyright 섹션 제거
- GitHub Issues + Actions 기반 방명록 / RSVP 동기화 구조

## GitHub Issues + Actions 흐름

- 사용자가 페이지에서 방명록/RSVP 폼 제출
- GitHub Issue 생성 페이지로 이동
- 저장소의 issue template + label 사용
- GitHub Actions가 issue 내용을 읽어 `data/guestbook.json`, `data/rsvp.json`에 반영
- GitHub Pages가 해당 JSON을 다시 읽어 화면에 표시

## 실행 방법

정적 파일이라서 아무 간단한 서버로 열면 됩니다.

예시:

```bash
python -m http.server 8080
```

그 다음 브라우저에서 `http://localhost:8080` 접속.

## 파일 구조

- `index.html` : 마크업
- `styles.css` : 스타일
- `script.js` : 달력 / 카운트다운 / 지도 / 복사 기능

## 메모

- 카카오맵 SDK 키는 현재 요청값으로 포함되어 있습니다.
- 장소 좌표는 더화이트베일 기준으로 반영했습니다.

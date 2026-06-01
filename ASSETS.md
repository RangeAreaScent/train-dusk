# Train Dusk — Asset Spec

라이언님이 직접 그리시는 그림들의 사양과 체크리스트입니다. 코드는 모두 준비되어 있어서 `public/assets/visuals/<id>.png` 같은 경로에 파일을 떨어뜨리기만 하면 자동으로 게임에 반영됩니다.

---

## 1. 화면 구성

게임 카드는 **5:8 세로 비율**, 최대 높이 860px (모바일에서는 화면 95vh).

```
┌─────────────────┐ ← width  = height × 5/8 (≈ 537px @ 860 tall)
│                 │
│   VISUAL AREA   │ ← height = 카드 높이의 50% (≈ 430px)
│   (4:3)         │
│                 │
├─────────────────┤
│ [노트] [설정]    │ ← header (auto)
├─────────────────┤
│                 │
│   BODY TEXT     │
│                 │
└─────────────────┘
```

**Visual area 실측 비율**: 약 537 × 430 (5:4). 게임 가이드는 4:3을 명시하므로 `4:3` 기준으로 그리시면 위아래 살짝 잘릴 수 있음 (대상이 중앙에 오게).

---

## 2. 파일 경로 & 형식

| 종류 | 경로 | 포맷 | 권장 크기 (1x) | 고해상도 (2x) |
|---|---|---|---|---|
| 일반 비주얼 | `public/assets/visuals/<id>.png` | PNG | **1080 × 810** (4:3) | 2160 × 1620 |
| 컷씬 | `public/assets/cutscenes/<id>.png` | PNG | **540 × 860** (5:8) | 1080 × 1720 |
| 팝업 (코너 아이콘) | `public/assets/popups/<id>.png` | PNG (투명) | **128 × 128** | 256 × 256 |
| 엔딩 비주얼 | `public/assets/visuals/ending_<A\|B\|C\|D>.png` | PNG | **1080 × 810** (4:3) | 2160 × 1620 |
| 타이틀 로고 | `public/assets/visuals/title_logo.png` | PNG | **1080 × 810** | 2160 × 1620 |

### 픽셀 아트로 가실 경우
- 네이티브 해상도로 그리고 (예: 240×180), CSS에서 `image-rendering: pixelated`로 확대됩니다 (`VisualArea`에서 자동 적용 예정)
- 권장 네이티브: **256 × 192** (4:3, DS 미학) 또는 **160 × 120**
- 팩스/디더 1-bit 흑백 톤이 README의 톤 가이드

### 픽셀 아트가 아닐 경우
- 1080×810 (4:3) 위에서 직접 그리기
- 흑백 / 그레이스케일 / 1-bit 디더 어느 쪽이든 OK

---

## 3. 파일 이름 체크리스트

게임에서 참조하는 ID들. **파일명은 ID 뒤에 `.png` 만 붙이면 됨.** 없으면 자동으로 placeholder가 깔립니다.

### 일반 비주얼 (25개) — `public/assets/visuals/`
```
[ ] title_logo.png
[ ] black_screen.png
[ ] window_dark.png

[ ] car_1_wide.png

[ ] car_2_wide.png
[ ] car_2_passage.png
[ ] car_2_seat_close.png
[ ] car_2_button_close.png

[ ] car_3_wide.png
[ ] car_3_seat_close.png
[ ] car_3_intercom_close.png

[ ] car_4_wide.png
[ ] car_4_wide_with_friend.png
[ ] car_4_passage.png
[ ] car_4_intercom_close.png

[ ] car_5_default.png
[ ] car_5_quiet.png
[ ] car_5_with_friend.png
[ ] car_5_with_people.png

[ ] conductor_car.png
[ ] conductor_back_view.png
[ ] conductor_back_close.png
[ ] friend_close.png
```

### 엔딩 비주얼 (4개) — `public/assets/visuals/`
```
[ ] ending_A.png    — 확신 / Certainty
[ ] ending_B.png    — 동행 / Companion
[ ] ending_C.png    — 거울 / Mirror
[ ] ending_D.png    — 각성 / Awakening
```

### 컷씬 (13개) — `public/assets/cutscenes/`
```
[ ] cutscene_phones.png             — 모두의 핸드폰에 같은 사진
[ ] cutscene_all_smile.png          — 모든 승객의 광기 어린 미소
[ ] cutscene_friend_appears.png     — 친구 첫 등장
[ ] cutscene_friend_hand.png        — 친구가 손 내밂
[ ] cutscene_friend_lowers_hand.png — 친구가 손을 내림
[ ] cutscene_friend_behind.png      — 친구가 가족 뒤에 보임 (엔딩 D)
[ ] cutscene_faded_photo.png        — 빛바랜 사진
[ ] cutscene_two_seated.png         — 둘이 나란히 앉음 (한 프레임만 비어 있음)
[ ] cutscene_conductor_turns.png    — 차장이 돌아본 얼굴 (본인 얼굴)
[ ] cutscene_viewpoint_shift.png    — 차장 1인칭 시점 전환
[ ] cutscene_hospital_family.png    — 병실에 둘러싼 가족
[ ] cutscene_zoom_out.png           — 병실이 좌석으로 변형
[ ] white_ceiling.png               — 흰 천장 (엔딩 D 시작)
```

### 팝업 (7개) — `public/assets/popups/`
오른쪽 상단 작은 아이콘. 투명 배경 PNG.
```
[ ] bag_open.png          — 열린 가방
[ ] phone_locked.png      — 잠긴 핸드폰
[ ] phone_unlocked.png    — 잠금 풀린 핸드폰
[ ] intercom.png          — 인터폰
[ ] emergency_button.png  — 비상 정지 버튼
[ ] seat_trace.png        — 빈 좌석 흔적
[ ] torn_paper.png        — 찢어진 쪽지
```

---

## 4. 톤 가이드 요약 (README에서)

- **1-bit 흑백** (또는 짙은 그레이스케일)
- DS 시절 미니멀한 픽셀아트 *또는* 손그림/콜라주 — 라이언님 선택
- **차분하고 외로운** 분위기. 명도 대비를 강하게 쓰지 말 것
- 인물은 **얼굴이 흐릿하거나 표정이 비어 있는** 톤 (관 뒷모습 등)
- 컷씬은 **단일 강한 이미지**, 텍스트로 보완

---

## 5. 워크플로

1. **하나 그릴 때마다** 해당 경로에 떨어뜨리고 dev 서버에서 바로 확인 가능
2. 파일이 없으면 placeholder (몹쓸 회색 박스) — 게임은 멈추지 않음
3. **권장 작업 순서**:
   1. `title_logo` (첫 인상)
   2. `car_1_wide` → `car_2_wide` → ... → `car_5_*` (씬 본 비주얼들)
   3. `ending_A/B/C/D` (엔딩 카드 배경)
   4. 팝업 7개 (작아서 빠름)
   5. 컷씬 (가장 시간 많이 듦, 마지막에)

---

## 6. 참고

- 모든 파일은 `public/` 안에 두어야 Vite가 빌드에 포함합니다
- 파일명에 공백·한글 금지 (위 ID 그대로 사용)
- 16:9이나 다른 비율로 그리신 게 있으면 알려주세요 — 코드 쪽에서 비율 조정 가능합니다

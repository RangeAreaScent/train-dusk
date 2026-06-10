# Train Dusk — Asset Spec (Minimum Set)

라이언님이 직접 그리시는 그림의 최소 세트입니다. 자동 대체 시스템이 작동해서, 누락된 자산은 다른 자산으로 대체되거나 placeholder가 표시됩니다.

---

## 화면 구성

게임 카드는 **5:8 세로 비율**, 최대 높이 860px.

```
┌─────────────────┐
│                 │
│   VISUAL AREA   │  4:3 영역
│                 │
├─────────────────┤
│ [노트] [설정]   │
├─────────────────┤
│   BODY TEXT     │
└─────────────────┘
```

---

## 파일 경로 & 권장 크기

| 종류 | 경로 | 권장 (1x) | 2x |
|---|---|---|---|
| 일반 비주얼 | `public/assets/visuals/<id>.png` | **1080 × 810** (4:3) | 2160 × 1620 |
| 컷씬 | `public/assets/cutscenes/<id>.png` | **540 × 860** (5:8) | 1080 × 1720 |
| 팝업 | `public/assets/popups/<id>.png` | **128 × 128** | 256 × 256 |

픽셀아트로 가실 경우 네이티브 256×192 (4:3) 권장. CSS에서 `image-rendering: pixelated`로 자동 확대됨.

---

## 🎯 Tier A — 12장 (출시 가능 최소)

라이언님이 추가로 그리실 것: **딱 2장** (`car_3_wide`, `cutscene_zoom_out`).  
나머지 10장은 이미 완료. ✅

```
[✅] title_logo.png            — 타이틀
[✅] car_1_wide.png            — 1번 칸 와이드
[✅] car_2_wide.png            — 2번 칸 와이드
[ ] car_3_wide.png             — 3번 칸 와이드 ← 추가 필요
[✅] car_4_wide.png            — 4번 칸 와이드
[✅] car_5_default.png         — 5번 칸 / B·C 엔딩 배경
[✅] car_5_quiet.png           — D 엔딩 배경
[✅] car_5_with_people.png     — A 엔딩 중반 (승객 등장)
[✅] passage.png               — 통로 (2번 칸 진입)
[✅] passage2.png              — 통로 (4번 칸 진입)
[✅] car_2_seat_close.png      — 좌석 디테일
[✅] car_3_seat_close.png      — 좌석 디테일
[ ] cutscenes/cutscene_zoom_out.png — D 엔딩 마무리 컷 ← 추가 필요
```

### 자동 대체 (코드가 처리)
- `ending_A.png` 없음 → `car_5_with_people.png` 사용
- `ending_B.png` 없음 → `car_5_default.png` 사용
- `ending_C.png` 없음 → `car_5_default.png` 사용
- `ending_D.png` 없음 → `car_5_quiet.png` 사용
- 팝업 누락 → 텍스트 라벨 표시
- 그 외 누락 → 회색 디더 패턴 + ID 표시

---

## 🌫️ Tier B — 분위기 깊게 (나중에 추가)

여유 생기시면 그리시면 자동으로 게임에 반영됨. 코드 변경 불필요.

```
[ ] friend_close.png           — B 엔딩 그녀의 얼굴
[ ] conductor_back_view.png    — C 엔딩 차장 뒷모습
[ ] car_5_with_friend.png      — B 엔딩 배경 (그녀와 함께)
[ ] cutscenes/cutscene_all_smile.png        — A 클라이맥스 (광기 어린 미소)
[ ] cutscenes/cutscene_friend_appears.png   — B 친구 첫 등장
[ ] cutscenes/cutscene_conductor_turns.png  — C 차장이 돌아본 얼굴
[ ] cutscenes/cutscene_hospital_family.png  — D 가족 컷
```

---

## 그림 가이드 (라이언님 톤 참고)

### 그릴 때 핵심 톤
- **1-bit 흑백** 또는 짙은 그레이스케일
- **DS 시절 미니멀한 픽셀아트** 또는 라이언님 스타일
- **차분하고 외로운** 분위기. 명도 대비 강하게 쓰지 않기
- 인물은 **얼굴이 흐릿하거나 표정이 비어 있는** 톤
- 컷씬은 **단일 강한 이미지** + 텍스트로 보완

### `car_3_wide` 가이드 (남은 와이드)
- 1번·2번·4번 칸과 같은 톤
- 좌석 등받이에 **번호판/날짜판**이 보이는 디테일 (스토리 핵심)
- 등받이가 살짝 정면에서 보이는 각도면 좋음

### `cutscene_zoom_out` 가이드 (D 마무리, 가장 중요)
- **5:8 비율**, 풀스크린
- 카메라가 통로를 뒤로 빠지며, 멀리 한 칸 안에 **병실 장면이 좌석 위에 펼쳐져 있는** 모습
- 양옆엔 **끝없이 늘어선 다른 칸들** (반복되는 통로의 깊이감)
- 통로 끝에 주인공 의식의 실루엣 (또는 1인칭 카메라 위치)
- **알지만 머문다**의 시각적 응축

---

## 워크플로

1. 그리신 그림을 해당 경로에 그대로 떨어뜨리면 즉시 반영
2. dev 서버 실행 중이면 자동 hot-reload
3. 라이브 (Vercel)에 push되면 자동 배포

파일명에 공백·한글 금지. 위 ID 그대로 사용.

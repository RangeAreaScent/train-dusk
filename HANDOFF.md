# Train Dusk — Session Handoff

문서 작성: 이 핸드오프는 진행 중인 협업의 상태를 다음 세션 (또는 새 Claude 인스턴스)으로 이어주기 위해 만들어졌습니다.

---

## 1. 프로젝트 한 줄

> **Train Dusk** — 1-bit 흑백 미학의 한 회차 ~20분 분량 단편 비주얼 노벨. 4 엔딩, 다회차 선형 구조. 코스믹 호러 + 외로움 + 부정.

라이언님(주인공·작가)이 그림·이야기 결정권을 가지며, Claude가 엔진·텍스트 초안·인프라를 담당.

---

## 2. 현재 상태 (요약)

### ✅ 완료
- 엔진: Vite + React 19 + TS + Tailwind v4 + Framer Motion
- 폴딩 핸드헬드 셸 (DS 영감), 검정 / 그레이(GameBoy DMG) 테마, 흰 / 크림 종이 테마
- 씬 엔진: 페이지네이션, ▶ 클릭 advance, 선택지 팝업, 비주얼 클릭 텍스트 스킵/페이지 넘기기
- 자동 저장 (localStorage), 회차 메타 (`trainDusk_meta`), Prefs (`trainDusk_pref`)
- 4 엔딩 시퀀스 도달, **선형 다회차 라우팅** (Run 1→A, 2→C, 3→B, 4→D)
- 잔상 시스템 (A·C·B 엔딩 카드 직전 2~3줄 인-픽션 텍스트)
- 노트 추론 보드 (단서 + 통찰 + 무효 연결 랜덤 풀) — **플로팅 팝업 피드백**으로 재설계
- 합성 사운드: Web Audio **oscillator + pitch drop** 타이핑 클릭 (triangle wave, "thock" 느낌)
- BGM (메인 + 엔딩): 자동 트랙 스위치, **첫 엔딩 씬부터 엔딩 음악**, 앱 백그라운드 시 일시정지
- PNG export + URL 공유 (`?ending=A&run=3`)
- 인트로 콜드 오픈 ("어둠 / 박자 / TRAIN DUSK") + 회차별 깨어남 변주
- 전체 텍스트 dense prose 톤으로 통일 (38+ 씬 갱신)
- **힌지 재설계**: TRAIN·DUSK 좌측 / 버튼 2개 우측 동일 크기 / 스피커 도트 제거
- **설정 패널**: 인라인 행 레이아웃, 항상 보이는 스크롤바
- **캐릭터 오버레이 시스템**: `overlay` / `overlayLeft` / `overlayRight` 필드
- **재방문 씬 스킵**: 이미 본 씬은 타이핑 스킵 (choicesReady는 건드리지 않음 — 멀티페이지 고착 버그 방지)
- VisualArea `object-contain` + Placeholder fallback 체인
- `cutscene_faded_photo` — 프로시저럴 Canvas 생성 (aged paper + ghost silhouettes + grain)

### 에셋 연결 완료
- `window_reflection.png` → `car_1_window` 씬
- `emergency_panel.png` → `car_2_button`, `car_3_intercom` 씬
- `conductor_car.png`, `conductor_back_view.png` → C 엔딩 씬
- `cutscene_zoom_out.png` → D 엔딩 최종 컷씬
- A 엔딩 phones 컷씬 + smile 씬 연결

### ❌ 남은 에셋 (라이언님 작업, 우선순위 순)

| 파일명 | 위치 | 영향 씬 수 | 비고 |
|---|---|---|---|
| `car_3_wide.png` | visuals/ | **6개** | car_3 전체 배경, 최우선 |
| `window_dark.png` | visuals/ | 2개 | car_3_window, car_4_window |
| `car_4_intercom_close.png` | visuals/ | 1개 | car_4 인터컴 씬 |
| `car_4_wide_with_friend.png` | visuals/ | 1개 | car_4 친구 등장 |
| `cutscene_friend_hand.png` | cutscenes/ | 1개 | B 엔딩 |
| `cutscene_friend_lowers_hand.png` | cutscenes/ | 1개 | B 엔딩 |
| `white_ceiling.png` | visuals/ | 1개 | D 엔딩 |

### ❌ 남은 코드 작업
- **마이너 씬 톤 통일** (whisper/window/button/leave/sit 류 — 인터럽트성 ~15개)
- **풀 플레이 검증** — Run 1~4 끝까지 굴려서 깨진 데 없는지
- **타이핑 사운드 실기기 확인** — 라이언님이 새 oscillator 사운드 직접 확인 아직 안 함
- **Phase 10~12 Tauri + Steam** (콘텐츠 완성 후)

---

## 3. 서사 핵심 (절대 잊으면 안 됨)

### 주인공 = 외과의 (미국, 잠정)
- 한때 무언가가 될 수 있었던 사람. 직업을 *그대로* 수행하면서도 *어딘가에서 자기 자신을 묻은 자*.
- 3년 전 — 3월 15일 — 한 환자를 잃었다. 생존율 낮은 큰 수술. **그가 끝까지 자기가 집도하기로 했다.** 큰 실수는 없었다. 그러나 그녀는 깨어나지 못했다.
- 그 후 3년, *표류*. 출근은 했다. 차트는 썼다. 그러나 자신에게서 점점 빠져나갔다. 어느 날 사고/무너짐/부주의로 코마.

### 그녀 = 친구의 아내
- 한때 셋이 가까웠다. 친구가 먼저 갔다. 친구의 마지막 문자: *"...그녀를 부탁한다."*
- 그와 그녀, 둘 다 서로의 감정을 알았지만 — 둘 다 서로가 친구를 떠올리게 한다는 것을 알았기에 — 둘 다 자기 감정을 죽였다. *상호 침묵, 상호 존중*.
- 그녀가 진단을 받았을 때 그가 자기 분야였다. *친구에게 한 약속을 지키기 위해서도. 그녀를 살리기 위해서도. 두 마음이 분리될 수 없었다.* 그가 끝까지 자기가 수술하겠다고 했다.
- 그녀는 그의 손 아래에서 깨어나지 못했다.

### 친구 — 게임에 *이름이 한 번도 안 나옴*
- 그러나 모든 곳에 그림자로 존재. *잔상의 식탁*, *셋이 같이 있던 일요일 저녁*, *카드 글씨*, *어머니의 호칭*, *형의 눈빛*에. 분산된 부재.

### 꿈 (열차)
- 그녀가 살아 있다. 친구의 죽음도, 그녀의 죽음도, 자기 표류도 — 없는 일.
- *가장 견딜 수 없는 진실을 가장 부드럽게 풀어낸 형태의 거짓.*

### 4 엔딩 = Bardo 단계
- **A (확신, Run 1)**: 부정. 광기 어린 미소의 승객들과 함께 웃기로 함.
- **C (거울, Run 2)**: 직시 (고립). 차장 = 자기 자신. 갇혀 있음의 자각.
- **B (동행, Run 3)**: 위로 속 거짓. 그녀와 영원히 — 환영인 줄 알면서도.
- **D (각성, Run 4)**: 진정한 트위스트. *알지만 머문다*. 깨어남 = 그녀가 가족 뒤에 서 있다 = 그녀가 거기 있을 리 없다 = 이게 진짜 깨어남인지조차 알 수 없다. *답은 주어지지 않는다.*

### 핵심 톤 원칙
1. **묘사로 자각이 일어나게** (직접 서술 X). 몸이 먼저 안다, 정신은 늦게 따라온다.
2. **빈 줄 제거**, dense prose. 한 문장 안에 여러 박자.
3. **이름 안 부름** — 그녀, 친구, 환자, 그 사람 모두 직접 이름 X.
4. **회차마다 같은 자리, 다른 무게**. 텍스트 변주(`variants.runN`)로 깊이 변화.

---

## 4. 기술 스택 / 아키텍처

```
src/
  engine/
    types.ts         — Scene, Choice, GameState, EndingId 등 타입
    state.ts         — initialState, applyChoice, save/load/Prefs, statePrefs 헬퍼
    scenes.ts        — getScene, resolveBranches, endingForRun, ENDING_INTROS
  ui/
    SceneView.tsx    — 핵심 씬 렌더 + 라우팅 + 팝업 + 잔상
    GameFrame.tsx    — 폴딩 셸 (검정/그레이, 흰/크림)
    TypedText.tsx    — 타이핑 효과 (▶ 인디케이터 + forceComplete 외부 트리거)
    VisualArea.tsx   — 비주얼 이미지 + overlay/overlayLeft/overlayRight + PROCEDURAL_VISUALS
    Choices.tsx, EndingCard.tsx
    NotesPanel.tsx   — 단서 카드 스크롤 + 플로팅 팝업 피드백
    SettingsPanel.tsx
  audio/
    typewriter.ts    — oscillator(triangle) + pitch drop + noise transient
    music.ts         — 메인/엔딩 트랙 매니저 (visibilitychange 일시정지 포함)
  platform/
    share.ts         — PNG export + URL 공유
  data/
    scenes.json      — 본편 씬 (car_1~4 + title/prologue + settings_menu 합성)
    endings.json     — 엔딩 시퀀스 (A·B·C·D)
    clues.json       — 단서 (회차별 noteEntry)
    connections.json — 통찰 unlock 규칙 + 무효 메시지 풀
    characters.json  — 캐릭터 시트 (현재 거의 미사용)
    config.json      — UI/typography/textSpeed/colors

public/
  audio/
    main_theme.m4a   — AAC 96k mono, ~1.9 MB
    ending_theme.m4a — AAC 96k mono, 60s, fade-out, ~729 KB
  assets/
    visuals/         — 씬 배경 이미지 (일부 누락 → Placeholder 자동 표시)
    cutscenes/       — 컷씬 이미지
    characters/      — 캐릭터 스프라이트 (overlay 시스템용)
    popups/          — 전부 텍스트 fallback (그릴 필요 X)
```

### 엔진 핵심 로직
- **선형 라우팅**: `endingForRun(runCount)` + `ENDING_INTROS` 셋. car_4 종료 시점에서 runCount 기반 override.
- **분기 라우터** (`car_3_branch_check`, `car_4_routing`, `car_4_final_branch`): `resolveBranches` 가 *default* 가지로만 흘려보냄 (조건 평가 죽었어도 데드락 안 됨).
- **재방문 씬**: `viewedScenes` 배열에 있으면 `textDone=true`, `forceTextComplete=true` → 타이핑 스킵. `choicesReady`는 항상 `false`로 초기화 — 멀티페이지 씬에서 ▶가 사라지는 버그 방지.
- **비주얼 클릭**: 텍스트 미완료 시 → `forceTextComplete=true`. 텍스트 완료 + choicesReady 미완료 시 → `handleAdvance()`.
- **자동 저장**: scene 변경 시. `title_screen`/`settings_menu`/엔딩 카드는 skip.
- **엔딩 음악**: `scene.id.startsWith("end")` 이면 ending track 전환 (카드 직전 잔상 씬부터 음악 바뀜).
- **공유 URL 모드**: `?ending=X` 진입 시 `flags.viewingShared=true` 세트, 메타·저장 안 건드림.
- **캐릭터 오버레이**: VisualArea에서 `overlay` (중앙), `overlayLeft`, `overlayRight` 필드로 스프라이트 bottom-anchor 렌더.
- **프로시저럴 비주얼**: `PROCEDURAL_VISUALS` 레지스트리 — `cutscene_faded_photo` → `FadedPhoto` 캔버스 컴포넌트.

### 데이터 흐름 특이점
- `prologue`는 Run 1 base text를 가지고 있고, `variants.run2/3/4.replace`로 회차마다 교체.
- 잔상 씬 (`endA_afterimage` 등)은 각 엔딩 시퀀스의 카드 직전에 들어감.
- `name_input` 씬은 데이터에는 남아 있지만 *어디서도 안 가짐* (title_screen에서 prologue로 직접).

---

## 5. 라이언님 작업 흐름 / 선호

- 단호하지만 친절한 톤. "도전적으로", "수정 필요한 부분 있으면", "톤이 너무 ___" 같은 피드백 직접적.
- *데이터 작업과 글쓰기는 Claude가 초안 → 라이언님이 톤 결정 → Claude가 적용* 패턴.
- *코드/엔진 작업은 Claude가 단독* — 엔진 디테일은 안 보이는 곳에서 처리.
- 매 커밋 후 *간략한 요약*과 *다음 단계 옵션 1~3개* 제시 선호.
- Vercel 자동 배포되므로 push 후 *모바일/실기기에서 확인*하는 패턴.
- 한국어로 대화. 짧고 명확하게.

---

## 6. 알아두면 좋은 디테일

- **Git 컨벤션**: 메인 직접 push (사용자가 권한 줬음). 커밋 메시지는 *왜*를 짧게 + *무엇*을 길게.
- **빌드 검증**: 매 변경 후 `node -e "JSON.parse(...)"` + `npm run build` 일관 패턴.
- **검증 스크립트**: 4 Run 도달 가능성 확인하는 시뮬레이터 (필요 시 재작성).
- **이름 (플레이어)**: 데이터에서 placeholder로 안 쓰임. `state.playerName` 필드는 있되 비어 있어도 무방.
- **언어**: 한국어가 정본, 영어는 평행 번역. 톤은 한국어 기준으로 결정.
- **타이밍**: 텍스트 속도 normal = 80ms/char, fast = 55ms/char.

---

## 7. 다음 세션에서 시작하기 좋은 곳

1. **타이핑 사운드 실기기 확인** — 새 oscillator 사운드 라이언님이 아직 들어본 적 없음. 마음에 안 들면 조정
2. **car_3_wide.png 그리면 바로 연결** — 6개 씬 한 번에 해결됨, 가장 효과 큰 에셋
3. **풀 플레이 검증** — Run 1~4 끝까지 굴려서 누락·깨짐 확인
4. **마이너 씬 톤 통일** — whisper / window / leave 류 인터럽트 씬 (~15개)
5. **Phase 10~12 Tauri + Steam 출시 준비** (콘텐츠 완성 후)

---

## 8. 마지막 커밋 (작성 시점)

```
826d581 Assets: conductor visuals + procedural faded photo for endB_photo
47d9d04 Assets: emergency_panel.png for car_2_button + car_3_intercom scenes
cd484ff Fix: tapping visual area now advances pages and reveals choices
794057d Fix: revisited scenes no longer stuck — skip typing only, not choicesReady
3fbfc49 UI/Audio: hinge redesign, notes popup, text skip, bg audio pause
015ddb3 Audio: typewriter click 900-1200Hz lowpass, gain 0.22
fae7f4c Audio + Config: fast speed 40→55ms
5512d98 UI: settings panel redesign — inline rows, active underline+bold
92c4033 Engine: ending music triggers at first ending scene, not just card
d930852 Engine + Content: overlayLeft/Right for two-character scenes
```

전체 히스토리: `git log --oneline -50` 으로 확인.

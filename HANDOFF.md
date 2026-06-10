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
- 씬 엔진: 페이지네이션 (5줄 cap, 본문 영역 풀폭), ▶ 클릭 advance, 선택지 팝업, 본문 클릭 시 팝업 토글
- 자동 저장 (localStorage), 회차 메타 (`trainDusk_meta`), Prefs (`trainDusk_pref`)
- 4 엔딩 시퀀스 도달, **선형 다회차 라우팅** (Run 1→A, 2→C, 3→B, 4→D)
- 잔상 시스템 (A·C·B 엔딩 카드 직전 2~3줄 인-픽션 텍스트)
- 노트 추론 보드 (단서 + 통찰 + 무효 연결 랜덤 풀)
- 합성 사운드 (Web Audio 타이핑 클릭) + BGM (메인 + 엔딩, 자동 트랙 스위치)
- PNG export + URL 공유 (`?ending=A&run=3`)
- 인트로 콜드 오픈 ("어둠 / 박자 / TRAIN DUSK") + 회차별 깨어남 변주
- 이름 입력 제거 (직접 prologue로)
- 전체 텍스트 dense prose 톤으로 통일 (38+ 씬 갱신, 옛 staccato 스타일 제거)
- 자산 미니멈 (12장 필수, 자동 대체 체인) + ASSETS.md
- VisualArea `object-contain` (그림 전체 표시)

### ❌ 남은 것
- **마이너 씬 톤 통일** (whisper/window/button/leave/sit 류 — 인터럽트성)
- **에셋 작업** (라이언님 작업): `car_3_wide.png` + `cutscenes/cutscene_zoom_out.png`
- **Phase 10~12 Tauri + Steam** (콘텐츠 완성 후)
- 풀 플레이 검증 (4 엔딩 끝까지 굴려서 깨진 데 없는지)

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
    TypedText.tsx    — 타이핑 효과 (▶ 인디케이터 포함)
    Choices.tsx, NameInputField.tsx, EndingCard.tsx, NotesPanel.tsx, VisualArea.tsx
  audio/
    typewriter.ts    — 합성 키 클릭
    music.ts         — 메인/엔딩 트랙 매니저
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
    visuals/         — 12장 필수 (10장 완료, 2장 라이언님 진행 중)
    cutscenes/       — Tier B
    popups/          — 전부 텍스트 fallback (그릴 필요 X)
```

### 엔진 핵심 로직
- **선형 라우팅**: `endingForRun(runCount)` + `ENDING_INTROS` 셋. car_4 종료 시점에서 *어느 분기 결과든* runCount 기반으로 override.
- **분기 라우터** (`car_3_branch_check`, `car_4_routing`, `car_4_final_branch`): `resolveBranches` 가 *default* 가지로만 흘려보냄 (조건 평가 죽었어도 데드락 안 됨).
- **교차 엔딩 점프 방지**: `endX_*` 씬에서 `endY_*`로 점프 시도하면 현재 엔딩의 카드로 클램프 (legacy fallback 보호).
- **자동 저장**: scene 변경 시. `title_screen`/`settings_menu`/엔딩 카드는 skip.
- **공유 URL 모드**: `?ending=X` 진입 시 `flags.viewingShared=true` 세트, 메타·저장 안 건드림.

### 데이터 흐름 특이점
- `prologue`는 Run 1 base text를 가지고 있고, `variants.run2/3/4.replace`로 회차마다 교체.
- 잔상 씬 (`endA_afterimage` 등)은 각 엔딩 시퀀스의 카드 직전에 들어감.
- `name_input` 씬은 데이터에는 남아 있지만 *어디서도 안 가짐* (title_screen에서 prologue로 직접).

---

## 5. 라이언님 작업 흐름 / 선호

- 단호하지만 친절한 톤. "도전적으로", "수정 필요한 부분 있으면", "톤이 너무 ___" 같은 피드백 직접적.
- *데이터 작업과 글쓰기는 Claude가 초안 → 라이언님이 톤 결정 → Claude가 적용* 패턴.
- *코드/엔진 작업은 Claude가 단독* — "골아프네"하셔서 엔진 디테일은 안 보이는 곳에서 처리.
- 매 커밋 후 *간략한 요약*과 *다음 단계 옵션 1~3개* 제시 선호.
- Vercel 자동 배포되므로 push 후 *모바일/실기기에서 확인*하는 패턴.
- 한국어로 대화. 짧고 명확하게.

---

## 6. 자산 상태

라이언님이 그릴 것 (Tier A): **딱 2장**
- `public/assets/visuals/car_3_wide.png`
- `public/assets/cutscenes/cutscene_zoom_out.png` — D 엔딩 시그니처 (병실이 열차 안, 통로 끝에서 본다)

이미 그린 것 (10/12 Tier A):
- title_logo, car_1_wide, car_2_wide, car_4_wide
- car_5_default, car_5_quiet, car_5_with_people
- passage, passage2 (car_2/car_4 진입)
- car_2_seat_close, car_3_seat_close

추가 자동 대체:
- ending_A → car_5_with_people
- ending_B → car_5_default
- ending_C → car_5_default
- ending_D → car_5_quiet
- 누락 컷씬·팝업 → 디더 placeholder / 텍스트 라벨

엔진 변경: `object-cover` → `object-contain` (그림 원본 그대로 검은 베젤 안에).

C 엔딩 그림 두 장 진행 중:
- Image 1 (뒷모습 + 어깨 위 손) → `visuals/conductor_back_close.png`
- Image 2 (정면 + 손 내밂) → `cutscenes/cutscene_viewpoint_shift.png`
- 얼굴 reveal 씬 (`cutscene_conductor_turns`) 생략 — 자각은 *목소리*로, 시점 전환은 *구조적* (Image 2가 *내가 그가 되어 나를 본다* 컷).

---

## 7. 알아두면 좋은 디테일

- **Git 컨벤션**: 메인 직접 push (사용자가 권한 줬음). 커밋 메시지는 *왜*를 짧게 + *무엇*을 길게.
- **빌드 검증**: 매 변경 후 `node -e "JSON.parse(...)"` + `npm run build` 일관 패턴.
- **검증 스크립트**: 4 Run 도달 가능성 확인하는 시뮬레이터 (이전 세션에 인라인으로 작성한 적 있음 — 필요 시 재작성).
- **이름 (플레이어)**: 데이터에서 placeholder로 안 쓰임. `state.playerName` 필드는 있되 비어 있어도 무방.
- **언어**: 한국어가 정본, 영어는 평행 번역. 톤은 한국어 기준으로 결정.
- **타이밍**: 텍스트 속도 normal = 80ms/char.

---

## 8. 다음 세션에서 시작하기 좋은 곳

라이언님이 다음에 하고 싶다고 한 것 / 자연스러운 다음:
1. **풀 플레이 검증** — Run 1~4 끝까지 굴려서 누락·깨짐 확인
2. **마이너 씬 톤 통일** — whisper / window / leave 류 인터럽트 씬 (~15개) 새 톤으로
3. **car_3_wide / cutscene_zoom_out 그려서 적용**
4. **사운드 미세 조정** — 클릭 톤, 음악 볼륨 등 실기기 확인
5. **Phase 7 컷씬 폴리시** — `isCutscene` 씬 전환 더 느리게, 별도 처리
6. **메인 메뉴 / 설정 UI 다듬기** — 현재 옵션이 9개로 길어졌음
7. **Phase 10~12 Tauri + Steam 출시 준비** (콘텐츠 완성 후)

---

## 9. 마지막 커밋 (작성 시점)

```
b4054de VisualArea: object-contain so portrait artwork shows in full
f924945 endC_touch: face never shown — two hands rest on the same shoulder
f1ece0a Content: car_4 core (entry, general, intercom, dual_choice)
9dbca98 Content: car_3 core scenes — the seat numbers carry the surgeon's 03.15
5be906b Content: car_2 core scenes (passage, intro, seat+flowers, clock)
acaaa71 Content: car_1 cluster rewritten — first car sets the surgeon's denial
440fecd Content: endC full sequence rewritten — surgeon's mirror, not just stranger's
814209a Content: endA full sequence rewritten — Run 1's first impression
e3ba122 Content: endD entries (realization → awaken → family) rewritten
30cff4c Content: car_4 friend cluster — longer, more enigmatic first encounter
...
```

전체 히스토리: `git log --oneline -50` 으로 확인.

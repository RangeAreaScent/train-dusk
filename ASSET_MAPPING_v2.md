# Train Dusk v2 — 에셋 매핑표

> 스크립트(`script_ko_v2.md`)가 지정한 에셋 키 → 실제 보유 에셋으로 매핑.
> 신규 에셋 추가 없이 기존 자원 재사용으로 처리.

---

## 보유 에셋 인벤토리

**visuals/** (전체화면 배경, .webp)
- black_screen, title_logo, passage, passage_deep
- car_1_wide, car_2_wide, car_2_seat_close, car_3_wide, car_3_seat_close, car_3_window
- car_4_wide, car_4_seat_close, car_4_window, car_4_intercom_close
- car_5_empty, car_5_with_people, car_5_crowded
- conductor_car, conductor_pov, emergency_panel
- friend_in_train, friend_behind, friend_hand
- hospital_family, white_ceiling, window_reflection
- protagonist_in_train, train_exterior

**characters/** (오버레이 스프라이트, .webp 알파)
- protagonist_standing, friend_standing, friend_standing_casual, friend_standing_smile
- conductor_back_view, conductor_back_close, viewpoint_shift

**overlays/** (prop 아이템, 화면 위 작은 박스)
- bag_open, bouquet, card_message, clock_2354
- friend_silhouette, phone_locked, phone_unlocked
- seat_trace, torn_paper, wristband

**cutscenes/** (insetCutscene 폴라로이드)
- phones

---

## 스크립트 표기 → 매핑 결과

### 일반/씬

| 스크립트 표기 | 매핑 |
|---|---|
| `car_4_wide_full` / `smiling_passengers` | `car_4_wide` (overlay 없이 — 텍스트로 분위기 전달) |
| `car_5_pre_conductor` | `car_5_empty` |
| `car_5_final` | `car_5_empty` |
| `passage` / `passage2` | `passage` / `passage_deep` (이미 정리됨) |
| `hospital_room_first_light` | `white_ceiling` |
| `hospital_room` | `white_ceiling` |
| `hospital_family_close` | `hospital_family` |
| `hospital_family_wide` | `hospital_family` |
| `train_exterior_pullback` | `train_exterior` |
| `corridor_end` | `friend_behind` (통로 끝에 멀리 인영) |

### 오버레이 (캐릭터)

| 스크립트 표기 | 매핑 |
|---|---|
| `protagonist_seated` | overlay 없음 (1인칭 + 텍스트) |
| `smiling_passengers` | overlay 없음 (텍스트만으로 분위기) |
| `smiling_passenger_close` | overlay 없음 |
| `synced_smiles` | overlay 없음 |
| `woman_seated_back` | `friend_standing` (좌측 또는 단독) |
| `woman_seated_face_dim` | `friend_standing` |
| `woman_and_protagonist` | overlayLeft: `protagonist_standing` + overlayRight: `friend_standing` |
| `woman_and_protagonist_dim` | 동상 + overlayOverlap |
| `woman_close` | `friend_standing_smile` |
| `woman_leaning_on_shoulder` | `friend_standing` (오버랩) |
| `distant_smile_woman` | prop `friend_silhouette` (top-right) |
| `distant_smile_woman_synced` | prop `friend_silhouette` (top-right) |
| `distant_woman` | prop `friend_silhouette` (center-right) |
| `dim_voices` | overlay 없음 |
| `closed_eyes` | overlay 없음 |
| `viewpoint_shift_close` | `viewpoint_shift` |
| `empty_seat_middle` / `empty_seat_far` | overlay 없음 (텍스트만) |
| `two_seats` / `empty_sides` | overlay 없음 |
| `hand_on_shoulder` | overlayLeft: `conductor_back_view` + overlayRight: `conductor_back_close` + overlayOverlap |

### prop (작은 박스)

| 스크립트 표기 | 매핑 |
|---|---|
| `white_flower_card` | `bouquet` (card_message는 회차에 따라 갈음) |
| `intercom` | prop 없음 (배경 텍스트로 처리) |

---

## 새 씬에 적용할 에셋 (구체)

### car_3_seat_six (run3+)
- 배경: `car_3_wide`
- prop (run3): `bouquet`, propPosition: `center`
- prop (run4): `bouquet` + 4회차는 `torn_paper`로 갈음 (코트 흔적 = "3월 15일" 종이)

### car_4_her_seat_empty (run3)
- 배경: `car_4_wide`
- overlay: 없음 (텍스트 중심)

### endD_choice / endD_sit_then
- 배경: `car_5_empty`
- overlay: 없음

### endC_end (눈을 감는 마지막 씬)
- 배경: `conductor_pov`
- overlay: `viewpoint_shift`

### endB 전체 시퀀스
- 모든 씬 배경: `car_5_empty` (또는 `friend_in_train` 일부)
- endB_intro: `friend_standing` (단독, 뒷모습 느낌)
- endB_recognition: `friend_standing_casual`
- endB_sit: overlayLeft `protagonist_standing` + overlayRight `friend_standing`, overlayOverlap
- endB_echo: `friend_standing_smile` (단독)
- endB_companion: overlayLeft `protagonist_standing` + overlayRight `friend_standing`, overlayOverlap
- endB_final / afterimage: 동일

---

## 결론

**신규 에셋 필요: 0**
모든 v2 씬을 보유 에셋 조합으로 처리 가능.

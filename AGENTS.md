# Mingu UI 작업 기준

- 이 저장소는 Mingu 웹의 공통 디자인 시스템이다. `DESIGN_SYSTEM.md`를 먼저 읽는다.
- 기본 시각 방향은 담백한 화면과 목적이 분명한 인터랙션의 조합이다.
- 새 UI는 기존 semantic token과 Core 컴포넌트를 우선 조합한다. 제품 전용 API·인증·비즈니스 규칙을 넣지 않는다.
- 새 색상·간격·모션 상수를 여러 파일에 흩어놓지 않고 토큰을 확장한다.
- native props, ref, 키보드, focus-visible, 오류 상태, disabled, reduced-motion을 유지한다.
- 인터랙션은 opt-in으로 추가한다. 기본 페이지에 반복 효과를 강제하지 않는다.
- 기존 패키지 이름·루트 exports는 소비 앱 호환성을 위해 유지한다.
- 변경 후 typecheck와 영향 있는 브라우저 검사를 수행한다. 새 API와 도입 방법은 문서에 함께 반영한다.

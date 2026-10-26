# Mingu Native preview

실제 iOS·Android 컴포넌트를 조작하는 Expo 예제입니다. 웹 `/native` 페이지는 설치·API 문서이고, 이 앱은 휴대폰에서 실행합니다.

## 휴대폰에서 열기

Node 22와 **SDK 57을 지원하는 Expo Go**가 필요합니다. 이 예제는 Expo SDK 57로 고정되어 있습니다. 폰의 Expo Go가 지원하는 SDK 숫자와 프로젝트 SDK가 같아야 합니다.

```sh
git clone https://github.com/Linternas/ui.git
cd ui/examples/native
npm ci
npm start
```

컴퓨터와 휴대폰을 같은 Wi-Fi에 연결하고 터미널 QR을 스캔하세요. iPhone에서는 카메라, Android에서는 Expo Go의 QR 스캐너를 사용합니다. iOS에서 계정 인증을 요청하면 CLI(`npx expo login`)와 Expo Go에 같은 Expo 계정으로 로그인하세요.

이미 저장소가 있다면 업데이트한 후 `examples/native`에서 `npm ci`, `npm start`만 실행하면 됩니다. 루트의 의존성 설치는 필요하지 않습니다. 서버가 실행 중인 동안 예제를 사용할 수 있으며, `App.tsx` 변경은 Fast Refresh로 반영됩니다.

연결이 안 되면 방화벽과 같은 네트워크 여부를 확인하세요. 필요하면 다음 명령으로 터널을 사용할 수 있습니다. CLI가 터널 도우미 설치를 요청할 수 있습니다.

```sh
npm start -- --tunnel
```

시뮬레이터가 준비되어 있다면 `npm run ios`(macOS/Xcode), `npm run android`(Android SDK)를 사용할 수 있습니다. 앱스토어 배포나 EAS 프로젝트 설정은 필요하지 않습니다.

## SDK 버전 오류

`Project is incompatible with this version of Expo Go`는 Wi-Fi 연결 후 프로젝트를 읽었지만 SDK 버전이 맞지 않을 때 발생합니다. 오류 화면의 Expo Go 지원 SDK가 **57**인지 확인하세요. 이 예제의 `expo`, React, React Native, 날짜·슬라이더·safe-area 의존성은 SDK 57 조합으로 설치됩니다. `app.json`의 `sdkVersion`만 바꾸면 실제 Native 런타임은 바뀌지 않습니다.

예제를 업데이트했다면 서버를 종료하고 `npm ci` 후 `npm start -- --clear`로 다시 실행하세요. Expo Go가 다른 SDK를 지원하면 앱 설치 방식에 맞는 호환 버전을 사용하거나 예제 의존성 전체를 해당 SDK에 맞춰야 합니다. [Expo 공식 버전 오류 안내](https://docs.expo.dev/troubleshooting/expo-go-version-mismatch/)

## 화면 구성

하단의 **Components / Inputs / Planning / More** 탭으로 화면을 전환합니다. 상단 AppBar와 하단 내비게이션은 본문을 스크롤해도 유지됩니다. 키보드가 뜨면 하단 내비게이션을 숨겨 입력 공간을 확보하고, 닫으면 복원합니다. 버튼 결과 알림은 하단 바 위에 바로 표시됩니다. Inputs에서 바꾼 이름·선택·슬라이더 등의 controlled 값은 탭을 왕복해도 유지됩니다. 화면을 떠나면 uncontrolled 예제는 다시 초기화됩니다. Planning에는 nullable 날짜·금액·월·날짜 범위·요일·달력과 긴 폼이 있습니다. More에는 표시·피드백, 내부 Tabs와 모달 예제가 있습니다.

`Screen.header`와 `Screen.footer`에 기존 AppBar·BottomNavigation을 조합하고 `hideFooterOnKeyboard`를 켠 레이아웃입니다. Screen이 safe area를 처리하므로 하단 바에는 `safeArea={false}`를 사용합니다. 컴포넌트를 제품 앱에서도 같은 방식으로 배치할 수 있습니다.

## 확인할 항목

- 라이트·다크 모드, 카드·텍스트·배지·아바타
- 버튼의 기본·비활성·로딩 상태
- 입력, 비밀번호 표시, 검색, OTP 붙여넣기, 키보드
- 체크박스, 스위치, 라디오, Select 검색, 슬라이더, 수량
- OS 날짜·시간 선택과 취소
- 탭·하단 내비게이션, 아코디언, 빈 화면·오류·알림
- Dialog·Bottom sheet·확인창·Action sheet, Android 뒤로가기
- 큰 글씨, 하단 safe area, VoiceOver·TalkBack

API·계좌·로그인·저장소에 연결하지 않습니다. 예제 상태는 앱을 다시 시작하면 초기화됩니다.

## 구조와 검증

Expo의 버전 조합과 `package-lock.json`은 이 폴더에서 관리합니다. Metro는 `../../packages/native/src`를 직접 읽고 이 앱의 의존성으로 실행하므로 루트 Web 개발용 React와 섞이지 않습니다. Native 라이브러리를 수정하면 별도 패키지 발행 없이 예제에서 볼 수 있습니다.

```sh
npm run typecheck
npx expo install --check
npm run export:check
```

`export:check`는 iOS·Android Metro 번들을 생성합니다. 실제 OS 렌더링, 접근성, 키보드·제스처는 기기에서 확인해야 합니다. Android 15 ARM64 에뮬레이터에서 실제 화면과 입력·선택·모달 동작을 검수했습니다. [검수 범위와 화면](../../docs/qa/native-android-2026-10-26.md). iPhone 실기기·iOS 시뮬레이터 동작은 아직 검증하지 않았습니다.

[전체 Native API](../../NATIVE.md) · [Expo 공식 실행 안내](https://docs.expo.dev/get-started/start-developing/)

Planning의 긴 폼은 고정 footer, 큰 화면 형태, 미저장 닫기 요청 보류와 busy 차단을 직접 확인할 수 있습니다. 새 API와 값 규약은 [Native API](../../NATIVE.md#calendar-ranges-and-amount-editing-026)에 있습니다.

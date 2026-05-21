# Play 스토어 등록 가이드

이 문서는 Instaclone 앱을 Google Play 스토어에 등록하는 전체 과정을 안내합니다.

## 사전 준비

### 1. 도구 설치 (로컬 PC)

- **Android Studio** 최신 버전 (Java JDK 17 포함)
- **Node.js** 18 이상
- **Google Play Console 개발자 계정** ($25 일회성, https://play.google.com/console)

### 2. 백엔드 공개 배포

Play 스토어에 등록되는 앱은 `localhost`에 접근할 수 없습니다. 백엔드를 공개 URL에 배포해야 합니다.

**추천 옵션** (모두 무료 티어 있음):

- **Railway** (https://railway.app) — Node.js 앱 배포 가장 쉬움
- **Render** (https://render.com) — Docker/Node.js 지원
- **Fly.io** (https://fly.io) — 글로벌 배포

배포 후 백엔드 URL을 받습니다 (예: `https://instaclone-api.up.railway.app`).

> ⚠️ 현재 백엔드는 SQLite + 로컬 파일 시스템으로 이미지를 저장합니다. 프로덕션에서는 PostgreSQL + S3/Cloudinary로 마이그레이션 권장. 무료 호스팅은 디스크가 휘발성인 경우가 많습니다.

### 3. 프론트엔드 환경 설정

`frontend/.env.production` 파일 생성:

```
VITE_API_URL=https://your-backend-domain.com/api
VITE_API_ORIGIN=https://your-backend-domain.com
```

## 안드로이드 빌드

### 4. 웹앱 → 네이티브 동기화

```bash
cd frontend
npm install
npm run cap:sync
```

이 명령은 React 앱을 빌드하고 `android/` 디렉토리로 복사합니다.

### 5. 앱 정보 수정

`frontend/android/app/src/main/res/values/strings.xml` 수정:
- `app_name`: 표시될 앱 이름
- `title_activity_main`: 동일

`frontend/capacitor.config.json` 의 `appId` 가 패키지명입니다 (`com.instaclone.app`). Play 스토어에 등록 후에는 변경할 수 없습니다.

### 6. 앱 아이콘 / 스플래시 스크린

```bash
npm install --save-dev @capacitor/assets
# 1024x1024 PNG 파일을 frontend/resources/icon.png 에 배치
# 2732x2732 PNG 파일을 frontend/resources/splash.png 에 배치
npx capacitor-assets generate
```

### 7. 서명 키 생성 (1회만)

```bash
keytool -genkey -v -keystore instaclone-release.keystore \
  -alias instaclone -keyalg RSA -keysize 2048 -validity 10000
```

**중요**: 이 keystore 파일과 비밀번호는 절대 잃어버리지 마세요. 잃어버리면 앱 업데이트를 못 합니다. 백업하세요.

### 8. 서명 설정

`frontend/android/key.properties` 생성 (gitignore에 추가):

```
storePassword=비밀번호
keyPassword=비밀번호
keyAlias=instaclone
storeFile=../../instaclone-release.keystore
```

`frontend/android/app/build.gradle` 수정:

```gradle
// android { 블록 위에 추가
def keystoreProperties = new Properties()
def keystorePropertiesFile = rootProject.file('key.properties')
if (keystorePropertiesFile.exists()) {
    keystoreProperties.load(new FileInputStream(keystorePropertiesFile))
}

android {
    // ... 기존 설정 ...
    signingConfigs {
        release {
            keyAlias keystoreProperties['keyAlias']
            keyPassword keystoreProperties['keyPassword']
            storeFile keystoreProperties['storeFile'] ? file(keystoreProperties['storeFile']) : null
            storePassword keystoreProperties['storePassword']
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled false
        }
    }
}
```

### 9. Release AAB 빌드

```bash
cd frontend
npm run android:build
```

결과물: `frontend/android/app/build/outputs/bundle/release/app-release.aab`

## Play Console 등록

### 10. 앱 만들기

1. https://play.google.com/console 접속
2. "앱 만들기" 클릭
3. 앱 이름, 언어, 무료/유료 선택
4. 정책 동의

### 11. 필수 정보 입력

- **앱 콘텐츠**: 광고, 콘텐츠 등급 (IARC 설문), 타겟 사용자
- **개인정보 처리방침 URL**: 사용자 데이터를 수집하므로 필수
- **앱 카테고리**: 소셜
- **연락처 정보**: 이메일

### 12. 스토어 등록정보

- **앱 이름** (50자)
- **간단한 설명** (80자)
- **자세한 설명** (4000자)
- **앱 아이콘** 512x512 PNG
- **그래픽 이미지** 1024x500
- **스크린샷** 폰: 최소 2장, 최대 8장 (16:9 또는 9:16)

### 13. AAB 업로드

1. "프로덕션" → "새 버전 만들기"
2. `app-release.aab` 업로드
3. 출시 노트 작성
4. 검토 후 출시

### 14. 검토 대기

신규 앱 첫 검토는 **3~7일** 정도 걸립니다. 정책 위반 시 거부될 수 있으니 다음 항목 미리 점검:

- 개인정보 처리방침 URL 정상 작동
- 데이터 안전 섹션 정확히 작성
- 사용자가 자신의 계정/데이터를 삭제할 수 있는 기능 (필수)
- 인스타그램 로고/이름 사용 시 거부됨 (상표 침해)

## 주의사항

- **앱 이름**: "Instagram" 또는 유사 단어 사용 금지 (상표 분쟁)
- **데이터 삭제 기능**: 계정 삭제 기능 필수 (현재 백엔드에 미구현)
- **HTTPS 필수**: 백엔드는 반드시 HTTPS여야 함 (Android 9+ 기본 정책)
- **버전 관리**: 매 업데이트마다 `android/app/build.gradle` 의 `versionCode` 증가 필수

## 빠른 명령어 요약

```bash
# 개발
cd backend && npm run dev          # 백엔드 시작
cd frontend && npm run dev          # 프론트엔드 (웹)

# 안드로이드
cd frontend && npm run cap:sync    # 웹 → 안드로이드 동기화
cd frontend && npm run cap:open    # Android Studio 열기
cd frontend && npm run android:build  # Release AAB 빌드
```

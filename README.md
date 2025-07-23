# 중고거래 플랫폼 NestJS API

NestJS 기반의 백엔드 서버로, 사용자 회원가입/로그인, 상품 등록, 주문, 리뷰, 좋아요 등의 기능을 제공합니다.

## 주요 기능

- 회원가입 / 소셜 로그인
- 상품 등록 / 이미지 업로드
- 상품 찜(좋아요)
- 팔로우 / 유저 간 피드
- 주문 생성 / 상태 변경
- 상품 리뷰 작성

## 기술 스택

- Node.js + NestJS
- TypeORM + MySQL
- Docker / Docker Compose
- VSCode + SQLTools

## 실행 방법

```bash
npm install
npm run start:dev

# docker mysql 백그라운드 실행
docker-compose up -d

# docker mysql 실시간 포그라운드 실행
docker-compose up
```

## VScode Extension

- SQLTools by Matheus Teixeira
- SQLTools MySQL/MariaDB/TiDB by Matheus Teixeira

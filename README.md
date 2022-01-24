# Cowket API & Socket Server

팀/채널 단위의 채팅 서비스를 제공하기 위한 API, 실시간 채팅을 제공하기 위한 Socket 서버 (Nest.js)

![NestJS](https://img.shields.io/badge/nestjs-%23E0234E.svg?style=for-the-badge&logo=nestjs&logoColor=white) ![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white) ![Socket.io](https://img.shields.io/badge/Socket.io-black?style=for-the-badge&logo=socket.io&badgeColor=010101) ![Yarn](https://img.shields.io/badge/yarn-%232C8EBB.svg?style=for-the-badge&logo=yarn&logoColor=white) ![Swagger](https://img.shields.io/badge/-Swagger-%23Clojure?style=for-the-badge&logo=swagger&logoColor=white) ![Nginx](https://img.shields.io/badge/nginx-%23009639.svg?style=for-the-badge&logo=nginx&logoColor=white) ![MariaDB](https://img.shields.io/badge/MariaDB-003545?style=for-the-badge&logo=mariadb&logoColor=white) ![Jest](https://img.shields.io/badge/-jest-%23C21325?style=for-the-badge&logo=jest&logoColor=white) ![Raspberry Pi](https://img.shields.io/badge/-RaspberryPi-C51A4A?style=for-the-badge&logo=Raspberry-Pi)

## 소켓 이벤트

[![Notion](https://img.shields.io/badge/Notion-%23000000.svg?style=for-the-badge&logo=notion&logoColor=white)](https://www.notion.so/ad4ab921e1b849bd8cb73626dc742b00?v=2717159ec097476bb945e2a2bcad5c5a)

- [x] 소켓 커넥션 이벤트
- [x] 메세지 발신
- [x] 메세지 수신
- [x] 메세지 수정
- [x] 메세지 삭제
- [x] 새 메세지 응답 (스크롤 업)
- [x] 채널 입장
- [x] 채널 퇴장
- [x] 에러 이벤트 핸들링
- [x] DM 발신
- [x] DM 수신
- [x] 메세지 반응(이모지, 리액션)
- [x] 채널 멤버 목록 응답
- [ ] 팀별 알림 수신
- [ ] 채널별 알림 수신

## API

[![Swagger](https://img.shields.io/badge/-Swagger-%23Clojure?style=for-the-badge&logo=swagger&logoColor=white)](https://cw.malrang.dev/swagger/)

- 유저

1. [x] 유저가 소유자인 모든 팀 조회
2. [x] 유저가 접근가능한 팀 조회
3. [x] 유저 정보 업데이트
4. [ ] 회원탈퇴

- 팀

1. [x] 모든 팀 조회
2. [x] 팀 생성
3. [x] 팀 검색
4. [x] 팀 내에 참여중인 모든 유저 조회
5. [x] 팀 내에 유저 프로필 조회
6. [x] 팀 내 프로필 생성
7. [x] 팀 내 프로필 수정
8. [ ] 팀 내 프로필 삭제
9. [x] 팀 가입
10. [x] 팀 삭제
11. [x] 팀 조회
12. [x] 팀 수정
13. [x] 팀 탈퇴

- 채널

1. [x] 채널 조회
2. [x] 채널 생성
3. [x] 채널 수정
4. [x] 채널 삭제
5. [x] 팀 내 내가 가입된 채널 조회
6. [x] 팀 내 공개 채널 조회
7. [x] 팀 내 공개 채널 참여
8. [x] 비공개 채널에 참여자 추가 (채널 소유자만 가능)
9. [x] 채널에 참여 가능한 유저 조회

- 메세지

1. [x] 채널의 최근 메세지 조회
2. [x] 메세지 상세 조회

- 권한

1. [x] 접근 가능한 채널 리스트 조회

- 인증

1. [x] 로그인
2. [x] 회원가입
3. [x] 토큰 검증
4. [ ] 소셜 로그인 (?)

- 파일 업로드

1. [x] 파일 업로드 (단건, 1개만)
2. [ ] 파일 업로드 (다건, 여러개)

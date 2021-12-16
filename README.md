# cowket-server

소켓 공부용 레포

## 소켓 이벤트 정리

[노션](https://www.notion.so/ad4ab921e1b849bd8cb73626dc742b00?v=2717159ec097476bb945e2a2bcad5c5a)에 정리하기

## API 정리

[스웨거](https://cowket-api.stackunderflow.xyz/swagger)에 정리하기

## 구성

## TODO

- Alert module implementation
- 모듈 독립적으로 구성 - 여러 레포지터리에 의존성을 갖지 않도록 > 한 모듈 당 하나의 레포지터리 가지도록

## Alert Module

- 유저가 채널에 메세지 전파시 채널에 모든 유저를 대상으로 한 Alert 생성

현재 서비스를 이용중이지 않고 나중에 접속했을 때 Alert을 통해 새 메세지를 확인 가능 및 실시간으로 채널에서 날라온 메세지 확인 가능

- 메세지에 이모지를 이용해서 반응할 시 해당 메세지를 전파한 유저의 Alert 생성

반응한 사람, 메세지를 전파한 사람의 정보 누적

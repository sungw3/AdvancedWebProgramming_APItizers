
# 26-1학기 고급웹프로그래밍 프로젝트
django를 이용하여 챗 웹 구현하기 + llm을 이용한 채팅 감정 분석과 그에 따른 디자인

## 주요기능
기본적인 로그인 기능  
실시간 채팅  
채팅방 구분  
문장별 감정분석을 통한 디자인 변화

## 프론트
- ux/ui design
- handling user interactions
- communication with server
- dynamic update via server data

## 서버
django

## 감정분석기능
Deepseek V4 pro를 사용하여 이전 감정 리스트와 함께 감정 분석을 진행
사전에 여러개의 감정을 미리 지정해놓고, 해당하는 감정중에서 적절한 것을 선택

서버와 구분되는 별도의 모듈로 먼저 구현

마르코프체인을 감정에 적용하여 일부 문장에 대해 llm 호출 없이 처리

sqlite를 데이터베이스로 사용 


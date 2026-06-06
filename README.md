
# 26-1학기 고급웹프로그래밍 프로젝트 (Advanced Web Programming Project 26-1)
uvicorn를 이용하여 챗 웹 구현하기 + llm을 이용한 채팅 감정 분석과 그에 따른 디자인
**The 'NEW' folder in the new-server branch is the final completed web service.**

## 주요기능 (critical features)
기본적인 로그인 기능  
실시간 채팅  
채팅방 구분  
문장별 감정분석을 통한 디자인 변화

## 배포계획 (roadmap)
  - Currently, front/backend separated for development & test.
  - Later, frontend integrate into uvicorn server. 


  > All HTML files moves to -> uvicorn templates/ directory

  > All JS, CSS, PNG (static files) moves to -> uvicorn static/ directory
> 


## 프론트 (frontend)
- ux/ui design (with bootstrap v5)
- handling user interactions
- communication with server
- dynamic update via server data
- https://chatting-with-emotion.vercel.app/
- 백엔드 없이 최종 프론트엔트 코드 돌리는 링크
- https://apitizers-design-demo.vercel.app/
- 백엔드에서 받을 데이터 임시로 넣어둔 디자인 확인하는 링크

## 서버 (backend)
- Framework: FastAPI
- Real-time Chat: WebSocket
- ASGI Server: Uvicorn
- Channel Layer: In-Memory
- Database: JSON File + In-Memory
- Frontend: HTML/CSS/JS (Bootstrap)

## 감정분석기능 (mood finding algorithm)
Deepseek V4 pro를 사용하여 이전 감정 리스트와 함께 감정 분석을 진행
사전에 여러개의 감정을 미리 지정해놓고, 해당하는 감정중에서 적절한 것을 선택

서버와 구분되는 별도의 모듈로 먼저 구현

마르코프체인을 감정에 적용하여 일부 문장에 대해 llm 호출 없이 처리

sqlite를 데이터베이스로 사용 

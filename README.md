
# 26-1학기 고급웹프로그래밍 프로젝트
django를 이용하여 챗 웹 구현하기 + llm을 이용한 채팅 감정 분석과 그에 따른 디자인

## 주요기능
기본적인 로그인 기능  
실시간 채팅  
채팅방 구분  
문장별 감정분석을 통한 디자인 변화
## 프론트
prototype of web page design
<img width="771" height="718" alt="스크린샷 2026-04-07 002413" src="https://github.com/user-attachments/assets/fca2d41f-684e-4b76-a4e0-522d90cb1315" />
<img width="910" height="797" alt="스크린샷 2026-04-07 002858" src="https://github.com/user-attachments/assets/f080abf8-9333-4542-ab00-4eb18a35dc03" />
<img width="962" height="797" alt="스크린샷 2026-04-07 004104" src="https://github.com/user-attachments/assets/da74d678-b4c1-4089-8190-2d939d9aff00" />


## 서버

## 감정분석기능
기본적으로 저렴한 llm의 api를 이용하여 적절한 프롬프트로 문장별 감정분석을 진행  
사전에 여러개의 감정을 미리 지정해놓고, 해당하는 감정중에서 적절한 것을 선택할 것이다.

서버와 구분되는 별도의 모듈로 구현하는것으로 생각중이다.

llm 호출에 따른 비용이 존재하므로 비용 최소화를 위해 아래의 최적화 방식을 고려중이다.

### 계획중인 최적화
문자열 캐싱  
마르코프체인을 감정에 적용하여 일부 문장에 대해 llm 호출 없이 처리

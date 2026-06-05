이곳에서 프론트엔드와 mood-engine을 통합하며 최종 웹 페이지를 통합 수정 중입니다.

원래 daphne을 이용하여 통합 중이었으나, 꽤 복잡해지고 코드가 꼬여 새로운 uvicorn 서버를 이용해 재통합 중입니다.

둘 다 같은 비동기 웹 서버이지만, 기존 daphne보다 더 속도가 빠르고 
server.py 파일 안에 있는 app이라는 비동기 애플리케이션 객체를 직접 바라보고 다이렉트로 통신을 주고받는 구조라 더 원활히 제작 중입니다.


(06/04) 회원가입/로그인 후 서로 다른 두 계정으로 실시간 채팅이 가능하며, 기존 팀원들이 만들어둔 모든 기능 이용 가능합니다.
하지만 아직 mood engine이 제대로 적용되지 않으며, 온라인/오프라인 버그, ui버그, 방 pw 및 방장 권한 버그 등등 자잘한 버그를 고쳐나가는 중입니다.


(06/05) mood-engine 작동 및 적용, 온/오프라인 동작, ui 버그 수정, 방 subtitle 및 pw 수정 완료.
앞으로 '방 최대인원 설정/방장 권한/오프라인 시간' 등 버그 수정 및 '유저 계정 탈퇴/방 나가기' 기능 추가 예정.



-----------------------------------------------------------------------------------------------------------------------------------------------------

Here, we are integrating the frontend and mood-engine and currently modifying the final web page.

We were originally integrating using daphne, but due to the complexity and tangled code, we are reintegrating using a new uvicorn server.

Although both are asynchronous web servers, uvicorn is faster than the existing daphne. Furthermore, because it has a structure that directly accesses the asynchronous application object named 'app' within the server.py file and communicates directly with it, development is proceeding more smoothly.

(06/04) Real-time chatting is possible using two different accounts after signing up and logging in, and all features created by existing team members are available.

However, the mood engine is not yet properly implemented, and we are currently fixing minor bugs, including those related to online/offline functionality, UI issues, room passwords, and host permissions.

(06/05) Mood-engine enabled and applied, On/Offline functionality fixed, UI bugs fixed, and room subtitle and password corrections completed.

Upcoming bug fixes for 'Room Max Capacity Setting/Host Authority/Offline Time' and the addition of 'User Account Deletion/Leave Room' features are planned.

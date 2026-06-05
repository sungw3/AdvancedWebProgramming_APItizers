이곳에서 프론트엔드와 mood-engine을 통합하며 최종 웹 페이지를 통합 수정 중입니다.

원래 daphne을 이용하여 통합 중이었으나, 꽤 복잡해지고 코드가 꼬여 새로운 uvicorn 서버를 이용해 재통합 중입니다.

둘 다 같은 비동기 웹 서버이지만, 기존 daphne보다 더 속도가 빠르고 
server.py 파일 안에 있는 app이라는 비동기 애플리케이션 객체를 직접 바라보고 다이렉트로 통신을 주고받는 구조라 더 원활히 제작 중입니다.


(06/04) 회원가입/로그인 후 서로 다른 두 계정으로 실시간 채팅이 가능하며, 기존 팀원들이 만들어둔 모든 기능 이용 가능합니다.
하지만 아직 mood engine이 제대로 적용되지 않으며, 온라인/오프라인 버그, ui버그, 방 pw 및 방장 권한 버그 등등 자잘한 버그를 고쳐나가는 중입니다.


(06/05) 코드 수정 후 실시간 채팅에서 정상적으로 mood engine과 메세지 색상 변경을 확인했고, 온/오프라인 동작 버그 및 ui 버그를 수정했습니다.
앞으로 '방 pw 설정/방장 권한/오프라인 시간' 등의 버그 수정과 '유저 계정 탈퇴/방 나가기' 기능 추가 예정입니다.



-----------------------------------------------------------------------------------------------------------------------------------------------------

Here, we are integrating the frontend and mood-engine and currently modifying the final web page.

We were originally integrating using daphne, but due to the complexity and tangled code, we are reintegrating using a new uvicorn server.

Although both are asynchronous web servers, uvicorn is faster than the existing daphne. Furthermore, because it has a structure that directly accesses the asynchronous application object named 'app' within the server.py file and communicates directly with it, development is proceeding more smoothly.

(06/04) Real-time chatting is possible using two different accounts after signing up and logging in, and all features created by existing team members are available.

However, the mood engine is not yet properly implemented, and we are currently fixing minor bugs, including those related to online/offline functionality, UI issues, room passwords, and host permissions.

(06/05) After modifying the code, we confirmed that the mood engine and message color changes work correctly in real-time chat, and fixed the on/offline behavior bugs as well as UI bugs. We plan to fix bugs related to 'room password settings, host permissions, and offline time,' and add a 'user account deletion, exit room' features in the future.


INSERT INTO User (UserName, LoginID, LoginPW) VALUES
('김철수', 'chulsoo123', SHA2('password1234', 256)),
('이영희', 'younghee646', SHA2('nono12345', 256)),
('박지민', 'jimin012', SHA2('passss111', 256));

INSERT INTO Room (HostID, RoomName) VALUES
(1, 'Room For Victory'),
(2, 'Dinner squad');

INSERT INTO UserRoom (UserID, RoomID, Valid) VALUES
(1, 1, TRUE),
(2, 1, TRUE),
(3, 1, TRUE),
(2, 2, TRUE);


INSERT INTO Chat (UserID, RoomID, ChatContent, ChatMood) VALUES
(1, 1, 'what a nice day!', 'Happy'),
(2, 1, 'oh no.. my code has a bug...', 'Sad'),
(2, 2, 'I am out. this is out of mind.', 'Angry');

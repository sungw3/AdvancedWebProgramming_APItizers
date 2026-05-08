import json
from channels.generic.websocket import AsyncWebsocketConsumer

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_name = self.scope['url_route']['kwargs']['room_name']
        self.room_group_name = f'chat_{self.room_name}'

        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()
        print(f"✅ [CONNECT] Room '{self.room_name}' - Client connected")

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)
        print(f"❌ [DISCONNECT] Room '{self.room_name}'")

    async def receive(self, text_data):
        try:
            text_data_json = json.loads(text_data)
            message = text_data_json['message']
            username = text_data_json.get('username', 'anonymous')

            print(f"📨 [RECEIVED] {username}: {message}")   # ← 서버가 받았는지 확인

            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'chat_message',
                    'message': message,
                    'username': username,
                }
            )
        except Exception as e:
            print(f"❌ Error in receive: {e}")

    async def chat_message(self, event):
        print(f"📤 [BROADCAST] {event['username']}: {event['message']}")  # ← 브로드캐스트 확인

        await self.send(text_data=json.dumps({
            'message': event['message'],
            'username': event['username'],
        }))
from django.shortcuts import render, redirect, get_object_or_404

from django.contrib.auth.decorators import login_required

from .models import ChatRoom, Message



# 채팅방 목록 (search-room.html과 연결)

@login_required

def room_list(request):

    rooms = ChatRoom.objects.all().order_by('-created_at')

    return render(request, 'search-room.html', {'rooms': rooms})



# 채팅방 생성

@login_required

def create_room(request):

    if request.method == 'POST':

        name = request.POST.get('roomTitle')

        topic = request.POST.get('roomSubtitle', '')

        if name:

            room = ChatRoom.objects.create(

                name=name,

                topic=topic,

                creator=request.user

            )

            room.participants.add(request.user)

            return redirect('room_detail', room_name=room.name)

    return redirect('room_list')



# 채팅방 입장

@login_required

def room_detail(request, room_name):

    room = get_object_or_404(ChatRoom, name=room_name)

    messages = room.messages.all()[:100]

    return render(request, 'chat-room.html', {

        'room': room,

        'messages': messages

    })
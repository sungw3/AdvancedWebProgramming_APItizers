from django.urls import path

from django.views.generic import TemplateView

from . import views



urlpatterns = [

    path('', views.room_list, name='room_list'),           # /chat/ -> 방 목록 (search-room.html)

    path('create/', views.create_room, name='create_room'), # /chat/create/ -> 방 생성 (create-room.html)

    path('about/', TemplateView.as_view(template_name='about.html'), name='about'), # /chat/about/ -> 어바웃 화면

    path('<str:room_name>/', views.room_detail, name='room_detail'),

]
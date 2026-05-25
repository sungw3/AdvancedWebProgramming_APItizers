from django.contrib import admin

from django.urls import path, include

from django.conf import settings

from django.conf.urls.static import static

from django.views.generic import TemplateView



urlpatterns = [

    # 홈 화면

    path('', TemplateView.as_view(template_name='index.html'), name='home'),



    # 관리자

    path('admin/', admin.site.urls),



    # API (프론트 fetchAPI 호출용)

    path('api/', include('accounts.urls')),



    # 채팅방 관련

    path('chat/', include('chat.urls')),



    # 테스트용

    path('test-chat/', include('chat.urls')),

]



# 개발 환경 static 파일 서빙 (CSS, JS, images)

if settings.DEBUG:

    urlpatterns += static(settings.STATIC_URL, document_root=settings.BASE_DIR / 'templates')
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.contrib.auth import login, logout
from django.contrib.auth.views import LoginView, LogoutView
from django.views.generic import CreateView
from .forms import CustomUserCreationForm

@method_decorator(csrf_exempt, name='dispatch')
class RegisterView(CreateView):
    form_class = CustomUserCreationForm
    template_name = 'signup.html'          # ← 프론트가 만든 파일

    def form_valid(self, form):
        user = form.save()
        login(self.request, user)
        return JsonResponse({
            'status': 'success',
            'userName': user.username,
            'message': '회원가입 성공'
        })

    def form_invalid(self, form):
        return JsonResponse({
            'status': 'error',
            'message': form.errors.get_json_data()
        }, status=400)


@method_decorator(csrf_exempt, name='dispatch')
class CustomLoginView(LoginView):
    template_name = 'login.html'

    def form_valid(self, form):
        user = form.get_user()
        login(self.request, user)
        return JsonResponse({
            'status': 'success',
            'userName': user.username,
            'message': '로그인 성공'
        })

    def form_invalid(self, form):
        return JsonResponse({
            'status': 'error',
            'message': '아이디 또는 비밀번호가 틀렸습니다.'
        }, status=400)


class CustomLogoutView(LogoutView):
    def dispatch(self, request, *args, **kwargs):
        logout(request)
        return JsonResponse({'status': 'success', 'message': '로그아웃 되었습니다.'})
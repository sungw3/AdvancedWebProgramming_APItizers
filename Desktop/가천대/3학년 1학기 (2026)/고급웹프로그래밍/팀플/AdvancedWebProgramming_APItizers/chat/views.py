from django.shortcuts import render

def chat_test(request):
    return render(request, 'chat_test.html')
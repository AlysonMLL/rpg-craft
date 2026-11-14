"""
Função do Arquivo: Endpoints de conta: dados do usuário logado, login com limite de tentativas
e verificação de saúde da API.

O que há aqui:
- MeView: GET /api/auth/me/ (usuário logado).
- LoginView: igual ao login do SimpleJWT, mas com limite de tentativas (escopo "login").
- HealthView: GET /api/health/ (público): consulta o banco de verdade. Usado pelo keep-alive que
  evita a pausa do Supabase e para acordar o servidor.
"""

from django.contrib.auth import get_user_model
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView


class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        return Response({
            'id': user.id,
            'username': user.username,
            'first_name': user.first_name,
            'email': user.email,
        })


class LoginView(TokenObtainPairView):
    throttle_scope = 'login'


class HealthView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []

    def get(self, request):
        get_user_model().objects.exists()  # uma consulta real ao banco
        return Response({'status': 'ok'})
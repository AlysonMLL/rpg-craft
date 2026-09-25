"""
O que há aqui:
- path('token/'): Endpoint de login. Recebe 'username' e 'password' no corpo da requisição e devolve os tokens JWT (access e refresh).
- path('token/refresh/'): Endpoint de renovação. Recebe o 'refresh' token para gerar um novo 'access' token sem o usuário precisar logar novamente.

Função do arquivo: Roteamento da aplicação de contas. 
Ele expõe os endpoints estritos de autenticação da biblioteca SimpleJWT, permitindo 
que o frontend (React) estabeleça e mantenha sessões seguras e stateless na API.
"""

from django.urls import path
from rest_framework_simplejwt.views import (  # type: ignore[reportMissingImports]
    TokenObtainPairView,
    TokenRefreshView,
)

urlpatterns = [
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]
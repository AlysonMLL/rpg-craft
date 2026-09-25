from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    # O AbstractUser já traz: username, first_name, last_name, email, password, etc.
    # Podemos adicionar campos extras futuramente aqui (ex: avatar, tier_plano)
    
    class Meta:
        db_table = 'users' # Força o nome da tabela no banco para ficar igual ao seu diagrama
        verbose_name = 'Usuário'
        verbose_name_plural = 'Usuários'

    def __str__(self):
        return self.username
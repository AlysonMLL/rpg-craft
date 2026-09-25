from django.db import models
from django.conf import settings

class Tag(models.Model):
    name = models.CharField(max_length=50)
    slug = models.SlugField(max_length=50, unique=True)

    class Meta:
        db_table = 'tags'
        verbose_name = 'Tag'
        verbose_name_plural = 'Tags'

    def __str__(self):
        return self.name

class World(models.Model):
    # Relacionamento com o usuário que criamos acima
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='worlds'
    )
    name = models.CharField(max_length=100)
    cover_image = models.URLField(blank=True, null=True) # Usando URL para prever o uso de Storage (Supabase/S3)
    synopsis = models.TextField()
    introduction_markdown = models.TextField(blank=True, null=True)
    is_demo = models.BooleanField(default=False)
    display_order = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    
    # Aqui entra a mágica: O Django cria a tabela 'world_tags' no banco automaticamente
    tags = models.ManyToManyField(Tag, related_name='worlds', blank=True)

    class Meta:
        db_table = 'worlds'
        verbose_name = 'Mundo'
        verbose_name_plural = 'Mundos'
        ordering = ['display_order', '-created_at']

    def __str__(self):
        return self.name
from django.contrib import admin
from .models import UsuarioBiblioteca

class UsuarioBibliotecaAdmin(admin.ModelAdmin):
    list_display = ('email', 'telefono', 'direccion', 'fecha_registro', 'activo')
    search_fields = ('email', 'telefono')
    list_filter = ('activo', 'fecha_registro')
    ordering = ('-fecha_registro',)

admin.site.register(UsuarioBiblioteca, UsuarioBibliotecaAdmin)

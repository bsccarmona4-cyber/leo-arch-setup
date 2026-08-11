from django.shortcuts import render
from .models import UsuarioBiblioteca

def lista_usuarios(request):
    usuarios = UsuarioBiblioteca.objects.filter(activo=True)
    return render(request, 'usuarios/lista_usuarios.html', {'usuarios': usuarios})


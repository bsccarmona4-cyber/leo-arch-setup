from django.shortcuts import render
from .models import Libro

def inicio(request):
    libros = Libro.objects.all()
    return render(request, 'inicio.html', {'libros': libros})

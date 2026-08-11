from django.db import models

class UsuarioBiblioteca(models.Model):
    telefono = models.CharField(max_length=20, blank=True, null=True)
    email = models.EmailField(unique=True)
    direccion = models.TextField(blank=True, null=True)
    fecha_registro = models.DateTimeField(auto_now_add=True)
    activo = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.email} - {'Activo' if self.activo else 'Inactivo'}"

    class Meta:
        verbose_name = "Usuario de Biblioteca"
        verbose_name_plural = "Usuarios de Biblioteca"

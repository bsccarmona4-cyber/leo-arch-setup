from django.db import models
from django.core.validators import RegexValidator

class Contacto(models.Model):
    telefono_validator = RegexValidator(
        r'^\+?1?\d{9,15}$',
        message='El numero esta mal checalo'
    )

    nombre = models.CharField(max_length=100)
    telefono = models.CharField(max_length=20, validators=[telefono_validator])
    email = models.EmailField(unique=True, primary_key=True)
    direccion = models.TextField(blank=True)
    favorito = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.nombre} ({self.telefono})"

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)

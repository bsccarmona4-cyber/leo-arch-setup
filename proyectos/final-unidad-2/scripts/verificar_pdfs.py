# -*- coding: utf-8 -*-
from pypdf import PdfReader

for f in ['/home/leo/final-unidad-2/reportes/Reporte_Biblioteca.pdf',
          '/home/leo/final-unidad-2/reportes/Memoria_Trabajo.pdf']:
    r = PdfReader(f)
    txt = ''.join(p.extract_text() or '' for p in r.pages)
    print(f, '| paginas:', len(r.pages), '| chars:', len(txt))
    for k in ['Gestión de Biblioteca', 'Diagrama de clases', 'Polimorfismo',
              'Leonardo', '7 días', '15 días', 'Valle de Toluca',
              'REPORTE DE LIBROS PRESTADOS']:
        print('   contiene', repr(k), ':', k in txt)

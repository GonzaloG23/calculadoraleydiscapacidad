# Plan: Calculadora de Auditoría Ley de Discapacidad — Tucumán

## Objetivo
Construir una calculadora web de una sola pantalla para auditores del Ministerio de Educación de Tucumán. La app recibe los valores de una planilla impresa, realiza los cálculos de la Ley de Discapacidad paso a paso y muestra el resultado para verificar contra el papel.

## Dirección visual elegida
**Audit Terminal** — interfaz oscura tipo terminal de auditoría, tipografía monoespaciada para los números, paneles con bordes sutiles, acentos en cian y verde menta. Sin decoración innecesaria; prioriza claridad numérica y legibilidad.

## Funcionalidad
1. **Entrada de datos**
   
   - Número de boletas (texto libre).
   - Valor remunerativo (numérico).
   - Valor no remunerativo (numérico).
   - Importe Ley 7991 (numérico).
   - Toggle: tratamiento dentro / fuera de la provincia.

2. **Cálculo**
   - `remunerativoAjustado = valorRemunerativo / 0.81`
   - `noRemunerativoAjustado = valorNoRemunerativo - ley7991`
   - `base = remunerativoAjustado + noRemunerativoAjustado`
   - Si es dentro de provincia: `resultado = base * 1.5`
   - Si es fuera de provincia: `resultado = base * 3`
   - El desglose se muestra en tiempo real a medida que se completan los campos.

3. **Validación**
   - Los campos numéricos deben rechazar texto no numérico y mostrar un mensaje de error claro.
   - Valores vacíos se tratan como 0 para no bloquear la vista, pero se indica cuando falta información relevante.

4. **Acciones**
   - Botón **Limpiar**: vacía todos los campos y vuelve al estado inicial.
   - Botón **Imprimir**: abre el diálogo de impresión del navegador con una hoja adaptada para comparar con la planilla impresa.

5. **Restricciones de alcance**
   - Estado local únicamente; sin backend, sin base de datos, sin historial y sin autenticación.
   - Una sola ruta: la página principal `/` reemplaza el placeholder actual.

## Estructura técnica
- `src/routes/index.tsx`: página principal con el formulario, el desglose y los cálculos.
- `src/styles.css`: ajustar los tokens del tema para reflejar la paleta Audit Terminal (fondo oscuro, paneles, acentos cian/menta, tipografías IBM Plex Sans y IBM Plex Mono).
- Head de la ruta con metadatos en español: título, descripción, og:title, og:description, og:type y twitter:card.

## Metadatos sugeridos
- Título: "Calculadora Ley de Discapacidad — Auditoría Tucumán"
- Descripción: "Herramienta de verificación de cálculos para auditorías de la Ley de Discapacidad en el Ministerio de Educación de Tucumán."

## Criterios de aceptación
- Los cálculos respetan la fórmula acordada.
- El desglose se actualiza en tiempo real.
- Los errores de entrada son visibles y comprensibles.
- La página se imprime correctamente.
- No se agrega persistencia ni autenticación.

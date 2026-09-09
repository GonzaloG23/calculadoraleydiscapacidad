# Plan: agregar "Deduc. Hab c/aportes"

## Resumen

Agregar, dentro de cada boleta, un toggle independiente llamado **"Deduc. Hab c/aportes"**. Al activarse se desplegará un único campo numérico manual. El valor ingresado se sumará al campo **Remunerativo** de esa boleta antes de aplicar la lógica de cálculo actual (`÷ 0,81`, resta de Ley 7991, factor 1,5/3 y ajuste por menos de 90 días).

## Comportamiento esperado

1. Cada boleta conserva su propio estado del toggle y su valor de "Deduc. Hab c/aportes".
2. Cuando el toggle está apagado, el campo desaparece y su valor se limpia (se trata como 0).
3. Cuando está activo, el campo se muestra debajo de los campos principales de la boleta.
4. El valor se valida con la misma regla que los demás importes (`isValidAmount`).
5. En el cálculo:
   - `deduccion = b.deducHabAportes ? parseAmount(b.deducHabAportesValor) : 0`
   - `remunerativoEfectivo = remunerativo + deduccion`
   - A partir de ahí se ejecuta la lógica vigente sin cambios.
6. En el desglose de la boleta se mostrará, cuando el valor sea mayor que 0, una línea que indique el aporte extra, por ejemplo: **"Remunerativo + deduc. hab c/aportes"**.
7. El botón Limpiar debe resetear el toggle y el campo a su estado inicial.
8. El campo y el toggle deben estar envueltos en `print-hidden` para no aparecer en la impresión, pero el desglose sí reflejará el cálculo final.

## Detalles técnicos

- Archivo a modificar: `src/routes/index.tsx`.
- Tipos a extender:
  - `Boleta`: agregar
    - `deducHabAportes: boolean`
    - `deducHabAportesValor: string`
  - `CalculationResult`: agregar
    - `deducHabAportes: number`
- Función `nuevaBoleta`: inicializar `deducHabAportes: false` y `deducHabAportesValor: ""`.
- Función `calcular`:
  - Sumar `parseAmount(b.deducHabAportesValor)` al `remunerativo` parseado solo cuando `b.deducHabAportes` sea `true`.
  - El resto del cálculo permanece igual.
- Función `tieneDatos`: considerar el campo adicional solo si el toggle está activo.
- UI:
  - Agregar switch con etiqueta **"Deduc. Hab c/aportes"**.
  - Al desactivarlo, limpiar `deducHabAportesValor`.
  - Mostrar input con etiqueta **"Deduc. Hab c/aportes"** solo cuando el toggle esté activo, con borde de validación cian/rojo.
  - Agrupar toggle y campo dentro de `print-hidden`.
- Desglose:
  - Cuando `deducHabAportes > 0`, mostrar la fila "Remunerativo + deduc. hab c/aportes" con el total combinado antes de continuar con el ajuste 0,81.
- Verificación:
  - `bunx tsgo --noEmit` debe terminar con exit 0.
  - `bun run build` debe reportar `build OK`.
  - Se validará con Playwright que el toggle despliega el campo, que un valor ingresado se suma al remunerativo y que el cálculo final es correcto.

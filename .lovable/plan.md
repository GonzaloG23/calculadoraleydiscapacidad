# Plan: agregar "Haberes con aporte"

## Resumen

Agregar, dentro de cada boleta, un botón/toggle independiente llamado **"Haberes con aporte"**. Al activarse se desplegará un único campo numérico: **"Haberes con aporte"**. El valor ingresado se sumará al campo **Remunerativo** de esa boleta antes de aplicar la lógica de cálculo actual (`÷ 0,81`, resta de Ley 7991, factor 1,5/3 y ajuste por menos de 90 días).

## Comportamiento esperado

1. Cada boleta conserva su propio estado del toggle y su valor de "Haberes con aporte".
2. Cuando el toggle está apagado, el campo desaparece y su valor se limpia (se trata como 0).
3. Cuando está activo, el campo se muestra debajo de los campos principales de la boleta.
4. El valor se valida con la misma regla que los demás importes (`isValidAmount`).
5. En el cálculo:
   - `remunerativoEfectivo = remunerativo + haberesConAporte`
   - A partir de ahí se ejecuta la lógica vigente sin cambios.
6. En el desglose de la boleta se mostrará una línea que indique el aporte extra cuando esté presente, por ejemplo: **"Remunerativo + haberes con aporte"**.
7. El botón Limpiar debe resetear el toggle y el campo a su estado inicial.
8. El campo y el toggle deben estar envueltos en `print-hidden` para no aparecer en la impresión, pero el desglose sí reflejará el cálculo final.

## Detalles técnicos

- Archivo a modificar: `src/routes/index.tsx`.
- Tipos a extender:
  - `Boleta`: agregar `haberesConAporte: boolean` y `haberesConAporteValor: string`.
  - `CalculationResult`: agregar `haberesConAporte: number`.
- Función `nuevaBoleta`: inicializar `haberesConAporte: false` y `haberesConAporteValor: ""`.
- Función `calcular`:
  - Sumar `parseAmount(b.haberesConAporteValor)` al `remunerativo` parseado cuando `b.haberesConAporte` es `true`.
  - El resto del cálculo permanece igual.
- Función `tieneDatos`: considerar el campo adicional solo si el toggle está activo.
- UI:
  - Agregar switch/toggle con etiqueta **"Haberes con aporte"**.
  - Al desactivar, limpiar `haberesConAporteValor`.
  - Mostrar input con etiqueta **"Haberes con aporte"** solo cuando el toggle esté activo, con borde de validación cian/rojo.
- Desglose:
  - Cuando `haberesConAporte > 0`, mostrar línea "Remunerativo + haberes con aporte" con el total correspondiente.
- Verificación:
  - `bunx tsgo --noEmit` debe terminar con exit 0.
  - `bun run build` debe reportar `build OK`.
  - Se validará con Playwright que el toggle despliega el campo, que un valor ingresado se suma al remunerativo y que el cálculo final es correcto.

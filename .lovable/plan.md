# Plan: agregar "Haberes con aporte" y "Deduc. Hab/Aportes"

## Resumen

Agregar, dentro de cada boleta, dos toggles independientes:

- **"Haberes con aporte"**
- **"Deduc. Hab/Aportes"**

Al activarse cada uno se despliega un único campo numérico manual. El valor ingresado se sumará al campo **Remunerativo** de esa boleta antes de aplicar la lógica de cálculo actual (`÷ 0,81`, resta de Ley 7991, factor 1,5/3 y ajuste por menos de 90 días). Ambos conceptos se acumulan: si están activos, sus valores se suman entre sí y al remunerativo original.

## Comportamiento esperado

1. Cada boleta conserva su propio estado de ambos toggles y sus valores asociados.
2. Cuando un toggle está apagado, su campo desaparece y su valor se limpia (se trata como 0).
3. Cuando un toggle está activo, su campo se muestra debajo de los campos principales de la boleta.
4. Los valores se validan con la misma regla que los demás importes (`isValidAmount`).
5. En el cálculo:
   - `haberesConAporte = b.haberesConAporte ? parseAmount(b.haberesConAporteValor) : 0`
   - `deducHabAportes = b.deducHabAportes ? parseAmount(b.deducHabAportesValor) : 0`
   - `remunerativoEfectivo = remunerativo + haberesConAporte + deducHabAportes`
   - A partir de ahí se ejecuta la lógica vigente sin cambios.
6. En el desglose de la boleta se mostrará, cuando corresponda, una o dos líneas que indiquen el aporte extra y/o la deducción de haberes/aportes, por ejemplo:
   - **"Remunerativo + haberes con aporte"**
   - **"Remunerativo + deduc. hab/aportes"**
   Si ambos están activos, se mostrará una línea combinada: **"Remunerativo + haberes con aporte + deduc. hab/aportes"**.
7. El botón Limpiar debe resetear ambos toggles y sus campos a su estado inicial.
8. Los campos y toggles deben estar envueltos en `print-hidden` para no aparecer en la impresión, pero el desglose sí reflejará el cálculo final.

## Detalles técnicos

- Archivo a modificar: `src/routes/index.tsx`.
- Tipos a extender:
  - `Boleta`: agregar
    - `haberesConAporte: boolean`
    - `haberesConAporteValor: string`
    - `deducHabAportes: boolean`
    - `deducHabAportesValor: string`
  - `CalculationResult`: agregar
    - `haberesConAporte: number`
    - `deducHabAportes: number`
- Función `nuevaBoleta`: inicializar ambos en `false` y `""`.
- Función `calcular`:
  - Sumar `parseAmount(b.haberesConAporteValor)` y `parseAmount(b.deducHabAportesValor)` al `remunerativo` parseado solo cuando sus respectivos toggles estén activos.
  - El resto del cálculo permanece igual.
- Función `tieneDatos`: considerar los campos adicionales solo si su toggle está activo.
- UI:
  - Agregar dos switches con etiquetas **"Haberes con aporte"** y **"Deduc. Hab/Aportes"**.
  - Al desactivar cada uno, limpiar su campo correspondiente.
  - Mostrar inputs con etiquetas **"Haberes con aporte"** y **"Deduc. Hab/Aportes"** solo cuando sus toggles estén activos, con borde de validación cian/rojo.
  - Agrupar visualmente ambos toggles y sus campos dentro de `print-hidden`.
- Desglose:
  - Cuando alguno de los dos valores sea mayor que 0, mostrar una línea que combine los conceptos activos antes de la fila de ajuste.
- Verificación:
  - `bunx tsgo --noEmit` debe terminar con exit 0.
  - `bun run build` debe reportar `build OK`.
  - Se validará con Playwright que ambos toggles despliegan sus campos, que los valores ingresados se suman al remunerativo y que los cálculos finales son correctos.

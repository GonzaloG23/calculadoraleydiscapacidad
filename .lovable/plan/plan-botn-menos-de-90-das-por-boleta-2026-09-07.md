# Plan: Botón "menos de 90 días" por boleta

## Objetivo
Agregar a cada boleta una opción para indicar que el agente trabajó menos de 90 días, con un cálculo alternativo.

## Funcionalidad
1. **Nuevo control por boleta**
   - Toggle "Menos de 90 días trabajados" dentro de cada boleta, junto al toggle de tratamiento (dentro/fuera de provincia).
   - Al activarlo, aparece un campo numérico "Días trabajados" (validado con `isValidAmount`, mismo estilo que los demás campos).

2. **Cálculo modificado (solo cuando el toggle está activo)**
   - Hasta la Suma (base) el cálculo es idéntico al actual (incluido el ajuste Ley 7991 cuando corresponde).
   - Luego: `resultado = (base / 30) × diasTrabajados`
     - Dentro de la provincia: el resultado se divide por 2.
     - Fuera de la provincia: queda igual.
   - El desglose en tiempo real muestra los pasos nuevos: "Base ÷ 30", "× días trabajados (N)", y si es dentro de provincia "÷ 2 (dentro de provincia)", reemplazando la fila de factor ×1,5 / ×3,0.
   - Días vacíos se tratan como 0; no bloquea la vista.

3. **Totales y acciones**
   - "Total del agente" suma los resultados igual que antes (cada boleta con su fórmula según corresponda).
   - Limpiar restablece el toggle y los días; Imprimir incluye el nuevo desglose.
   - Estado local únicamente; sin persistencia.

## Estructura técnica
- `src/routes/index.tsx`:
  - `Boleta`: agregar `menos90: boolean` y `dias: string`; `nuevaBoleta` los inicializa (false / "").
  - `calcular`: si `menos90` y hay días válidos → `resultado = (base/30)*dias`, con `/2` si tratamiento "dentro". Extender `CalculationResult` (ej. `menos90`, `dias`, `valorDiario`).
  - Desglose JSX: rama condicional para el caso <90 días.
  - UI: toggle + campo días con validación (`hayInvalidos` incluye el campo días inválido).
- Sin cambios en estilos ni otras rutas.

## Criterios de aceptación
- El toggle aparece en cada boleta de forma independiente.
- Fórmula: base ÷ 30 × días, ÷2 si es dentro de provincia.
- El desglose refleja los pasos nuevos en tiempo real.
- Validación del campo días igual que los demás importes.
- `bun run build` con exit 0.

# Plan: Botón "Adicional de sueldo" por boleta

## Objetivo
Agregar a cada boleta un botón/toggle para cuando existe un adicional de sueldo en algún mes. Al activarlo, aparecen tres campos adicionales cuyos valores se suman al remunerativo, al no remunerativo y a la Ley 7991 originales; con esos totales se hacen los cálculos ya establecidos.

## Funcionalidad

1. **Nuevo control por boleta**
   - Toggle "Adicional de sueldo" dentro de cada boleta, junto al toggle "Menos de 90 días trabajados" (dentro de `print-hidden`, mismo estilo de switch).
   - Independiente por boleta, igual que los demás controles.

2. **Campos adicionales (visibles solo con el toggle activo)**
   - Tres campos numéricos con el mismo estilo y validación (`isValidAmount`, borde cian/rojo) que los existentes:
     - Adicional remunerativo
     - Adicional no remunerativo
     - Adicional Ley 7991
   - Vacío se trata como 0; no bloquea la vista.

3. **Cálculo (solo cuando el toggle está activo)**
   - Primero se suman: `remunerativo + adicionalRem`, `noRemunerativo + adicionalNoRem`, `ley7991 + adicionalLey`.
   - Sobre esos totales se aplica la lógica actual sin cambios: ajuste Ley 7991 (÷0,81 y resta) cuando corresponde, factor ×1,5 / ×3,0, y la rama de menos de 90 días si también está activa.
   - Cuando el toggle está apagado, el cálculo es exactamente el actual.

4. **Desglose en tiempo real**
   - Con adicional activo, el desglose agrega una fila por concepto con el adicional, por ejemplo: "Remunerativo + adicional", "No remunerativo + adicional", "Ley 7991 + adicional", antes de "Suma (base)".
   - El resto del desglose (ajuste 0,81, factor, menos de 90 días) sigue igual y usa los totales sumados.

5. **Totales y acciones**
   - "Total del agente" suma los resultados igual que antes.
   - Limpiar restablece el toggle y los tres campos; Imprimir incluye el desglose con adicionales.
   - Estado local únicamente; sin persistencia.

## Estructura técnica (todo en `src/routes/index.tsx`)

- `Boleta`: agregar `tieneAdicional: boolean`, `adicionalRem: string`, `adicionalNoRem: string`, `adicionalLey: string`; `nuevaBoleta` los inicializa (false / "").
- `calcular`: parsear los adicionales (vacío = 0), validar con `isValidAmount` (devuelve null si alguno es inválido); si `tieneAdicional`, sumar a remunerativo, noRemunerativo y ley7991 antes del ajuste; el resto de la función no cambia.
- `CalculationResult`: agregar `tieneAdicional`, `adicionalRem`, `adicionalNoRem`, `adicionalLey` (números) para el desglose.
- `tieneDatos`: incluir los campos adicionales cuando el toggle está activo.
- Validación: `remOk`/`noRemOk`/`leyOk`/`diasOk` + tres nuevos (`adicionalRemOk` etc.), incluidos en `hayInvalidos`.
- UI: switch "Adicional de sueldo" (al apagarlo se limpian los tres campos, como hace el toggle de días) y, debajo, los tres inputs con labels y `aria-invalid` igual que los campos actuales.
- Desglose JSX: filas condicionales de adicionales cuando `tieneAdicional`.
- Sin cambios en estilos ni otras rutas.

## Criterios de aceptación
- El toggle aparece en cada boleta de forma independiente.
- Con adicional: los cálculos usan remunerativo/noRemunerativo/Ley 7991 sumados con sus adicionales, y el resto de la fórmula (ajuste 0,81, factor, <90 días) funciona igual.
- El desglose muestra las filas de adicionales en tiempo real.
- Validación de los campos adicionales igual que los demás importes (bordes cian/rojo).
- `bun run build` con exit 0.

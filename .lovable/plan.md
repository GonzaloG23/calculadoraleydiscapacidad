# Plan: volver a carga manual de boletas

Objetivo: deshacer el panel "Pegar desde la planilla oficial" agregado en el último cambio y restaurar la calculadora a su funcionamiento manual anterior, donde se tipean los importes en cada boleta.

## Cambios a realizar en `src/routes/index.tsx`

1. Quitar funciones y constantes de parseo de pegado:
   - `const NUM_RE = ...`
   - `function normalizar(s: string)`
   - `function numerosDe(linea: string)`
   - `interface Pegado`
   - `function interpretarPegado(texto: string)`

2. Quitar estados del componente `Index`:
   - `const [pegado, setPegado] = useState("")`
   - `const [avisoPegado, setAvisoPegado] = useState<string | null>(null)`

3. Quitar la función `aplicarPegado`.

4. Actualizar `handleReset` para que solo resetee `boletas` (sin limpiar estados de pegado).

5. Quitar toda la sección JSX del panel "Pegar desde la planilla oficial" (recuadro con textarea, botón "Cargar valores" y mensaje de aviso) que aparece arriba del listado de boletas.

6. Verificar que no queden imports ni referencias sin uso y que `bun run build` termine con exit 0.

## Verificación

- Abrir `/` en el preview y confirmar que no aparece el recuadro de pegar planilla.
- Confirmar que se puede seguir agregando/quintando boletas y cargando los importes manualmente.
- Confirmar que los botones Limpiar e Imprimir siguen funcionando.
# GYST — Agent Rules

## Stack
- Expo SDK 51+, React Native, TypeScript **strict**, Expo Router (file-based routing en `/app`)
- Estado servidor: TanStack Query + `@supabase/supabase-js`
- Estilos: `StyleSheet` nativo — NO styled-components, NO NativeWind, NO Tailwind
- Iconos: `lucide-react-native` (nunca SVGs custom para iconos de sistema)
- Backend: Supabase (Postgres + RLS + Auth)

## Comandos
- Dev: `npx expo start`
- Type check: `npx tsc --noEmit`
- Generar tipos DB: `npx supabase gen types typescript --project-id <id> > types/supabase.ts`

## Convenciones de código
- **Prohibido `any`**. Si el tipo es incierto: `unknown` + type guard.
- Named exports únicamente (excepción: páginas de Expo Router, que requieren `export default`).
- Tipos de base de datos SIEMPRE desde `types/supabase.ts` (generado). Nunca duplicar interfaces manuales de tablas.
- Un hook de TanStack Query por entidad, en `/hooks`: `useRoutines()`, `useExercises()`, `useWorkoutLogs()`.
- Imports absolutos con alias `@/` (definido en `tsconfig.json`), nunca `../../../`.
- Un componente por archivo, PascalCase (`RoutineCard.tsx`).
- IDs siempre `string` (uuid) — nunca `number`.
- Mutaciones: invalidar `queryKey` específico en `onSuccess`. Prohibido `queryClient.refetchQueries()` sin key (invalida todo el cache).
- Queries a Supabase SOLO dentro de `/hooks` o `/lib/api` — nunca directo desde un componente de `/app`.

## Reglas de ejecución (agentes IA / bajo contexto)
1. **Atomización**: 1 tarea = 1 archivo, 15–20 min, ejecutable de forma aislada.
2. **Antes de codear**: leer `.gyst-roadmap.json` → confirmar tarea activa → leer completo el archivo a modificar.
3. **Un archivo por turno**. No tocar un segundo archivo sin aprobación explícita.
4. **Sin refactors fuera de scope**: no "limpiar" código, no renombrar, no tocar imports ajenos a la tarea.
5. **Ambigüedad = STOP**: si el requerimiento admite más de una interpretación, preguntar. No asumir.
6. **Al cerrar tarea**: marcarla `done` en `.gyst-roadmap.json` y detenerse. No encadenar la siguiente tarea sin confirmación.

## Boundaries (no negociable)
- Nunca modificar RLS policies o el schema SQL sin aprobación explícita.
- Nunca hardcodear credenciales Supabase — usar `EXPO_PUBLIC_SUPABASE_URL` / `EXPO_PUBLIC_SUPABASE_ANON_KEY` vía `.env`.
- Nunca commitear `.env` ni claves.
- Nunca crear tablas, columnas o policies nuevas fuera del Paso 1 aprobado sin gate explícito del usuario.

## Patrón de referencia

```typescript
// hooks/useRoutines.ts
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/supabase';

type Routine = Database['public']['Tables']['routines']['Row'];

export function useRoutines() {
  return useQuery<Routine[]>({
    queryKey: ['routines'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('routines')
        .select('*')
        .order('updated_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}
```

```typescript
// hooks/useCloneRoutine.ts (patrón de clonado — decisión arquitectónica #4)
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export function useCloneRoutine() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (sourceRoutineId: string) => {
      const { data, error } = await supabase.rpc('clone_routine', {
        source_id: sourceRoutineId,
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['routines'] });
    },
  });
}
```

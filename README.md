<div align="center">

# GymProgress Gratis

### Registro de entrenamiento centrado en una sola pregunta: ¿estás progresando de verdad?

![React](https://img.shields.io/badge/React-19.2-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL%20%2B%20Auth-3ECF8E?logo=supabase&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white)

</div>

> Este README sirve a dos públicos.
> Si solo quieres **usar la aplicación**, ve a [Puesta en marcha](#-puesta-en-marcha) y [Cómo se usa](#-cómo-se-usa).
> Si quieres **entender o modificar el código**, ve a [Para desarrolladores](#-para-desarrolladores).

---

## 📑 Contenido

- [¿Qué es GymProgress Gratis?](#-qué-es-gymprogress-gratis)
- [¿Para quién es?](#-para-quién-es)
- [Funciones principales](#-funciones-principales)
- [Los conceptos: e1RM, RIR y RPE](#-los-conceptos-e1rm-rir-y-rpe)
- [Puesta en marcha](#-puesta-en-marcha)
- [Configurar la base de datos en Supabase](#-configurar-la-base-de-datos-en-supabase)
- [Cómo se usa](#-cómo-se-usa)
- [Dónde viven los datos](#-dónde-viven-los-datos)
- [Limitaciones actuales](#-limitaciones-actuales)
- [Para desarrolladores](#-para-desarrolladores)
- [Estructura del proyecto](#-estructura-del-proyecto)
- [Arquitectura](#-arquitectura)
- [Modelo de datos](#-modelo-de-datos)
- [Scripts SQL del repositorio](#-scripts-sql-del-repositorio)
- [Seguridad](#-seguridad)
- [Solución de problemas](#-solución-de-problemas)
- [Preguntas frecuentes](#-preguntas-frecuentes)
- [Estado del repositorio](#-estado-del-repositorio)

---

## 🎯 ¿Qué es GymProgress Gratis?

GymProgress Gratis es una aplicación web para registrar entrenamientos de fuerza y medir el
progreso real con una métrica objetiva: el **e1RM** (repetición máxima estimada).

El problema que resuelve: subir de 80 kg × 5 repeticiones a 82.5 kg × 4 no dice a simple vista
si has mejorado o empeorado. Comparar series con distinto peso y distintas repeticiones es
confuso, y por eso mucha gente entrena durante meses sin saber si avanza.

La aplicación convierte cada serie a un **único número comparable** —el peso teórico que
podrías levantar una sola vez— y con él dibuja la tendencia de cada ejercicio: mejorando,
manteniéndose o retrocediendo, con el porcentaje de cambio.

Es la versión gratuita y simplificada de la familia GymProgress: no analiza riesgo de lesión ni
usa IA. Se centra en registrar bien y medir bien, con cuentas de usuario reales y datos
guardados en la nube.

---

## 👥 ¿Para quién es?

| Perfil | Qué obtiene |
|---|---|
| Persona que entrena fuerza | Registro de series, historial por ejercicio y tendencia objetiva de progreso |
| Principiante | Una guía completa dentro de la app (sección *Ayuda*) que explica e1RM, RIR y RPE desde cero |
| Persona que entrena en varios sitios | Cuenta en la nube: los datos siguen ahí desde cualquier dispositivo |
| Desarrollador / reclutador técnico | Ejemplo de SPA React + TypeScript sobre Supabase, con RLS, triggers y estrategia de caché local |

---

## ✨ Funciones principales

**Cuentas y sesión**

- ✅ Registro e inicio de sesión con correo y contraseña (Supabase Auth)
- ✅ **Verificación de correo obligatoria**: no se puede entrar hasta confirmar el email
- ✅ Recuperación y cambio de contraseña
- ✅ Carga instantánea gracias a una caché local del perfil, que se revalida en segundo plano

**Registro de entrenamiento**

- ✅ Registrador de sesiones a pantalla completa (`views/WorkoutLogger.tsx`)
- ✅ Series con peso y repeticiones, varias por ejercicio y varios ejercicios por sesión
- ✅ Registro opcional de **RIR** (0–10) por serie; el **RPE** se deriva automáticamente y ambos se guardan
- ✅ Nota de texto libre por sesión
- ✅ La última serie registrada de ese ejercicio se propone como punto de partida

**Ejercicios**

- ✅ Cinco ejercicios base creados automáticamente al registrarse (press de banca, sentadilla, peso muerto, press militar, dominadas)
- ✅ Crear, editar y eliminar ejercicios propios
- ✅ Cada usuario solo ve y modifica sus propios ejercicios (Row Level Security en la base de datos)

**Análisis**

- ✅ e1RM por ejercicio, con minigráfica de evolución en cada tarjeta de inicio (Recharts)
- ✅ Estado de tendencia: *mejorando* (≥ +2 %), *manteniendo*, *retrocediendo* (≤ −2 %) o *nuevo*
- ✅ Comparación de la última sesión contra el promedio de las dos anteriores
- ✅ RIR y RPE medios de la última sesión de cada ejercicio
- ✅ Detalle por ejercicio con la tabla de sesiones, sus series y la opción de borrar sesiones

**Herramientas**

- ✅ **Calculadora e1RM** independiente: introduce peso y repeticiones y obtén el e1RM, la conversión RIR↔RPE y una estimación de repeticiones máximas
- ✅ Cambio de unidad entre kilogramos y libras en toda la aplicación
- ✅ Sección de **Ayuda** con guía completa: qué es el e1RM, RIR/RPE, cómo saber si progresas, cómo registrar y preguntas frecuentes

**Interfaz**

- ✅ Diseño responsive: barra lateral en escritorio, navegación inferior y menú desplegable en móvil
- ✅ Tema oscuro

---

## 📐 Los conceptos: e1RM, RIR y RPE

Las fórmulas están en `utils/calculations.ts` y son las que la aplicación usa realmente.

### e1RM — repetición máxima estimada (fórmula de Epley)

```text
e1RM = peso × (1 + repeticiones / 30)
```

Si haces 1 repetición, el e1RM es directamente el peso levantado.

Ejemplo: 80 kg × 5 repeticiones → 80 × (1 + 5/30) = **93.3 kg** de e1RM.
Si la semana siguiente haces 85 kg × 4 → 85 × (1 + 4/30) = **96.3 kg**. Has progresado, aunque
hayas hecho menos repeticiones.

Por cada sesión y ejercicio, la app toma el **e1RM más alto** de entre las series efectivas
(descartando calentamientos y series con peso o repeticiones a cero).

### RIR y RPE

- **RIR** (*Reps In Reserve*): cuántas repeticiones te quedaban en el depósito al terminar la serie.
- **RPE** (*Rate of Perceived Exertion*): cuán dura se sintió la serie, del 1 al 10.

La app los relaciona con la equivalencia habitual:

```text
RPE = 10 − RIR
```

Y usa el e1RM como contexto para estimar cuántas repeticiones podrías haber hecho a un peso
dado, o cuántas te quedarían con un RIR objetivo.

### Cálculo de la tendencia

```text
tendencia % = (e1RM de la última sesión − promedio de las 2 sesiones anteriores) / promedio × 100
```

| Tendencia | Estado |
|---|---|
| ≥ +2 % | Mejorando |
| entre −2 % y +2 % | Manteniendo |
| ≤ −2 % | Retrocediendo |
| Sin historial | Nuevo |

---

## 🚀 Puesta en marcha

### Requisitos

- Node.js (el proyecto se compila con Vite 6; se recomienda una versión LTS reciente)
- Una cuenta y un proyecto en [Supabase](https://supabase.com) (el plan gratuito es suficiente)

### 1. Clonar e instalar

```bash
git clone https://github.com/Leoglez10/gymprogress-gratis.git
cd gymprogress-gratis
npm install
```

El repositorio versiona `package-lock.json`, así que el gestor de paquetes es **npm**.

### 2. Configurar las variables de entorno

Copia el ejemplo incluido y rellena los valores de tu proyecto de Supabase:

```bash
cp .env.example .env.local
```

`.env.local` debe quedar así:

```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-clave-anonima-larga
```

Ambos valores están en el panel de Supabase, en *Project Settings → API*.

> ⚠️ Usa siempre la clave **anon / publishable**, nunca la `service_role`. La clave anónima está
> diseñada para viajar al navegador y depende de las políticas RLS para proteger los datos.
> El `.gitignore` cubre `*.local`, de modo que `.env.local` no se sube al repositorio.

### 3. Preparar la base de datos

Antes del primer registro hay que crear las tablas y los triggers. Ver
[Configurar la base de datos en Supabase](#-configurar-la-base-de-datos-en-supabase).

### 4. Arrancar

```bash
npm run dev
```

La aplicación queda en **http://localhost:3000**. El servidor escucha en `0.0.0.0`, así que
también es accesible desde otros dispositivos de la red local.

---

## 🗄 Configurar la base de datos en Supabase

Los scripts viven en la carpeta [`supabase/`](supabase/) y se ejecutan desde el **SQL Editor**
del panel de Supabase. El repositorio no usa la CLI de Supabase ni un sistema de migraciones
versionadas: son scripts sueltos que se aplican a mano.

### Orden recomendado para una instalación nueva

| Orden | Script | Qué hace |
|---|---|---|
| 1 | [`supabase/setup_profiles_trigger.sql`](supabase/setup_profiles_trigger.sql) | Crea la tabla `profiles`, sus políticas RLS y el trigger que crea el perfil al registrarse |
| 2 | [`supabase/exercises-setup.sql`](supabase/exercises-setup.sql) | Crea la tabla `exercises` con RLS y el trigger que siembra 5 ejercicios base por usuario |
| 3 | [`supabase/fix_all_issues.sql`](supabase/fix_all_issues.sql) | ⭐ Script consolidado: corrige los triggers y activa RLS y las políticas de `workout_sessions`, `workout_entries` y `sets` |
| 4 | [`supabase/add-rir-to-sets.sql`](supabase/add-rir-to-sets.sql) | Añade la columna `rir` a `sets` y las restricciones de rango de `rpe` |

> ⚠️ Las tablas `workout_sessions`, `workout_entries` y `sets` **no se crean en ningún script de
> este repositorio**: solo se configuran sus políticas. Si partes de un proyecto de Supabase
> vacío tendrás que crearlas tú a partir de las columnas que usa `services/sessionService.ts`,
> descritas en [Modelo de datos](#-modelo-de-datos).

### Scripts de corrección históricos

Estos scripts corresponden a incidencias ya resueltas y están incluidos como referencia. En una
instalación nueva no hacen falta, porque `fix_all_issues.sql` los engloba:

- `fix-registration-trigger.sql`, `fix_registration_final.sql` — corrección del trigger de alta de usuarios
- `fix-rls-policies.sql`, `fix_sessions_rls.sql` — corrección de políticas RLS
- `recreate-exercises-table.sql` — recreación de la tabla de ejercicios
- `remove_avatar_url.sql` — eliminación de las columnas de foto de perfil

`SESSION_SUMMARY.md` documenta el contexto de esas correcciones (diciembre de 2025).

### Scripts de depuración — no usar en producción

> ⚠️ `supabase/debug-disable-rls.sql` **desactiva Row Level Security** en la tabla `exercises`, lo
> que deja los ejercicios de todos los usuarios legibles por cualquiera.
> `supabase/debug-drop-trigger.sql` elimina el trigger de siembra de ejercicios.
>
> Son herramientas de diagnóstico puntual. Si ejecutas alguna, vuelve a aplicar
> `fix_all_issues.sql` y `exercises-setup.sql` para restaurar la protección.

---

## 🚶 Cómo se usa

### Primer acceso

1. Abre la aplicación: si no hay sesión activa, aparece la pantalla de autenticación.
2. Regístrate con nombre, correo y contraseña.
3. **Revisa tu correo y confirma la cuenta.** La app muestra una pantalla de "Verifica tu correo"
   y bloquea el acceso hasta entonces.
4. Inicia sesión. Al hacerlo se crea tu perfil y tus 5 ejercicios base.

### Flujo: registrar una sesión

1. *Registrar Sesión* (botón central en móvil, o *Registrar Sesión* en la barra lateral).
2. Selecciona un ejercicio.
3. Añade series con peso y repeticiones.
4. Opcionalmente indica el RIR de cada serie; el RPE se calcula solo.
5. Añade más ejercicios si hace falta, escribe una nota de sesión y finaliza.
6. La sesión se guarda en Supabase; si falla, permanece en la copia local.

### Flujo: ver si estás progresando

1. *Inicio*: cada ejercicio muestra su e1RM actual y una etiqueta de tendencia con el porcentaje.
2. Pulsa un ejercicio para abrir el detalle: tabla de sesiones con sus series, RIR y RPE, y la
   posibilidad de borrar sesiones concretas.

### Flujo: estimar un máximo sin arriesgarte

1. *Calculadora*.
2. Introduce peso y repeticiones de una serie exigente.
3. Obtienes el e1RM y, si añades RIR o RPE, una estimación de las repeticiones que podrías hacer.

### Flujo: cambiar de kilos a libras

*Perfil* → unidad de peso. El cambio afecta a toda la aplicación. Internamente todo se almacena
en kilogramos y la conversión es solo de presentación.

---

## 💾 Dónde viven los datos

La aplicación usa un modelo **híbrido**: la nube es la fuente de verdad y el navegador guarda
una copia para que la app cargue al instante y siga siendo utilizable si la red falla.

### En la nube (Supabase / PostgreSQL)

Perfiles, ejercicios, sesiones, entradas y series. Protegido con Row Level Security: cada
usuario solo accede a sus propias filas.

### En el navegador (`localStorage`)

| Clave | Contenido |
|---|---|
| `gymprogress_user_cache` | Perfil en caché para el arranque instantáneo |
| `gp_profile_v2` | Perfil local (nombre, alias, unidad de peso) |
| `gp_exercises` | Copia local de la lista de ejercicios |
| `gp_sessions` | Copia local de las sesiones |
| `sb-<proyecto>-auth-token` | Token de sesión gestionado por Supabase |

Cómo se combinan: al abrir una vista se pinta primero la copia local y después se intenta traer
los datos remotos; si la petición funciona, sustituyen a los locales; si falla, la app registra
un aviso en consola y sigue con la copia local.

### Copia de seguridad

No hay función de exportación en la interfaz. La copia de seguridad real es la del proyecto de
Supabase, desde su propio panel. Cerrar sesión limpia la caché local, pero **no borra nada de la
base de datos**.

> ⚠️ *Perfil → Zona de Peligro* ejecuta `localStorage.clear()` y recarga la página. Borra la
> copia local, no los datos de la nube.

---

## ⚠️ Limitaciones actuales

- **Editar una sesión ya guardada no está implementado**: el botón muestra un aviso de
  "Próximamente". Sí se puede borrar una sesión y volver a registrarla.
- **No se pueden marcar series de calentamiento desde la interfaz**: el campo `isWarmup` existe en
  el modelo y se filtra en los cálculos, pero el registrador guarda todas las series como efectivas.
- **El campo de variante por ejercicio** (`variant`) existe en el modelo y en los servicios, pero
  no hay control para rellenarlo en el registrador.
- **Las tablas de entrenamiento no tienen script de creación** en el repositorio (ver arriba).
- **No hay migraciones versionadas**: los scripts SQL se aplican manualmente y algunos se
  solapan entre sí.
- **La foto de perfil se retiró** del producto. Quedan restos en el código: `services/profileService.ts`
  (subida a un bucket `avatars`) no se importa desde ningún sitio, y `App.tsx` y `views/Home.tsx`
  siguen leyendo un campo `photoUrl` que ya no existe en `types.ts`.
- **`react-router-dom` está en las dependencias pero no se usa**: la navegación es un `useState`
  con vistas condicionales.
- **Tailwind está configurado dos veces**: vía PostCSS (Tailwind 4, `index.css`) y además por CDN
  desde `index.html`. Funciona, pero es redundante.
- **No hay tests automatizados** ni linter configurado. `test_new_user_flow.js` es un script
  manual de diagnóstico del alta de usuarios, no una suite.
- **No hay integración continua** ni licencia declarada.

---

## 👨‍💻 Para desarrolladores

### Stack

| Capa | Tecnología |
|---|---|
| UI | React 19.2 |
| Lenguaje | TypeScript 5.8 |
| Bundler / dev server | Vite 6 |
| Estilos | Tailwind CSS 4 vía `@tailwindcss/postcss` (más una carga adicional por CDN en `index.html`) |
| Iconos | lucide-react |
| Gráficas | Recharts 3.5 |
| Backend | Supabase (PostgreSQL + Auth + Storage), `@supabase/supabase-js` 2.87 |
| Caché local | `localStorage` |

### Scripts disponibles

| Script | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo en el puerto 3000, escuchando en `0.0.0.0` |
| `npm run build` | Compila la aplicación para producción |
| `npm run preview` | Sirve localmente el resultado de `build` |

> El proyecto no define scripts de test, lint ni typecheck. Para comprobar tipos:
> `npx tsc --noEmit` (`tsconfig.json` usa `noEmit: true`).

### Variables de entorno

| Variable | Obligatoria | Descripción |
|---|---|---|
| `VITE_SUPABASE_URL` | Sí | URL del proyecto de Supabase |
| `VITE_SUPABASE_ANON_KEY` | Sí | Clave anónima (publishable) del proyecto |

Están tipadas en `vite-env.d.ts` y se consumen en `services/supabase.ts`, que imprime en consola
un diagnóstico si faltan. Sin ellas la aplicación arranca, pero cualquier operación contra
Supabase falla.

### Configuración relevante

- **Puerto de desarrollo**: 3000, host `0.0.0.0` (`vite.config.ts`).
- **Hosts permitidos**: `vite.config.ts` autoriza explícitamente dominios `*.ngrok-free.app` y dos
  subdominios concretos de `trycloudflare.com`, usados para exponer el servidor de desarrollo por
  un túnel durante las pruebas en móvil. Si usas otro túnel, añade su dominio a `allowedHosts`.
- **Alias de importación**: `@/` apunta a la raíz del proyecto.
- **`metadata.json`**: descriptor del proyecto para Google AI Studio; no lo consume el código.

### Script de diagnóstico del alta de usuarios

`test_new_user_flow.js` es un script de Node que lee `.env.local` a mano y ejecuta un alta de
prueba contra Supabase para verificar que los triggers de perfil y ejercicios funcionan:

```bash
node test_new_user_flow.js
```

`test_log.txt` conserva la salida de una ejecución fallida anterior (el error de trigger que
resolvió `fix_all_issues.sql`); es un registro histórico, no el estado actual.

---

## 🗺 Estructura del proyecto

```text
gymprogress-gratis/
├── index.html                    ← Punto de entrada
├── index.tsx                     ← Montaje de React
├── index.css                     ← Import de Tailwind y estilos base
├── App.tsx                       ← ⭐ Guardia de sesión, layout y navegación por vistas
├── types.ts                      ← Modelos de dominio
├── vite.config.ts                ← Puerto, alias y hosts de túnel permitidos
├── .env.example                  ← Plantilla de variables de entorno
├── views/                        ← Pantallas completas
│   ├── Auth.tsx                  ← Login, registro, verificación y recuperación
│   ├── Home.tsx                  ← ⭐ Lista de ejercicios con e1RM y tendencia
│   ├── WorkoutLogger.tsx         ← ⭐ Registro de la sesión
│   ├── Exercises.tsx             ← CRUD de ejercicios
│   ├── Calculator.tsx            ← Calculadora e1RM / RIR / RPE
│   ├── Profile.tsx               ← Perfil, unidad de peso y reinicio local
│   └── Help.tsx                  ← Guía de usuario dentro de la app
├── components/
│   ├── ExerciseCard.tsx          ← Tarjeta de ejercicio con minigráfica de e1RM
│   ├── ExerciseDetailModal.tsx   ← Detalle e historial de sesiones del ejercicio
│   ├── TrendBadge.tsx            ← Etiqueta de tendencia
│   └── UnverifiedBanner.tsx      ← Aviso de cuenta sin verificar
├── services/                     ← Acceso a datos
│   ├── supabase.ts               ← Cliente de Supabase
│   ├── auth.ts                   ← ⭐ Registro, login, perfil y contraseñas
│   ├── exerciseService.ts        ← Ejercicios remotos y sincronización de IDs
│   ├── sessionService.ts         ← ⭐ Alta y lectura de sesiones, entradas y series
│   ├── profileService.ts         ← Avatares y perfil (código sin uso actual)
│   ├── store.ts                  ← Copia local en localStorage
│   └── cache.ts                  ← Caché del perfil para el arranque instantáneo
├── utils/
│   └── calculations.ts           ← ⭐ e1RM, conversiones RIR/RPE y tendencias
└── supabase/                     ← Scripts SQL (aplicación manual)
```

> 💡 Regla rápida:
> - Una pantalla nueva → `views/` y registrarla en el tipo `View` de `App.tsx`
> - Una consulta o mutación → `services/`
> - Una fórmula o métrica → `utils/calculations.ts`
> - Un cambio de esquema → un script nuevo en `supabase/`

---

## 🏗 Arquitectura

```text
       views/  (pantallas)
            ↓
      services/  (acceso a datos)
        ↓         ↓
   Supabase    store.ts + cache.ts
  (PostgreSQL,  (localStorage:
   Auth, RLS)    copia y arranque rápido)
            ↑
   utils/calculations.ts
   (e1RM, RIR/RPE, tendencias — sin dependencias externas)
```

Decisiones observables en el código:

- **Sesión con verificación estricta.** `App.tsx` y `services/auth.ts` comprueban
  `email_confirmed_at` tanto al iniciar como en cada evento de `onAuthStateChange`, y fuerzan el
  cierre de sesión si el correo no está confirmado.
- **Arranque optimista.** El perfil en caché se pinta de inmediato y la validación contra
  Supabase corre en segundo plano, sin bloquear la interfaz.
- **Lectura remota con reserva local.** Cada vista intenta la carga remota y, si falla, conserva
  la copia local en lugar de mostrar un error.
- **Conciliación de IDs de ejercicio.** Un ejercicio creado sin conexión tiene un ID temporal;
  `exerciseService.ensureRemoteExercise()` lo materializa en Supabase antes de guardar la sesión,
  para evitar claves ajenas inválidas.
- **Escrituras tolerantes a fallos.** `profileService.updateProfile()` aplica un tiempo límite de
  30 s y, si Supabase no responde, avisa y deja continuar con el guardado local en vez de lanzar
  una excepción.
- **Los pesos se almacenan siempre en kilogramos**; la unidad del usuario es solo presentación.

---

## 🗃 Modelo de datos

Tablas de PostgreSQL que el código utiliza, según los scripts SQL y las consultas de `services/`:

| Tabla | Columnas usadas por la aplicación |
|---|---|
| `profiles` | `id` (FK a `auth.users`), `full_name`, `nombre_mostrar`, `weight_unit` / `unidad_peso`, `website`, `updated_at` |
| `exercises` | `id`, `user_id`, `name`, `muscle_group`, `is_custom`, `created_at`; único por `(user_id, name)` |
| `workout_sessions` | `id`, `user_id`, `started_at`, `notes`, `name` |
| `workout_entries` | `id`, `session_id`, `exercise_id`, `order_index`, `notes` (guarda la variante) |
| `sets` | `id`, `entry_id`, `set_number`, `weight_kg`, `reps`, `rpe`, `rir` |

Almacenamiento: el bucket `avatars` solo aparece en `services/profileService.ts`, que actualmente
no se usa.

Automatismos en la base de datos (triggers `AFTER INSERT` sobre `auth.users`):

- `handle_new_user_profile()` crea la fila de `profiles` con el nombre indicado en el registro.
- `handle_new_user_exercises()` siembra los 5 ejercicios base del usuario.

> ⚠️ Las columnas de perfil están duplicadas en español e inglés (`weight_unit` / `unidad_peso`,
> `full_name` / `nombre_mostrar`). El código escribe ambas y lee la que encuentre. Es deuda
> técnica de una migración de nomenclatura a medias.

---

## 📜 Scripts SQL del repositorio

| Archivo | Tipo | Propósito |
|---|---|---|
| [`setup_profiles_trigger.sql`](supabase/setup_profiles_trigger.sql) | Instalación | Tabla `profiles`, RLS y trigger de perfil |
| [`exercises-setup.sql`](supabase/exercises-setup.sql) | Instalación | Tabla `exercises`, RLS, trigger de siembra y migración de usuarios existentes |
| [`fix_all_issues.sql`](supabase/fix_all_issues.sql) | Instalación / corrección | Script consolidado: triggers corregidos y RLS de sesiones, entradas y series |
| [`add-rir-to-sets.sql`](supabase/add-rir-to-sets.sql) | Migración | Columna `rir`, rango de `rpe`, índice y `set_number >= 1` |
| [`fix-registration-trigger.sql`](supabase/fix-registration-trigger.sql) | Histórico | Corrección del trigger de alta |
| [`fix_registration_final.sql`](supabase/fix_registration_final.sql) | Histórico | Versión final de esa corrección |
| [`fix-rls-policies.sql`](supabase/fix-rls-policies.sql) | Histórico | Corrección de políticas RLS |
| [`fix_sessions_rls.sql`](supabase/fix_sessions_rls.sql) | Histórico | RLS de sesiones |
| [`recreate-exercises-table.sql`](supabase/recreate-exercises-table.sql) | Histórico | Recreación de `exercises` |
| [`remove_avatar_url.sql`](supabase/remove_avatar_url.sql) | Histórico | Eliminación de columnas de foto |
| [`debug-disable-rls.sql`](supabase/debug-disable-rls.sql) | 🧪 Depuración | Desactiva RLS en `exercises`. **No usar en producción** |
| [`debug-drop-trigger.sql`](supabase/debug-drop-trigger.sql) | 🧪 Depuración | Elimina el trigger de ejercicios. **No usar en producción** |

---

## 🔐 Seguridad

Estado actual, verificado en el código:

- ✅ El repositorio **no contiene credenciales**. Las claves se aportan por `.env.local`, cubierto
  por el patrón `*.local` del `.gitignore`.
- ✅ El aislamiento entre usuarios se apoya en **Row Level Security** de PostgreSQL: cada política
  compara `auth.uid()` con `user_id`, y las de `workout_entries` y `sets` lo hacen en cascada
  a través de la sesión propietaria.
- ✅ La verificación de correo es obligatoria y se comprueba en varios puntos del flujo de sesión.
- ⚠️ La política `"Public profiles are viewable by everyone"` de `setup_profiles_trigger.sql`
  permite `SELECT` sobre `profiles` a cualquiera (`USING (true)`). Expone nombres y alias de
  todos los usuarios. Si no necesitas perfiles públicos, restríngela a `auth.uid() = id`.
- ⚠️ `debug-disable-rls.sql` desactiva la protección de la tabla `exercises`. Está en el
  repositorio como herramienta de diagnóstico; ejecutarlo en producción deja los ejercicios de
  todos los usuarios al descubierto.
- ⚠️ Los servicios registran abundante información en la consola del navegador (identificadores
  de usuario, correos, eventos de sesión). Conviene retirar esos `console.log` antes de un
  despliegue público.

---

## 🔧 Solución de problemas

| Problema | Causa probable | Solución |
|---|---|---|
| La consola muestra `❌ CRITICAL: Faltan las variables de entorno de Supabase!` | No existe `.env.local` o las variables no llevan el prefijo `VITE_` | Crear `.env.local` a partir de `.env.example` y reiniciar `npm run dev` |
| Al registrarse aparece "Database error saving new user" | Los triggers de `auth.users` referencian columnas que no existen | Ejecutar [`supabase/fix_all_issues.sql`](supabase/fix_all_issues.sql) en el SQL Editor |
| "Debes verificar tu correo electrónico antes de entrar" | La cuenta existe pero el correo no se ha confirmado | Abrir el enlace de confirmación enviado por Supabase |
| No se pueden borrar sesiones | Falta la política `DELETE` en `workout_sessions` | Ejecutar [`supabase/fix_all_issues.sql`](supabase/fix_all_issues.sql) |
| La lista de ejercicios está vacía tras registrarse | El trigger de siembra no se ejecutó | Ejecutar [`supabase/exercises-setup.sql`](supabase/exercises-setup.sql) y volver a registrarse |
| El servidor de desarrollo rechaza la conexión desde un túnel | El dominio del túnel no está en `allowedHosts` | Añadirlo en `vite.config.ts` |
| Datos locales desincronizados de la nube | Caché local desactualizada | *Perfil → Zona de Peligro*: limpia la copia local (no borra la base de datos) |

---

## ❓ Preguntas frecuentes

**¿Necesito internet?**
Sí, para iniciar sesión y sincronizar. Con la sesión ya cargada, la app puede seguir mostrando la
copia local si la red falla, pero las sesiones nuevas necesitan llegar a Supabase para guardarse
de forma permanente.

**¿Puedo usarla en varios dispositivos?**
Sí. Los datos están en Supabase y se recuperan al iniciar sesión.

**¿Por qué mi peso aparece redondeado en las gráficas?**
Los e1RM se muestran como enteros para que las gráficas sean legibles. La calculadora permite más
precisión.

**¿Qué series entran en el cálculo del e1RM?**
Solo las series con peso y repeticiones mayores que cero, y las que no estén marcadas como
calentamiento. El modelo de datos contempla el marcado de calentamiento (`isWarmup`), pero el
registrador todavía no ofrece un control para activarlo: hoy todas las series se guardan como
efectivas.

**¿Qué pasa si borro una sesión?**
Se elimina de la base de datos y el e1RM y la tendencia de los ejercicios implicados se
recalculan. No es reversible desde la aplicación.

**¿Puedo editar una sesión pasada?**
Todavía no. Está señalado como "Próximamente" dentro de la app. La alternativa es borrarla y
volver a registrarla.

**¿Necesito una API key de IA?**
No. Esta versión no usa modelos de lenguaje. Si un README anterior lo mencionaba, era una
plantilla heredada de Google AI Studio.

---

## 📌 Estado del repositorio

| Aspecto | Estado |
|---|---|
| Backend | Supabase (PostgreSQL + Auth) |
| Autenticación | Real, con verificación de correo obligatoria |
| Migraciones | Scripts SQL manuales, sin versionar |
| Tests | No hay suite; solo un script de diagnóstico |
| Linter | No configurado |
| CI/CD | No configurado |
| Licencia | No declarada |

---

<div align="center">

Desarrollado por **Leonardo González**

[![GitHub](https://img.shields.io/badge/GitHub-Leoglez10-181717?logo=github&logoColor=white)](https://github.com/Leoglez10)

</div>

# Ingenius Task Manager

Aplicación web para gestión de proyectos y tareas, desarrollada como prueba técnica para Frontend Developer en Ingenius. La implementación se enfocó en cubrir el enunciado funcional al 100% con una arquitectura limpia y testeable. La base de Tailwind v4 + shadcn/ui permite refinar el diseño sin tocar lógica de negocio.

> **Nota sobre el idioma:** este README está redactado en español por estar dirigido a un equipo hispanohablante. Las convenciones técnicas internas (mensajes de commit, comentarios de código, identificadores, valores de enum) se mantienen en inglés siguiendo estándares profesionales.

## Stack tecnológico

- **Framework:** Next.js 16 (App Router) con TypeScript estricto.
- **Estilos:** Tailwind CSS v4 + shadcn/ui (sobre Base UI).
- **Persistencia:** Prisma 6 + SQLite.
- **Autenticación:** NextAuth v5 (Credentials Provider con JWT).
- **Validación:** Zod 4.
- **Formularios:** React Hook Form + Zod resolver.
- **Tests:** Vitest (dominio puro).

## Acceso rápido

### Requisitos

- Node.js 20+
- pnpm

### Instalación

```bash
git clone https://github.com/GeraldMisa27/ingenius-task-manager.git
cd ingenius-task-manager
pnpm install
```

### Variables de entorno

Crear archivo `.env` en la raíz copiando `.env.example`:

```bash
cp .env.example .env
```

**Fuente de verdad:** todas las claves necesarias están en `.env.example` (`DATABASE_URL`, `AUTH_SECRET`, `NEXTAUTH_URL`). Sustituir `AUTH_SECRET` por una cadena aleatoria larga (por ejemplo `openssl rand -base64 32`).

**SQLite:** el valor `DATABASE_URL="file:./dev.db"` es el mismo que en `.env.example`. Prisma resuelve rutas relativas respecto al directorio donde está `schema.prisma` (`prisma/`), por lo que el archivo de base queda en `prisma/dev.db`.

En despliegues donde el host no se detecta bien, Auth.js puede requerir `AUTH_TRUST_HOST=true`; no está en `.env.example` porque en desarrollo local suele bastar `NEXTAUTH_URL`.

### Base de datos + datos demo

```bash
pnpm prisma migrate reset --force
```

Este comando:

- Borra y recrea la base SQLite (en `prisma/dev.db`).
- Aplica las migraciones.
- Ejecuta el seed con datos de demostración.

Si solo quieres reaplicar el seed sin recrear la base:

```bash
pnpm db:seed
```

### Levantar la aplicación

```bash
pnpm dev
```

La app queda disponible en `http://localhost:3000`.

### Credenciales demo

Tres usuarios prepoblados, todos con contraseña `demo1234`:

| Email | Rol en el seed |
|---|---|
| `alice@demo.local` | Jefa del proyecto activo "Lanzamiento del producto" y del proyecto archivado "Migración legacy" (en ambos figura como `ownerId`, no aparece en `ProjectMember`: el jefe es miembro implícito). |
| `bob@demo.local` | Miembro de "Lanzamiento del producto". |
| `carol@demo.local` | Miembro de "Lanzamiento del producto". |

## Funcionalidades implementadas

Todas las del enunciado:

- Registro y autenticación de usuarios (con validación de email y contraseña mínima de 8 caracteres).
- Listar, crear, editar, eliminar y archivar/desarchivar proyectos.
- Listar tareas de un proyecto, crear, eliminar y modificar estado y prioridad.
- Asociar usuarios a un proyecto (por correo electrónico) y darlos de baja.
- Reasignación atómica de tareas al jefe cuando se da de baja a un miembro.
- Permisos por rol: jefe gestiona todo el proyecto; miembros solo crean tareas y gestionan las propias; tareas de otros miembros son consultables.
- Proyectos archivados son de solo lectura para tareas y miembros.

## Estructura del proyecto

Arquitectura **feature-first**: cada dominio del problema (auth, projects, tasks, members) se encapsula en su propia carpeta con domain, server (repositorio + actions), components y validación.

Árbol esquemático (no exhaustivo):

```
src/
├── app/
│   ├── login/                          # Página pública de login
│   ├── register/                       # Página pública de registro
│   ├── (protected)/                    # Route group con auth guard
│   │   ├── layout.tsx
│   │   └── projects/
│   │       ├── page.tsx                # Dashboard
│   │       └── [id]/page.tsx           # Detalle de proyecto
│   ├── api/auth/[...nextauth]/route.ts # NextAuth handler
│   ├── layout.tsx                      # Root layout
│   ├── globals.css                     # Tailwind + design tokens
│   └── page.tsx                        # Redirect según sesión
├── core/                               # Infraestructura compartida
│   ├── prisma.ts                       # Cliente Prisma singleton
│   ├── auth/                           # NextAuth con split Edge-safe
│   ├── errors/                         # Errores de dominio tipados
│   └── server/                         # Helpers de Server Actions
├── features/                           # Dominios de negocio
│   ├── auth/
│   ├── projects/
│   ├── tasks/
│   └── members/
│       ├── domain/                     # Lógica pura testeable
│       ├── server/                     # Repositorio + Server Actions
│       ├── components/                 # UI específica de la feature
│       └── validation.ts               # Schemas Zod
├── components/ui/                      # Componentes shadcn/ui
├── lib/utils.ts                        # cn helper
├── shared/validation/                  # Helpers Zod compartidos
└── proxy.ts                            # Route guard (Next.js 16)
```

Y a nivel de raíz: `prisma/` (schema, migrations, seed) y `src/generated/prisma/` (cliente Prisma generado).

## Decisiones técnicas

### Server Actions en lugar de API REST

Toda la mutación de datos se realiza a través de Server Actions de Next.js, no a través de endpoints REST. Esto reduce código boilerplate (no hay capa de fetching cliente), mantiene la lógica server-side y aprovecha `revalidatePath` para refresco automático de datos.

### Arquitectura feature-first

Cada feature (auth, projects, tasks, members) contiene su dominio, infraestructura, componentes y validaciones. Esto facilita:

- Mover una feature a otra parte del proyecto sin tocar imports cruzados.
- Aislar tests de dominio puro de infraestructura.
- Onboarding de nuevos desarrolladores (cada carpeta cuenta una historia completa).

### Dominio puro testeado

Las reglas de negocio (permisos por rol, validación de archivado, autorización de acciones) viven en funciones puras dentro de `features/<feature>/domain/permissions.ts`. Estas funciones:

- No dependen de Prisma, NextAuth ni infraestructura.
- Reciben datos planos como input.
- Devuelven booleanos.

Hay 41 tests Vitest que cubren todas estas reglas (18 para projects, 12 para tasks, 11 para members).

### NextAuth v5 con split Edge-safe

Next.js 16 ejecuta `proxy.ts` (antes `middleware.ts`) en runtime Edge, donde Prisma y bcrypt no funcionan. Para que el guard de rutas siga funcionando, la configuración de NextAuth está dividida:

- `core/auth/auth.config.ts` — Edge-safe (sin Prisma ni bcrypt). Lo usa `proxy.ts`.
- `core/auth/auth.ts` — Node runtime con Credentials Provider y bcrypt. Lo usan los Server Actions y el route handler.

Este patrón está documentado por el equipo de Auth.js como solución oficial.

### Migración a `proxy.ts` (Next.js 16)

A mitad del desarrollo, Next.js 16 deprecó `middleware.ts` en favor de `proxy.ts`. La configuración fue migrada siguiendo la documentación oficial. Funcionalmente equivalente, pero más explícito sobre que es un mecanismo de proxying y no de middleware HTTP tradicional.

### Errores tipados con mapper

Los Server Actions devuelven siempre un `ActionResponse<T>` con shape `{ ok: true, data } | { ok: false, error }`. Los errores son clases tipadas (`UnauthorizedError`, `ForbiddenError`, `NotFoundError`, `ValidationError`, `BusinessRuleError`) que se traducen al cliente mediante un mapper que extrae `fieldErrors` de los errores de Zod.

### Server Components por defecto, Client Components donde es estrictamente necesario

Las páginas (`/projects`, `/projects/[id]`) son Server Components que hacen `auth()`, fetchan datos con repositorios y pasan props a los componentes de presentación. Solo se marca `"use client"` en componentes con interactividad real (formularios, dropdowns, transiciones).

### Validación en frontera con Zod

Los Server Actions parsean su input con Zod antes de cualquier operación. Esto garantiza que los tipos en el dominio sean realmente válidos en runtime, no solo en compilación.

## Reglas de negocio destacables

### Transferencia atómica de tareas

Al dar de baja a un miembro, sus tareas se reasignan al jefe del proyecto en una **transacción Prisma atómica** dentro del Server Action `removeMember` (usando `prisma.$transaction`). No es un workflow en dos pasos: o ambas operaciones tienen éxito (reasignación + baja), o ninguna se aplica.

### El jefe es miembro implícito

El usuario que crea un proyecto NO se inserta en `ProjectMember`. Se considera miembro por ser `ownerId`. Esto evita inconsistencias (qué pasa si el jefe se da de baja a sí mismo) y simplifica las queries.

### Outsiders no acceden a páginas de proyectos ajenos

Si un usuario que no es jefe ni miembro accede manualmente a `/projects/[id]`, la página detecta el rol via `deriveProjectRole` y redirige al dashboard. La protección no está solo en el dominio sino también en la frontera de la página.

## Estrategia de testing

El proyecto cuenta con **41 tests Vitest** sobre funciones puras de dominio, cubriendo las reglas de autorización del enunciado:

- Permisos de proyecto por rol (owner/member/outsider).
- Permisos de tarea según creador, asignado y rol.
- Permisos de gestión de miembros.
- Restricciones de archivado.

**Decisión consciente:** no se añadieron tests de UI ni de integración con Prisma porque:

- El dominio puro encapsula la lógica crítica del enunciado y se testea sin levantar infraestructura.
- Los Server Actions están validados implícitamente al orquestar componentes ya testeados (auth + dominio + repositorios).
- Los tests de UI tienen ROI bajo en proyectos pequeños comparados con verificación manual.

> **Nota:** la atomicidad de la transacción de `removeMember` (reasignación + baja) está garantizada en código de producción mediante `prisma.$transaction`. No se cubre con un test de integración; es una mejora declarada en la sección siguiente.

## Sobre el diseño visual

La interfaz cubre el enunciado funcional con un diseño limpio basado en shadcn/ui sobre Tailwind v4. Decisiones tomadas:

- **Base sólida con shadcn/ui sobre Tailwind v4:** el sistema de design tokens (colores, espaciado, tipografía) ya está establecido y es accesible por defecto. Refinar paleta o componentes es directo.
- **Modo claro únicamente:** las variables CSS para dark mode están presentes en `globals.css` (`@custom-variant dark` y bloque `.dark`) pero no se implementó un toggle ni la clase se aplica al layout.
- **Confirmaciones nativas (`confirm()` y `alert()`):** funcionales para una prueba técnica; documentadas como mejora futura para migrar a modales de Dialog.
- **Sin animaciones extensas ni micro-interacciones:** el foco fue cubrir el enunciado funcional al 100%.

El refinamiento visual (paleta personalizada, animaciones, modo oscuro, modales custom) es una capa que se aplica sobre la arquitectura ya establecida sin tocar lógica de negocio. Ese trabajo está listado en "Mejoras futuras" abajo.

## Mejoras futuras

Decisiones tomadas conscientemente por alcance temporal de la prueba; en una siguiente iteración:

1. **Modales de Dialog para confirmaciones destructivas.** Actualmente se usa `confirm()` nativo del navegador para "Eliminar proyecto", "Eliminar tarea" y "Dar de baja a miembro". En producción se reemplazaría por un componente `ConfirmDialog` reutilizable basado en el `Dialog` de shadcn ya integrado.

2. **Sistema de notificaciones (Toast) para feedback de errores.** Hoy los errores de Server Actions se muestran con `alert()`. Migrar a un sistema de toast (sonner o similar) mejoraría la UX sin bloquear la interacción.

3. **Permiso de edición de tarea alineado con assignee.** Actualmente, si un miembro creador de una tarea es dado de baja y posteriormente readmitido, recupera permisos sobre tareas que ahora están asignadas al jefe. La regla `canEditTask` se basa solo en `creatorId`. Una mejora sería exigir `creatorId === userId && assigneeId === userId` para alinear el permiso con la regla de transferencia automática.

4. **Tests de integración para Server Actions críticos.** Aunque el dominio puro está cubierto, una capa adicional de tests de integración sobre `transferOwnership`, `removeMember` (verificando atomicidad real de la transacción Prisma) y `archiveProject` aumentaría la confianza ante cambios futuros.

5. **Endpoint GraphQL de consulta** para clientes terceros (no solicitado en el enunciado).

6. **Resolver warning de NFT/Turbopack en build.** El build muestra un warning conocido del traceable file tracer al rastrear la cadena Prisma → auth → API route. No afecta el funcionamiento pero conviene investigar configuración alternativa de Prisma con Turbopack.

7. **Modo oscuro.** Las variables CSS para dark mode están presentes en `globals.css` pero deshabilitadas (no hay toggle ni clase `.dark` aplicada al layout). Habilitarlas es directo.

8. **Refinamiento visual general.** Paleta personalizada, animaciones de transición, micro-interacciones en hover, mejoras de tipografía. Capa de polish que se aplica sobre la arquitectura ya establecida.

## Autor

**Gerald Misa**  
Email: geraldmisa0@gmail.com  
GitHub: [@GeraldMisa27](https://github.com/GeraldMisa27)

# Registro de Progreso MediTrack - 24 Enero 2026

## 🎯 Estado del Proyecto

**Versión Actual:** MVP (Producto Viable Mínimo) Funcional.
**Plataforma Operativa:** Android (Expo Go / Emulator) & Windows (Entorno de desarrollo).
**Estética:** Diseño Premium "Clean Medical" (Teal/Blue/Slate) inspirado en Daily Dose App.

## 🚀 Funcionalidades Implementadas Hoy

### 1. Core & Configuración 🛠️

- **Estabilidad en Windows:** Se resolvió el conflicto entre Expo SDK 54 y NativeWind v4 downgrading a **NativeWind v2**, logrando un entorno de desarrollo estable.
- **Base de Datos (SQLite):** Implementación completa de `expo-sqlite` con tablas relacionales:
  - `users`: Gestión de usuarios con Nombre, Email y Rol.
  - `medications`: Tratamientos, dosis, frecuencia y horarios.
  - `history`: Registro de tomas (Tomado/Omitido) con timestamps.
  - _Fix:_ Se añadió migración automática para la columna `email`.

### 2. Autenticación & Usuarios 👤

- **Store de Autenticación (`useAuthStore`):** Lógica conectada a SQLite real (ya no simulada). Permite crear cuentas y loguearse persistentemente.
- **Pantallas de Auth (Rediseñadas & Traducidas):**
  - `WelcomeScreen`: Réplica pixel-perfect del diseño de referencia (Card central, minimalista).
  - `LoginScreen`: Diseño "Floating Card" en tonos azules profesionales.
  - `RegisterScreen`: Diseño consistente en tonos Teal (Verde azulado).

### 3. Gestión de Medicamentos 💊

- **Pantalla de Agregar (`AddMedicationScreen`):**
  - Selector de hora nativo (`DateTimePicker`).
  - Lógica de frecuencia (ej. "3 veces al día" genera 3 slots).
  - Feedback de voz (TTS) al guardar.
- **Lógica de Notificaciones (Blindada):**
  - Se implementó `expo-notifications` sorteando las restricciones de Expo Go SDK 54.
  - Uso de `PermissionsAndroid` nativo para evitar errores de "Remote Notifications".
  - Estrategia de Fallback: Intenta triggers diarios, si falla usa triggers de Fecha simple.

### 4. Dashboards & Seguimiento 📅

- **Home Screen Premium:**
  - Header con saludo dinámico ("Hola, Juan 👋") y Avatar con iniciales.
  - Timeline vertical de dosis del día ("Agenda de Hoy").
  - Checkbox interactivo para marcar tomas (Green check ✅).
  - Action Bar flotante para agregar nuevos tratamientos.
- **Historial (`HistoryScreen`):**
  - Vista de calendario semanal.
  - Lista de estado (Tomado/Omitido/Pendiente).

---

## 📂 Archivos Clave Modificados

- `services/notificationService.js`: Lógica crítica de alarmas y permisos.
- `store/useMedicationStore.js`: Cerebro de la lógica de agenda diaria (`getTodayDoses`).
- `screens/HomeScreen.js`: UI principal rediseñada.
- `database/db.js`: Esquema de datos y migraciones.

---

## 📝 Para Retomar Mañana

### Pasos para iniciar:

1.  Abrir terminal en `c:\Users\Janus\Desktop\medicina\MedTime`.
2.  Ejecutar: `npx expo start -c` (el `-c` limpia caché, recomendado).
3.  Escanear con Expo Go en Android.

### Pendientes / Siguientes Pasos (Roadmap):

1.  **Sincronización de Alarmas:** Actualmente si marcas una toma, la lógica para reprogramar la del día siguiente es básica. Se puede mejorar para ser perpetua.
2.  **Perfiles de Familiares:** Implementar la lógica para que un "Cuidador" vea los datos de un "Paciente" (requiere lógica de IDs en las queries `SELECT`).
3.  **Gráficas de Adherencia:** Usar una librería de charts para mostrar el % de cumplimiento en `HistoryScreen`.
4.  **Edición de Medicamentos:** Permitir editar hora/dosis de un medicamento ya creado.

---

_Fin del reporte._

# Backend2 Events - Plataforma de Eventos e Inscripciones

API REST desarrollada con Node.js, Express, MongoDB Atlas y Mongoose para una plataforma de eventos e inscripciones.

El proyecto forma parte del curso **Programación Backend II** y utiliza una arquitectura por capas para separar responsabilidades.

Actualmente incluye:

- registro seguro de usuarios;
- almacenamiento de contraseñas con bcrypt;
- login de usuarios;
- autenticación mediante JWT;
- almacenamiento del JWT en una cookie HTTP Only;
- ruta protegida para consultar al usuario autenticado;
- logout;
- manejo centralizado de errores.

---

## Tecnologías utilizadas

- Node.js
- Express
- MongoDB Atlas
- Mongoose
- dotenv
- bcrypt
- JSON Web Token
- cookie-parser
- JavaScript con módulos ESM
- Thunder Client para pruebas de endpoints
- Git y GitHub

---

## Instalación

Clonar el repositorio e instalar las dependencias:

```bash
npm install
```

---

## Variables de entorno

Crear un archivo `.env` en la raíz del proyecto tomando como referencia `.env.example`.

El archivo `.env.example` contiene:

```env
PORT=8080
NODE_ENV=development
MONGO_URL=
JWT_SECRET=
JWT_EXPIRES_IN=
```

Descripción:

- `PORT`: puerto donde se ejecuta el servidor.
- `NODE_ENV`: entorno de ejecución.
- `MONGO_URL`: URL de conexión a MongoDB Atlas.
- `JWT_SECRET`: clave utilizada para firmar y verificar los JWT.
- `JWT_EXPIRES_IN`: tiempo de expiración de los JWT.

Las credenciales reales se almacenan únicamente en `.env`.

El archivo `.env` no debe subirse al repositorio.

---

## Ejecución

Para iniciar el servidor en modo desarrollo:

```bash
npm run dev
```

Para iniciar el servidor normalmente:

```bash
npm start
```

Por defecto, el servidor se ejecuta en:

```text
http://localhost:8080
```

---

## Base de datos

El proyecto utiliza **MongoDB Atlas** como base de datos y **Mongoose** para la conexión y persistencia.

La conexión se realiza mediante la variable de entorno:

```env
MONGO_URL=
```

La URL real de conexión se guarda únicamente en `.env`.

---

## Estructura del proyecto

```text
backend2-events/
├── src/
│   ├── app.js
│   ├── server.js
│   │
│   ├── config/
│   │   ├── config.js
│   │   └── database.js
│   │
│   ├── routes/
│   │   ├── health.router.js
│   │   ├── events.router.js
│   │   └── sessions.router.js
│   │
│   ├── controllers/
│   │   ├── health.controller.js
│   │   ├── events.controller.js
│   │   └── sessions.controller.js
│   │
│   ├── services/
│   │   └── sessions.service.js
│   │
│   ├── repositories/
│   │   └── users.repository.js
│   │
│   ├── dao/
│   │   └── users.dao.js
│   │
│   ├── models/
│   │   ├── User.js
│   │   └── Event.js
│   │
│   ├── middlewares/
│   │   ├── auth.middleware.js
│   │   └── error.middleware.js
│   │
│   └── utils/
│       ├── hash.js
│       └── jwt.js
│
├── docs/
│   └── evidencias/
│
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

---

# Rutas disponibles

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/health` | Verifica que el servidor esté activo |
| GET | `/api/events` | Endpoint inicial de eventos |
| GET | `/api/sessions` | Verifica la estructura de sessions |
| POST | `/api/sessions/register` | Registra un usuario |
| POST | `/api/sessions/login` | Inicia sesión y genera un JWT |
| GET | `/api/sessions/current` | Devuelve el usuario autenticado |
| POST | `/api/sessions/logout` | Cierra la sesión |

---

# Health

## GET `/api/health`

Permite comprobar que el servidor está funcionando.

### Request

```http
GET /api/health
```

### Response 200

```json
{
  "status": "ok",
  "message": "Servidor activo"
}
```

---

# Events

## GET `/api/events`

Endpoint inicial correspondiente al recurso de eventos.

### Request

```http
GET /api/events
```

### Response 200

```json
{
  "status": "success",
  "payload": []
}
```

---

# Sessions

## GET `/api/sessions`

Permite comprobar que la estructura del recurso sessions está disponible.

### Request

```http
GET /api/sessions
```

### Response 200

```json
{
  "status": "success",
  "message": "Estructura de sessions disponible"
}
```

---

# Registro de usuarios

## POST `/api/sessions/register`

Permite registrar un nuevo usuario de forma segura.

### Request

```json
{
  "first_name": "Ana",
  "last_name": "Pérez",
  "email": "ana@mail.com",
  "password": "Secreta123"
}
```

Los campos obligatorios son:

- `first_name`
- `last_name`
- `email`
- `password`

El email se normaliza eliminando espacios al inicio y al final y convirtiéndolo a minúsculas.

La contraseña debe tener al menos 8 caracteres y se almacena hasheada mediante bcrypt.

El rol se asigna automáticamente como:

```text
user
```

El registro público no permite asignar los roles `admin` u `organizer` desde el body.

### Response 201

```json
{
  "status": "success",
  "payload": {
    "id": "665f2a...",
    "first_name": "Ana",
    "last_name": "Pérez",
    "email": "ana@mail.com",
    "role": "user"
  }
}
```

La contraseña no se incluye en la respuesta.

### Error 400 - Campos faltantes

```json
{
  "status": "error",
  "message": "Faltan campos obligatorios"
}
```

### Error 400 - Email inválido

```json
{
  "status": "error",
  "message": "El email no es válido"
}
```

### Error 400 - Contraseña demasiado corta

```json
{
  "status": "error",
  "message": "La contraseña debe tener al menos 8 caracteres"
}
```

### Error 409 - Email duplicado

```json
{
  "status": "error",
  "message": "El email ya está registrado"
}
```

---

# Login

## POST `/api/sessions/login`

Permite iniciar sesión utilizando email y contraseña.

El backend:

1. valida la presencia de email y contraseña;
2. normaliza el email;
3. busca el usuario;
4. compara la contraseña ingresada con el hash almacenado mediante bcrypt;
5. genera un JWT si las credenciales son correctas;
6. guarda el JWT en una cookie HTTP Only llamada `currentUser`.

### Request

```json
{
  "email": "ana@mail.com",
  "password": "Secreta123"
}
```

### Response 200

```json
{
  "status": "success",
  "message": "Login correcto"
}
```

El JWT contiene únicamente:

```json
{
  "id": "665f2a...",
  "email": "ana@mail.com",
  "role": "user"
}
```

El token se almacena en una cookie llamada:

```text
currentUser
```

La cookie utiliza la siguiente configuración:

```javascript
{
  httpOnly: true,
  sameSite: "lax",
  maxAge: 3600000,
  secure: true // solamente en producción
}
```

### Error 400 - Campos faltantes

```json
{
  "status": "error",
  "message": "Faltan campos obligatorios"
}
```

### Error 401 - Credenciales incorrectas

```json
{
  "status": "error",
  "message": "Credenciales inválidas"
}
```

Por seguridad, el backend devuelve el mismo mensaje tanto si el email no existe como si la contraseña es incorrecta.

---

# Usuario autenticado

## GET `/api/sessions/current`

Ruta protegida que permite consultar el usuario autenticado.

No es necesario volver a enviar email y contraseña.

El middleware de autenticación:

1. lee la cookie `currentUser`;
2. obtiene el JWT;
3. verifica su firma y expiración;
4. almacena el payload en `req.user`;
5. permite continuar hacia el controller.

### Request

```http
GET /api/sessions/current
```

La cookie `currentUser` debe estar presente y contener un JWT válido.

### Response 200

```json
{
  "status": "success",
  "payload": {
    "id": "665f2a...",
    "email": "ana@mail.com",
    "role": "user"
  }
}
```

La respuesta no incluye `password`.

### Error 401

```json
{
  "status": "error",
  "message": "No autenticado"
}
```

Se devuelve `401` cuando:

- no existe la cookie;
- el JWT es inválido;
- el JWT fue manipulado;
- el JWT expiró.

---

# Logout

## POST `/api/sessions/logout`

Permite cerrar la sesión del usuario.

El servidor elimina la cookie:

```text
currentUser
```

### Request

```http
POST /api/sessions/logout
```

No requiere body.

### Response 200

```json
{
  "status": "success",
  "message": "Sesión cerrada"
}
```

Después del logout, una nueva petición a:

```http
GET /api/sessions/current
```

debe responder:

```json
{
  "status": "error",
  "message": "No autenticado"
}
```

con código HTTP `401`.

---

# Seguridad

## Contraseñas

Las contraseñas nunca se almacenan en texto plano.

Durante el registro:

```text
password
   ↓
bcrypt.hash()
   ↓
hash
   ↓
MongoDB Atlas
```

Durante el login se utiliza:

```text
bcrypt.compare()
```

para comparar la contraseña recibida con el hash almacenado.

La contraseña no se devuelve en las respuestas de la API.

---

## JWT

La generación y verificación de JWT se encuentra centralizada en:

```text
src/utils/jwt.js
```

Los JWT contienen información mínima del usuario:

```json
{
  "id": "...",
  "email": "ana@mail.com",
  "role": "user"
}
```

No contienen:

- password;
- hash de password;
- claves secretas;
- credenciales internas.

La firma utiliza la variable de entorno:

```env
JWT_SECRET=
```

La duración del token se configura mediante:

```env
JWT_EXPIRES_IN=
```

---

## Cookie de autenticación

El JWT se almacena en una cookie:

```text
currentUser
```

Configurada con:

```text
httpOnly: true
sameSite: lax
maxAge: 3600000
secure: true solamente en producción
```

El flag `httpOnly` impide que JavaScript del navegador pueda leer directamente el token.

---

# Arquitectura

El proyecto utiliza separación de responsabilidades.

El flujo de registro y login sigue:

```text
Route
  ↓
Controller
  ↓
Service
  ↓
Repository
  ↓
DAO
  ↓
Model
  ↓
MongoDB Atlas
```

Responsabilidades principales:

```text
utils/hash.js
→ hashing y comparación de contraseñas

utils/jwt.js
→ generación y verificación de JWT

middlewares/auth.middleware.js
→ autenticación de rutas protegidas

middlewares/error.middleware.js
→ manejo centralizado de errores
```

La lógica de autenticación no se encuentra directamente en las rutas ni en `app.js`.

---

# Manejo de errores

El proyecto cuenta con un middleware global para centralizar las respuestas de error.

Principales códigos utilizados:

```text
200 → operación exitosa
201 → recurso creado
400 → datos inválidos
401 → no autenticado o credenciales inválidas
409 → conflicto por email duplicado
500 → error interno del servidor
```

---

# Pruebas realizadas

Se verificaron los siguientes casos:

1. Registro exitoso.
2. Normalización del email.
3. Contraseña almacenada mediante bcrypt.
4. Respuesta de registro sin password.
5. Rechazo de email duplicado.
6. Login exitoso.
7. Login con email inexistente.
8. Login con contraseña incorrecta.
9. Creación de cookie `currentUser`.
10. `/current` autenticado devuelve `200`.
11. `/current` sin cookie devuelve `401`.
12. `/current` con JWT manipulado devuelve `401`.
13. Logout exitoso.
14. `/current` después del logout devuelve `401`.
15. Registro, persistencia y autenticación funcionando con MongoDB Atlas.

---

# Flujo completo de autenticación

```text
REGISTRO

POST /api/sessions/register
        ↓
validación de datos
        ↓
bcrypt
        ↓
usuario guardado en MongoDB Atlas


LOGIN

POST /api/sessions/login
        ↓
buscar usuario por email
        ↓
bcrypt.compare()
        ↓
generar JWT
        ↓
cookie currentUser HTTP Only


CURRENT

GET /api/sessions/current
        ↓
leer cookie currentUser
        ↓
verificar JWT
        ↓
req.user
        ↓
devolver id, email y role


LOGOUT

POST /api/sessions/logout
        ↓
eliminar cookie currentUser
        ↓
sesión cerrada
```

---

# Evidencias de funcionamiento

## Registro exitoso

La siguiente captura muestra un registro exitoso mediante:

```http
POST /api/sessions/register
```

Se puede observar:

- respuesta `201 Created`;
- email normalizado;
- rol asignado como `user`;
- ausencia del campo `password`.

![Registro exitoso](docs/evidencias/registro-exitoso.png)

---

## Contraseña hasheada en MongoDB

La siguiente captura muestra un usuario persistido con la contraseña protegida mediante bcrypt.

La contraseña no se almacena en texto plano.

![Contraseña hasheada en MongoDB](docs/evidencias/password-hasheada-mongodb.png)

---

# Archivos excluidos del repositorio

El archivo `.gitignore` excluye:

```gitignore
node_modules/
.env
```

Esto evita publicar dependencias locales y credenciales privadas.

---

# Repositorio

Proyecto desarrollado como parte del curso **Programación Backend II**.

El código se encuentra versionado mediante Git y GitHub.
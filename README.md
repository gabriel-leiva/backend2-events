# Backend2 Events - Plataforma de Eventos e Inscripciones

API REST desarrollada con Node.js, Express, MongoDB Atlas y Mongoose para una plataforma de eventos e inscripciones.

El proyecto forma parte del curso **Programación Backend II** y utiliza una arquitectura por capas basada en **Controller, Service, Repository, DAO y DTO**, con el objetivo de separar responsabilidades, centralizar la lógica de negocio y proteger la información sensible expuesta por la API.

Actualmente incluye:

- registro seguro de usuarios;
- almacenamiento de contraseñas con bcrypt;
- login de usuarios;
- autenticación mediante JWT y Passport.js;
- almacenamiento del JWT en una cookie HTTP Only;
- ruta protegida para consultar al usuario autenticado;
- roles `user`, `organizer` y `admin`;
- autorización mediante una matriz centralizada de permisos;
- middleware reutilizable de autorización por roles;
- validación de propiedad de eventos;
- creación de eventos exclusiva para `organizer` y `admin`;
- modificación de eventos propios para `organizer`;
- modificación de cualquier evento para `admin`;
- gestión de eventos con consulta individual y cambio de estado;
- lógica de negocio centralizada en la capa `services`;
- validación de fechas, capacidad, precio y estados;
- cancelación lógica de eventos;
- filtros por estado, categoría, ubicación y rango de fechas;
- paginación y ordenamiento del listado de eventos;
- ruta administrativa para consultar usuarios;
- sistema de inscripciones mediante tickets;
- control de cupos disponibles;
- prevención de inscripciones duplicadas;
- cancelación lógica de tickets;
- generación de códigos únicos de reserva;
- notificación por email mediante Nodemailer;
- DTOs para usuarios, eventos y tickets;
- protección del campo `password` en todas las respuestas;
- filtrado de documentos relacionados obtenidos mediante `populate`;
- diferenciación entre errores `400`, `401`, `403`, `404`, `409` y `500`;
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
- Passport.js
- passport-local
- passport-jwt
- Nodemailer
- JavaScript con módulos ESM
- Thunder Client / Postman para pruebas de endpoints
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
MAIL_HOST=
MAIL_PORT=
MAIL_USER=
MAIL_PASS=
MAIL_FROM=
```

Descripción:

- `PORT`: puerto donde se ejecuta el servidor.
- `NODE_ENV`: entorno de ejecución.
- `MONGO_URL`: URL de conexión a MongoDB Atlas.
- `JWT_SECRET`: clave utilizada para firmar y verificar los JWT.
- `JWT_EXPIRES_IN`: tiempo de expiración de los JWT.
- `MAIL_HOST`: servidor SMTP.
- `MAIL_PORT`: puerto SMTP.
- `MAIL_USER`: usuario de la cuenta de correo.
- `MAIL_PASS`: contraseña o clave de aplicación.
- `MAIL_FROM`: dirección utilizada como remitente.

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

El proyecto utiliza **MongoDB Atlas** como base de datos y **Mongoose** para la definición de schemas y modelos.

La conexión se realiza mediante:

```env
MONGO_URL=
```

El acceso directo a los modelos de Mongoose está encapsulado en la capa **DAO**.

Controllers, Services y Repositories no importan modelos directamente.

---

# Arquitectura

El proyecto implementa la siguiente arquitectura:

```text
Request
   ↓
Route
   ↓
Middleware
   ↓
Controller
   ↓
Service
   ↓
Repository
   ↓
DAO
   ↓
Mongoose Model
   ↓
MongoDB Atlas
```

Las entidades que deben enviarse como respuesta son transformadas mediante DTO antes de llegar al cliente:

```text
DAO / Repository
       ↓
    Service
       ↓
      DTO
       ↓
  Controller
       ↓
   Response
```

---

## Controller

Los Controllers coordinan la comunicación HTTP.

Sus responsabilidades son:

- obtener datos desde `req.body`;
- obtener parámetros desde `req.params`;
- obtener filtros desde `req.query`;
- utilizar la información de `req.user`;
- llamar al Service correspondiente;
- definir el código HTTP;
- devolver la respuesta;
- delegar errores al middleware centralizado.

Los Controllers no:

- importan modelos de Mongoose;
- importan DAOs;
- acceden directamente a MongoDB;
- calculan capacidad disponible;
- validan estados de negocio;
- verifican duplicados;
- implementan reglas de propiedad.

---

## Service

La capa Service contiene la lógica de negocio.

Entre sus responsabilidades se encuentran:

- validación de campos;
- validación de fechas;
- validación de estados;
- control de capacidad;
- prevención de inscripciones duplicadas;
- validación de propiedad de recursos;
- normalización de emails;
- hashing de contraseñas;
- validación de credenciales;
- generación del JWT;
- generación de códigos de reserva;
- coordinación del envío de emails;
- aplicación de DTOs sobre respuestas.

Los Services consumen Repositories.

No importan DAOs ni modelos de Mongoose.

---

## Repository

Los Repositories funcionan como intermediarios entre los Services y los DAO.

Permiten expresar operaciones orientadas al dominio sin que el Service necesite conocer cómo se implementa la persistencia.

Ejemplos:

```text
getUserByEmail()
getUserById()
getEventById()
getFilteredEvents()
getEventsCount()
getActiveTicketByUserAndEvent()
getReservedQuantity()
getTicketsByUser()
getTicketsByEvent()
getTicketById()
```

Los Repositories:

- consumen DAO;
- no importan modelos;
- no contienen lógica HTTP.

---

## DAO

Los DAO constituyen la única capa que accede directamente a los modelos de Mongoose.

El proyecto posee:

```text
users.dao.js
events.dao.js
tickets.dao.js
```

Operaciones realizadas en esta capa:

```text
findById
findOne
find
create
update
count
aggregate
populate
```

La separación permite que las capas superiores no dependan directamente de Mongoose.

---

## DTO

Los DTO controlan la representación de los datos que se envían al cliente.

El proyecto incluye:

```text
UserDTO
EventDTO
TicketDTO
```

Ubicados en:

```text
src/dto/
```

Su objetivo es evitar que detalles internos de persistencia o información sensible sean expuestos.

Especialmente:

```text
password
```

nunca debe llegar a una respuesta HTTP.

Esto también se aplica cuando un documento relacionado fue obtenido mediante `populate()`.

Por ejemplo, si un ticket contiene un usuario poblado, `TicketDTO` permite exponer solamente:

```text
_id
first_name
last_name
email
```

sin incluir la contraseña.

---

# Estructura del proyecto

```text
backend2-events/
├── src/
│   ├── app.js
│   ├── server.js
│   │
│   ├── config/
│   │   ├── config.js
│   │   ├── database.js
│   │   ├── passport.config.js
│   │   └── permissions.config.js
│   │
│   ├── routes/
│   │   ├── health.router.js
│   │   ├── events.router.js
│   │   ├── sessions.router.js
│   │   ├── tickets.router.js
│   │   └── users.router.js
│   │
│   ├── controllers/
│   │   ├── health.controller.js
│   │   ├── events.controller.js
│   │   ├── sessions.controller.js
│   │   ├── tickets.controller.js
│   │   └── users.controller.js
│   │
│   ├── services/
│   │   ├── authorization.service.js
│   │   ├── events.service.js
│   │   ├── mail.service.js
│   │   ├── sessions.service.js
│   │   ├── tickets.service.js
│   │   └── users.service.js
│   │
│   ├── repositories/
│   │   ├── users.repository.js
│   │   ├── events.repository.js
│   │   └── tickets.repository.js
│   │
│   ├── dao/
│   │   ├── users.dao.js
│   │   ├── events.dao.js
│   │   └── tickets.dao.js
│   │
│   ├── dto/
│   │   ├── user.dto.js
│   │   ├── event.dto.js
│   │   └── ticket.dto.js
│   │
│   ├── models/
│   │   ├── User.js
│   │   ├── Event.js
│   │   └── Ticket.js
│   │
│   ├── middlewares/
│   │   ├── passport.middleware.js
│   │   ├── authorize.middleware.js
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

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| GET | `/api/health` | Público | Verifica que el servidor esté activo |
| GET | `/api/events` | Público | Lista eventos |
| GET | `/api/events/:id` | Público | Consulta un evento |
| POST | `/api/events` | `organizer`, `admin` | Crea un evento |
| PUT | `/api/events/:id` | Dueño o `admin` | Modifica un evento |
| PATCH | `/api/events/:id/status` | Dueño o `admin` | Cambia el estado |
| POST | `/api/events/:eid/tickets` | Autenticado | Inscripción a evento |
| GET | `/api/events/:eid/tickets` | Organizer dueño / admin | Consulta inscripciones |
| GET | `/api/tickets/my-tickets` | Autenticado | Consulta tickets propios |
| PATCH | `/api/tickets/:tid/cancel` | Dueño / admin | Cancela ticket |
| GET | `/api/sessions` | Público | Estado de sessions |
| POST | `/api/sessions/register` | Público | Registra usuario |
| POST | `/api/sessions/login` | Público | Inicia sesión |
| GET | `/api/sessions/current` | Autenticado | Usuario actual |
| POST | `/api/sessions/logout` | Público | Cierra sesión |
| GET | `/api/users` | `admin` | Lista usuarios |

---

# Roles y autorización

El sistema utiliza tres roles:

- `user`
- `organizer`
- `admin`

## user

Puede:

- consultar eventos;
- iniciar sesión;
- inscribirse en eventos publicados;
- consultar sus tickets;
- cancelar sus propios tickets.

## organizer

Puede además:

- crear eventos;
- modificar sus propios eventos;
- cambiar el estado de sus eventos;
- consultar las inscripciones de sus eventos.

## admin

Puede:

- administrar cualquier evento;
- consultar tickets de cualquier evento;
- cancelar tickets;
- consultar todos los usuarios.

---

## Matriz de permisos

| Acción | user | organizer | admin |
|---|---:|---:|---:|
| Consultar eventos | ✅ | ✅ | ✅ |
| Crear eventos | ❌ | ✅ | ✅ |
| Modificar evento propio | ❌ | ✅ | ✅ |
| Modificar cualquier evento | ❌ | ❌ | ✅ |
| Inscribirse | ✅ | ✅ | ✅ |
| Ver tickets propios | ✅ | ✅ | ✅ |
| Ver tickets de evento propio | ❌ | ✅ | ✅ |
| Ver tickets de cualquier evento | ❌ | ❌ | ✅ |
| Ver todos los usuarios | ❌ | ❌ | ✅ |

La matriz se encuentra en:

```text
src/config/permissions.config.js
```

---

# Diferencia entre 401 y 403

## 401 Unauthorized

Se devuelve cuando el usuario no posee una sesión válida.

Ejemplo:

```http
GET /api/tickets/my-tickets
```

sin cookie válida.

Respuesta:

```json
{
  "status": "error",
  "message": "No autenticado"
}
```

---

## 403 Forbidden

Se devuelve cuando el usuario está autenticado pero no posee permisos suficientes.

Ejemplo:

```http
POST /api/events
```

con rol:

```text
user
```

Respuesta:

```json
{
  "status": "error",
  "message": "No tenés permisos para realizar esta acción"
}
```

En resumen:

```text
401 → no autenticado
403 → autenticado, pero sin permisos
```

---

# Health

## GET `/api/health`

Permite comprobar que el servidor está funcionando.

```http
GET /api/health
```

Respuesta:

```json
{
  "status": "ok",
  "message": "Servidor activo"
}
```

---

# Events

Los eventos pueden tener los siguientes estados:

```text
draft
published
cancelled
finished
```

Un evento nuevo siempre se crea con:

```text
status: draft
```

El organizador se obtiene del usuario autenticado.

---

## GET `/api/events`

Ruta pública.

Admite filtros:

```text
status
category
location
dateFrom
dateTo
```

Paginación:

```text
page
limit
```

Ordenamiento:

```text
sort
```

Ejemplo:

```http
GET /api/events?status=published&category=workshop&page=2&limit=5
```

Campos admitidos para ordenamiento:

```text
date
price
title
createdAt
```

Orden descendente:

```text
sort=-date
```

Respuesta:

```json
{
  "status": "success",
  "data": [],
  "page": 1,
  "limit": 10,
  "total": 0,
  "totalPages": 0
}
```

---

## GET `/api/events/:id`

Consulta un evento individual.

Ejemplo:

```http
GET /api/events/66abc123...
```

ID inválido:

```json
{
  "status": "error",
  "message": "El ID del evento no es válido"
}
```

Evento inexistente:

```json
{
  "status": "error",
  "message": "Evento no encontrado"
}
```

---

## POST `/api/events`

Requiere:

```text
organizer
admin
```

Ejemplo:

```json
{
  "title": "Workshop Backend II",
  "description": "Encuentro práctico sobre desarrollo backend",
  "category": "workshop",
  "date": "2027-05-20T18:00:00.000Z",
  "location": "Mar del Plata",
  "capacity": 50,
  "price": 10000
}
```

El cliente no controla:

```text
organizer
status
```

El backend asigna:

```text
organizer → usuario autenticado
status → draft
```

Respuesta:

```json
{
  "status": "success",
  "payload": {
    "id": "66abc123...",
    "title": "Workshop Backend II",
    "organizer": "665f2a..."
  }
}
```

Reglas:

- campos de texto obligatorios;
- fecha futura;
- capacidad mayor a `0`;
- precio mayor o igual a `0`;
- organizer automático;
- estado inicial `draft`.

---

## PUT `/api/events/:id`

Permite modificar un evento.

Acceso:

```text
organizer dueño
admin
```

No se pueden modificar mediante esta ruta:

```text
organizer
status
```

Reglas:

- un evento `cancelled` no puede modificarse;
- los campos de texto no pueden quedar vacíos;
- la fecha no puede quedar en el pasado;
- `capacity` debe ser mayor a `0`;
- `price` debe ser mayor o igual a `0`.

---

## PATCH `/api/events/:id/status`

Permite modificar el estado.

Ejemplo:

```json
{
  "status": "published"
}
```

Estados válidos:

```text
draft
published
cancelled
finished
```

Reglas:

- evento cancelado no puede volver a cambiar;
- evento finalizado no puede volver a `published`;
- evento con fecha pasada no puede publicarse.

Respuesta:

```json
{
  "status": "success",
  "payload": {
    "id": "...",
    "title": "Workshop Backend II",
    "status": "published",
    "organizer": "..."
  }
}
```

---

# Sessions

## GET `/api/sessions`

Comprueba que el recurso sessions está disponible.

Respuesta:

```json
{
  "status": "success",
  "message": "Estructura de sessions disponible"
}
```

---

# Registro

## POST `/api/sessions/register`

Ejemplo:

```json
{
  "first_name": "Ana",
  "last_name": "Pérez",
  "email": "ana@mail.com",
  "password": "Secreta123"
}
```

El Service:

1. valida campos obligatorios;
2. valida formato del email;
3. normaliza el email;
4. verifica duplicados;
5. valida longitud de contraseña;
6. aplica bcrypt;
7. crea el usuario mediante Repository;
8. devuelve la entidad para ser transformada mediante `UserDTO`.

El rol público siempre es:

```text
user
```

Respuesta:

```json
{
  "status": "success",
  "payload": {
    "id": "...",
    "first_name": "Ana",
    "last_name": "Pérez",
    "email": "ana@mail.com",
    "role": "user"
  }
}
```

Nunca se devuelve:

```text
password
```

Email duplicado:

```text
409 Conflict
```

---

# Login

## POST `/api/sessions/login`

Ejemplo:

```json
{
  "email": "ana@mail.com",
  "password": "Secreta123"
}
```

Flujo:

```text
Passport Local
      ↓
sessions.service.js
      ↓
buscar usuario
      ↓
bcrypt.compare()
      ↓
usuario autenticado
      ↓
generar JWT
      ↓
cookie currentUser
```

Respuesta:

```json
{
  "status": "success",
  "message": "Login correcto"
}
```

El JWT contiene únicamente información mínima:

```json
{
  "id": "...",
  "email": "ana@mail.com",
  "role": "user"
}
```

---

# Usuario autenticado

## GET `/api/sessions/current`

Passport JWT:

1. obtiene el token desde la cookie;
2. verifica la firma;
3. obtiene el usuario mediante `sessions.service.js`;
4. deja los datos disponibles en `req.user`;
5. el controller devuelve el resultado mediante `UserDTO`.

Respuesta:

```json
{
  "status": "success",
  "payload": {
    "id": "...",
    "email": "ana@mail.com",
    "role": "user"
  }
}
```

No contiene:

```text
password
```

---

# Logout

## POST `/api/sessions/logout`

Elimina:

```text
currentUser
```

Respuesta:

```json
{
  "status": "success",
  "message": "Sesión cerrada"
}
```

---

# Tickets e inscripciones

La plataforma permite que un usuario autenticado se inscriba a eventos mediante tickets.

Cada ticket relaciona:

```text
User
Event
```

mediante referencias ObjectId.

---

## Estados de Ticket

```text
confirmed
pending
cancelled
```

Los estados activos para el cálculo de capacidad son:

```text
confirmed
pending
```

Los tickets:

```text
cancelled
```

no ocupan capacidad.

---

## Modelo Ticket

Incluye:

```text
user
event
status
quantity
reservationCode
cancelledAt
createdAt
updatedAt
```

---

## POST `/api/events/:eid/tickets`

Permite realizar una inscripción.

Requiere autenticación.

Body:

```json
{
  "quantity": 1
}
```

El usuario se obtiene automáticamente desde:

```text
req.user.id
```

No se recibe `userId` desde el cliente.

Validaciones realizadas por el Service:

- ID de evento válido;
- evento existente;
- estado `published`;
- fecha futura;
- quantity entera y mayor a `0`;
- ausencia de inscripción activa duplicada;
- capacidad suficiente;
- usuario existente.

---

## Control de capacidad

La cantidad reservada se obtiene mediante el Repository de tickets.

El DAO realiza la consulta de persistencia correspondiente.

Cálculo:

```text
capacidad disponible =
capacidad del evento
-
cantidad reservada activa
```

Si:

```text
cantidad solicitada > capacidad disponible
```

la API devuelve:

```text
400 Bad Request
```

---

## Prevención de duplicados

Antes de crear un ticket se verifica si existe una inscripción activa para:

```text
usuario + evento
```

Si existe:

```text
409 Conflict
```

Mensaje:

```text
Ya tenés una inscripción activa para este evento
```

---

## Código de reserva

Cada inscripción genera un código único:

```text
TCK-...
```

utilizando `randomUUID()`.

---

## Email de confirmación

Después de crear correctamente el ticket, el sistema intenta enviar un email mediante Nodemailer.

Incluye:

- nombre del usuario;
- título del evento;
- código de reserva.

Si falla el correo, el ticket continúa siendo válido.

La persistencia de la inscripción no se revierte por un fallo SMTP.

---

## GET `/api/tickets/my-tickets`

Devuelve únicamente los tickets pertenecientes al usuario autenticado.

Los eventos asociados se obtienen mediante `populate`.

Los datos pasan por:

```text
TicketDTO
```

antes de llegar al cliente.

---

## GET `/api/events/:eid/tickets`

Permite consultar las inscripciones de un evento.

Acceso:

```text
organizer dueño del evento
admin
```

Los usuarios relacionados son obtenidos mediante `populate`.

La respuesta del usuario poblado es filtrada mediante `TicketDTO`.

Se pueden exponer:

```text
_id
first_name
last_name
email
```

pero nunca:

```text
password
```

---

## PATCH `/api/tickets/:tid/cancel`

Permite cancelar un ticket.

Acceso:

```text
dueño del ticket
admin
```

La cancelación no elimina físicamente el documento.

Se actualiza:

```text
status → cancelled
cancelledAt → fecha actual
```

Un ticket ya cancelado no puede cancelarse nuevamente.

Los tickets cancelados dejan de ocupar cupo.

---

# Flujo de inscripción

```text
POST /api/events/:eid/tickets
        ↓
Passport
        ↓
Controller
        ↓
Ticket Service
        ↓
Event Repository
        ↓
validar evento
        ↓
Ticket Repository
        ↓
validar duplicado
        ↓
calcular capacidad
        ↓
Ticket DAO
        ↓
MongoDB
        ↓
TicketDTO
        ↓
email de confirmación
        ↓
201 Created
```

---

# Usuarios

## GET `/api/users`

Disponible exclusivamente para:

```text
admin
```

El DAO obtiene los documentos completos desde MongoDB.

La protección de información sensible se realiza en:

```text
UserDTO
```

antes de devolver los usuarios al cliente.

Por lo tanto, ningún usuario de la respuesta incluye:

```text
password
```

---

# Passport

Las estrategias están configuradas en:

```text
src/config/passport.config.js
```

Existen:

```text
register
login
current
```

---

## register

Utiliza Passport Local.

Passport obtiene los datos y delega la lógica a:

```text
registerUserService()
```

La estrategia no accede directamente al Repository, DAO ni modelo.

---

## login

Utiliza Passport Local.

La validación se delega a:

```text
loginUserService()
```

El Service realiza:

- normalización del email;
- búsqueda del usuario;
- comparación de contraseña.

---

## current

Utiliza Passport JWT.

El token se extrae desde:

```text
currentUser
```

y el usuario se obtiene mediante:

```text
getCurrentSessionUserService()
```

---

# Autorización

La autorización por roles continúa siendo responsabilidad del middleware.

Ejemplo:

```text
authorizeRoles()
```

Las reglas relacionadas con propiedad y dominio se encuentran delegadas a la capa Service.

Para modificación de eventos:

```text
authorizeEventOwnerOrAdmin
        ↓
authorization.service.js
        ↓
getEventById()
        ↓
validar dueño o admin
```

De esta forma, la lógica de negocio no queda implementada directamente dentro del middleware.

---

# Seguridad

## Contraseñas

Las contraseñas nunca se almacenan en texto plano.

Registro:

```text
password
   ↓
bcrypt.hash()
   ↓
hash
   ↓
MongoDB
```

Login:

```text
password ingresada
   ↓
bcrypt.compare()
   ↓
hash almacenado
```

---

## DTO y datos sensibles

La protección de `password` no depende de un `.select("-password")` aislado en el DAO.

La aplicación utiliza DTOs para definir explícitamente la respuesta pública.

Esto protege:

- registro;
- `/current`;
- listado de usuarios;
- usuarios poblados dentro de tickets.

---

## JWT

El JWT contiene:

```text
id
email
role
```

No contiene:

```text
password
hash
JWT_SECRET
credenciales internas
```

---

## Cookie

El JWT se almacena en:

```text
currentUser
```

Configuración:

```text
httpOnly: true
sameSite: lax
secure: true solamente en producción
```

---

# Manejo de errores

El proyecto utiliza middleware global de errores.

Códigos principales:

```text
200 → operación exitosa
201 → recurso creado
400 → datos o estado inválido
401 → usuario no autenticado
403 → usuario autenticado sin permisos
404 → recurso no encontrado
409 → conflicto de negocio
500 → error interno del servidor
```

Ejemplos:

```text
ID inválido                    → 400
Evento no disponible           → 400
Sin autenticación              → 401
Rol incorrecto                 → 403
Evento inexistente             → 404
Email duplicado                → 409
Inscripción duplicada          → 409
Error no controlado            → 500
```

Los errores de negocio no deben convertirse innecesariamente en errores `500`.

---

# Auditoría de arquitectura

Se verificó que los únicos archivos que importan modelos sean:

```text
src/dao/events.dao.js
src/dao/tickets.dao.js
src/dao/users.dao.js
```

Los Controllers no importan:

```text
DAO
Repository
Model
```

Los Services no importan:

```text
DAO
Model
```

Los Repositories no importan:

```text
Model
```

La separación resultante es:

```text
Controller
   ↓
Service
   ↓
Repository
   ↓
DAO
   ↓
Model
```

---

# Pruebas realizadas

## Flujo completo principal

Se verificó:

```text
register
   ↓
login
   ↓
create event
   ↓
publish event
   ↓
signup
   ↓
my tickets
   ↓
cancel ticket
```

Resultados:

```text
Registro                         → 201
Login                            → 200
Creación de evento               → 201
Publicación de evento            → 200
Inscripción                      → 201
Consulta de tickets propios      → 200
Cancelación                      → 200
```

---

## DTO de usuario autenticado

Se verificó:

```http
GET /api/sessions/current
```

Resultado:

```text
200 OK
```

La respuesta no incluye:

```text
password
```

---

## DTO de usuarios

Se verificó con rol admin:

```http
GET /api/users
```

Resultado:

```text
200 OK
```

Ningún usuario contiene:

```text
password
```

---

## DTO de tickets

Se verificó:

```http
GET /api/events/:eid/tickets
```

con usuario poblado.

Resultado:

```text
200 OK
```

Los usuarios relacionados no contienen:

```text
password
```

---

## Error de negocio

Se intentó registrar nuevamente un email existente.

Resultado:

```text
409 Conflict
```

Esto verifica que un error de negocio no se transforma en:

```text
500 Internal Server Error
```

---

## Ruta protegida sin autenticación

Después del logout:

```http
GET /api/tickets/my-tickets
```

Resultado:

```text
401 Unauthorized
```

---

## Rol incorrecto

Se inició sesión con un usuario de rol:

```text
user
```

y se intentó:

```http
POST /api/events
```

Resultado:

```text
403 Forbidden
```

---

# Pruebas históricas de eventos

También se verificaron durante el desarrollo:

1. Crear evento con rol `user` devuelve `403`.
2. Crear evento con fecha pasada devuelve `400`.
3. Crear evento con `capacity: 0` devuelve `400`.
4. Crear evento con `price < 0` devuelve `400`.
5. Crear evento válido con organizer devuelve `201`.
6. Organizer se asigna automáticamente.
7. Estado inicial se fuerza a `draft`.
8. Consultar evento válido devuelve `200`.
9. Evento inexistente devuelve `404`.
10. ID inválido devuelve `400`.
11. Organizer puede modificar evento propio.
12. Organizer no puede modificar evento ajeno.
13. Admin puede modificar eventos ajenos.
14. Evento cancelado no puede modificarse.
15. Evento cancelado no puede cambiar nuevamente de estado.
16. Evento finalizado no puede volver a `published`.
17. Evento pasado no puede publicarse.
18. PUT no permite modificar organizer.
19. PUT no permite modificar status.
20. PUT rechaza textos obligatorios vacíos.
21. PUT rechaza capacidad inválida.
22. PUT rechaza precio negativo.
23. PUT rechaza fecha pasada.
24. Listado devuelve metadata de paginación.
25. Filtro por status.
26. Filtro por category.
27. Filtro por location.
28. Filtro por rango de fechas.
29. Paginación mediante page y limit.
30. Ordenamiento ascendente y descendente.
31. `dateFrom > dateTo` devuelve `400`.
32. Status inválido devuelve `400`.
33. Sort inválido devuelve `400`.
34. Page inválida devuelve `400`.
35. Limit inválido devuelve `400`.

---

# Pruebas históricas de tickets

Se verificaron:

1. Inscripción exitosa devuelve `201`.
2. Inscripción genera email de confirmación.
3. Inscripción sin sesión devuelve `401`.
4. Evento inexistente devuelve `404`.
5. Evento no publicado impide inscripción.
6. Evento finalizado impide inscripción.
7. Quantity inválida devuelve `400`.
8. Falta de cupos devuelve `400`.
9. Duplicado activo devuelve `409`.
10. Usuario puede cancelar su ticket.
11. Cancelación no elimina documento.
12. Cupo vuelve a estar disponible.
13. Usuario no puede cancelar ticket ajeno.
14. User no puede consultar tickets de evento.
15. Organizer no puede consultar evento ajeno.
16. Organizer puede consultar evento propio.
17. Admin puede consultar cualquier evento.
18. Admin puede cancelar ticket ajeno.
19. Ticket cancelado no puede cancelarse nuevamente.

---

# Evidencias de funcionamiento

Las evidencias gráficas existentes se encuentran en:

```text
docs/evidencias/
```

Incluyen pruebas de:

- registro exitoso;
- contraseña hasheada;
- login;
- cookie JWT;
- usuario autenticado;
- acceso sin sesión.

---

# Archivos excluidos

El `.gitignore` debe excluir al menos:

```gitignore
node_modules/
.env
```

Esto evita publicar:

- dependencias;
- secretos;
- credenciales de MongoDB;
- secretos JWT;
- credenciales SMTP.

El archivo:

```text
.env.example
```

sí debe incluirse como referencia.

---

# Flujo general del sistema

```text
CLIENTE
   ↓
ROUTE
   ↓
PASSPORT / AUTHORIZATION
   ↓
CONTROLLER
   ↓
SERVICE
   ↓
REPOSITORY
   ↓
DAO
   ↓
MONGOOSE MODEL
   ↓
MONGODB ATLAS
```

Para respuestas con entidades:

```text
DATABASE
   ↓
DAO
   ↓
REPOSITORY
   ↓
SERVICE
   ↓
DTO
   ↓
CONTROLLER
   ↓
CLIENTE
```

---

# Repositorio

Proyecto desarrollado como parte del curso **Programación Backend II - Coderhouse**.

El código se encuentra versionado mediante Git y GitHub.

---

# Autor

Gabriel Leiva
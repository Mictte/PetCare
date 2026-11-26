# PetCare

PetCare es una aplicación móvil desarrollada para facilitar el registro y la administración de la información de las mascotas.

La aplicación permite crear un perfil para cada mascota, agregar fotografías, actualizar sus datos y generar un carnet digital con código QR. También cuenta con un acceso veterinario, desde el cual se puede escanear el carnet y consultar la información que el propietario decida compartir.

Este proyecto fue desarrollado como parte de la materia Desarrollo de Apps Móviles.

## Funcionalidades

- Registro e inicio de sesión.
- Sesión persistente.
- Registro, consulta y edición de mascotas.
- Captura y almacenamiento de fotografías.
- Carnet digital con código QR.
- Acceso veterinario con lector QR.
- Configuración de privacidad del carnet.
- Renovación del código QR.

## Repositorios

- Aplicación móvil: https://github.com/Mictte/PetCare
- Backend: https://github.com/ElPartner2/PetCare_API

## Tecnologías utilizadas

### Aplicación móvil

- React Native
- Expo SDK 58
- JavaScript / JSX
- React Navigation
- React Hook Form
- Expo Camera
- Expo File System
- Expo SecureStore
- AsyncStorage
- react-native-qrcode-svg
- @expo/vector-icons

### Backend

- Python
- Django 6.0.5
- Django REST Framework
- SimpleJWT
- SQLite
- Pillow

## Requisitos

Para ejecutar el proyecto en el entorno de desarrollo utilizado se necesita:

- Node.js y npm.
- Git.
- Visual Studio Code (recomendado).
- Ubuntu o WSL con Python 3.12 o superior.
- Expo Go instalado en el teléfono.
- Computadora y teléfono conectados a la misma red Wi-Fi.

## Instalación y ejecución

### 1. Descargar la aplicación

Desde PowerShell, ejecutar:

```powershell
git clone https://github.com/Mictte/PetCare.git
cd PetCare
npm ci
```

### 2. Preparar el backend

Desde la terminal de Ubuntu:

```bash
git clone https://github.com/ElPartner2/PetCare_API.git
cd PetCare_API
```

Crear y activar el entorno virtual:

```bash
python3 -m venv .venv
source .venv/bin/activate
```

Instalar las dependencias:

```bash
python -m pip install -r requirements.txt
```

### 3. Configurar la API

Para ejecutar el proyecto de manera local se utiliza SQLite, por lo que no es necesario instalar PostgreSQL.

Configurar las siguientes variables en la terminal de Ubuntu:

```bash
export DATABASE_ENGINE=django.db.backends.sqlite3
export DATABASE_NAME=db.sqlite3
export DEBUG=1
export DJANGO_SECRET_KEY="TU_CLAVE_LOCAL"
export DJANGO_ALLOWED_HOSTS="localhost,127.0.0.1,IP_WINDOWS"
```

Reemplazar `IP_WINDOWS` por la dirección IPv4 de la computadora y `TU_CLAVE_LOCAL` por una clave privada de desarrollo.

Estas variables deben estar configuradas en la terminal desde la que se ejecutará Django.

Preparar la base de datos e iniciar el servidor:

```bash
python manage.py migrate
python manage.py runserver 0.0.0.0:8000
```

El servidor estará disponible localmente en:

http://localhost:8000

### 4. Configurar la aplicación móvil

En la carpeta principal de PetCare, crear un archivo llamado `.env.local` con el siguiente contenido:

```env
EXPO_PUBLIC_API_URL=http://IP_WINDOWS:8001
```

Para consultar la dirección IPv4 de Windows, ejecutar en PowerShell:

```powershell
ipconfig
```

Reemplazar `IP_WINDOWS` por la dirección correspondiente a la conexión Wi-Fi de la computadora.

### 5. Conexión entre Windows y Ubuntu WSL

Si Django se está ejecutando desde WSL y el teléfono no puede acceder directamente a la API, será necesario redirigir el puerto.

Abrir PowerShell como administrador y ejecutar:

```powershell
$wslIp = ((wsl.exe hostname -I).Trim() -split '\s+')[0]
```

Crear la redirección:

```powershell
netsh interface portproxy add v4tov4 listenaddress=0.0.0.0 listenport=8001 connectaddress=$wslIp connectport=8000
```

Permitir la conexión desde la red local:

```powershell
New-NetFirewallRule -DisplayName "PetCare API 8001" -Direction Inbound -Protocol TCP -LocalPort 8001 -Action Allow -Profile Private -RemoteAddress LocalSubnet
```

Consultar las redirecciones existentes:

```powershell
netsh interface portproxy show all
```

Si existe una redirección anterior para el puerto 8001, deberá eliminarse antes de crear una nueva.

Para comprobar la conexión, abrir desde el navegador del teléfono:

```
http://IP_WINDOWS:8001/api/pets/
```

Si aparece una respuesta `401 Unauthorized`, significa que la API está respondiendo, pero requiere iniciar sesión.

### 6. Ejecutar la aplicación

Desde la carpeta PetCare, ejecutar:

```powershell
npx expo start --clear --lan
```

Una vez iniciado Expo, escanear el código QR que aparece en la terminal utilizando Expo Go.

También se puede abrir la versión web presionando la tecla `w` en la terminal.

Se recomienda utilizar un teléfono para probar las funciones de cámara y escaneo de códigos QR.

## Uso de la aplicación

### Propietario

1. Crear una cuenta o iniciar sesión.
2. Registrar una mascota.
3. Consultar y actualizar su información.
4. Agregar una fotografía.
5. Consultar su carnet digital.
6. Configurar la información que desea compartir.

### Acceso veterinario

1. Seleccionar la opción Acceso veterinario.
2. Abrir el lector QR.
3. Escanear el carnet digital de una mascota.
4. Consultar la información autorizada por el propietario.

El acceso veterinario permite consultar la información, pero no modificarla.

## Pruebas

Para ejecutar las pruebas del backend:

```bash
python manage.py test api
```

Para verificar las dependencias de Expo:

```powershell
npx expo install --check
```

Las pruebas de navegación, formularios, cámara y lectura de códigos QR se realizan desde la aplicación móvil.

## Notas

- Los archivos `.env` y `.env.local` no deben subirse al repositorio.
- No compartir contraseñas, claves privadas ni tokens.
- La dirección IP puede cambiar al reiniciar el equipo o cambiar de red.
- La base de datos SQLite y la carpeta `media/` almacenan la información y las fotografías del proyecto.
- La conexión HTTP local se utiliza únicamente durante el desarrollo.

## Estado del proyecto

Actualmente, PetCare cuenta con sus principales funcionalidades implementadas. Se encuentran pendientes las pruebas finales de integración, la revisión de seguridad y la publicación del backend en un servidor.

## Integrantes

- Castro Romero Roberto Daniel
- Mondragon Nieto Yolanda Karina

**Materia:** Desarrollo de Apps Móviles.

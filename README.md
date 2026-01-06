### Plantilla para proyectos finales
* Proyecto de ejemplo sencillo y simple, incluye la creación de la aplicación móvil
* Dominio de prueba: appsmoviles.grupofmo.com
# Tecnologías usadas en el Backend
* Node.js
# Módulos
* cors 2.8.5
* dotenv 17.2.3
* express 5.2.1
* mariadb 3.4.5
* mysql2 3.16.0
* sequelize 6.37.7
# Tecnologías usadas en el Frontend
* HTML/CSS/Javascript

# Tecnologías para aplicaciones móviles
* Apache Cordova

# Base de datos - MariaDB
* Servidor: grupofmo.com

# Funcionamiento del proyecto
Es necesario crear un archivo .env dentro del directorio backend que contenga lo siguiente:

```
PORT=5555
DB_HOST=grupofmo.com
DB_PORT=3306
DB_NAME=Consultar nombre de la base
DB_USER=Consultar usuario
DB_PASS=Consultar clave

TABLE_PREFIX=ap_
CORS_ORIGIN=*
```

### Cómo usar el Proyecto
* Clonar el repositorio
```
git clone https://github.com/elgabo82/plantilla-aplicaciones-moviles.git
```
* Crear una rama localmente
* Instalar todos los paquetes necesarios
```
npm i
```
* Ejecutar el Backend y Frontend, para este ejemplo están separados, pero es posible hacerlos escuchar en el mismo puerto

# Para ejecutar el backend
* Debe ejecutar el backend, se debe estar dentro del directorio del backend
* Puerto de la configuración: 3000
```
nodemon server.js
```
#####  Inicio 1
```
npm run start
```

##### Inicio 2
```
npm run dev
```

# Para ejecutar el Frontend
* Pueden instalar el módulo http-server
```
npm i http-server
```
* Puerto de la configuración: 8080
* Para ejecutar el Frontend, se debe estar dentro el directorio del frontend
```
http-server -p 8080
```

# Creación del proyecto Cordova (aplicación móvil)
* Es necesario instalar el paquete cordova de forma global:
```
npm i -g cordova
```
* Paso de generación
```
cordova create appmovil com.grupofmo.catalogolibros CatalogoLibros
```
Dentro del directorio de la aplicación, realizar lo siguiente:
```
cordova platform add android@latest
cordova platform ls
```
Si todo lo anterior fue correcto, dentro del directorio www de la aplicación, eliminar el contenido y trasladar el contenido del frontend hacia www
```
rm -rf www/*
cp -r ../frontend/* www/
```
Agregar en el archivo config.xml lo siguiente:
```
<access origin="*" />
<allow-navigation href="*" />
```
Realizar la compilación o generación del apk
```
cordova build android
```
El archivo .apk se genera dentro del directorio:
```
platforms/android/app/build/outputs/apk/debug
```

### Nota importante
El proyecto está funcionando con SSL, se hicieron los cambios necesarios para que funcione la aplicación tanto en la versión web como móvil.
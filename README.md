# Media Management Platform

## Descripción

Esta es una plataforma de gestión de medios que permite a los usuarios administrar pantallas, listas de reproducción y contenido multimedia como imágenes y videos. La aplicación está construida utilizando **Next.js**, **Firebase** y **Tailwind CSS**.

## Características

- **Gestión de Pantallas**: Crear, editar y asignar listas de reproducción a pantallas específicas.
- **Gestión de Listas de Reproducción**: Crear y organizar listas de reproducción con contenido multimedia.
- **Gestión de Contenido**: Subir y administrar imágenes y videos.
- **Autenticación**: Inicio de sesión seguro utilizando Firebase Authentication.
- **Base de Datos en Tiempo Real**: Almacenar y sincronizar datos utilizando Firestore.

## Tecnologías Utilizadas

- **Next.js**: Framework de React para aplicaciones web.
- **Firebase**: Backend como servicio para autenticación, base de datos y almacenamiento.
- **Tailwind CSS**: Framework de CSS para diseño responsivo y moderno.
- **React Hook Form**: Manejo de formularios con validación.
- **Zod**: Validación de esquemas de datos.

## Instalación

1. Clona este repositorio:
   ```bash
   git clone <URL_DEL_REPOSITORIO>
   ```
2. Instala las dependencias:
   ```bash
   npm install
   ```
3. Crea un archivo `.env.local` en la raíz del proyecto y configura las variables de entorno necesarias:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   ```
4. Inicia el servidor de desarrollo:
   ```bash
   npm run dev
   ```
5. Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## Estructura del Proyecto

```
media/
├── src/
│   ├── app/
│   │   ├── admin/
│   │   │   ├── screens/
│   │   │   ├── playlists/
│   │   │   ├── content/
│   │   ├── login/
│   │   ├── display/
│   ├── components/
│   │   ├── ui/
│   │   ├── media-viewer.tsx
│   ├── firebase/
│   ├── hooks/
│   ├── lib/
│   ├── styles/
├── public/
├── .env.example
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```

## Scripts Disponibles

- `npm run dev`: Inicia el servidor de desarrollo.
- `npm run build`: Construye la aplicación para producción.
- `npm run start`: Inicia el servidor en modo producción.

## Contribución

1. Haz un fork del repositorio.
2. Crea una rama para tu feature:
   ```bash
   git checkout -b feature/nueva-feature
   ```
3. Realiza tus cambios y haz commit:
   ```bash
   git commit -m "Agrega nueva feature"
   ```
4. Sube tus cambios:
   ```bash
   git push origin feature/nueva-feature
   ```
5. Abre un Pull Request.

## Licencia

Este proyecto está licenciado bajo la [MIT License](LICENSE).

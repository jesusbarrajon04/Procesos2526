<p align="center">
  <img src="./cliente/saas.png" alt="SaaS Banner" width="600"/>
</p>

<h1 align="center">🚀 Procesos2526</h1>

<p align="center">
  <b>Arquitectura base para un SaaS desarrollado en Node.js y desplegado en Google Cloud Run</b>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-v22.0.0-green?logo=node.js" alt="Node.js Badge"/>
  <img src="https://img.shields.io/badge/Express.js-4.x-blue?logo=express" alt="Express Badge"/>
  <img src="https://img.shields.io/badge/Jasmine-5.1-orange?logo=jasmine" alt="Jasmine Badge"/>
  <img src="https://img.shields.io/badge/Google%20Cloud%20Run-Deployed-success?logo=googlecloud" alt="Cloud Run Badge"/>
  <img src="https://img.shields.io/badge/License-MIT-yellow" alt="License Badge"/>
</p>

---

## 🧠 Descripción general

**Procesos2526** es un proyecto académico desarrollado en el marco de la asignatura **Procesos de Ingeniería del Software** (4º curso del Grado en Ingeniería Informática – UCLM).

El objetivo principal es construir desde cero la **arquitectura base de un SaaS (Software as a Service)**, comprendiendo la interacción entre sus diferentes capas y tecnologías:  
backend, frontend, base de datos, entorno de pruebas y despliegue en la nube.

Este proyecto servirá como base para futuros desarrollos y para el **Trabajo Fin de Grado (TFG)**.

---

## 🎯 Objetivos

- Diseñar e implementar una **arquitectura cliente-servidor REST**.  
- Gestionar usuarios y servicios mediante peticiones AJAX.  
- Integrar **pruebas unitarias automatizadas** con Jasmine.  
- Aprender la **interconexión entre servidor, base de datos, cliente y entorno cloud**.  
- Desplegar el proyecto en **Google Cloud Run** con contenedor Docker.  
- Utilizar herramientas profesionales: GitHub, VS Code y Modelio.

---

## ⚙️ Tecnologías utilizadas

| Categoría | Herramienta / Tecnología |
|------------|---------------------------|
| **Backend** | Node.js + Express |
| **Frontend** | HTML5, JavaScript, jQuery, Bootstrap |
| **Base de datos** | MongoDB Atlas (integración futura) |
| **Pruebas unitarias** | Jasmine |
| **Entorno de desarrollo** | Visual Studio Code |
| **Control de versiones** | Git + GitHub |
| **Despliegue en la nube** | Google Cloud Run |
| **Contenerización** | Docker |
| **Diagramado UML** | Modelio |

---

## 🧩 Arquitectura general

El sistema sigue una arquitectura **cliente-servidor REST**:

- El **cliente** realiza peticiones AJAX mediante `ClienteRest` y renderiza formularios dinámicos con `ControlWeb`.  
- El **servidor** (Node.js + Express) gestiona las peticiones REST y la lógica del sistema (`Sistema` y `Usuario`).  
- Las **pruebas unitarias** se ejecutan con Jasmine sobre los métodos del modelo.  
- En el futuro, los datos se almacenarán en **MongoDB Atlas** para persistencia real.

---

## 📁 Estructura del proyecto
Procesos2526/
├── cliente/
│ ├── index.html
│ ├── clienteRest.js
│ ├── controlWeb.js
│ ├── modelo.js
│ └── saas.png
├── servidor/
│ ├── modelo.js
│ └── modeloSpec.js
├── index.js
├── package.json
├── Dockerfile
├── LICENSE
└── README.md


--------------------------------------------------------------------

## 🧪 Ejecución en entorno local

### 🔧 Requisitos previos

- [Node.js](https://nodejs.org/en/download) (v22 o superior)  
- npm (instalado junto a Node)  
- Visual Studio Code  
- Git

### ▶️ Pasos

1. **Clonar el repositorio:**
   ```bash
   git clone https://github.com/<tu_usuario>/Procesos2526.git
   cd Procesos2526
2. Instalar dependencias:
  npm install
3. Iniciar el servidor:
  npm start
4. Abrir en el navegador:
  http://localhost:3000/cliente/index.html

☁️ Despliegue en Google Cloud Run
El proyecto está desplegado públicamente en Google Cloud Run.
URL del servicio:
  https://procesos2526-817150573239.europe-west1.run.app

Despliegue manual:
1. Inicia sesión y configura tu proyecto:
   gcloud init
2. Despliega el servicio:
   gcloud run deploy
3. Responde a las opciones:
   - Código fuente: .
   - Nombre del servicio: procesos2526
   - Región: europe-west1
   - Permitir invocaciones no autenticadas: Y
4. Acceda con la URL que se genera para el SaaS

Pruebas unitarias
Las pruebas se ejecutan con Jasmine, verificando el correcto funcionamiento de los métodos del modelo (Sistema y Usuario).
Ejecutar pruebas desde la raíz del proyecto: npm run testW

Autor
Jesús
🎓 Estudiante de Ingeniería Informática – Universidad de Castilla-La Mancha (UCLM)
Curso académico: 2025 / 2026

Licencia
Este proyecto se distribuye bajo la licencia MIT.

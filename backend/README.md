# G6 - Gym Management System

## 🚀 Tecnologias

- Backend: Laravel 11 + Sanctum
- Frontend: React (Vite)
- Banco: MySQL
- Auth: Token (Sanctum)
- API REST

---

## ⚙️ Requisitos

- PHP 8.2+
- Composer
- Node.js 18+
- MySQL
- Git

---

# 🧠 BACKEND (Laravel)

## 📥 Instalar dependências

```bash
cd backend
composer install
```

---

## ⚙️ Configurar ambiente

```bash
cp .env.example .env
php artisan key:generate
```

---

## 🗄️ Rodar migrations + seeders

```bash
php artisan migrate:fresh --seed
```

---

## 🌱 Seeder principal (dados do sistema)

```bash
php artisan db:seed --class=SuperSeeder
```

---

## 🚀 Rodar servidor

```bash
php artisan serve
```

API:
http://localhost:8000

---

# ⚛️ FRONTEND (React)

## 📥 Instalar dependências

```bash
cd frontend
npm install
```

---

## 🚀 Rodar frontend

```bash
npm run dev
```

Frontend:
http://localhost:5173

---

# 🔐 AUTENTICAÇÃO

Sistema usa Laravel Sanctum (token).

## Login

POST /api/auth/login

### Body

{
"email": "student@teste.com",
"password": "123456"
}

---

## Usar token

Authorization: Bearer SEU_TOKEN

---

# 👤 USUÁRIOS (SEEDER)

## Personal

email: trainer@teste.com
senha: 123456

## Aluno

email: student@teste.com
senha: 123456

---

# 🏋️ FUNCIONALIDADES

## Personal

- CRUD de alunos
- CRUD de exercícios
- CRUD de treinos

## Aluno

- visualizar treinos
- executar treino
- registrar cargas e repetições (em desenvolvimento)

---

# 🚀 START COMPLETO

## Backend

cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate:fresh --seed
php artisan serve

## Frontend

cd frontend
npm install
npm run dev

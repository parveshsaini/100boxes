# 100Boxes - Assignment project for Gamitar

### Live Here: https://gamitar.parveshsaini.tech

## Features

- **Interactive 10x10 Grid**: Players can select and update any block in a 10x10 grid with a Unicode character of their choice.
  
- **Time-based Restrictions**: Once a block is updated, it becomes locked for **20 seconds** for **all the users**, preventing any further updates within that period.

- **Real-time Updates**: All grid updates are propagated in real-time to every connected player using Wesockets.

- **Online User Tracking**: Players can view a list of all the users currently online on the platform.

- **Grid Update History**: Users can view the full history of grid updates, showing when and how each block was modified.


---

## Architecture

The application is designed with **scalability** in mind, ensuring real-time updates and fast communication in a distributed setting:

- **Redis for WebSocket Scaling**: Redis is used to enable communication across distributed WebSocket servers, ensuring seamless synchronization of grid updates between players.

- **In-memory Writes with Redis**: Writes are first stored in Redis for faster updates, allowing the system to handle real-time changes efficiently before persisting to the database.

---

## Local Development Setup
You can use either `pnpm` or `npm` for package management, but **if you opt to use `npm`, make sure to delete the `pnpm-lock.yaml` file** before running the installation commands.

### Prerequisites
- Make sure you have Docker and Docker Compose installed.
- Install `pnpm` globally, or use `npm` if preferred.

### Backend Setup

1. **Copy `.env.example` to `.env` file** 
```bash
cp .env.example .env
```
2. **Install Dependencies**
```bash
pnpm install
```
3. **Run Docker Containers for Postgres and Redis**
```bash
docker-compose up
```
4. **Migrate Prisma Schema**  
```bash
pnpm dlx prisma migrate dev --init_schema
pnpm dlx prisma generate
```
5. **Start Backend**
```bash
pnpm dev
```

### Frontend Setup
1. **Navigate to the Frontend Directory**  

2. **Install Dependencies**
```bash
pnpm install
```
3. **Start Frontend**
```bash
pnpm dev
```

---

### Important Notes:
- If you're using `npm` instead of `pnpm`, remember to delete the `pnpm-lock.yaml` file.
- The backend and frontend will be available on different ports (`http://localhost:6001` for the backend and `http://localhost:5173` for the frontend).

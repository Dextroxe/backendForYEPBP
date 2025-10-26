# 🐳 Docker Guide for backendForYEPBP

This guide explains how to run the entire application stack using Docker Compose.

## 📋 Prerequisites

- Docker Desktop installed (Windows/Mac) or Docker Engine + Docker Compose (Linux)
- Docker Compose v2.0 or higher

## 🚀 Quick Start

### 1. Ensure your `.env` file is configured

Make sure your `.env` file has the correct values. For Docker Compose, use these settings:

```env
DATABASE_HOST=postgres
REDIS_HOST=redis
REDIS_URL=redis://redis:6379
```

Your existing `.env` should already have these values set correctly.

### 2. Start all services

```bash
docker-compose up -d
```

This command will:
- Pull PostgreSQL and Redis images
- Build your backend application
- Start all services in the background
- Run database migrations automatically

### 3. Check service status

```bash
docker-compose ps
```

You should see three services running:
- `backendForYEPBP-postgres` (PostgreSQL)
- `backendForYEPBP-redis` (Redis)
- `backendForYEPBP-app` (Backend API)

### 4. View logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f postgres
docker-compose logs -f redis
```

### 5. Access your application

- **API**: http://localhost:3000
- **Swagger Documentation**: http://localhost:3000/api/docs
- **PostgreSQL**: localhost:5432
- **Redis**: localhost:6379

## 🛠️ Common Commands

### Start services
```bash
docker-compose up -d
```

### Stop services
```bash
docker-compose down
```

### Stop and remove volumes (⚠️ deletes all data)
```bash
docker-compose down -v
```

### Rebuild backend after code changes
```bash
docker-compose up -d --build backend
```

### Restart a specific service
```bash
docker-compose restart backend
```

### Execute commands inside containers
```bash
# Access backend container shell
docker-compose exec backend sh

# Run Prisma commands
docker-compose exec backend npx prisma migrate dev
docker-compose exec backend npx prisma studio

# Access PostgreSQL
docker-compose exec postgres psql -U docker -d postgres

# Access Redis CLI
docker-compose exec redis redis-cli
```\


## my thing
docker-compose exec backend-dev npx prisma migrate dev --name init
docker-compose exec backend-dev npx prisma generate


## 🔧 Development Mode

To run in development mode with hot reload:

1. Edit `docker-compose.yml`
2. Comment out the `backend` service
3. Uncomment the `backend-dev` service
4. Run:
```bash
docker-compose up -d
```

Development mode mounts your local code directory, so changes are reflected immediately.

## 🗃️ Database Management

### Run migrations
```bash
docker-compose exec backend npx prisma migrate deploy
```

### Create a new migration
```bash
docker-compose exec backend npx prisma migrate dev --name your_migration_name
```

### Reset database (⚠️ deletes all data)
```bash
docker-compose exec backend npx prisma migrate reset
```

### Open Prisma Studio
```bash
docker-compose exec backend npx prisma studio
```
Then open http://localhost:5555

## 🐛 Troubleshooting

### Services won't start
```bash
# Check logs for errors
docker-compose logs

# Ensure no port conflicts
netstat -ano | findstr :3000
netstat -ano | findstr :5432
netstat -ano | findstr :6379
```

### Database connection issues
```bash
# Check if PostgreSQL is healthy
docker-compose exec postgres pg_isready -U docker

# Verify connection string
docker-compose exec backend env | grep DATABASE_URL
```

### Redis connection issues
```bash
# Check if Redis is running
docker-compose exec redis redis-cli ping
# Should return: PONG
```

### Reset everything
```bash
# Stop all services and remove volumes
docker-compose down -v

# Remove all images
docker-compose down --rmi all

# Start fresh
docker-compose up -d --build
```

## 📊 Monitoring

### Check resource usage
```bash
docker stats
```

### View container details
```bash
docker-compose ps -a
```

### Inspect networks
```bash
docker network ls
docker network inspect backendForYEPBP_backend-network
```

## 🔒 Security Notes

1. **Never commit `.env` file** - It contains sensitive keys
2. **Change default passwords** in production
3. **Use secrets management** for production deployments
4. **Regenerate Ed25519 keys** for production:
   ```bash
   openssl genpkey -algorithm ed25519 -out private.pem
   openssl pkey -in private.pem -pubout -out public.pem
   ```

## 📦 Data Persistence

Data is persisted in Docker volumes:
- `postgres_data` - PostgreSQL database
- `redis_data` - Redis cache

These volumes persist even when containers are stopped. To remove them:
```bash
docker-compose down -v
```

## 🚢 Production Deployment

For production:
1. Use environment-specific `.env` files
2. Enable SSL/TLS for database connections
3. Use managed database services (AWS RDS, Azure Database, etc.)
4. Implement proper backup strategies
5. Use container orchestration (Kubernetes, ECS, etc.)

## 📝 Notes

- The backend waits for PostgreSQL and Redis to be healthy before starting
- Migrations run automatically on backend startup
- Logs are available via `docker-compose logs`
- Data persists across container restarts

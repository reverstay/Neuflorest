# neuflower

neuflower bridges the gap between nature and technology. It is a full-stack e-commerce and management platform designed to sell uniquely engineered 3D-printed planters alongside real plants, integrated with a smart, automated care ecosystem that tracks and maintains plant health autonomously.

## Stack

- Backend: Django, Django REST Framework, PostgreSQL
- Frontend: React, TypeScript, Vite
- Infrastructure: Docker and Docker Compose

## Local Development

Copy the example environment file if you want to customize local settings:

```bash
cp .env.example .env
```

Start the full development stack:

```bash
docker-compose up --build
```

The main services will be available at:

- Frontend: http://localhost:3030
- Backend API: http://localhost:2020/api/
- Django admin: http://localhost:2020/admin/
- Health check: http://localhost:2020/api/health/

## API Surface

The initial REST API exposes CRUD endpoints for:

- `/api/plants/`
- `/api/planters/`
- `/api/devices/`
- `/api/telemetry/`

The frontend example calls:

```text
GET /api/telemetry/latest/
GET /api/telemetry/latest/?device_identifier=<device-id>
```

## Optional Nginx Routing

A development proxy config is available at `nginx/nginx.conf`. The default Compose stack uses Vite's `/api` proxy, keeping the required runtime to the three core services: PostgreSQL, Django, and React.

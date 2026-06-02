# Expense Tracker

Full-stack expense tracker with a scalable REST API (Express + MongoDB) and a React + Vite frontend.

## Deploy

- https://expense-tracker-virid-eta-39.vercel.app/auth

## Backend

This backend provides robust Authentication (JWT & Google OAuth) and Role-Based Access Control, along with full CRUD operations.

### Scalability Notes

1. **Microservices Architecture**: The current monolithic design can be split into independent services (e.g., an Auth Service and an Expense Service) as the application grows, allowing individual services to scale based on demand.
2. **Caching**: Implementing a caching layer (like Redis) can significantly reduce database load. Frequent queries (e.g., fetching a user's expense summary) can be cached.
3. **Load Balancing**: Deploying the application across multiple instances behind a load balancer (e.g., NGINX, AWS ALB) will ensure high availability and distribute incoming traffic effectively.
4. **Database Indexing**: The MongoDB schema should utilize indexes (e.g., indexing `createdBy` in the Expense schema) to speed up query execution as the database grows.
5. **API Versioning**: Implementing versioning (e.g., `/api/v1/...`) early on helps maintain backward compatibility when releasing new features.

## Frontend

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

### Environment Variables

Create a `.env` file (or set this in your deployment environment) with:

```
VITE_API_URL=http://localhost:5000
```

In Vercel, add `VITE_API_URL` in Project Settings -> Environment Variables and point it to your deployed backend URL.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs)

### React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

### Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

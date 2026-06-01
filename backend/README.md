# Scalable REST API

This backend is built using Express.js and MongoDB. It provides robust Authentication (JWT & Google OAuth) and Role-Based Access Control, along with full CRUD operations.

## Scalability Notes

To scale this application in a production environment:

1. **Microservices Architecture**: The current monolithic design can be split into independent services (e.g., an Auth Service and an Expense Service) as the application grows, allowing individual services to scale based on demand.
2. **Caching**: Implementing a caching layer (like Redis) can significantly reduce database load. Frequent queries (e.g., fetching a user's expense summary) can be cached.
3. **Load Balancing**: Deploying the application across multiple instances behind a load balancer (e.g., NGINX, AWS ALB) will ensure high availability and distribute incoming traffic effectively.
4. **Database Indexing**: The MongoDB schema should utilize indexes (e.g., indexing `createdBy` in the Expense schema) to speed up query execution as the database grows.
5. **API Versioning**: Implementing versioning (e.g., `/api/v1/...`) early on helps maintain backward compatibility when releasing new features.

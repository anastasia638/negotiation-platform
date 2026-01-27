# API

Base URL:
http://127.0.0.1:8080

## Health
GET /api/health

## Products
GET /api/products  
GET /api/products/{id}  
POST /api/products  
PUT /api/products/{id}  
DELETE /api/products/{id}

### Status codes
- 200 OK: Successful GET/PUT with a response body. [web:1074]
- 201 Created: Successful POST (resource created). [web:1074]
- 204 No Content: Successful DELETE (no response body). [web:1060]
- 400 Bad Request: Validation error on request body. [web:963]
- 404 Not Found: Resource not found. [web:1060]

### Examples (curl)

#### Create (201)
```bash
curl -i -H "Content-Type: application/json" \
  -d '{"name":"Keyboard","basePrice":49.99}' \
  http://127.0.0.1:8080/api/products

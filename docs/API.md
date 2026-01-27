# API

## Health
GET /api/health

## Products
GET /api/products
GET /api/products/{id}
POST /api/products
PUT /api/products/{id}
DELETE /api/products/{id}

### Examples (curl)

# Create
curl -i -H "Content-Type: application/json" \
  -d '{"name":"Keyboard","basePrice":49.99}' \
  http://127.0.0.1:8080/api/products

# List
curl -i http://127.0.0.1:8080/api/products

# Get by id
curl -i http://127.0.0.1:8080/api/products/1

# Update
curl -i -X PUT -H "Content-Type: application/json" \
  -d '{"name":"Keyboard V2","basePrice":59.99}' \
  http://127.0.0.1:8080/api/products/1

# Delete
curl -i -X DELETE http://127.0.0.1:8080/api/products/1

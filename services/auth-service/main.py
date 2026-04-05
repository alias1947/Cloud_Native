from datetime import datetime, timedelta

from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer
from pydantic import BaseModel

app = FastAPI(
    title="Authentication Service",
    description="User authentication and RBAC for Cloud-Native Microservices Platform",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class SimpleBearer:
    def __init__(self):
        self.model = HTTPBearer()


security = SimpleBearer()

# In-memory storage (replace with database later)
users_db = {
    "admin": {
        "password": "admin123",
        "roles": ["admin", "user"],
        "permissions": ["read", "write", "delete"],
    },
    "user1": {"password": "user123", "roles": ["user"], "permissions": ["read"]},
}

tokens_db = {}


class LoginRequest(BaseModel):
    username: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    expires_in: int


class User(BaseModel):
    username: str
    roles: list
    permissions: list


class RoleRequest(BaseModel):
    username: str
    role: str


@app.post("/auth/login", response_model=TokenResponse)
async def login(request: LoginRequest):
    """Authenticate user and return JWT token"""
    user = users_db.get(request.username)
    if not user or user["password"] != request.password:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = f"token_{request.username}_{datetime.now().timestamp()}"
    expires_in = 3600
    tokens_db[token] = {
        "username": request.username,
        "roles": user["roles"],
        "permissions": user["permissions"],
        "expires_at": datetime.now() + timedelta(seconds=expires_in),
    }

    return {"access_token": token, "token_type": "bearer", "expires_in": expires_in}


@app.post("/auth/logout")
async def logout(bearer: HTTPBearer = Depends(HTTPBearer())):
    """Logout user"""
    token = bearer.credentials
    if token in tokens_db:
        del tokens_db[token]
    return {"message": "Logged out successfully"}


@app.get("/auth/verify")
async def verify_token(bearer: HTTPBearer = Depends(HTTPBearer())):
    """Verify token validity"""
    token = bearer.credentials
    if token not in tokens_db:
        raise HTTPException(status_code=401, detail="Invalid token")

    token_data = tokens_db[token]
    if datetime.now() > token_data["expires_at"]:
        del tokens_db[token]
        raise HTTPException(status_code=401, detail="Token expired")

    return token_data


@app.get("/auth/user/{username}", response_model=User)
async def get_user(username: str, bearer: HTTPBearer = Depends(HTTPBearer())):
    """Get user details"""
    token = bearer.credentials
    if token not in tokens_db:
        raise HTTPException(status_code=401, detail="Unauthorized")

    user = users_db.get(username)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return {
        "username": username,
        "roles": user["roles"],
        "permissions": user["permissions"],
    }


@app.post("/auth/role/assign")
async def assign_role(request: RoleRequest, bearer: HTTPBearer = Depends(HTTPBearer())):
    """Assign role to user (admin only)"""
    token = bearer.credentials
    if token not in tokens_db or "admin" not in tokens_db[token]["roles"]:
        raise HTTPException(status_code=403, detail="Forbidden - admin access required")

    user = users_db.get(request.username)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if request.role not in user["roles"]:
        user["roles"].append(request.role)

    return {"message": f"Role {request.role} assigned to {request.username}"}


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "auth-service"}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8001)

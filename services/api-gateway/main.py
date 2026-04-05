from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="API Gateway",
    description="Central API Gateway for Cloud-Native Microservices Platform",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    return {"message": "API Gateway"}


@app.get("/health")
async def health_check():
    return {"status": "healthy"}


@app.get("/services")
async def list_services():
    return {
        "services": [
            "api-gateway",
            "auth-service",
            "optimization-service",
            "resource-mgmt-service",
            "monitoring-service",
        ]
    }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)

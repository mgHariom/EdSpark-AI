from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api import generate



app = FastAPI()

app.include_router(generate.router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods (GET, POST, PUT, DELETE, OPTIONS)
    allow_headers=["*"],  # Allows all headers
)

@app.get("/")
def read_root():
    return {"message": "hello React... I am your support buddy"}

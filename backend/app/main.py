from fastapi import FastAPI
from app.api import auth, cases

app = FastAPI(title="Rinexor API")

app.include_router(auth.router)
app.include_router(cases.router)

@app.get("/")
def root():
    return {"status": "Rinexor backend running"}


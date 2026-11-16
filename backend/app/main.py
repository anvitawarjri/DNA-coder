from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List

from app.database import engine, get_db, Base
from app import models, schemas
from app.classification import classify_and_compare

# Create tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Genetic Variant Classification API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For local development, allow all origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/api/analyze", response_model=schemas.AnalysisResponse)
def analyze_variant(payload: schemas.AnalysisRequest, db: Session = Depends(get_db)):
    try:
        # Perform analysis
        results = classify_and_compare(payload.reference, payload.variant)
        
        # Save to database
        db_item = models.AnalysisHistory(
            reference_sequence=payload.reference,
            variant_sequence=payload.variant,
            variant_type=results["variant_type"],
            protein_change=results["protein_change"]
        )
        db.add(db_item)
        db.commit()
        db.refresh(db_item)
        
        # Return results with db id and timestamp
        results["id"] = db_item.id
        results["created_at"] = db_item.created_at
        return results
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {str(e)}")

@app.get("/api/history", response_model=List[schemas.HistoryItem])
def get_history(db: Session = Depends(get_db)):
    try:
        history = db.query(models.AnalysisHistory).order_by(models.AnalysisHistory.created_at.desc()).all()
        return history
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@app.delete("/api/history/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_history_item(item_id: int, db: Session = Depends(get_db)):
    db_item = db.query(models.AnalysisHistory).filter(models.AnalysisHistory.id == item_id).first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Item not found")
    try:
        db.delete(db_item)
        db.commit()
        return None
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@app.post("/api/batch", response_model=List[schemas.AnalysisResponse])
def analyze_batch(payload: schemas.BatchRequest, db: Session = Depends(get_db)):
    responses = []
    errors = []
    
    for idx, item in enumerate(payload.variants):
        try:
            results = classify_and_compare(item.reference, item.variant)
            
            db_item = models.AnalysisHistory(
                reference_sequence=item.reference,
                variant_sequence=item.variant,
                variant_type=results["variant_type"],
                protein_change=results["protein_change"]
            )
            db.add(db_item)
            db.commit()
            db.refresh(db_item)
            
            results["id"] = db_item.id
            results["created_at"] = db_item.created_at
            responses.append(results)
        except ValueError as ve:
            errors.append(f"Row {idx + 1} validation error: {str(ve)}")
        except Exception as e:
            errors.append(f"Row {idx + 1} general error: {str(e)}")
            
    if errors and len(responses) == 0:
        raise HTTPException(status_code=400, detail="; ".join(errors))
    
    # We return the successful analyses, and if there are errors, they're omitted 
    # but the API responds successfully. In a robust setup, batch returns success status per row.
    # Let's keep it simple: return list of successes, or error if all fail.
    return responses

from app.copilot import generate_copilot_response

@app.post("/api/chat", response_model=schemas.ChatResponse)
def copilot_chat(payload: schemas.ChatRequest):
    try:
        context_dict = payload.context.dict()
        response_data = generate_copilot_response(payload.message, context_dict)
        return response_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Copilot error: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)


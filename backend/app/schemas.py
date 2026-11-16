from pydantic import BaseModel, Field, field_validator
from typing import List, Optional
from datetime import datetime

class AnalysisRequest(BaseModel):
    reference: str = Field(..., description="Reference DNA sequence (only A, T, G, C)")
    variant: str = Field(..., description="Variant DNA sequence (only A, T, G, C)")

    @field_validator('reference', 'variant')
    @classmethod
    def validate_dna(cls, v: str) -> str:
        v_clean = v.upper().strip()
        if not v_clean:
            raise ValueError("Sequence cannot be empty")
        if any(char not in "ATGC" for char in v_clean):
            raise ValueError("Sequence must contain only A, T, G, C characters")
        return v_clean

class AminoAcidDetail(BaseModel):
    codon: str
    aa: str
    name: str
    polarity: str
    charge: str
    type: str

class AnalysisResponse(BaseModel):
    id: Optional[int] = None
    variant_type: str
    protein_change: str
    reference_protein: str
    variant_protein: str
    ref_sequence_codons: List[str]
    alt_sequence_codons: List[str]
    ref_protein_list: List[str]
    alt_protein_list: List[str]
    ref_detailed: List[AminoAcidDetail]
    alt_detailed: List[AminoAcidDetail]
    mutation_position: int
    ref_nucleotide: str
    alt_nucleotide: str
    impact_description: str
    created_at: Optional[datetime] = None

class HistoryItem(BaseModel):
    id: int
    reference_sequence: str
    variant_sequence: str
    variant_type: str
    protein_change: str
    created_at: datetime

    class Config:
        from_attributes = True

class BatchRequest(BaseModel):
    variants: List[AnalysisRequest]

class ChatArticle(BaseModel):
    title: str
    authors: str
    journal: str
    year: int
    pmid: str
    relevance: str

class ChatContext(BaseModel):
    variant_type: str
    protein_change: str
    reference_protein: str
    variant_protein: str
    ref_nucleotide: str
    alt_nucleotide: str
    mutation_position: int

class ChatRequest(BaseModel):
    message: str
    context: ChatContext

class ChatResponse(BaseModel):
    response: str
    articles: List[ChatArticle]


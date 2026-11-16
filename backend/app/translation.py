CODON_TABLE = {
    "TTT": "Phe", "TTC": "Phe", "TTA": "Leu", "TTG": "Leu",
    "CTT": "Leu", "CTC": "Leu", "CTA": "Leu", "CTG": "Leu",
    "ATT": "Ile", "ATC": "Ile", "ATA": "Ile", "ATG": "Met",
    "GTT": "Val", "GTC": "Val", "GTA": "Val", "GTG": "Val",
    "TCT": "Ser", "TCC": "Ser", "TCA": "Ser", "TCG": "Ser",
    "CCT": "Pro", "CCC": "Pro", "CCA": "Pro", "CCG": "Pro",
    "ACT": "Thr", "ACC": "Thr", "ACA": "Thr", "ACG": "Thr",
    "GCT": "Ala", "GCC": "Ala", "GCA": "Ala", "GCG": "Ala",
    "TAT": "Tyr", "TAC": "Tyr", "TAA": "Stop", "TAG": "Stop",
    "CAT": "His", "CAC": "His", "CAA": "Gln", "CAG": "Gln",
    "AAT": "Asn", "AAC": "Asn", "AAA": "Lys", "AAG": "Lys",
    "GAT": "Asp", "GAC": "Asp", "GAA": "Glu", "GAG": "Glu",
    "TGT": "Cys", "TGC": "Cys", "TGA": "Stop", "TGG": "Trp",
    "CGT": "Arg", "CGC": "Arg", "CGA": "Arg", "CGG": "Arg",
    "AGT": "Ser", "AGC": "Ser", "AGA": "Arg", "AGG": "Arg",
    "GGT": "Gly","GGC": "Gly","GGA": "Gly","GGG": "Gly"
}

AMINO_ACID_PROPERTIES = {
    "Phe": {"name": "Phenylalanine", "polarity": "Non-polar", "charge": "Neutral", "type": "Hydrophobic"},
    "Leu": {"name": "Leucine", "polarity": "Non-polar", "charge": "Neutral", "type": "Hydrophobic"},
    "Ile": {"name": "Isoleucine", "polarity": "Non-polar", "charge": "Neutral", "type": "Hydrophobic"},
    "Met": {"name": "Methionine", "polarity": "Non-polar", "charge": "Neutral", "type": "Hydrophobic"},
    "Val": {"name": "Valine", "polarity": "Non-polar", "charge": "Neutral", "type": "Hydrophobic"},
    "Ser": {"name": "Serine", "polarity": "Polar", "charge": "Neutral", "type": "Polar"},
    "Pro": {"name": "Proline", "polarity": "Non-polar", "charge": "Neutral", "type": "Hydrophobic"},
    "Thr": {"name": "Threonine", "polarity": "Polar", "charge": "Neutral", "type": "Polar"},
    "Ala": {"name": "Alanine", "polarity": "Non-polar", "charge": "Neutral", "type": "Hydrophobic"},
    "Tyr": {"name": "Tyrosine", "polarity": "Polar", "charge": "Neutral", "type": "Polar/Aromatic"},
    "Stop": {"name": "Stop Codon", "polarity": "N/A", "charge": "N/A", "type": "Termination"},
    "His": {"name": "Histidine", "polarity": "Polar", "charge": "Positive", "type": "Basic"},
    "Gln": {"name": "Glutamine", "polarity": "Polar", "charge": "Neutral", "type": "Polar"},
    "Asn": {"name": "Asparagine", "polarity": "Polar", "charge": "Neutral", "type": "Polar"},
    "Lys": {"name": "Lysine", "polarity": "Polar", "charge": "Positive", "type": "Basic"},
    "Asp": {"name": "Aspartic Acid", "polarity": "Polar", "charge": "Negative", "type": "Acidic"},
    "Glu": {"name": "Glutamic Acid", "polarity": "Polar", "charge": "Negative", "type": "Acidic"},
    "Cys": {"name": "Cysteine", "polarity": "Polar", "charge": "Neutral", "type": "Polar"},
    "Trp": {"name": "Tryptophan", "polarity": "Non-polar", "charge": "Neutral", "type": "Hydrophobic/Aromatic"},
    "Arg": {"name": "Arginine", "polarity": "Polar", "charge": "Positive", "type": "Basic"},
    "Gly": {"name": "Glycine", "polarity": "Non-polar", "charge": "Neutral", "type": "Polar/Small"}
}

def translate_dna(sequence: str) -> dict:
    """
    Translates a DNA sequence into codons and amino acids.
    Returns:
        {
            "codons": ["ATG", "AAA", ...],
            "protein": ["Met", "Lys", ...],
            "amino_acids_detailed": [{"codon": "ATG", "aa": "Met", "name": "Methionine", ...}, ...]
        }
    """
    sequence = sequence.upper().strip()
    codons = []
    protein = []
    detailed = []
    
    for i in range(0, len(sequence), 3):
        codon = sequence[i:i+3]
        if len(codon) < 3:
            # Trailing partial codon due to frameshift or incomplete sequence
            codons.append(codon)
            protein.append("?")
            detailed.append({
                "codon": codon,
                "aa": "?",
                "name": f"Incomplete Codon ({codon})",
                "polarity": "Unknown",
                "charge": "Unknown",
                "type": "Incomplete"
            })
            continue
            
        aa = CODON_TABLE.get(codon, "?")
        codons.append(codon)
        protein.append(aa)
        
        aa_props = AMINO_ACID_PROPERTIES.get(aa, {
            "name": "Unknown",
            "polarity": "Unknown",
            "charge": "Unknown",
            "type": "Unknown"
        })
        
        detailed.append({
            "codon": codon,
            "aa": aa,
            **aa_props
        })
        
    return {
        "codons": codons,
        "protein": protein,
        "detailed": detailed
    }

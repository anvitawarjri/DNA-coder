from app.translation import translate_dna, AMINO_ACID_PROPERTIES

def get_mutation_details(ref: str, alt: str) -> dict:
    """
    Identifies the exact position and change of a mutation using common prefix/suffix matching.
    """
    ref = ref.upper().strip()
    alt = alt.upper().strip()
    
    # 1. Find common prefix
    prefix_len = 0
    min_len = min(len(ref), len(alt))
    while prefix_len < min_len and ref[prefix_len] == alt[prefix_len]:
        prefix_len += 1
        
    # 2. Find common suffix from the end, ensuring no overlap with prefix
    suffix_len = 0
    max_suffix = min_len - prefix_len
    while suffix_len < max_suffix and ref[len(ref) - 1 - suffix_len] == alt[len(alt) - 1 - suffix_len]:
        suffix_len += 1
        
    ref_mid = ref[prefix_len : len(ref) - suffix_len]
    alt_mid = alt[prefix_len : len(alt) - suffix_len]
    
    position = prefix_len + 1  # 1-indexed position
    
    return {
        "position": position,
        "ref_nucleotide": ref_mid if ref_mid else "-",
        "alt_nucleotide": alt_mid if alt_mid else "-",
        "prefix_len": prefix_len,
        "suffix_len": suffix_len
    }

def classify_and_compare(ref_seq: str, alt_seq: str) -> dict:
    """
    Compares the reference and variant DNA sequences, translates them,
    classifies the variant type, and generates alignment/comparison details.
    """
    ref_seq = ref_seq.upper().strip()
    alt_seq = alt_seq.upper().strip()
    
    # Validation
    if not ref_seq or not alt_seq:
        raise ValueError("Sequences cannot be empty.")
    if any(c not in "ATGC" for c in ref_seq) or any(c not in "ATGC" for c in alt_seq):
        raise ValueError("Sequences must only contain A, T, G, and C.")
    if ref_seq == alt_seq:
        raise ValueError("Variant sequence must differ from reference sequence.")
        
    # Translate sequences
    ref_trans = translate_dna(ref_seq)
    alt_trans = translate_dna(alt_seq)
    
    ref_codons = ref_trans["codons"]
    alt_codons = alt_trans["codons"]
    ref_protein = ref_trans["protein"]
    alt_protein = alt_trans["protein"]
    
    # Determine basic variant classification
    len_diff = len(alt_seq) - len(ref_seq)
    
    # Detail of mutation at DNA level
    mut_details = get_mutation_details(ref_seq, alt_seq)
    pos = mut_details["position"]
    ref_n = mut_details["ref_nucleotide"]
    alt_n = mut_details["alt_nucleotide"]
    
    variant_type = "Unknown"
    protein_change = "None"
    impact_description = ""
    
    if len_diff != 0:
        # Insertion or Deletion
        is_inframe = abs(len_diff) % 3 == 0
        if is_inframe:
            if len_diff > 0:
                variant_type = "Inframe Insertion"
                protein_change = f"Inframe insertion of {abs(len_diff)} bp"
                impact_description = (
                    f"An insertion of {abs(len_diff)} nucleotides (divisible by 3) preserves the open reading frame but "
                    f"adds amino acids to the protein, which may alter its structure or binding properties."
                )
            else:
                variant_type = "Inframe Deletion"
                protein_change = f"Inframe deletion of {abs(len_diff)} bp"
                impact_description = (
                    f"A deletion of {abs(len_diff)} nucleotides (divisible by 3) preserves the open reading frame but "
                    f"removes amino acids from the protein, potentially disrupting crucial domains or functions."
                )
        else:
            variant_type = "Frameshift"
            protein_change = f"Frameshift mutation (offset {len_diff} bp)"
            impact_description = (
                f"The insertion/deletion of {abs(len_diff)} nucleotides shifts the translation reading frame. "
                f"This typically results in a completely altered amino acid sequence downstream and "
                f"often introduces a premature stop codon, causing a truncated, non-functional protein."
            )
    else:
        # Substitution (same length)
        # Find mismatched positions
        mismatched_nucleotides = []
        mismatched_codons = []
        nonsense_found = False
        stop_loss_found = False
        missense_found = False
        
        # We can compare codons and amino acids side by side since lengths are identical
        num_codons = len(ref_codons)
        
        for i in range(num_codons):
            r_c = ref_codons[i]
            a_c = alt_codons[i]
            r_aa = ref_protein[i]
            a_aa = alt_protein[i]
            
            if r_c != a_c:
                mismatched_codons.append({
                    "codon_position": i + 1,
                    "ref_codon": r_c,
                    "alt_codon": a_c,
                    "ref_aa": r_aa,
                    "alt_aa": a_aa
                })
                
                if r_aa != a_aa:
                    if a_aa == "Stop":
                        nonsense_found = True
                    elif r_aa == "Stop" and a_aa != "Stop":
                        stop_loss_found = True
                    else:
                        missense_found = True
        
        # Classification
        if nonsense_found:
            variant_type = "Nonsense"
            # Find the first nonsense mutation
            for mc in mismatched_codons:
                if mc["alt_aa"] == "Stop":
                    protein_change = f"{mc['ref_aa']}{mc['codon_position']}Stop"
                    break
            impact_description = (
                f"The mutation introduces a premature stop codon in the protein sequence. This causes early "
                f"termination of translation (truncation), which usually leads to nonsense-mediated decay of the mRNA "
                f"or a completely non-functional protein."
            )
        elif stop_loss_found:
            variant_type = "Stop-loss"
            for mc in mismatched_codons:
                if mc["ref_aa"] == "Stop":
                    protein_change = f"Stop{mc['codon_position']}{mc['alt_aa']}"
                    break
            impact_description = (
                f"The mutation alters the natural stop codon, allowing translation to continue "
                f"into the 3' untranslated region (UTR). This readthrough produces an abnormally long protein "
                f"which can affect protein stability and cellular localization."
            )
        elif missense_found:
            variant_type = "Missense"
            # Show the primary change (or first change if multiple)
            primary_change = mismatched_codons[0]
            protein_change = f"{primary_change['ref_aa']}{primary_change['codon_position']}{primary_change['alt_aa']}"
            
            # Formulate chemical properties impact details
            ref_aa = primary_change['ref_aa']
            alt_aa = primary_change['alt_aa']
            ref_props = AMINO_ACID_PROPERTIES.get(ref_aa, {})
            alt_props = AMINO_ACID_PROPERTIES.get(alt_aa, {})
            
            ref_name = ref_props.get("name", ref_aa)
            alt_name = alt_props.get("name", alt_aa)
            ref_type = ref_props.get("type", "unknown")
            alt_type = alt_props.get("type", "unknown")
            ref_charge = ref_props.get("charge", "neutral")
            alt_charge = alt_props.get("charge", "neutral")
            
            charge_change = ""
            if ref_charge != alt_charge:
                charge_change = f" and a charge alteration from {ref_charge} to {alt_charge}"
                
            impact_description = (
                f"The mutation changes the codon at position {primary_change['codon_position']}, resulting in the substitution of "
                f"{ref_name} ({ref_type}) to {alt_name} ({alt_type}){charge_change}. This chemical change "
                f"may impact protein folding, stability, or active site interactions."
            )
        else:
            variant_type = "Synonymous"
            primary_change = mismatched_codons[0] if mismatched_codons else {"codon_position": 1, "ref_aa": "Unknown"}
            protein_change = f"{primary_change['ref_aa']}{primary_change['codon_position']}="
            impact_description = (
                "The DNA mutation changes the codon sequence but does not alter the translated amino acid. "
                "While the protein sequence remains identical, synonymous variants can sometimes affect mRNA splicing, "
                "stability, or translation kinetics."
            )
            
    # Format side-by-side protein strings
    ref_protein_str = "-".join(ref_protein)
    alt_protein_str = "-".join(alt_protein)
    
    return {
        "variant_type": variant_type,
        "protein_change": protein_change,
        "reference_protein": ref_protein_str,
        "variant_protein": alt_protein_str,
        "ref_sequence_codons": ref_codons,
        "alt_sequence_codons": alt_codons,
        "ref_protein_list": ref_protein,
        "alt_protein_list": alt_protein,
        "ref_detailed": ref_trans["detailed"],
        "alt_detailed": alt_trans["detailed"],
        "mutation_position": pos,
        "ref_nucleotide": ref_n,
        "alt_nucleotide": alt_n,
        "impact_description": impact_description
    }

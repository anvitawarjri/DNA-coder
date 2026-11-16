# DNA Variant Decoder

A Python-based bioinformatics project that analyzes differences between a reference DNA sequence and a variant DNA sequence to identify and classify genetic mutations.

## Overview

DNA mutations are changes in the nucleotide sequence of DNA. Understanding these changes is important in studying genetic variation and their potential effects on protein function.

The DNA Variant Decoder takes a reference DNA sequence and a variant DNA sequence as input, compares them, and identifies the type of mutation based on the observed changes.

## Features

- **DNA Sequence Input:** Accepts reference and variant DNA sequences.
- **Sequence Comparison:** Identifies differences between the two sequences.
- **Mutation Identification:** Detects different types of genetic mutations.
- **Mutation Classification:** Categorizes mutations into:
  - Synonymous
  - Missense
  - Nonsense
  - Frameshift
  - In-frame insertion/deletion
- **Mutation Interpretation:** Helps understand how sequence changes may affect the resulting protein.

## Types of Mutations

| Mutation Type | Description |
|---|---|
| Synonymous | A nucleotide change that does not alter the encoded amino acid. |
| Missense | A nucleotide change that results in a different amino acid. |
| Nonsense | A nucleotide change that introduces a premature stop codon. |
| Frameshift | An insertion or deletion that changes the reading frame. |
| In-frame | An insertion or deletion involving a multiple of three nucleotides, preserving the reading frame. |

## How It Works

1. The user provides a reference DNA sequence.
2. The user provides a variant DNA sequence.
3. The program compares the sequences to identify changes.
4. The mutation is analyzed based on the nucleotide differences.
5. The mutation is classified according to its potential effect on the protein sequence.

## Technology Stack

- **Programming Language:** Python
- **Domain:** Bioinformatics
- **Core Concepts:** DNA sequences, genetic mutations, codons, translation, and protein sequence analysis.

## Example

**Input:**

- Reference DNA: A DNA coding sequence
- Variant DNA: The corresponding sequence containing a mutation

**Output:**

The application identifies the sequence difference and determines the corresponding mutation category, where sufficient sequence information is available.

## Future Improvements

- Support for additional HGVS variant descriptions.
- Integration with biological reference databases.
- Visualization of sequence differences.
- Support for FASTA file uploads.
- Improved mutation annotation and protein-level interpretation.
- Integration with tools such as ClinVar for additional variant information.

## Disclaimer

This project is intended for educational and research purposes in bioinformatics. Its mutation classifications should not be treated as clinical diagnoses or substitutes for professional genetic interpretation.

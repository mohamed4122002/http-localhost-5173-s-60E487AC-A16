import pandas as pd
import json

file_path = "Questionnaire Taste Test Standard.xlsx"

try:
    # Inspect "Product Attribute (Taste Test)" sheet
    df = pd.read_excel(file_path, sheet_name="Product Attribute (Taste Test)")
    print(f"--- Product Attribute (Taste Test) Sheet ---")
    print("Columns:", df.columns.tolist())
    print("\nFirst 10 rows:")
    print(df.head(10).to_string())
    
    # Also inspect "Screening" sheet as it might be Layer 1
    df_screening = pd.read_excel(file_path, sheet_name="Screening")
    print(f"\n--- Screening Sheet ---")
    print("Columns:", df_screening.columns.tolist())
    print("\nFirst 5 rows:")
    print(df_screening.head(5).to_string())

except Exception as e:
    print(f"Error: {e}")

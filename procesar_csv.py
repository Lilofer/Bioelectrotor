import pandas as pd

# 1. Cargar el Excel omitiendo las 6 primeras filas institucionales
excel_path = "CATASTRO_RELAVES_CHILE_OCT2025_1 (1).xlsx"
df = pd.read_excel(excel_path, skiprows=6)

# 2. Guardar el resultado limpio en un nuevo archivo CSV
df.to_csv("catastro_relaves_limpio.csv", index=False, encoding="utf-8-sig")

print(
    f"¡Listo! Se creó 'catastro_relaves_limpio.csv' con {len(df)} registros."
)
import pandas as pd

# 1. Ruta del archivo Excel original de SERNAGEOMIN
excel_path = "CATASTRO_RELAVES_CHILE_OCT2025_1 (1).xlsx"

print("Leyendo y procesando el archivo Excel...")
# Omitimos las primeras 6 filas porque contienen texto institucional y no los datos tabulares
df = pd.read_excel(excel_path, skiprows=6)

# 2. Opcional pero recomendado: limpiar los nombres de las columnas (minúsculas, sin espacios ni caracteres raros)
df.columns = (
    df.columns.str.strip()
    .str.lower()
    .str.replace(" ", "_")
    .str.replace("º", "n")
    .str.replace(".", "")
)

# 3. Exportar los datos limpios a un nuevo archivo CSV
nombre_csv = "catastro_relaves_limpio.csv"
df.to_csv(nombre_csv, index=False, encoding="utf-8-sig")

print(f"¡Éxito! Se ha generado el archivo '{nombre_csv}' con {len(df)} registros listos para usar.")
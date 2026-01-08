import sqlite3

conn = sqlite3.connect("game.db")
c = conn.cursor()

c.execute("""
CREATE TABLE IF NOT EXISTS cities (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    weather TEXT,
    fuel_cost REAL,
    lat REAL,
    lon REAL
)
""")

cities = [
    ("Tokyo", "rain", 0.02, 35.6762, 139.6503),
    ("London", "wind", 0.03, 51.5074, -0.1278),
    ("Dubai", "hot", 0.04, 25.2048, 55.2708),
    ("VIP City", "clear", 0.01, 40.7128, -74.0060)
]

c.executemany("""
INSERT INTO cities (name, weather, fuel_cost, lat, lon)
VALUES (?, ?, ?, ?, ?)
""", cities)

conn.commit()
conn.close()

print("✅ Database created and cities inserted")

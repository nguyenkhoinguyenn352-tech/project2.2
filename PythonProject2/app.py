from flask import Flask, jsonify, render_template
import sqlite3

app = Flask(__name__)
@app.route("/")
def home():
    return render_template("index.html")
@app.route("/cities")
def cities():
    conn = sqlite3.connect("game.db")
    c = conn.cursor()
    c.execute("SELECT name, weather, fuel_cost, lat, lon FROM cities")
    rows = c.fetchall()
    conn.close()

    result = []
    for r in rows:
        result.append({
            "name": r[0],
            "weather": r[1],
            "fuel_cost": r[2],
            "lat": r[3],
            "lon": r[4]
        })

    return jsonify(result)

if __name__ == "__main__":
    app.run(debug=True)

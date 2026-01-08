const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// 1. INITIALIZE GAME STATE
let planeX = 50;
let planeY = 200;
let fuel = 100;
let gameOver = false;
let win = false;
let message = "Visit all cities before heading to VIP City!";

// Create city objects from the database list
let cityObjects = cities.map(city => ({
    ...city,
    x: Math.random() * (canvas.width - 150) + 75,
    y: Math.random() * (canvas.height - 150) + 75,
    visited: false
}));

// Identify the VIP City
const vipCity = cityObjects.find(c => c.name === "VIP City");
const regularCities = cityObjects.filter(c => c.name !== "VIP City");

// 2. CONTROLS
window.addEventListener("keydown", (e) => {
    if (gameOver) return;
    const step = 15;
    if (e.key === "ArrowUp") planeY -= step;
    if (e.key === "ArrowDown") planeY += step;
    if (e.key === "ArrowLeft") planeX -= step;
    if (e.key === "ArrowRight") planeX += step;
});

// 3. COLLISION & LOGIC
function checkCollision() {
    cityObjects.forEach(city => {
        if (!city.visited) {
            let dx = planeX - city.x;
            let dy = planeY - city.y;
            let distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < 30) {
                // Logic for VIP City
                if (city.name === "VIP City") {
                    const allVisited = regularCities.every(c => c.visited);
                    if (allVisited) {
                        city.visited = true;
                        gameOver = true;
                        win = true;
                    } else {
                        message = "⚠️ You must visit ALL other cities first!";
                    }
                }
                // Logic for regular cities
                else {
                    city.visited = true;
                    if (["rain", "wind", "hot"].includes(city.weather)) {
                        fuel -= 20;
                        message = "❌ Bad weather at " + city.name + "! -20 Fuel";
                    } else {
                        fuel += 20;
                        message = "✅ Good weather at " + city.name + "! +20 Fuel";
                    }
                }
            }
        }
    });
}

// 4. DRAWING
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!gameOver) {
        checkCollision();

        // FUEL DEPLETION OVER TIME (While flying)
        fuel -= 0.05;
        if (fuel <= 0) { fuel = 0; gameOver = true; }
        if (fuel > 100) fuel = 100;

        // Draw Cities
        cityObjects.forEach(city => {
            if (!city.visited) {
                ctx.beginPath();
                ctx.arc(city.x, city.y, 12, 0, Math.PI * 2);
                ctx.fillStyle = city.name === "VIP City" ? "#FFD700" : "#FF4500"; // Gold for VIP, OrangeRed for others
                ctx.fill();
                ctx.closePath();

                ctx.fillStyle = "black";
                ctx.font = "bold 12px Arial";
                ctx.fillText(city.name, city.x - 25, city.y - 20);
            }
        });

        // Draw Plane
        ctx.fillStyle = "#007BFF";
        ctx.fillRect(planeX - 20, planeY - 10, 40, 20);
        ctx.fillStyle = "white";
        ctx.fillRect(planeX - 5, planeY - 15, 10, 30); // Wings

        // HUD (Heads-up Display)
        ctx.fillStyle = "black";
        ctx.font = "16px Arial";
        ctx.fillText("⛽ Fuel: " + Math.floor(fuel) + "%", 20, 30);

        const visitedCount = regularCities.filter(c => c.visited).length;
        ctx.fillText("📍 Cities Visited: " + visitedCount + "/" + regularCities.length, 20, 55);

        ctx.fillStyle = "red";
        ctx.font = "italic 14px Arial";
        ctx.fillText(message, 20, 85);

        requestAnimationFrame(draw);
    } else {
        // End Screen
        ctx.fillStyle = "rgba(0,0,0,0.85)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "white";
        ctx.textAlign = "center";
        ctx.font = "40px Arial";
        if (win) {
            ctx.fillText("MISSION ACCOMPLISHED! 🏆", canvas.width/2, canvas.height/2);
            ctx.font = "20px Arial";
            ctx.fillText("You reached VIP City with fuel remaining!", canvas.width/2, canvas.height/2 + 50);
        } else {
            ctx.fillText("GAME OVER 💀", canvas.width/2, canvas.height/2);
            ctx.font = "20px Arial";
            ctx.fillText("Out of fuel! Better luck next time.", canvas.width/2, canvas.height/2 + 50);
        }
    }
}

draw();
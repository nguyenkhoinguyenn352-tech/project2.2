const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// 1. GAME STATE
let planeX = 50;
let planeY = 200;
let fuel = 100;
let gameOver = false;
let win = false;
let passengersPickedUp = 0;
const requiredPassengers = 3;
let message = "Pick up passengers from 3 cities, then head to VIP City!";

// 2. ĐẢM BẢO CÓ ĐỦ 6 THÀNH PHỐ
// Nếu dữ liệu 'cities' từ Python truyền sang ít hơn 6, ta sẽ tự tạo thêm
let gameCities = [...cities];
while (gameCities.length < 6) {
    gameCities.push({
        name: "Extra City " + gameCities.length,
        weather: Math.random() > 0.5 ? "clear" : "rain",
        fuel_cost: 0.05
    });
}

// Thiết lập vị trí ngẫu nhiên cho 6 thành phố
let cityObjects = gameCities.slice(0, 6).map(city => ({
    ...city,
    x: Math.random() * (canvas.width - 150) + 75,
    y: Math.random() * (canvas.height - 150) + 75,
    visited: false
}));

const vipCity = cityObjects.find(c => c.name === "VIP City") || cityObjects[5];
// Đảm bảo VIP City là mục tiêu cuối cùng
vipCity.name = "VIP City"; 

// 3. CONTROLS & FUEL DRAIN ON MOVE
window.addEventListener("keydown", (e) => {
    if (gameOver) return;
    
    let moved = false;
    const step = 15;
    
    if (e.key === "ArrowUp") { planeY -= step; moved = true; }
    if (e.key === "ArrowDown") { planeY += step; moved = true; }
    if (e.key === "ArrowLeft") { planeX -= step; moved = true; }
    if (e.key === "ArrowRight") { planeX += step; moved = true; }

    // CHỈ TRỪ XĂNG KHI DI CHUYỂN
    if (moved) {
        fuel -= 1.5; // Mỗi lần bấm phím di chuyển sẽ mất 1.5% xăng
    }
});

// 4. COLLISION LOGIC
function checkCollision() {
    cityObjects.forEach(city => {
        if (!city.visited) {
            let dx = planeX - city.x;
            let dy = planeY - city.y;
            let distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < 30) {
                if (city.name === "VIP City") {
                    if (passengersPickedUp >= requiredPassengers) {
                        city.visited = true;
                        gameOver = true;
                        win = true;
                    } else {
                        message = "⚠️ Collect " + (requiredPassengers - passengersPickedUp) + " more passengers first!";
                    }
                } else {
                    city.visited = true;
                    passengersPickedUp++;
                    // Thời tiết xấu trừ xăng, tốt cộng xăng
                    if (["rain", "wind", "hot"].includes(city.weather)) {
                        fuel -= 15;
                        message = "❌ Rough landing! -15 Fuel at " + city.name;
                    } else {
                        fuel += 20;
                        message = "✅ Smooth landing! +20 Fuel at " + city.name;
                    }
                }
            }
        }
    });
}

// 5. RENDER LOOP
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!gameOver) {
        checkCollision();
        if (fuel <= 0) { fuel = 0; gameOver = true; }
        if (fuel > 100) fuel = 100;

        // Vẽ 6 thành phố
        cityObjects.forEach(city => {
            if (!city.visited) {
                ctx.beginPath();
                ctx.arc(city.x, city.y, 12, 0, Math.PI * 2);
                ctx.fillStyle = city.name === "VIP City" ? "#FFD700" : "#00FF00";
                ctx.fill();
                ctx.stroke();
                
                ctx.fillStyle = "black";
                ctx.font = "bold 11px Arial";
                ctx.fillText(city.name, city.x - 25, city.y - 20);
            }
        });

        // Vẽ máy bay
        ctx.fillStyle = "#007BFF";
        ctx.fillRect(planeX - 20, planeY - 10, 40, 20);
        ctx.fillStyle = "white";
        ctx.fillRect(planeX - 5, planeY - 15, 10, 30);

        // UI
        ctx.fillStyle = "black";
        ctx.font = "bold 16px Arial";
        ctx.fillText("Fuel: " + Math.floor(fuel) + "%", 20, 30);
        ctx.fillText("Passengers: " + passengersPickedUp + "/" + requiredPassengers, 20, 55);
        ctx.fillStyle = "darkred";
        ctx.fillText(message, 20, 85);

        requestAnimationFrame(draw);
    } else {
        ctx.fillStyle = "rgba(0,0,0,0.85)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "white";
        ctx.textAlign = "center";
        ctx.font = "30px Arial";
        ctx.fillText(win ? "MISSION SUCCESS! 🏆" : "GAME OVER 💀", canvas.width/2, canvas.height/2);
    }
}

draw();

const ws = new WebSocket("wss://ws.taxyciti.net");

ws.onopen = () => console.log("✅ Connected to Secure WebSocket!");
ws.onmessage = (e) => console.log("📩 Message:", e.data);
ws.onerror = (e) => console.error("❌ Error:", e);
ws.onclose = () => console.log("⚠️ Disconnected");

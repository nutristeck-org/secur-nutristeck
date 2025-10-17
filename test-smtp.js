// test-smtp.js
const net = require("net");

const host = "smtp.gmail.com"; // Gmail SMTP server
const ports = [465, 587];      // Common secure SMTP ports

console.log(`\n🔍 Testing SMTP connectivity to ${host}...\n`);

ports.forEach((port) => {
  const socket = new net.Socket();
  const start = Date.now();

  socket.setTimeout(7000); // 7 seconds timeout

  socket.connect(port, host, () => {
    const time = Date.now() - start;
    console.log(`✅ Port ${port} is OPEN (connected in ${time}ms)`);
    socket.destroy();
  });

  socket.on("timeout", () => {
    console.log(`⏱️ Port ${port} TIMED OUT`);
    socket.destroy();
  });

  socket.on("error", (err) => {
    console.log(`❌ Port ${port} FAILED (${err.code || err.message})`);
  });
});
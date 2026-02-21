const express = require("express");
const nodemailer = require("nodemailer"); // สำหรับส่ง Email
const app = express();

app.use(express.json());

// 📝 เก็บออร์เดอร์และข้อความติดต่อ (Production ควรใช้ DB)
let orders = {};
let contacts = {};

const BOT_TOKEN = "ML2026SECURE";

// 🔹 ฟังก์ชันสร้าง Order ID
function generateOrderId() {
  return "ML-" + Date.now();
}

// 🔹 ฟังก์ชันสร้าง Contact ID
function generateContactId() {
  return "CT-" + Date.now();
}

// Homepage
app.get("/", (req, res) => {
  res.send("ML Topup Production Server Running 🚀");
});

/* ========================
  1️⃣ Order API
======================== */
app.post("/create-order", (req, res) => {
  const { userId, serverId, packageName, price, token } = req.body;

  if(token !== BOT_TOKEN){
    return res.status(401).json({status:"ERROR", error_code:"INVALID_TOKEN"});
  }

  if (!userId || !packageName || !price) {
    return res.status(400).json({status:"ERROR", error_code:"INVALID_INPUT"});
  }

  const orderId = generateOrderId();

  orders[orderId] = {
    userId,
    serverId,
    packageName,
    price,
    status: "PAYMENT_PENDING",
    createdAt: new Date()
  };

  res.json({status:"ORDER_CREATED", orderId});
});

app.get("/order-status/:id", (req, res) => {
  const order = orders[req.params.id];
  if (!order) return res.status(404).json({status:"ERROR", error_code:"ORDER_NOT_FOUND"});
  res.json(order);
});

/* ========================
  2️⃣ Contact Form API
======================== */
app.post("/api/contact", async (req,res)=>{
    const { name,email,subject,message,token,date } = req.body;

    if(token !== BOT_TOKEN) return res.status(401).json({success:false,error:"Invalid token"});

    if(!name || !email || !subject || !message) 
        return res.status(400).json({success:false,error:"กรุณากรอกข้อมูลครบทุกช่อง"});

    const contactId = generateContactId();
    contacts[contactId] = {name,email,subject,message,date};

    // 🔹 ส่ง Email ด้วย Nodemailer
    try{
        let transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 465,
            secure: true,
            auth: {
                user: "your-email@gmail.com",
                pass: "your-email-app-password"
            }
        });

        let htmlBody = `
        <div style="font-family:Arial,sans-serif;font-size:14px;color:#222;">
          <p>คุณได้รับข้อความใหม่จาก <strong>${name}</strong></p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Subject:</strong> ${subject}</p>
          <p><strong>Message:</strong></p>
          <div style="background:#f9f9f9;padding:10px;border-radius:5px;">${message}</div>
          <p style="font-size:12px;color:#555;margin-top:10px;">วันที่: ${date}</p>
        </div>`;

        await transporter.sendMail({
            from: `"ML Topup Contact" <your-email@gmail.com>`,
            to: "admin@example.com",
            subject: `📩 Contact Form: ${subject}`,
            html: htmlBody,
            replyTo: email
        });

        res.json({success:true,message:"ส่งข้อความสำเร็จ"});
    } catch(err){
        console.error(err);
        res.status(500).json({success:false,error:"ระบบขัดข้อง", code:err.message});
    }
});

/* ========================
  3️⃣ Payment API (ตัวอย่าง Simulation)
======================== */
app.post("/api/payment", (req,res)=>{
    const { orderId, paymentMethod, token } = req.body;

    if(token !== BOT_TOKEN) return res.status(401).json({success:false,error:"Invalid token"});

    const order = orders[orderId];
    if(!order) return res.status(404).json({success:false,error:"ORDER_NOT_FOUND"});

    // 🔹 Simulation Payment Success
    order.status = "PAID";
    order.paidAt = new Date();
    order.paymentMethod = paymentMethod;

    res.json({success:true,message:"ชำระเงินสำเร็จ", order});
});

/* ========================
  4️⃣ Reza API (ตัวอย่าง Simulation)
======================== */
app.post("/api/reza", (req,res)=>{
    const { orderId, token } = req.body;
    if(token !== BOT_TOKEN) return res.status(401).json({success:false,error:"Invalid token"});
    const order = orders[orderId];
    if(!order) return res.status(404).json({success:false,error:"ORDER_NOT_FOUND"});

    // 🔹 Simulation API Reza approve
    order.status = "DELIVERED";
    order.deliveredAt = new Date();

    res.json({success:true,message:"เติมเงินสำเร็จ 🎮", order});
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, ()=>console.log(`Server running on port ${PORT}`));

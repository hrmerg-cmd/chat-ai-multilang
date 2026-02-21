const express = require("express");
const nodemailer = require("nodemailer");
const path = require("path");
const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

const BOT_TOKEN = "ML2026SECURE";

// เก็บข้อมูล Simulation (Production ใช้ DB)
let orders = {};
let contacts = {};

function generateOrderId() { return "ML-" + Date.now(); }
function generateContactId() { return "CT-" + Date.now(); }

// หน้าแรก
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public/index.html"));
});

// Contact form
app.get("/contact", (req,res) => {
  res.sendFile(path.join(__dirname, "public/contact.html"));
});

/* ========================
   1️⃣ Order API
======================== */
app.post("/api/create-order", (req,res)=>{
    const { userId, packageName, price, token } = req.body;
    if(token !== BOT_TOKEN) return res.status(401).json({success:false,error:"Invalid token"});
    if(!userId || !packageName || !price) return res.status(400).json({success:false,error:"กรอกข้อมูลไม่ครบ"});

    const orderId = generateOrderId();
    orders[orderId] = { userId, packageName, price, status:"PAYMENT_PENDING", createdAt:new Date() };
    res.json({success:true, orderId});
});

app.get("/api/order-status/:id",(req,res)=>{
    const order = orders[req.params.id];
    if(!order) return res.status(404).json({success:false,error:"ORDER_NOT_FOUND"});
    res.json(order);
});

/* ========================
   2️⃣ Contact API
======================== */
app.post("/api/contact", async (req,res)=>{
    const { name,email,subject,message,token } = req.body;
    if(token !== BOT_TOKEN) return res.status(401).json({success:false,error:"Invalid token"});
    if(!name||!email||!subject||!message) return res.status(400).json({success:false,error:"กรอกข้อมูลไม่ครบ"});

    const contactId = generateContactId();
    contacts[contactId] = {name,email,subject,message,date:new Date()};

    try {
        let transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 465,
            secure: true,
            auth: { user:"your-email@gmail.com", pass:"your-app-password" }
        });

        let htmlBody = `
        <div style="font-family:Arial,sans-serif;font-size:14px;color:#222;">
          <p>คุณได้รับข้อความใหม่จาก <strong>${name}</strong></p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Subject:</strong> ${subject}</p>
          <p><strong>Message:</strong></p>
          <div style="background:#f9f9f9;padding:10px;border-radius:5px;">${message}</div>
          <p style="font-size:12px;color:#555;margin-top:10px;">วันที่: ${new Date().toLocaleString()}</p>
        </div>`;

        await transporter.sendMail({
            from:`"ML Topup Contact"<your-email@gmail.com>`,
            to:"admin@example.com",
            subject:`📩 Contact Form: ${subject}`,
            html:htmlBody,
            replyTo: email
        });

        res.json({success:true,message:"ส่งข้อความสำเร็จ"});
    } catch(err){
        console.error(err);
        res.status(500).json({success:false,error:"ระบบขัดข้อง",code:err.message});
    }
});

/* ========================
   3️⃣ Payment API (Simulation)
======================== */
app.post("/api/payment",(req,res)=>{
    const { orderId,paymentMethod,token } = req.body;
    if(token !== BOT_TOKEN) return res.status(401).json({success:false,error:"Invalid token"});

    const order = orders[orderId];
    if(!order) return res.status(404).json({success:false,error:"ORDER_NOT_FOUND"});

    order.status = "PAID";
    order.paidAt = new Date();
    order.paymentMethod = paymentMethod;

    res.json({success:true,message:"ชำระเงินสำเร็จ", order});
});

/* ========================
   4️⃣ Reza API (Simulation)
======================== */
app.post("/api/reza",(req,res)=>{
    const { orderId, token } = req.body;
    if(token !== BOT_TOKEN) return res.status(401).json({success:false,error:"Invalid token"});
    const order = orders[orderId];
    if(!order) return res.status(404).json({success:false,error:"ORDER_NOT_FOUND"});

    order.status = "DELIVERED";
    order.deliveredAt = new Date();

    res.json({success:true,message:"เติมเงินสำเร็จ 🎮", order});
});

// Start server
const PORT = process.env.PORT||3000;
app.listen(PORT,()=>console.log(`Server running on port ${PORT}`));

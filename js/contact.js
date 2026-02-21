const sendBtn = document.getElementById("sendBtn");
const statusBox = document.getElementById("status");
const BOT_TOKEN = "ML2026SECURE";

sendBtn.addEventListener("click", async ()=>{
    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const subject = document.getElementById("subject").value.trim();
    const message = document.getElementById("message").value.trim();
    const notAI = document.getElementById("notAI");

    // Validate fields
    if(!name || !email || !subject || !message){
        showStatus("กรุณากรอกทุกช่อง", "error");
        return;
    }

    // Validate bot checkbox
    if(!notAI.checked){
        showStatus("⚠️ โปรดยืนยันว่าคุณไม่ใช่บอท", "error");
        return;
    }

    showStatus("กำลังส่งข้อความ...", "");

    try {
        const res = await fetch("/api/contact", {
            method: "POST",
            headers: {"Content-Type":"application/json"},
            body: JSON.stringify({name,email,subject,message,token:BOT_TOKEN,date:new Date().toISOString()})
        });

        const data = await res.json();
        if(data.success){
            showStatus("✅ ส่งข้อความสำเร็จ!", "success");
            document.getElementById("name").value="";
            document.getElementById("email").value="";
            document.getElementById("subject").value="";
            document.getElementById("message").value="";
            notAI.checked=false;
        } else {
            showStatus(`❌ ${data.error || "ระบบขัดข้อง"} Code: ${data.code || "-"}`, "error");
        }
    } catch(err){
        showStatus("❌ ระบบขัดข้อง", "error");
    }
});

function showStatus(msg,type){
    statusBox.innerText = msg;
    statusBox.className = type ? (type==="success"?"success":"error") : "";
    statusBox.style.display="block";
}

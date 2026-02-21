const BOT_TOKEN = "ML2026SECURE";
const buyBtn = document.getElementById("buyBtn");
const orderStatus = document.getElementById("orderStatus");

buyBtn.addEventListener("click", async ()=>{
    const userId = document.getElementById("userId").value.trim();
    const packageId = document.getElementById("package").value;
    const payment = document.getElementById("payment").value;
    const notAI = document.getElementById("notAI");

    if(!userId) { showStatus("กรุณาใส่ User ID", "error"); return; }
    if(!notAI.checked) { showStatus("⚠️ โปรดยืนยันว่าคุณไม่ใช่บอท", "error"); return; }

    showStatus("กำลังทำรายการ...", "");

    try {
        const res = await fetch("/api/order", {
            method: "POST",
            headers: {"Content-Type":"application/json"},
            body: JSON.stringify({user_id:userId, package:packageId, payment, token:BOT_TOKEN, date:new Date().toISOString()})
        });
        const data = await res.json();
        if(data.success) showStatus("✅ สั่งซื้อสำเร็จ", "success");
        else showStatus(`❌ ${data.error || "ระบบขัดข้อง"} Code: ${data.code || "-"}`, "error");
    } catch(err) {
        showStatus("❌ ระบบขัดข้อง", "error");
    }
});

function showStatus(msg,type){
    orderStatus.innerText = msg;
    orderStatus.className = type ? `success` === type ? "success" : "error" : "";
    orderStatus.style.display="block";
}

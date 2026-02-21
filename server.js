const express = require("express");
const app = express();

app.use(express.json());

let orders = {};

function generateOrderId() {
  return "ML-" + Date.now();
}

app.get("/", (req, res) => {
  res.send("ML Topup Production Server Running 🚀");
});

app.post("/create-order", (req, res) => {
  const { userId, serverId, packageName, price } = req.body;

  if (!userId || !packageName || !price) {
    return res.status(400).json({
      status: "ERROR",
      error_code: "INVALID_INPUT"
    });
  }

  const orderId = generateOrderId();

  orders[orderId] = {
    userId,
    serverId,
    packageName,
    price,
    status: "PAYMENT_PENDING"
  };

  res.json({
    status: "ORDER_CREATED",
    orderId
  });
});

app.get("/order-status/:id", (req, res) => {
  const order = orders[req.params.id];

  if (!order) {
    return res.status(404).json({
      status: "ERROR",
      error_code: "ORDER_NOT_FOUND"
    });
  }

  res.json(order);
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});

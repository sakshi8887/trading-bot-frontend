import { useState } from "react";

function TradingPanel({ marketData, onOrderSuccess}) {
  const [side, setSide] = useState("BUY");
  const [quantity, setQuantity] = useState("");
  const [stopLoss, setStopLoss] = useState("");
  const [takeProfit, setTakeProfit] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleOrder = async (event) => {
    event.preventDefault();

    setMessage("");
    setError("");

    const currentPrice = Number(marketData?.close);
    const orderQuantity = Number(quantity);

    if (!currentPrice) {
      setError("Live market price is not available");
      return;
    }

    if (!orderQuantity || orderQuantity <= 0) {
      setError("Enter a valid quantity");
      return;
    }

    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/orders/paper`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            symbol: "BTCUSDT",
            side,
            quantity: orderQuantity,
            price: currentPrice,
            stopLoss: stopLoss ? Number(stopLoss) : null,
            takeProfit: takeProfit ? Number(takeProfit) : null,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Order failed");
      }

      setMessage(
        `${side} order executed successfully at $${currentPrice.toLocaleString()}`
      );

      setQuantity("");
      setStopLoss("");
      setTakeProfit("");

      if (onOrderSuccess) {
        onOrderSuccess();
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="trading-panel">
      <div className="trading-panel-header">
        <div>
          <span className="label">PAPER TRADING</span>
          <h2>Place Order</h2>
        </div>

        <div className="current-price">
          <span>Market Price</span>

          <strong>
            {marketData
              ? `$${Number(marketData.close).toLocaleString()}`
              : "Loading..."}
          </strong>
        </div>
      </div>

      <div className="side-buttons">
        <button
          type="button"
          className={
            side === "BUY"
              ? "side-button buy active"
              : "side-button buy"
          }
          onClick={() => setSide("BUY")}
        >
          BUY
        </button>

        <button
          type="button"
          className={
            side === "SELL"
              ? "side-button sell active"
              : "side-button sell"
          }
          onClick={() => setSide("SELL")}
        >
          SELL
        </button>
      </div>

      <form onSubmit={handleOrder}>
        <label>Quantity</label>

        <input
          type="number"
          min="0.000001"
          step="0.000001"
          placeholder="Enter quantity"
          value={quantity}
          onChange={(event) => setQuantity(event.target.value)}
          required
        />

        <label>Stop Loss (optional)</label>

        <input
          type="number"
          min="0"
          step="0.01"
          placeholder="e.g. 82000"
          value={stopLoss}
          onChange={(event) => setStopLoss(event.target.value)}
        />

        <label>Take Profit (optional)</label>

        <input
          type="number"
          min="0"
          step="0.01"
          placeholder="e.g. 85000"
          value={takeProfit}
          onChange={(event) => setTakeProfit(event.target.value)}
        />

        {error && (
          <p className="order-error">
            {error}
          </p>
        )}

        {message && (
          <p className="order-success">
            {message}
          </p>
        )}

        <button
          type="submit"
          className={`submit-order ${
            side === "BUY"
              ? "submit-buy"
              : "submit-sell"
          }`}
          disabled={loading || !marketData}
        >
          {loading
            ? "Executing..."
            : `Place ${side} Order`}
        </button>
      </form>
    </section>
  );
}

export default TradingPanel;
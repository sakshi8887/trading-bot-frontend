import { useEffect, useState } from "react";

function OrderHistory({ refreshTrigger }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/orders/paper`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to fetch order history"
        );
      }

      setOrders(data.orders || []);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [refreshTrigger]);
  if (loading) {
    return (
      <section className="order-history">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading orders...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="order-history">
        <div className="error-state">
          <strong>Unable to load order history</strong>
  
          <p>{error}</p>
  
          <button
            type="button"
            className="retry-button"
            onClick={fetchOrders}
          >
            Try Again
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="order-history">
      <div className="card-header">
        <div>
          <span className="label">ORDERS</span>
          <h2>Order History</h2>
        </div>

        <div>
          <span>{orders.length} orders</span>

          <button
              type="button"
              className="refresh-button"
              onClick={fetchOrders}
              disabled={loading}
            >
              {loading ? "Refreshing..." : "Refresh"}
            </button>
        </div>
      </div>

      {orders.length === 0 ? (
        <p className="waiting">No orders found.</p>
      ) : (
        <div className="orders-table-wrapper">
          <table className="orders-table">
            <thead>
              <tr>
                <th>Symbol</th>
                <th>Side</th>
                <th>Quantity</th>
                <th>Price</th>
                <th>Status</th>
                <th>Stop Loss</th>
                <th>Take Profit</th>
                <th>Time</th>
              </tr>
            </thead>

            <tbody>
              {orders.map((order) => (
                <tr key={order._id}>
                  <td>{order.symbol}</td>

                  <td
                    className={
                      order.side === "BUY"
                        ? "order-buy"
                        : "order-sell"
                    }
                  >
                    {order.side}
                  </td>

                  <td>{order.quantity}</td>

                  <td>
                    ${Number(order.executedPrice).toLocaleString()}
                  </td>

                  <td>
                      <span className="order-status">
                        {order.status}
                      </span>
                  </td>

                  <td>
                      {order.stopLoss
                          ? `$${Number(order.stopLoss).toLocaleString()}`
                          : "-"}
                  </td>

                   <td>
                       {order.takeProfit
                           ? `$${Number(order.takeProfit).toLocaleString()}`
                           : "-"}
                  </td>

                  <td>
                    {order.executedAt
                      ? new Date(order.executedAt).toLocaleString()
                      : "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

export default OrderHistory;


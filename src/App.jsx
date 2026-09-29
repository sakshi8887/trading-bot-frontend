import { useEffect, useState } from "react";

import { socket } from "./services/socket";
import Login from "./pages/Login";
import TradingChart from "./components/TradingChart";
import PortfolioCard from "./components/PortfolioCard";
import TradingPanel from "./components/TradingPanel";
import OrderHistory from "./components/OrderHistory";

import "./App.css";

function App() {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem("user");
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const [marketData, setMarketData] = useState(null);
  const [orderRefresh, setOrderRefresh] = useState(0);
  const [connected, setConnected] = useState(false);
  const [strategy, setStrategy] = useState(null);

  // =========================
  // Socket.IO + Live Market Data
  // =========================
  useEffect(() => {
    if (!user) {
      socket.disconnect();
      setConnected(false);
      setMarketData(null);
      return;
    }

    const handleConnect = () => {
      setConnected(true);
      console.log("Socket connected:", socket.id);
    };

    const handleDisconnect = (reason) => {
      setConnected(false);
      console.log("Socket disconnected:", reason);
    };

    const handleMarketData = (data) => {
      setMarketData(data);
    };

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("marketData", handleMarketData);

    socket.connect();

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("marketData", handleMarketData);
      socket.disconnect();
    };
  }, [user]);

  // =========================
  // Strategy Signal
  // =========================
  useEffect(() => {
    if (!user) {
      setStrategy(null);
      return;
    }

    const fetchStrategy = async () => {
      try {
        const response = await fetch(
          "http://localhost:5000/api/strategy/signal"
        );

        if (!response.ok) {
          throw new Error(
            "Failed to fetch strategy signal"
          );
        }

        const data = await response.json();

        setStrategy(data);
      } catch (error) {
        console.error(
          "Strategy fetch error:",
          error.message
        );
      }
    };

    fetchStrategy();

    const interval = setInterval(
      fetchStrategy,
      10000
    );

    return () => {
      clearInterval(interval);
    };
  }, [user]);

  // =========================
  // Login
  // =========================
  const handleLogin = (loggedInUser) => {
    setUser(loggedInUser);
  };

  // =========================
  // Logout
  // =========================
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    socket.disconnect();

    setUser(null);
    setMarketData(null);
    setStrategy(null);
    setConnected(false);
  };

  // =========================
  // Show Login
  // =========================
  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  // =========================
  // Dashboard
  // =========================
  return (
    <div className="dashboard">
      <header className="header">
        <div>
          <h1>Trading Bot</h1>
          <p>Real-time Paper Trading Dashboard</p>
        </div>

        <div className="header-right">
          <div
            className={
              connected
                ? "status online"
                : "status offline"
            }
          >
            <span className="status-dot"></span>

            {connected
              ? "Connected"
              : "Disconnected"}
          </div>

          <button
            className="logout-button"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </header>

      <main className="content">

        <div className="dashboard-grid">
           <div className="dashboard-main">
              <PortfolioCard />

              <OrderHistory refreshTrigger={orderRefresh} />
           </div>

           <div className="dashboard-side">
              <TradingPanel
                marketData={marketData}
                onOrderSuccess={() =>
                  setOrderRefresh((value) => value + 1)
                }
              />
           </div>
          </div>
        {/* Market */}
        <section className="market-card">
          <div className="card-header">
            <div>
              <span className="label">MARKET</span>

              <h2>BTCUSDT</h2>
            </div>

            <span className="interval">
              {marketData?.interval || "1m"}
            </span>
          </div>

          {marketData ? (
            <div className="price-section">
              <span className="price">
                $
                {Number(
                  marketData.close
                ).toLocaleString()}
              </span>

              <div className="market-details">
                <div>
                  <span>Open</span>

                  <strong>
                    $
                    {Number(
                      marketData.open
                    ).toLocaleString()}
                  </strong>
                </div>

                <div>
                  <span>High</span>

                  <strong>
                    $
                    {Number(
                      marketData.high
                    ).toLocaleString()}
                  </strong>
                </div>

                <div>
                  <span>Low</span>

                  <strong>
                    $
                    {Number(
                      marketData.low
                    ).toLocaleString()}
                  </strong>
                </div>

                <div>
                  <span>Volume</span>

                  <strong>
                    {Number(
                      marketData.volume
                    ).toLocaleString()}
                  </strong>
                </div>
              </div>
            </div>
          ) : (
            <p className="waiting">
              Waiting for live market data...
            </p>
          )}
        </section>

        {/* Chart */}
        <section className="chart-card">
          <h2>BTCUSDT Chart</h2>

          <TradingChart
            marketData={marketData}
          />
        </section>

        {/* Strategy */}
        <section className="strategy-card">
          <div className="strategy-header">
            <div>
              <span className="label">
                STRATEGY
              </span>

              <h2>
                EMA 9 + EMA 21 + RSI 14
              </h2>
            </div>

            <div
              className={`signal ${
                strategy?.signal?.toLowerCase() ||
                "hold"
              }`}
            >
              {strategy?.signal || "Loading"}
            </div>
          </div>

          {strategy && (
            <div className="strategy-values">
              <div>
                <span>EMA 9</span>

                <strong>
                  {strategy.ema9 !== undefined
                    ? strategy.ema9.toFixed(2)
                    : "-"}
                </strong>
              </div>

              <div>
                <span>EMA 21</span>

                <strong>
                  {strategy.ema21 !== undefined
                    ? strategy.ema21.toFixed(2)
                    : "-"}
                </strong>
              </div>

              <div>
                <span>RSI 14</span>

                <strong>
                  {strategy.rsi !== undefined
                    ? strategy.rsi.toFixed(2)
                    : "-"}
                </strong>
              </div>
            </div>
          )}

          <p className="strategy-reason">
            {strategy?.reason ||
              "Calculating strategy..."}
          </p>
        </section>
      </main>
    </div>
  );
}

export default App;
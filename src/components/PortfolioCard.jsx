import { useEffect, useState } from "react";

function PortfolioCard() {
  const [portfolio, setPortfolio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchPortfolio = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("Authentication token not found");
      }

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/portfolio`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to fetch portfolio"
        );
      }

      setPortfolio(data.portfolio);
      setError("");
    } catch (error) {
      console.error(
        "Portfolio fetch error:",
        error.message
      );

      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPortfolio();

    const interval = setInterval(
      fetchPortfolio,
      5000
    );

    return () => {
      clearInterval(interval);
    };
  }, []);

  if (loading) {
    return (
      <section className="portfolio-card">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading portfolio...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="portfolio-card">
        <div className="error-state">
          <strong>Unable to load portfolio</strong>
  
          <p>{error}</p>
  
          <button
            type="button"
            className="retry-button"
            onClick={fetchPortfolio}
          >
            Try Again
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="portfolio-card">
      <div className="portfolio-header">
        <div>
          <span className="label">
            PAPER PORTFOLIO
          </span>

          <h2>Portfolio</h2>
        </div>

        <span className="paper-badge">
          PAPER TRADING
        </span>
      </div>

      <div className="portfolio-stats">
        <div className="portfolio-stat">
          <span>Available Balance</span>

          <strong>
            ₹
            {portfolio.balance.toLocaleString(
              "en-IN",
              {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              }
            )}
          </strong>
        </div>

        <div className="portfolio-stat">
          <span>Realized P&L</span>

          <strong
            className={
              portfolio.realizedPnL >= 0
                ? "profit-text"
                : "loss-text"
            }
          >
            ₹
            {portfolio.realizedPnL.toLocaleString(
              "en-IN",
              {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              }
            )}
          </strong>
        </div>

        <div className="portfolio-stat">
          <span>Total P&L</span>

          <strong
            className={
              portfolio.totalPnL >= 0
                ? "profit-text"
                : "loss-text"
            }
          >
            ₹
            {portfolio.totalPnL.toLocaleString(
              "en-IN",
              {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              }
            )}
          </strong>
        </div>
      </div>

      <div className="holdings-section">
        <h3>Current Holdings</h3>

        {portfolio.holdings.length === 0 ? (
          <p className="empty-state">
            No open holdings
          </p>
        ) : (
          <div className="holdings-list">
            {portfolio.holdings.map((holding) => (
              <div
                className="holding-row"
                key={holding.symbol}
              >
                <div>
                  <strong>
                    {holding.symbol}
                  </strong>

                  <span>
                    Qty: {holding.quantity}
                  </span>
                </div>

                <div className="holding-price">
                  <strong>
                    ₹
                    {holding.currentPrice.toLocaleString(
                      "en-IN"
                    )}
                  </strong>

                  <span
                    className={
                      holding.unrealizedPnL >= 0
                        ? "profit-text"
                        : "loss-text"
                    }
                  >
                    P&L: ₹
                    {holding.unrealizedPnL.toFixed(2)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default PortfolioCard;


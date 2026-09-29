import { useEffect, useRef, useState } from "react";
import {
  CandlestickSeries,
  createChart,
} from "lightweight-charts";

function TradingChart({ marketData }) {
  const containerRef = useRef(null);
  const chartRef = useRef(null);
  const seriesRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Create chart
  useEffect(() => {
    if (!containerRef.current) {
      return;
    }

    const chart = createChart(containerRef.current, {
      width: containerRef.current.clientWidth,
      height: 450,

      layout: {
        textColor: "#334155",
        background: {
          type: "solid",
          color: "#ffffff",
        },
      },

      grid: {
        vertLines: {
          color: "#e2e8f0",
        },
        horzLines: {
          color: "#e2e8f0",
        },
      },

      timeScale: {
        timeVisible: true,
        secondsVisible: false,
        borderColor: "#cbd5e1",
      },

      rightPriceScale: {
        borderColor: "#cbd5e1",
      },
    });

    const candlestickSeries = chart.addSeries(
      CandlestickSeries,
      {
        upColor: "#22c55e",
        downColor: "#ef4444",
        borderVisible: false,
        wickUpColor: "#22c55e",
        wickDownColor: "#ef4444",
      }
    );

    chartRef.current = chart;
    seriesRef.current = candlestickSeries;

    const handleResize = () => {
      if (!containerRef.current) {
        return;
      }

      chart.applyOptions({
        width: containerRef.current.clientWidth,
      });
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);

      chart.remove();

      chartRef.current = null;
      seriesRef.current = null;
    };
  }, []);

  // Load historical candles
  useEffect(() => {
    let cancelled = false;

    const loadHistoricalData = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          "http://localhost:5000/api/market/klines?symbol=BTCUSDT&interval=1m&limit=200"
        );

        if (!response.ok) {
          throw new Error(
            `HTTP error: ${response.status}`
          );
        }

        const data = await response.json();

        if (cancelled) {
          return;
        }

        if (
          !Array.isArray(data.candles) ||
          data.candles.length === 0
        ) {
          throw new Error("No candle data received");
        }

        if (seriesRef.current) {
          seriesRef.current.setData(data.candles);

          if (chartRef.current) {
            chartRef.current.timeScale().fitContent();
          }
        }
      } catch (err) {
        console.error(
          "Historical chart error:",
          err
        );

        if (!cancelled) {
          setError(err.message);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadHistoricalData();

    return () => {
      cancelled = true;
    };
  }, []);

  // Update live candle
  useEffect(() => {
    if (!marketData || !seriesRef.current) {
      return;
    }

    if (!marketData.openTime) {
      return;
    }

    try {
      seriesRef.current.update({
        time: Math.floor(
          marketData.openTime / 1000
        ),
        open: Number(marketData.open),
        high: Number(marketData.high),
        low: Number(marketData.low),
        close: Number(marketData.close),
      });
    } catch (err) {
      console.error(
        "Live candle update error:",
        err
      );
    }
  }, [marketData]);

  return (
    <div>
      {loading && (
        <p style={{ color: "#64748b" }}>
          Loading historical candles...
        </p>
      )}

      {error && (
        <p style={{ color: "#ef4444" }}>
          Chart error: {error}
        </p>
      )}

      <div
        ref={containerRef}
        style={{
          width: "100%",
          minHeight: "450px",
        }}
      />
    </div>
  );
}

export default TradingChart;
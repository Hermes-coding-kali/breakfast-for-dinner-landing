import React, { useEffect, useState } from "react";
import ProductCard from "./ProductCard";
import "./StorePage.css";

function StorePage() {
  const [products, setProducts] = useState([]);
  const [status, setStatus] = useState("loading"); // loading | ready | error
  const [error, setError] = useState(null);

  // ✅ use the same endpoint you had before
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        setStatus("loading");
        const res = await fetch("/.netlify/functions/get-products", {
          credentials: "same-origin",
        });
        const data = await res.json(); // your function returns JSON
        if (!cancelled) {
          setProducts(Array.isArray(data) ? data : []);
          setStatus("ready");
        }
      } catch (err) {
        if (!cancelled) {
          console.error(err);
          setError("Failed to load products.");
          setStatus("error");
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  if (status === "loading" || status === "error") {
    return (
      <div className="store-page-container">
        <h1 className="store-title">
          {status === "loading" ? "Loading…" : error}
        </h1>
      </div>
    );
  }

  return (
    <div className="store-page-container">
      <h1 className="store-title">The Official Store</h1>

      <div className="store-grid-container">
        {products.map((p) => (
          <ProductCard key={p._id} product={p} view="card" />
        ))}
      </div>
    </div>
  );
}

export default StorePage;

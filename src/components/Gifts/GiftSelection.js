import { useState } from "react";
import { gifts } from "../../data/gifts"; // импортируем массив

const GiftSelection = ({ gift, onChange }) => {
  const [search, setSearch] = useState("");

  const filteredGifts = gifts.filter((g) =>
    g.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <h3 className="profile-page-title" style={{ marginBottom: 8 }}>
        Выберите NFT подарок:
      </h3>

      {/* Поле поиска */}
      <div className="input-group" style={{ marginBottom: 16 }}>
        <input
          type="text"
          placeholder="Поиск по подаркам..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            width: "100%",
            padding: "8px 12px",
            border: "1px solid #ddd",
            borderRadius: 8,
            fontSize: 14,
          }}
        />
      </div>

      <div
        className="gift-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))",
          gap: 16,
        }}
      >
        {filteredGifts.map((g) => (
          <div
            key={g.id}
            className="gift-card"
            style={{
              position: "relative",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              padding: 12,
              border: "1px solid #ddd",
              borderRadius: 12,
              cursor: "pointer",
              textAlign: "center",
            }}
            onClick={() => onChange(g.id)}
          >
            <img
              src={g.img}
              alt={g.title}
              width={80}
              height={80}
              style={{ borderRadius: 8, marginBottom: 8 }}
            />
            <span style={{ fontSize: 14 }}>{g.title}</span>

            {/* Галочка для активного подарка */}
            {gift === g.id && (
              <div
                style={{
                  position: "absolute",
                  top: 8,
                  right: 8,
                  width: 20,
                  height: 20,
                  borderRadius: "50%",
                  backgroundColor: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 0 3px rgba(0,0,0,0.2)",
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="black"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              </div>
            )}
          </div>
        ))}
        {filteredGifts.length === 0 && (
          <p style={{ gridColumn: "1/-1", textAlign: "center", color: "#777" }}>
            Ничего не найдено
          </p>
        )}
      </div>
    </div>
  );
};

export default GiftSelection;

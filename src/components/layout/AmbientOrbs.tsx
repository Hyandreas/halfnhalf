export function AmbientOrbs() {
  return (
    <div
      className="pointer-events-none fixed inset-0"
      style={{ zIndex: 1 }}
      aria-hidden="true"
    >
      {/* Large peach orb — top-left, slow drift */}
      <div
        style={{
          position: "absolute",
          top: "5%",
          left: "-5%",
          width: 520,
          height: 520,
          borderRadius: "50%",
          backgroundColor: "#FFB997",
          filter: "blur(110px)",
          opacity: 0.09,
          animation: "orb-drift-1 30s ease-in-out infinite",
        }}
      />
      {/* Medium rose orb — bottom-right, medium drift */}
      <div
        style={{
          position: "absolute",
          bottom: "8%",
          right: "-4%",
          width: 400,
          height: 400,
          borderRadius: "50%",
          backgroundColor: "#E8A598",
          filter: "blur(95px)",
          opacity: 0.08,
          animation: "orb-drift-2 42s ease-in-out infinite",
          animationDelay: "-8s",
        }}
      />
      {/* Small sage orb — centre-right, fast drift */}
      <div
        style={{
          position: "absolute",
          top: "38%",
          left: "55%",
          width: 290,
          height: 290,
          borderRadius: "50%",
          backgroundColor: "#A8C5A0",
          filter: "blur(85px)",
          opacity: 0.07,
          animation: "orb-drift-3 25s ease-in-out infinite",
          animationDelay: "-15s",
        }}
      />
    </div>
  );
}

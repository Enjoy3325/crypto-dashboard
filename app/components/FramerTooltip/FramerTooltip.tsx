import { motion } from "framer-motion";

interface FramerTooltipProps {
  tooltipData: any;
  cursorPos: { x: number; y: number } | null;
  chartHeight?: number;
}

export const FramerTooltip: React.FC<FramerTooltipProps> = ({
  tooltipData,
  cursorPos,
  chartHeight = 540,
}) => {
  if (!tooltipData || !cursorPos) return null;

  const showBelow = cursorPos.y < chartHeight / 2;
  const offsetY = showBelow ? 20 : -80;

  return (
    <motion.div
      initial={{ opacity: 0, y: showBelow ? 10 : -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 150, damping: 18 }}
      className="absolute z-50 pointer-events-none"
      style={{
        transform: `translate(${cursorPos.x}px, ${cursorPos.y + offsetY}px)`,
        background: "linear-gradient(145deg, #1e293b, #334155)",
        color: "white",
        borderRadius: 12,
        padding: "10px 14px",
        boxShadow: "0 4px 20px rgba(0,0,0,0.4)",
        fontSize: 12,
        minWidth: 160,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <span>{new Date(tooltipData.time).toLocaleString()}</span>
      </div>
      <div style={{ marginTop: 6 }}>
        <div>
          <strong>BTC:</strong> ${tooltipData.BTC.toLocaleString(undefined, { minimumFractionDigits: 4, maximumFractionDigits: 4 })}{" "}
          <span style={{ color: tooltipData.BTCChange >= 0 ? "#22c55e" : "#ef4444" }}>
            ({tooltipData.BTCChange}%)
          </span>
        </div>
        <div>
          <strong>SOL:</strong> ${tooltipData.SOL.toLocaleString(undefined, { minimumFractionDigits: 4, maximumFractionDigits: 4 })}{" "}
          <span style={{ color: tooltipData.SOLChange >= 0 ? "#22c55e" : "#ef4444" }}>
            ({tooltipData.SOLChange}%)
          </span>
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          left: "50%",
          transform: "translateX(-50%)",
          bottom: showBelow ? "100%" : undefined,
          top: showBelow ? undefined : "100%",
          width: 0,
          height: 0,
          borderLeft: "6px solid transparent",
          borderRight: "6px solid transparent",
          borderTop: showBelow ? "6px solid #1e293b" : undefined,
          borderBottom: showBelow ? undefined : "6px solid #1e293b",
        }}
      />
    </motion.div>
  );
};

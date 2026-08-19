export function ProgressRing({ value }: { value: number }) {
  return (
    <div className="ring" style={{ "--progress": `${value * 3.6}deg` } as React.CSSProperties}>
      <div className="ring-inner"><strong>{value}%</strong><span>READY</span></div>
    </div>
  );
}

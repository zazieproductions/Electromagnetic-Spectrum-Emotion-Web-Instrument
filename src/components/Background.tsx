// Atmospheric backdrop: layered radial glows plus a slowly drifting grain grid.
// Kept as a fixed, pointer-transparent layer so it never intercepts the instrument.
export default function Background() {
  return (
    <>
      <div
        className="fixed inset-0 -z-10"
        style={{
          background:
            "radial-gradient(1200px 700px at 50% -10%, rgba(120,90,255,0.16), transparent 60%), radial-gradient(900px 600px at 90% 110%, rgba(255,90,140,0.1), transparent 55%), radial-gradient(700px 500px at 5% 90%, rgba(80,200,255,0.08), transparent 55%), #05040a",
        }}
      />
      <div
        className="fixed inset-0 -z-10 opacity-[0.05] pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, #fff 1px, transparent 0)",
          backgroundSize: "40px 40px",
          animation: "floatGrain 12s linear infinite alternate",
        }}
      />
    </>
  );
}

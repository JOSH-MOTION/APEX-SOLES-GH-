export default function PagesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans selection:bg-[#c6ff00] selection:text-black">
      {children}
    </div>
  );
}

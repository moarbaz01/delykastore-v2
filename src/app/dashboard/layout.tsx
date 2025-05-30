import Navbar from "@/components/Dashboard/Navbar";
import Sidebar from "@/components/Dashboard/Sidebar";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen bg-gray-900">
      <main className="flex-1 pt-20 pb-2 md:p-0">
        <Navbar />
        <Sidebar />
        {children}
      </main>
    </div>
  );
}

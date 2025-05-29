import { ReactNode } from "react";
import Navbar from "./Navbar";
import MobileNav from "./MobileNav";
import Chatbot from "./Chatbot";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <main className="pb-16 md:pb-0">
        {children}
      </main>
      <MobileNav />
      <Chatbot />
    </div>
  );
}

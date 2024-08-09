// pages/login.tsx
import Header from '../components/Header';
import Footer from '../components/Footer';
import Login from '../components/Login';
import Link from 'next/link';

export default function LoginPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <div className="flex-grow container mx-auto p-4 flex justify-center items-center">
        <main className="flex-grow container mx-auto p-4">
          <Login />
        </main>
      </div>  
      <Footer />
    </div>
  );
}
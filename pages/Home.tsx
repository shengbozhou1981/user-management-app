// pages/index.tsx
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container mx-auto p-4">
        <h1 className="text-3xl font-bold text-center mb-8">Welcome to MyApp</h1>
        <p className="text-center">This is the home page. Use the navigation bar to go to the login or signup page.</p>
      </main>
      <Footer />
    </div>
  );
}
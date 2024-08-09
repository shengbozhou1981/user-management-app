// pages/signup.tsx
import Signup from '../components/Signup';
import Header from '../components/Header';
import Footer from '../components/Footer';
export default function SignupPage() {
  return (
    <div className="flex flex-col min-h-screen ">
      <div className="mt-auto">
        <Header />
      </div>

      <div className="flex-grow container mx-auto p-4 flex justify-center items-center">
      <main className="flex-grow container mx-auto p-4 ">
        <Signup />
      </main>
      </div>
      <div className="mt-auto">
        <Footer />
      </div>
    </div>
  );
}

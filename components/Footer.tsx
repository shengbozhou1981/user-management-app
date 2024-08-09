// components/Footer.tsx
export default function Footer() {
    return (
      <footer className="bg-gray-800 text-white p-4 mt-8">
        <div className="container mx-auto text-center">
          &copy; {new Date().getFullYear()} MyApp. All rights reserved.
        </div>
      </footer>
    );
  }
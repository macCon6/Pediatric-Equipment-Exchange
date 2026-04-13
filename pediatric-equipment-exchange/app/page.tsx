import Link from "next/link";

export default function Login() {
  return (
    /* Full screen background */
    <div className="flex min-h-screen items-center justify-center bg-white font-sans">

      {/* Middle box */}
      <main className="flex min-h-screen w-4/6 max-w-screen flex-col items-center justify-center py-8 px-16 bg-white sm:items-start">
        <div className="flex flex-col items-center gap-4 text-center sm:items-start sm:text-left">

          {/* Logo */}
          <img 
            src="/logo.jpg" 
            alt="Beyond the Horizon Logo" 
            className="w-full h-auto"
          />

          {/*<h2 className="text-2xl font-montserrat text-black">Where Helping Families Comes First</h2>*/}
        
          {/* Login Redirect */}
          <Link 
            className="flex h-12 w-full items-center justify-center rounded-full bg-[#5a9e3a] px-5 transition-colors hover:border-transparent hover:bg-[#4a8a2e] md:w-[158px] text-xl text-white"
            href="/equipment-gallery"
          >
            Login
          </Link>
        </div>
      </main>
    </div>
  );
}
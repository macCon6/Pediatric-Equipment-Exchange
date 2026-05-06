import Link from "next/link";
import Image from "next/image";

export default function Landing() {
  return (
    /* Full screen background */
    <div className="flex min-h-screen items-center justify-center bg-white font-sans">

      {/* Middle box */}
     <main className="flex min-h-screen w-full max-w-5xl mx-auto flex-col items-center justify-center px-6 sm:px-10 md:px-16 text-center">
        <div className="flex flex-col items-center gap-4 text-center items-start text-left">

          {/* Logo */}
          <Image
            src="/logo.jpg"
            alt="Beyond the Horizon Logo"
            width={600}
            height={300}
            priority
            className="w-full max-w-[500px] h-auto mx-auto"
          />

          {/* Login Redirect */}
          <Link 
            className="flex h-12 w-1/2 mx-auto mt-6 items-center justify-center rounded-full bg-[#5a9e3a] px-5 transition-colors hover:border-transparent hover:bg-[#4a8a2e] md:w-[158px] text-xl text-white"
            href="/login-page"
          >
            Login
          </Link>
        </div>
      </main>
    </div>
  );
}
import Link from "next/link";

export default function Login() {
  return (
    /* Full screen background */
    <div className="flex min-h-screen items-center justify-center bg-teal-400 font-sans">

      {/* Middle box */}
      <main className="flex min-h-screen w-4/6 max-w-screen flex-col items-center justify-between py-32 px-16 bg-teal-300 sm:items-start">
        <div className="flex flex-col items-center gap-8 text-center sm:items-start sm:text-left">

          {/* Main and sub headers */}
          <h1 className="max-w-xs text-6xl font-semibold tracking-tight leading-15 text-white">
            <ul className = "space-y-3">
              <li> Pediatric </li>
              <li> Adaptive </li>
              <li> Equipment </li>
              <li> Closet </li>
            </ul>
          </h1>
          
          <h2 className="text-2xl text-black"> Where Helping Families Comes First </h2>
        
          {/* Login Redirect: EDIT LATER WITH AUTHENTICATION */}
          <Link 
            className="flex h-12 w-full items-center justify-center rounded-full bg-rose-400 px-5 transition-colors hover:border-transparent hover:bg-rose-300  md:w-[158px] text-white"
            href="/equipment-gallery"
          >
            Login
          </Link>
        </div>
      </main>
    </div>
  );
}

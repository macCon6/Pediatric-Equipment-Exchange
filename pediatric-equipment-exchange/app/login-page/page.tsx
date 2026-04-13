import Link from "next/link";

export default function Login() {
  return (
    /* Full screen background */
    <div className="flex min-h-screen items-center justify-center bg-[#FFC94A] font-sans">

      {/* Middle box */}
      <main className="flex min-h-screen w-4/6 max-w-screen flex-col items-center justify-center py-8 px-16 bg-[#FFE09A] sm:items-start">

        <div className="flex flex-col items-center gap-4 text-center sm:items-start sm:text-left">
          
          <div className="w-1/2"> Right now this is just the title page copied, but here is where we can add a box for the user to input their username
            and password. OR click the view as guest button, where their role will be Supabase's default "anon" role.
          </div>

          {/* TODO: Implement a login box */}
           
          {/* Gallery redirect until we implement this */}
          <Link 
            className="flex h-12 w-full items-center justify-center rounded-full bg-[#5a9e3a] px-5 transition-colors hover:border-transparent hover:bg-[#4a8a2e] md:w-[158px] text-xl text-white"
            href="/equipment-gallery"
          >
            Enter
          </Link>

          <Link 
            className="flex h-12 w-full justify-center rounded-full bg-[#5a9e3a] px-5 transition-colors hover:border-transparent hover:bg-[#4a8a2e] md:w-[158px] text-xl text-white"
            href="/equipment-gallery"
          >
           View as Guest
          </Link>
        </div>
      </main>
    </div>
  );
}
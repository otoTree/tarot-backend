import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background text-foreground selection:bg-black/10">
      <div className="container flex flex-col items-center justify-center gap-8 px-4 py-16 md:gap-12">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="rounded-full border border-black/5 bg-black/[0.02] px-3 py-1 text-sm text-black/60 backdrop-blur-sm">
            Backend Service
          </div>
          <h1 className="text-4xl font-light tracking-tight text-black sm:text-6xl lg:text-7xl">
            Tarot <span className="font-normal text-black/40">AI</span>
          </h1>
          <p className="max-w-[42rem] text-center text-lg font-light leading-relaxed text-black/60 sm:text-xl">
            Eastern wisdom meets modern intelligence. <br className="hidden sm:inline" />
            The engine of your mystical journey.
          </p>
        </div>
        
        <div className="flex gap-4">
          <Link href="/admin">
            <Button size="lg" className="rounded-full px-8 font-light" variant="outline">
              Admin Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </main>
  )
}

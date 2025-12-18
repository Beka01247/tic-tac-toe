import Game from '@/components/Game'
import BackgroundBlobs from '@/components/BackgroundBlobs'
import DevTestPanel from '@/components/DevTestPanel'

export default function Home() {
  return (
    <main className="min-h-screen noise-texture overflow-hidden relative">
      <BackgroundBlobs />
      <div className="relative z-10 flex items-center justify-center min-h-screen p-16">
        <Game />
      </div>
      <DevTestPanel />
    </main>
  )
}

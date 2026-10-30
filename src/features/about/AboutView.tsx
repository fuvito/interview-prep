import { BookOpen, Database, Zap, Shield, Code2 } from 'lucide-react'
import { useIconSize } from '@/hooks/useIconSize'

const VERSION = '0.1.0'

interface InfoRowProps {
  label: string
  value: React.ReactNode
}

function InfoRow({ label, value }: InfoRowProps) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-800 last:border-0">
      <span className="text-sm text-gray-500">{label}</span>
      <span className="text-sm font-semibold text-gray-100">{value}</span>
    </div>
  )
}

interface FeatureRowProps {
  icon: React.ReactNode
  title: string
  description: string
}

function FeatureRow({ icon, title, description }: FeatureRowProps) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-7 h-7 rounded-lg bg-gray-800 border border-gray-700 flex items-center justify-center shrink-0 text-blue-400">
        {icon}
      </div>
      <div>
        <p className="text-sm font-medium text-gray-200">{title}</p>
        <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">{description}</p>
      </div>
    </div>
  )
}

export function AboutView() {
  const iconSize = useIconSize()
  return (
    <div className="flex flex-col h-full overflow-y-auto overflow-x-hidden">
      <div className="p-5 space-y-5">

        {/* Hero */}
        <div className="text-center space-y-3 pt-2">
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-900/40">
              <span className="text-xl font-black text-white tracking-tight">IP</span>
            </div>
          </div>
          <div className="space-y-0.5">
            <h1 className="text-lg font-bold text-gray-100">InterviewPrep</h1>
            <p className="text-xs text-gray-500">Version {VERSION}</p>
          </div>
          <p className="text-sm text-gray-400 leading-relaxed max-w-xs mx-auto">
            Offline-first technical interview preparation for software developers. Free, open-source, and fully offline.
          </p>
        </div>

        <hr className="border-gray-800" />

        {/* Info rows */}
        <div className="border border-gray-800 rounded-lg px-3 overflow-hidden">
          <InfoRow label="Author" value="Fuat Yazar" />
          <InfoRow label="License" value="MIT" />
          <InfoRow label="Version" value={VERSION} />
        </div>

        <hr className="border-gray-800" />

        {/* Features */}
        <section className="space-y-3">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Features</h2>
          <div className="space-y-3.5">
            <FeatureRow
              icon={<BookOpen size={iconSize(14)} />}
              title="Structured Question Banks"
              description="Curated questions across topics, levels, and types — single choice, multiple select, code output, and open-ended."
            />
            <FeatureRow
              icon={<Zap size={iconSize(14)} />}
              title="Interview Simulation"
              description="Timed quiz sessions with scoring, answer review, and session history."
            />
            <FeatureRow
              icon={<Database size={iconSize(14)} />}
              title="Local-first Persistence"
              description="All progress, bookmarks, and preferences are stored locally in IndexedDB. Nothing leaves your device."
            />
            <FeatureRow
              icon={<Shield size={iconSize(14)} />}
              title="No Account Required"
              description="No sign-up, no tracking, no internet connection needed. Works fully offline."
            />
          </div>
        </section>

        <hr className="border-gray-800" />

        {/* Content */}
        <section className="space-y-2">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Content</h2>
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-3 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-200">TypeScript</span>
              <span className="text-xs text-blue-400 font-mono">155 questions</span>
            </div>
            <div className="flex gap-1.5 flex-wrap">
              {['Basics', 'Interfaces & Types', 'Functions', 'Generics', 'Classes', 'Advanced Types'].map((t) => (
                <span key={t} className="text-xs px-2 py-0.5 bg-gray-800 text-gray-400 rounded border border-gray-700">{t}</span>
              ))}
            </div>
          </div>
          <p className="text-xs text-gray-600 pt-0.5">More subjects coming in future releases.</p>
        </section>

        <hr className="border-gray-800" />

        {/* Stack */}
        <section className="space-y-3">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Built With</h2>
          <div className="grid grid-cols-2 gap-1.5 text-xs">
            {[
              ['React 19', 'UI'],
              ['TypeScript 5.7', 'Language'],
              ['Vite 6', 'Build'],
              ['Tailwind CSS v4', 'Styling'],
              ['Dexie / IndexedDB', 'Storage'],
              ['Zustand', 'State'],
            ].map(([name, role]) => (
              <div key={name} className="flex justify-between items-center bg-gray-900 border border-gray-800 rounded px-2.5 py-1.5">
                <span className="text-gray-200">{name}</span>
                <span className="text-gray-500">{role}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Footer */}
        <div className="flex items-center justify-center gap-1.5 text-xs text-gray-600 pb-2">
          <Code2 size={iconSize(12)} />
          <span>Open source — MIT License</span>
        </div>

      </div>
    </div>
  )
}

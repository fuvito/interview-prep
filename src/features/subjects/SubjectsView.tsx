import { ChevronRight } from 'lucide-react'
import { useNavigationStore } from '@/store'
import { questionRepository } from '@/core/question-engine'

export function SubjectsView() {
  const { navigate } = useNavigationStore()
  const subjects = questionRepository.getAllSubjects()

  return (
    <div className="p-4 space-y-2">
      {subjects.map((s) => (
        <button
          key={s.id}
          onClick={() => navigate({ name: 'topics', subjectId: s.id })}
          className="w-full flex items-center justify-between p-4 bg-gray-900 border border-gray-800 rounded-lg hover:border-gray-600 transition-colors text-left"
        >
          <div>
            <p className="font-medium text-gray-100">{s.name}</p>
            <p className="text-sm text-gray-500 mt-0.5">{s.description}</p>
            <p className="text-xs text-gray-600 mt-1">{questionRepository.countBySubject(s.id)} questions</p>
          </div>
          <ChevronRight size={18} className="text-gray-600 shrink-0 ml-3" />
        </button>
      ))}
    </div>
  )
}

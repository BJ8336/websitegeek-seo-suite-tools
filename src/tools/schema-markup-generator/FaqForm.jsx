function FaqForm({ fields, onChange }) {
  const questions = fields.questions || []

  const updateQuestion = (index, key, value) => {
    const next = questions.map((q, i) => (i === index ? { ...q, [key]: value } : q))
    onChange('questions', next)
  }

  const addQuestion = () => onChange('questions', [...questions, { question: '', answer: '' }])
  const removeQuestion = (index) => onChange('questions', questions.filter((_, i) => i !== index))

  return (
    <div className="space-y-4">
      {questions.length === 0 && (
        <p className="text-sm text-slate-500">Add at least one question and answer.</p>
      )}
      {questions.map((q, index) => (
        <div key={index} className="rounded-lg border border-slate-200 p-3">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Question {index + 1}
            </p>
            <button
              type="button"
              onClick={() => removeQuestion(index)}
              className="text-xs text-red-600 hover:underline"
            >
              Remove
            </button>
          </div>
          <input
            type="text"
            value={q.question}
            onChange={(event) => updateQuestion(index, 'question', event.target.value)}
            placeholder="Question"
            className="w-full rounded-lg border border-slate-300 p-2.5 text-sm focus:border-blue-500 focus:outline-none"
          />
          <textarea
            value={q.answer}
            onChange={(event) => updateQuestion(index, 'answer', event.target.value)}
            placeholder="Answer"
            rows={2}
            className="mt-2 w-full rounded-lg border border-slate-300 p-2.5 text-sm focus:border-blue-500 focus:outline-none"
          />
        </div>
      ))}
      <button
        type="button"
        onClick={addQuestion}
        className="rounded-lg border border-dashed border-slate-300 px-3 py-2 text-sm text-slate-600 hover:border-blue-400 hover:text-blue-600"
      >
        + Add question
      </button>
    </div>
  )
}

export default FaqForm

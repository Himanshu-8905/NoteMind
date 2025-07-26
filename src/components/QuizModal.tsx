import { useState } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { generateQuizFromNote } from "@/actions/note-actions";

type QuizQuestion = {
  question: string;
  options: string[];
  answer: string;
};

export function QuizModal({ noteDescription }: { noteDescription: string }) {
  const [quiz, setQuiz] = useState<QuizQuestion[]>([]);
  const [selected, setSelected] = useState<{ [key: number]: string }>({});
  const [score, setScore] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const generateQuiz = async () => {
    setLoading(true);
    try {
      const result = await generateQuizFromNote(noteDescription);
      const data = JSON.parse(result);
      setQuiz(data);
    } catch (error) {
      console.error("Error generating quiz : ", error);
    }
    setLoading(false);
    setScore(null);
    setSelected({});
  };

  const handleAnswer = (qIndex: number, option: string) => {
    setSelected((prev) => ({ ...prev, [qIndex]: option }));
  };

  const handleSubmit = () => {
    let correct = 0;
    quiz.forEach((q, i) => {
      if (selected[i] === q.answer) correct++;
    });
    setScore(correct);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button onClick={generateQuiz}>Generate Quiz</Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Quiz</DialogTitle>
        </DialogHeader>

        {loading ? (
          <p className="text-center">Generating quiz...</p>
        ) : quiz.length === 0 ? (
          <p className="text-center">No quiz available</p>
        ) : (
          <div className="space-y-4">
            {quiz.map((q, i) => (
              <div key={i}>
                <p className="font-semibold">
                  {i + 1}. {q.question}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                  {q.options.map((opt, j) => (
                    <button
                      key={j}
                      disabled={typeof score==="number"}
                      onClick={() => handleAnswer(i, opt)}
                      className={`p-2 rounded border ${
                        selected[i] === opt
                          ? selected[i] === q.answer
                            ? "bg-green-200 dark:bg-green-600 border-green-600"
                            : "bg-red-200 dark:bg-red-600 border-red-600"
                          : "hover:bg-gray-100 dark:hover:bg-gray-700"
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            ))}
            {score === null && (
              <Button onClick={handleSubmit}>Submit</Button>
            )}
            {score !== null && (
              <p className="mt-4 text-center font-bold text-xl">
                You scored {score} out of {quiz.length}
              </p>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

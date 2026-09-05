import React, { useState } from 'react';
import { DailyTask } from '../types';
import {
  ListTodo,
  Plus,
  Trash2,
  CheckCircle,
  Circle,
  Check,
  Sparkles,
} from 'lucide-react';

interface DailyTasksSectionProps {
  tasks: DailyTask[];
  onAddTask: (text: string) => void;
  onToggleTask: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
  onClearCompletedTasks: () => void;
}

export const DailyTasksSection: React.FC<DailyTasksSectionProps> = ({
  tasks,
  onAddTask,
  onToggleTask,
  onDeleteTask,
  onClearCompletedTasks,
}) => {
  const [newTaskText, setNewTaskText] = useState('');

  const completedCount = tasks.filter((t) => t.isCompleted).length;
  const totalCount = tasks.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskText.trim()) return;
    onAddTask(newTaskText.trim());
    setNewTaskText('');
  };

  return (
    <div
      id="daily-tasks-section"
      className="bg-white rounded-2xl border border-slate-200/80 p-3.5 sm:p-4 shadow-xs"
    >
      {/* Header: Title, Counter & Clear action */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-teal-50 border border-teal-200/60 flex items-center justify-center text-teal-800 shrink-0">
            <ListTodo className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs sm:text-sm font-extrabold text-slate-900">
                مهام ومتابعات اليوم
              </h3>
              {totalCount > 0 && (
                <span className="text-[10px] sm:text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                  {completedCount} من {totalCount} منجزة
                </span>
              )}
            </div>
          </div>
        </div>

        {completedCount > 0 && (
          <button
            onClick={onClearCompletedTasks}
            className="text-[11px] font-bold text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
            title="حذف المهام المكتملة"
          >
            مسح المكتملة
          </button>
        )}
      </div>

      {/* Progress Line (if there are tasks) */}
      {totalCount > 0 && (
        <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden mb-3">
          <div
            className="h-full bg-teal-700 transition-all duration-300 rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      )}

      {/* Input Form for Adding New Task */}
      <form onSubmit={handleSubmit} className="flex items-center gap-2 mb-3">
        <input
          id="input-daily-task"
          type="text"
          value={newTaskText}
          onChange={(e) => setNewTaskText(e.target.value)}
          placeholder="أضف مهمة لليوم (مثال: تسليم شيك عينات، مراجعة صيدلية، تأكيد ميعاد...)"
          className="flex-1 bg-slate-50 border border-slate-200 focus:bg-white focus:border-teal-700 focus:ring-1 focus:ring-teal-700/30 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 placeholder:text-slate-400 outline-none transition-all"
        />
        <button
          id="btn-add-daily-task"
          type="submit"
          disabled={!newTaskText.trim()}
          className="inline-flex items-center justify-center gap-1 px-3 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold transition-all shadow-xs shrink-0 cursor-pointer active:scale-95"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>إضافة</span>
        </button>
      </form>

      {/* Tasks List */}
      {totalCount === 0 ? (
        <div className="py-3 px-3 text-center rounded-xl bg-slate-50/60 border border-dashed border-slate-200 text-slate-400 text-xs font-medium">
          لا توجد مهام إضافية مضافة لليوم حتى الآن. أضف مهامك الميدانية هنا لتنظيم يومك.
        </div>
      ) : (
        <div className="space-y-1.5 max-h-56 overflow-y-auto pr-0.5">
          {tasks.map((task) => (
            <div
              key={task.id}
              onClick={() => onToggleTask(task.id)}
              className={`flex items-center justify-between gap-2.5 p-2 rounded-xl border transition-all cursor-pointer select-none group ${
                task.isCompleted
                  ? 'bg-slate-50/70 border-slate-200/60 text-slate-400'
                  : 'bg-white border-slate-200/80 hover:border-teal-300 text-slate-800 shadow-xs'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleTask(task.id);
                  }}
                  className={`w-5 h-5 rounded-md flex items-center justify-center transition-colors shrink-0 ${
                    task.isCompleted
                      ? 'bg-emerald-600 text-white'
                      : 'border-2 border-slate-300 group-hover:border-teal-600'
                  }`}
                >
                  {task.isCompleted && <Check className="w-3 h-3 stroke-[3]" />}
                </button>
                <span
                  className={`text-xs font-semibold break-words ${
                    task.isCompleted ? 'line-through text-slate-400' : 'text-slate-800'
                  }`}
                >
                  {task.text}
                </span>
              </div>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteTask(task.id);
                }}
                className="p-1 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors shrink-0"
                title="حذف المهمة"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

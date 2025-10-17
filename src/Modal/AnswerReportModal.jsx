import React from 'react';
import {
  X,
  FileText,
  Mail,
  Briefcase,
  Building2,
  CalendarDays,
  TimerReset,
  UserRound,
  Smile,
  Monitor,
} from 'lucide-react';

const AnswerReportModal = ({ interview, onClose }) => {
  if (!interview) return null;

  const answers = Array.isArray(interview.answers) ? interview.answers : [];
  const firstAnsAt = answers[0]?.created_at ? new Date(answers[0]?.created_at) : null;
  const lastAnsAt = answers[answers.length - 1]?.created_at
    ? new Date(answers[answers.length - 1]?.created_at)
    : null;
  const totalMinutes = firstAnsAt && lastAnsAt
    ? Math.max(1, Math.round((lastAnsAt - firstAnsAt) / 1000 / 60))
    : interview?.durationMinutes || null;

  // Scores (fallback to simple averages when not provided)
  const numericRatings = answers
    .map(a => (typeof a?.rating === 'number' ? a.rating : null))
    .filter(v => v !== null);
  const avgSkillScore = numericRatings.length
    ? Math.round((numericRatings.reduce((s, v) => s + v, 0) / numericRatings.length) * 10) // scale ~100
    : interview?.scores?.skill ?? null;
  const avgCommScore = (() => {
    const comm = answers
      .map(a => (typeof a?.communication_score === 'number' ? a.communication_score : null))
      .filter(v => v !== null);
    if (comm.length) return Math.round((comm.reduce((s, v) => s + v, 0) / comm.length) * 10);
    return interview?.scores?.communication ?? null;
  })();

  const experience = Array.isArray(interview?.experience) ? interview.experience : [];
  const proctor = interview?.proctoring || null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      {/* Modal Panel */}
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-5xl mx-4 overflow-hidden">
        {/* Top Bar */}
        <div className="relative p-4 sm:p-6 bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-white">
              <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-semibold leading-tight">Interview Report</h3>
                <p className="text-xs/5 opacity-90">{interview?.name || 'Candidate'} • {interview?.email || '—'}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {interview?.cvUrl && (
                <a
                  href={interview.cvUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="hidden sm:inline-flex px-3 py-1.5 rounded-md bg-white/15 text-white text-sm hover:bg-white/25 border border-white/20"
                >
                  View CV ↗
                </a>
              )}
              {interview?.snapshotsUrl && (
                <a
                  href={interview.snapshotsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="hidden sm:inline-flex px-3 py-1.5 rounded-md bg-white/15 text-white text-sm hover:bg-white/25 border border-white/20"
                >
                  View Snapshots ↗
                </a>
              )}
              <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/20 text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Candidate Summary */}
          <section className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-semibold">
                {(interview?.name || '?').slice(0, 1).toUpperCase()}
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-gray-900">{interview?.name || 'Candidate'}</h2>
                <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600 mt-1">
                  {interview?.role && (
                    <span className="inline-flex items-center gap-1"><Briefcase className="w-4 h-4" />{interview.role}</span>
                  )}
                  {interview?.email && (
                    <span className="inline-flex items-center gap-1"><Mail className="w-4 h-4" />{interview.email}</span>
                  )}
                  {interview?.company && (
                    <span className="inline-flex items-center gap-1"><Building2 className="w-4 h-4" />{interview.company}</span>
                  )}
                </div>
              </div>
            </div>

            {/* Round-wise Scores */}
            <div className="flex-1 sm:flex-initial grid grid-cols-2 gap-3 w-full sm:w-auto sm:min-w-[340px]">
              <div className="rounded-xl border border-gray-200 p-3">
                <div className="text-xs text-gray-500">Skill based</div>
                <div className="mt-1 flex items-end gap-1">
                  <span className="text-2xl font-bold text-indigo-600">{avgSkillScore ?? '—'}</span>
                  <span className="text-xs text-gray-500">/ 100</span>
                </div>
              </div>
              <div className="rounded-xl border border-gray-200 p-3">
                <div className="text-xs text-gray-500">Communication</div>
                <div className="mt-1 flex items-end gap-1">
                  <span className="text-2xl font-bold text-indigo-600">{avgCommScore ?? '—'}</span>
                  <span className="text-xs text-gray-500">/ 100</span>
                </div>
              </div>
            </div>
          </section>

          {/* Interview Meta */}
          <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <UserRound className="w-5 h-5 text-gray-500" />
              <div>
                <div className="text-xs text-gray-500">Total work experience</div>
                <div className="text-sm font-medium text-gray-800">{interview?.totalExperience || '—'}</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Briefcase className="w-5 h-5 text-gray-500" />
              <div>
                <div className="text-xs text-gray-500">Current role</div>
                <div className="text-sm font-medium text-gray-800">{interview?.role || '—'}</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Building2 className="w-5 h-5 text-gray-500" />
              <div>
                <div className="text-xs text-gray-500">Current company</div>
                <div className="text-sm font-medium text-gray-800">{interview?.company || '—'}</div>
              </div>
            </div>
          </section>

          {/* Dates & Duration */}
          <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-xl border border-gray-200 p-4 flex items-center gap-3">
              <CalendarDays className="w-5 h-5 text-gray-500" />
              <div>
                <div className="text-xs text-gray-500">Interview date</div>
                <div className="text-sm font-medium text-gray-800">{lastAnsAt ? lastAnsAt.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}</div>
              </div>
            </div>
            <div className="rounded-xl border border-gray-200 p-4 flex items-center gap-3">
              <TimerReset className="w-5 h-5 text-gray-500" />
              <div>
                <div className="text-xs text-gray-500">Total time spent</div>
                <div className="text-sm font-medium text-gray-800">{totalMinutes ? `${totalMinutes} minutes` : '—'}</div>
              </div>
            </div>
          </section>

          {/* Experience */}
          {experience.length > 0 && (
            <section>
              <h4 className="text-sm font-semibold text-gray-900 mb-3">Experience</h4>
              <div className="rounded-xl border border-gray-200 overflow-hidden">
                <div className="divide-y divide-gray-100">
                  {experience.map((exp, idx) => (
                    <div key={idx} className="grid grid-cols-3 sm:grid-cols-3 items-center px-4 py-3">
                      <div className="col-span-2 text-sm text-gray-800">{exp?.company || exp?.project || '—'}</div>
                      <div className="text-right text-sm text-gray-600">{exp?.duration || exp?.months ? `${exp.months || exp.duration}` : '—'}</div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* Proctoring */}
          {proctor && (
            <section>
              <h4 className="text-sm font-semibold text-gray-900 mb-3">Proctoring</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="rounded-xl border border-emerald-300 bg-emerald-50 p-4 text-center">
                  <Monitor className="w-6 h-6 mx-auto text-emerald-600" />
                  <div className="mt-2 text-xs font-medium text-emerald-700">{proctor?.distractions === 0 ? 'No Distractions' : 'Distractions'}</div>
                  <div className="text-xs text-gray-600 mt-1">{typeof proctor?.distractions === 'number' ? `You stayed focused with ${proctor.distractions} tab switches.` : 'Focus data not available.'}</div>
                </div>
                <div className="rounded-xl border border-emerald-300 bg-emerald-50 p-4 text-center">
                  <UserRound className="w-6 h-6 mx-auto text-emerald-600" />
                  <div className="mt-2 text-xs font-medium text-emerald-700">Single Person Detected</div>
                  <div className="text-xs text-gray-600 mt-1">{typeof proctor?.peopleCount === 'number' ? `Detected ${proctor.peopleCount} face(s) during session.` : 'Face detection not available.'}</div>
                </div>
                <div className="rounded-xl border border-emerald-300 bg-emerald-50 p-4 text-center">
                  <Smile className="w-6 h-6 mx-auto text-emerald-600" />
                  <div className="mt-2 text-xs font-medium text-emerald-700">{proctor?.expression || 'Good'}</div>
                  <div className="text-xs text-gray-600 mt-1">Facial expressions showed focus and interest.</div>
                </div>
              </div>
            </section>
          )}

          {/* Answers */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-semibold text-gray-900">Answers</h4>
            </div>
            {answers.length === 0 ? (
              <div className="text-center py-12 text-gray-500">No answers recorded for this interview.</div>
            ) : (
              <div className="space-y-3">
                {answers.map((ans, idx) => (
                  <div key={ans.id || idx} className="border rounded-xl p-4 bg-gray-50">
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="font-medium text-gray-800">Q{idx + 1}</h5>
                      <span className="text-xs text-gray-500">{ans?.created_at ? new Date(ans.created_at).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) : '—'}</span>
                    </div>
                    <div className="text-sm text-gray-700">
                      <p className="mb-1"><span className="font-semibold">Answer:</span> {ans?.answer_text?.trim() ? ans.answer_text : '—'}</p>
                      <p className=""><span className="font-semibold">AI Feedback:</span> {ans?.ai_response?.trim() ? ans.ai_response : '—'}</p>
                    </div>
                    <div className="mt-2 text-xs text-gray-600">Rating: {typeof ans?.rating === 'number' ? `${ans.rating}/10` : '—'}</div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Footer */}
        <div className="p-4 border-t flex justify-end bg-gray-50">
          <button onClick={onClose} className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-white">Close</button>
        </div>
      </div>
    </div>
  );
};

export default AnswerReportModal;

import React, { useState } from 'react';
import { DAYS, COURSEWORK_AREAS, RETENTION_AREAS, isDayMatch } from '../constants';

// ─── 내부 헬퍼 컴포넌트 ──────────────────────────────────────────────────────

function Section({ title, children }) {
    return (
        <div className="space-y-2">
            <h3 className="text-xs font-black text-zinc-500 uppercase tracking-wider">{title}</h3>
            <div className="space-y-2">
                {children}
            </div>
        </div>
    );
}

function InfoRow({ label, value }) {
    return (
        <div className="flex items-start gap-3 py-2 border-b border-zinc-100 last:border-0">
            <span className="text-xs font-bold text-zinc-500 w-24 shrink-0">{label}</span>
            <div className="text-sm font-medium text-zinc-900 flex-1">{value || '-'}</div>
        </div>
    );
}

function StatusBadge({ label, value, color }) {
    const colors = {
        green:  value ? 'bg-emerald-100 text-emerald-700 border-emerald-300' : 'bg-zinc-50 text-zinc-400 border-zinc-200',
        yellow: value ? 'bg-amber-100 text-amber-700 border-amber-300'   : 'bg-zinc-50 text-zinc-400 border-zinc-200',
        red:    value ? 'bg-rose-100 text-rose-700 border-rose-300'       : 'bg-zinc-50 text-zinc-400 border-zinc-200',
    };
    return (
        <div className={`px-3 py-2 rounded-lg border text-center text-xs font-bold ${colors[color]}`}>
            {label}
        </div>
    );
}

function CheckIcon({ checked }) {
    if (checked === 'none' || !checked) return <span className="text-zinc-300">○</span>;
    if (checked === 'check') return <span className="text-emerald-600">✓</span>;
    if (checked === 'cross') return <span className="text-rose-600">✗</span>;
    return <span className="text-zinc-300">-</span>;
}

function CheckStatusGrid({ step1, step2, stepNext, areas }) {
    return (
        <div className="grid grid-cols-4 gap-2 text-[10px]">
            <div className="font-black text-zinc-500 uppercase">Area</div>
            <div className="font-black text-zinc-500 uppercase text-center">1st</div>
            <div className="font-black text-zinc-500 uppercase text-center">2nd</div>
            <div className="font-black text-zinc-500 uppercase text-center">Next</div>

            {areas.map(area => (
                <React.Fragment key={area.key}>
                    <div className="font-bold text-zinc-700">{area.label}</div>
                    <div className="text-center">
                        {step1?.[area.key] ? <CheckIcon checked={step1[area.key]} /> : '-'}
                    </div>
                    <div className="text-center">
                        {step2?.[area.key] ? <CheckIcon checked={step2[area.key]} /> : '-'}
                    </div>
                    <div className="text-center">
                        {stepNext?.[area.key] ? <CheckIcon checked={stepNext[area.key]} /> : '-'}
                    </div>
                </React.Fragment>
            ))}
        </div>
    );
}

// ─── ProfileModal ─────────────────────────────────────────────────────────────

/**
 * 학생 상세 프로필 슬라이드 패널
 *
 * @param {object}   student        - 학생 세션 객체
 * @param {boolean}  show           - 표시 여부
 * @param {Function} onClose        - 닫기 핸들러
 * @param {Function} onUpdate       - 학생 데이터 업데이트 핸들러 (updated session 전달)
 * @param {string}   todayName      - 오늘 요일 (예: '화')
 * @param {boolean}  [showHighlight=true] - 오늘 요일 강조 여부
 */
export default function ProfileModal({ student, show, onClose, onUpdate, todayName, showHighlight = true }) {
    const [pendingTasks, setPendingTasks] = useState('');

    if (!show || !student) return null;

    const handleSaveTasks = () => {
        if (pendingTasks.trim()) {
            const updated = {
                ...student,
                checks: {
                    ...student.checks,
                    memos: {
                        ...student.checks?.memos,
                        pendingTasks: pendingTasks.trim(),
                    },
                },
            };
            onUpdate(updated);
            setPendingTasks('');
        }
    };

    return (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex justify-end z-[100]" onClick={onClose}>
            <div
                className="bg-white w-full max-w-[400px] h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="bg-zinc-900 px-6 py-6 flex items-center justify-between shrink-0">
                    <div>
                        <h2 className="text-xl font-black text-white tracking-tight">{student.name}</h2>
                        <p className="text-sm font-medium text-zinc-300 mt-0.5">
                            {student.schoolName} {student.grade} {student.classes?.[0] && `/ ${student.classes[0]}`}
                        </p>
                    </div>
                    <button onClick={onClose} className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all">
                        <span className="text-white text-xl font-bold">×</span>
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-5">
                    {/* Basic Info */}
                    <Section title="기본 정보">
                        <InfoRow label="소속" value={student.department || '-'} />
                        <InfoRow label="학번" value={student.studentId || '-'} />
                        <InfoRow label="스케줄" value={
                            <div className="flex flex-col gap-2">
                                <div className="flex gap-1.5 items-center justify-center">
                                    {DAYS.map(d => {
                                        const isReg   = isDayMatch(student.attendanceDays, d);
                                        const isSpec  = isDayMatch(student.specialDays, d);
                                        const isExtra = isDayMatch(student.extraDays, d);
                                        const count   = [isReg, isSpec, isExtra].filter(Boolean).length;

                                        let bg = 'bg-transparent text-zinc-300 border border-zinc-100';
                                        if (count >= 2)  bg = 'bg-black text-white border-black';
                                        else if (isReg)  bg = 'bg-emerald-500 text-white border-emerald-500';
                                        else if (isSpec) bg = 'bg-indigo-600 text-white border-indigo-600';
                                        else if (isExtra) bg = 'bg-orange-500 text-white border-orange-500';

                                        const isToday = showHighlight && d === todayName;
                                        const size = isToday ? 'w-8 h-8 text-[12px]' : 'w-7 h-7 text-[11px]';
                                        return (
                                            <div key={d} className={`${size} rounded-md flex items-center justify-center font-black ${bg} border ${isToday ? 'border-zinc-900 border-2 shadow-md' : ''} transition-all`}>
                                                {d}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        } />
                    </Section>

                    {/* Attendance Status */}
                    <Section title="출석 현황">
                        <div className="grid grid-cols-3 gap-2">
                            <StatusBadge label="출석" value={student.status === 'attendance'} color="green" />
                            <StatusBadge label="지각" value={student.status === 'late'}       color="yellow" />
                            <StatusBadge label="결석" value={student.status === 'absent'}     color="red" />
                        </div>
                    </Section>

                    {/* Coursework Status */}
                    {(student.checks?.homework1 || student.checks?.homework2 || student.checks?.homeworkNext) && (
                        <Section title="Coursework 현황">
                            <CheckStatusGrid
                                step1={student.checks?.homework1}
                                step2={student.checks?.homework2}
                                stepNext={student.checks?.homeworkNext}
                                areas={COURSEWORK_AREAS}
                            />
                        </Section>
                    )}

                    {/* Retention Status */}
                    {(student.checks?.retention1 || student.checks?.retention2 || student.checks?.retentionNext) && (
                        <Section title="Retention 현황">
                            <CheckStatusGrid
                                step1={student.checks?.retention1}
                                step2={student.checks?.retention2}
                                stepNext={student.checks?.retentionNext}
                                areas={RETENTION_AREAS}
                            />
                        </Section>
                    )}

                    {/* Memos */}
                    {student.checks?.memos?.toDesk && (
                        <Section title="메모">
                            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                                <p className="text-sm text-amber-900 whitespace-pre-wrap">{student.checks.memos.toDesk}</p>
                            </div>
                        </Section>
                    )}

                    {/* Pending Tasks */}
                    {student.checks?.memos?.pendingTasks && (
                        <Section title="Pending Tasks">
                            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                <p className="text-sm text-blue-900 whitespace-pre-wrap">{student.checks.memos.pendingTasks}</p>
                            </div>
                        </Section>
                    )}

                    {/* Pending Tasks Input */}
                    <Section title="Pending Tasks 추가">
                        <div className="space-y-2">
                            <textarea
                                value={pendingTasks}
                                onChange={e => setPendingTasks(e.target.value)}
                                placeholder="새로운 pending task를 입력하세요..."
                                className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                                rows={3}
                            />
                            <button
                                onClick={handleSaveTasks}
                                disabled={!pendingTasks.trim()}
                                className="w-full px-4 py-2 bg-indigo-600 text-white text-sm font-bold rounded-lg hover:bg-indigo-700 disabled:bg-zinc-300 disabled:cursor-not-allowed transition-all"
                            >
                                저장
                            </button>
                        </div>
                    </Section>
                </div>
            </div>
        </div>
    );
}

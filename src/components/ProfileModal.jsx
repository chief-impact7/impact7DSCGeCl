import React, { useState, useRef } from 'react';
import { COURSEWORK_AREAS, RETENTION_AREAS } from '../constants';

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


const ATTENDANCE_OPTIONS = [
    { value: 'attendance', label: '출석', bg: 'bg-[#84994F] text-white' },
    { value: 'late',       label: '지각', bg: 'bg-[#FCB53B] text-white' },
    { value: 'absent',     label: '결석', bg: 'bg-[#B45253] text-white' },
];

function StatusDots({ stepData, areas }) {
    return (
        <div className="flex gap-1">
            {areas.map(area => {
                const val = stepData?.[area.key];
                let bg = 'bg-zinc-100 text-zinc-400';
                if (val === 'o')        bg = 'bg-[#84994F] text-white';
                else if (val === 'triangle') bg = 'bg-[#FCB53B] text-white';
                else if (val === 'x')   bg = 'bg-[#B45253] text-white';
                return (
                    <div key={area.key} className={`w-4 h-4 rounded flex items-center justify-center text-[9px] font-black ${bg}`}>
                        {area.label}
                    </div>
                );
            })}
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
export default function ProfileModal({ student, show, onClose, onUpdate, todayName, showHighlight = true, currentUser = '' }) {
    const [newTask, setNewTask] = useState({ date: '', time: '', reason: '', author: '' });
    const [isRescheduling, setIsRescheduling] = useState(false);
    const addTaskRef = useRef(null);

    if (!show || !student) return null;

    // 기존 resolved:true 데이터를 status:'done'으로 정규화
    const taskList = (student.checks?.memos?.taskList || []).map(t => ({
        ...t,
        status: t.status || (t.resolved ? 'done' : 'pending'),
    }));
    const pendingCount = taskList.filter(t => t.status !== 'done').length;

    const saveTaskList = (updatedList) => {
        onUpdate({
            ...student,
            checks: { ...student.checks, memos: { ...student.checks?.memos, taskList: updatedList } },
        });
    };

    // ── 상태 토글 (완료/미완료) ──
    const handleToggleStatus = (taskId, toggleTo) => {
        saveTaskList(taskList.map(t => {
            if (t.id !== taskId) return t;
            const next = t.status === toggleTo ? 'pending' : toggleTo;
            return {
                ...t,
                status: next,
                resolvedBy: next === 'done' ? currentUser : t.resolvedBy,
                resolvedAt: next === 'done' ? new Date().toLocaleString('ko-KR') : t.resolvedAt,
            };
        }));
    };

    // ── 재연기 ──
    const handleReschedule = (task) => {
        setNewTask({ date: '', time: '', reason: task.reason, author: task.author || '' });
        setIsRescheduling(true);
        setTimeout(() => addTaskRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
    };

    // ── 과업 추가 ──
    const handleAddTask = () => {
        if (!newTask.reason.trim()) return;
        const task = {
            id: Date.now(),
            date: newTask.date || new Date().toISOString().slice(0, 10),
            time: newTask.time || '',
            reason: newTask.reason.trim(),
            author: newTask.author.trim(),
            status: 'pending',
        };
        saveTaskList([...taskList, task]);
        setNewTask({ date: '', time: '', reason: '', author: '' });
        setIsRescheduling(false);
    };

    const hasCoursework = student.checks?.homework1 || student.checks?.homework2;
    const hasRetention  = student.checks?.retention1 || student.checks?.retention2;

    const schoolInfo = [student.schoolName, student.grade, student.classes?.[0]].filter(Boolean).join(' ');

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
                        <p className="text-sm font-medium text-zinc-300 mt-0.5">{schoolInfo || '-'}</p>
                    </div>
                    <button onClick={onClose} className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all">
                        <span className="text-white text-xl font-bold">×</span>
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-5">

                    {/* 출석 현황 - 한 줄 */}
                    <div className="flex items-center gap-3 py-1">
                        <span className="text-xs font-black text-zinc-500 uppercase tracking-wider shrink-0 w-20">출석 현황</span>
                        <div className="flex gap-1.5 flex-1">
                            {!student.status && (
                                <div className="flex-1 py-0.5 rounded text-center text-[10px] font-black bg-zinc-200 text-zinc-500">
                                    등원전
                                </div>
                            )}
                            {ATTENDANCE_OPTIONS.map(opt => (
                                <div
                                    key={opt.value}
                                    className={`flex-1 py-0.5 rounded text-center text-[10px] font-black ${
                                        student.status === opt.value
                                            ? opt.bg
                                            : 'bg-zinc-100 text-zinc-400'
                                    }`}
                                >
                                    {opt.label}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Coursework - 1차/2차/Next */}
                    {hasCoursework && (
                        <div className="space-y-1">
                            <span className="text-xs font-black text-zinc-500 uppercase tracking-wider">Coursework</span>
                            <div className="flex items-center gap-1">
                                <span className="text-[10px] font-bold text-zinc-400 w-4 shrink-0">1차</span>
                                <StatusDots stepData={student.checks?.homework1} areas={COURSEWORK_AREAS} />
                                <span className="ml-10 text-[10px] font-black text-zinc-400">Next</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <span className="text-[10px] font-bold text-zinc-400 w-4 shrink-0">2차</span>
                                <StatusDots stepData={student.checks?.homework2} areas={COURSEWORK_AREAS} />
                                <div className="ml-10 flex gap-1">
                                    {COURSEWORK_AREAS.map(area => {
                                        const val = student.checks?.homeworkNext?.[area.key];
                                        return (
                                            <div key={area.key} className={`w-4 h-4 rounded flex items-center justify-center text-[9px] font-black ${val ? 'bg-[#84994F] text-white' : 'bg-zinc-100 text-zinc-400'}`}>
                                                {area.label}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Retention - 1차/2차 */}
                    {hasRetention && (
                        <div className="space-y-1.5">
                            <span className="text-xs font-black text-zinc-500 uppercase tracking-wider">Retention</span>
                            <div className="flex items-center gap-3">
                                <span className="text-[10px] font-bold text-zinc-400 w-4 shrink-0">1차</span>
                                <StatusDots stepData={student.checks?.retention1} areas={RETENTION_AREAS} />
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-[10px] font-bold text-zinc-400 w-4 shrink-0">2차</span>
                                <StatusDots stepData={student.checks?.retention2} areas={RETENTION_AREAS} />
                            </div>
                        </div>
                    )}

                    {/* 메모 */}
                    {student.checks?.memos?.toDesk && (
                        <Section title="메모">
                            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                                <p className="text-sm text-amber-900 whitespace-pre-wrap">{student.checks.memos.toDesk}</p>
                            </div>
                        </Section>
                    )}

                    {/* 구분선 */}
                    <div className="border-t-2 border-zinc-200 mt-6 mb-4" />

                    {/* 밀린 과업 */}
                    <Section title={`밀린 과업 (${pendingCount})`}>
                        {taskList.length === 0 ? (
                            <p className="text-xs text-zinc-400 py-2">현재 과업이 없습니다.</p>
                        ) : (
                            <div className="space-y-2">
                                {taskList.map(task => {
                                    const isDone       = task.status === 'done';
                                    const isIncomplete = task.status === 'incomplete';
                                    const cardBg = isDone
                                        ? 'bg-emerald-50 border-emerald-200'
                                        : isIncomplete
                                            ? 'bg-rose-50 border-rose-200'
                                            : 'bg-white border-zinc-200';
                                    return (
                                        <div key={task.id} className={`p-3 border rounded-xl shadow-sm ${cardBg}`}>
                                            <div className="flex items-start gap-2">
                                                {/* 내용 */}
                                                <div className="flex-1 min-w-0">
                                                    <p className={`text-sm font-bold ${isDone ? 'line-through text-zinc-400' : 'text-zinc-800'}`}>
                                                        {task.reason}
                                                    </p>
                                                    <p className="text-[10px] text-zinc-400 mt-0.5">
                                                        {[task.date, task.time].filter(Boolean).join(' ')}
                                                        {task.author && ` · ${task.author}`}
                                                        {task.status === 'done' && task.resolvedBy && (
                                                            <span className="ml-1 text-emerald-600 font-bold">· 완료: {task.resolvedBy}</span>
                                                        )}
                                                    </p>
                                                </div>
                                                {/* 버튼 */}
                                                <div className="flex gap-1 shrink-0" onClick={e => e.stopPropagation()}>
                                                    <button
                                                        onClick={() => handleToggleStatus(task.id, 'done')}
                                                        className={`text-[9px] font-black px-1.5 py-1 rounded transition-all ${isDone ? 'bg-[#84994F] text-white' : 'bg-zinc-100 text-zinc-400 hover:bg-zinc-200'}`}
                                                    >완료</button>
                                                    <button
                                                        onClick={() => handleToggleStatus(task.id, 'incomplete')}
                                                        className={`text-[9px] font-black px-1.5 py-1 rounded transition-all ${isIncomplete ? 'bg-[#B45253] text-white' : 'bg-zinc-100 text-zinc-400 hover:bg-zinc-200'}`}
                                                    >미완료</button>
                                                    <button
                                                        onClick={() => handleReschedule(task)}
                                                        className="text-[9px] font-black px-1.5 py-1 rounded bg-zinc-700 text-white hover:bg-zinc-900 transition-all"
                                                    >재연기</button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </Section>

                    {/* 과업 추가 */}
                    <div ref={addTaskRef}>
                        <Section title={isRescheduling ? '재연기 설정' : '과업 추가'}>
                            <div className="space-y-2">
                                {/* 재연기 모드: 이유 표시만 */}
                                {isRescheduling ? (
                                    <div className="px-3 py-2 bg-zinc-100 rounded-lg">
                                        <p className="text-[10px] font-bold text-zinc-500 mb-0.5">이유</p>
                                        <p className="text-xs font-bold text-zinc-700">{newTask.reason}</p>
                                    </div>
                                ) : (
                                    <div>
                                        <label className="text-[10px] font-bold text-zinc-500 block mb-1">이유 *</label>
                                        <textarea
                                            value={newTask.reason}
                                            onChange={e => setNewTask(t => ({ ...t, reason: e.target.value }))}
                                            placeholder="과업 이유를 입력하세요..."
                                            rows={2}
                                            className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                                        />
                                    </div>
                                )}
                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <label className="text-[10px] font-bold text-zinc-500 block mb-1">날짜</label>
                                        <input
                                            type="date"
                                            value={newTask.date}
                                            onChange={e => setNewTask(t => ({ ...t, date: e.target.value }))}
                                            className="w-full px-2 py-1.5 text-xs border border-zinc-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold text-zinc-500 block mb-1">시간</label>
                                        <input
                                            type="time"
                                            value={newTask.time}
                                            onChange={e => setNewTask(t => ({ ...t, time: e.target.value }))}
                                            className="w-full px-2 py-1.5 text-xs border border-zinc-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                        />
                                    </div>
                                </div>
                                {!isRescheduling && (
                                    <div>
                                        <label className="text-[10px] font-bold text-zinc-500 block mb-1">작성자</label>
                                        <input
                                            type="text"
                                            value={newTask.author}
                                            onChange={e => setNewTask(t => ({ ...t, author: e.target.value }))}
                                            placeholder="작성자 이름"
                                            className="w-full px-2 py-1.5 text-xs border border-zinc-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                        />
                                    </div>
                                )}
                                <div className="flex gap-2">
                                    {isRescheduling && (
                                        <button
                                            onClick={() => { setIsRescheduling(false); setNewTask({ date: '', time: '', reason: '', author: '' }); }}
                                            className="flex-1 px-4 py-2 bg-zinc-200 text-zinc-600 text-sm font-bold rounded-lg hover:bg-zinc-300 transition-all"
                                        >
                                            취소
                                        </button>
                                    )}
                                    <button
                                        onClick={handleAddTask}
                                        disabled={!newTask.reason.trim()}
                                        className="flex-1 px-4 py-2 bg-indigo-600 text-white text-sm font-bold rounded-lg hover:bg-indigo-700 disabled:bg-zinc-300 disabled:cursor-not-allowed transition-all"
                                    >
                                        {isRescheduling ? '재연기 등록' : '과업 추가'}
                                    </button>
                                </div>
                            </div>
                        </Section>
                    </div>
                </div>
            </div>
        </div>
    );
}

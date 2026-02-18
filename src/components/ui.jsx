/**
 * ui.jsx — Dashboard 공유 UI 프리미티브
 *
 * Dashboard.jsx 에서 분리된 소형 stateless 컴포넌트 모음입니다.
 * 각각 named export 로 제공됩니다.
 *
 * 포함:
 *   NavItem, SubNavItem, ImportPanel, FormRow, SectionDivider,
 *   SidebarInput, MemoIndicator, StatusButtons, EmptyState,
 *   FilterSelect, DayPicker
 */

import { ChevronDown, MessageSquare, Search } from 'lucide-react';
import { DAYS } from '../constants';
import { toast } from 'sonner';

// ─── 네비게이션 ───────────────────────────────────────────────────────────────

/** 사이드바 메인 네비게이션 아이템 */
export function NavItem({ icon, label, active, onClick, hasDropdown, isExpanded }) {
    return (
        <div
            onClick={onClick}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all ${active ? 'bg-zinc-100 text-black shadow-sm' : 'text-muted-foreground hover:text-foreground hover:bg-zinc-50'}`}
        >
            <div className={active ? 'text-black' : 'text-muted-foreground'}>{icon}</div>
            <span className="text-sm font-bold truncate flex-1">{label}</span>
            {hasDropdown && (
                <ChevronDown
                    size={14}
                    className={`transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                />
            )}
        </div>
    );
}

/** 사이드바 서브 네비게이션 아이템 */
export function SubNavItem({ label, active, onClick }) {
    return (
        <div
            onClick={onClick}
            className={`px-3 py-2 rounded-lg text-[11px] font-bold cursor-pointer transition-all ${active ? 'bg-black text-white' : 'text-zinc-400 hover:text-black hover:bg-zinc-50'}`}
        >
            {label}
        </div>
    );
}

// ─── Import 패널 ──────────────────────────────────────────────────────────────

/** Import 사이드바 아코디언 패널 */
export function ImportPanel({ label, icon, open, onToggle, children }) {
    return (
        <div className={`group rounded-xl transition-all duration-200 overflow-hidden ${open ? 'bg-zinc-50' : 'hover:bg-zinc-50'}`}>
            <button
                onClick={onToggle}
                className="w-full h-11 flex items-center justify-between px-4 py-3 text-left bg-white hover:bg-zinc-50/50 transition-colors"
            >
                <div className="flex items-center gap-3">
                    <div className={`w-7 h-7 rounded-md flex items-center justify-center transition-colors ${open ? 'bg-black text-white' : 'text-zinc-400 group-hover:text-black'}`}>
                        {icon}
                    </div>
                    <span className={`text-[12px] font-bold transition-colors ${open ? 'text-black' : 'text-zinc-500 group-hover:text-black'}`}>
                        {label}
                    </span>
                </div>
                <ChevronDown
                    size={14}
                    className={`text-zinc-300 transition-transform duration-300 ${open ? 'rotate-180 text-black' : 'group-hover:text-zinc-500'}`}
                />
            </button>
            {open && children}
        </div>
    );
}

// ─── 폼 프리미티브 ────────────────────────────────────────────────────────────

/** 폼 행 (라벨 + children) */
export function FormRow({ label, children }) {
    return (
        <div className="space-y-1">
            <label className="text-[10px] font-bold text-zinc-500 uppercase ml-1">{label}</label>
            {children}
        </div>
    );
}

/** 섹션 구분선 */
export function SectionDivider({ label }) {
    return (
        <p className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-widest mb-2 flex items-center gap-2 px-1 py-1">
            <span className="h-[1px] flex-1 bg-zinc-100" />
            {label}
            <span className="h-[1px] flex-1 bg-zinc-100" />
        </p>
    );
}

/** 사이드바 텍스트 인풋 */
export function SidebarInput({ ...props }) {
    return (
        <input
            {...props}
            className="w-full bg-white border border-border rounded-lg px-3 py-2 text-[11px] text-foreground focus:outline-none focus:ring-1 focus:ring-black/10 transition-all font-medium placeholder:text-muted-foreground/30 shadow-sm"
        />
    );
}

// ─── 학생 행 UI ───────────────────────────────────────────────────────────────

/** 메모 존재 시 표시되는 인디케이터 버튼 */
export function MemoIndicator({ student, onClick }) {
    if (!student.checks?.memos?.toDesk) return null;
    return (
        <button
            onClick={e => { e.stopPropagation(); onClick(); }}
            className="w-5 h-5 rounded-full flex items-center justify-center text-indigo-500 hover:bg-indigo-50 transition-all relative shrink-0"
        >
            <MessageSquare size={12} fill="currentColor" fillOpacity={0.2} />
            <div className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-indigo-600 rounded-full border border-white" />
        </button>
    );
}

/** 출석 상태(P/L/A) 버튼 그룹 */
export function StatusButtons({ session, readOnly, onStatus, labels = ['P', 'L', 'A'] }) {
    const configs = [
        { status: 'attendance', color: '#84994F' },
        { status: 'late',       color: '#FCB53B' },
        { status: 'absent',     color: '#B45253' },
    ];
    return (
        <div className="flex items-center gap-1.5" onClick={e => e.stopPropagation()}>
            {configs.map(({ status, color }, i) => (
                <button
                    key={status}
                    onClick={() => {
                        if (readOnly) {
                            toast.warning('이 뷰에서는 출석 상태를 변경할 수 없습니다.');
                            return;
                        }
                        onStatus(status);
                    }}
                    className={`h-7 px-2.5 rounded-lg text-[10px] font-black transition-all border ${session.status === status ? 'text-white border-transparent' : 'bg-zinc-100/50 text-zinc-400 border-zinc-200/50 hover:bg-white hover:border-zinc-300'} ${readOnly ? 'cursor-not-allowed opacity-80' : ''}`}
                    style={session.status === status ? { backgroundColor: color } : {}}
                >
                    {labels[i]}
                </button>
            ))}
        </div>
    );
}

// ─── 빈 상태 ─────────────────────────────────────────────────────────────────

/** 학생 목록이 비어있을 때 표시되는 EmptyState */
export function EmptyState({ sessions, todayName, filters, searchQuery, onImport, onMaster, onClearFilters }) {
    const hasActiveFilters =
        filters.departments.length > 0 ||
        filters.grades.length > 0 ||
        filters.class !== 'All' ||
        filters.school !== 'All' ||
        (searchQuery || '') !== '';

    return (
        <div className="flex flex-col items-center justify-center py-20 px-8 text-center bg-zinc-50/50 rounded-3xl border border-dashed border-zinc-200 m-8">
            <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-6 ring-1 ring-zinc-100">
                <Search size={32} className="text-zinc-200" />
            </div>
            <h3 className="text-sm font-bold text-zinc-900 mb-2">찾으시는 학생이 없나요?</h3>
            <p className="text-[11px] text-zinc-500 max-w-[240px] leading-relaxed mb-8">
                {hasActiveFilters
                    ? '활성화된 필터나 검색어로 인해 학생이 표시되지 않을 수 있습니다. 필터를 초기화하거나 스테이징에서 데이터를 가져와보세요.'
                    : '오늘 등원하는 학생이 아직 없습니다. 스테이징(Import Hub)에서 데이터를 가져오거나 마스터 목록에서 명단을 확인해보세요.'}
            </p>
            <div className="flex gap-3">
                <button
                    onClick={onMaster}
                    className="h-10 px-6 bg-white border border-zinc-200 rounded-xl text-[12px] font-black hover:bg-zinc-50 transition-all shadow-sm"
                >
                    Master List 보기
                </button>
                <button
                    onClick={onImport}
                    className="h-10 px-6 bg-black text-white rounded-xl text-[12px] font-black hover:bg-zinc-800 transition-all shadow-lg shadow-black/10"
                >
                    데이터 임포트하기
                </button>
            </div>
        </div>
    );
}

// ─── 필터 / 요일 선택 ─────────────────────────────────────────────────────────

/** 드롭다운 필터 셀렉트 */
export function FilterSelect({ label, value, options, onChange }) {
    return (
        <div className="space-y-1">
            <label className="text-[9px] font-bold text-muted-foreground uppercase ml-1">{label}</label>
            <select
                value={value}
                onChange={e => onChange(e.target.value)}
                className="w-full bg-white border border-border rounded-lg px-2.5 py-1.5 text-[11px] text-foreground focus:outline-none focus:ring-1 focus:ring-black/10 transition-all cursor-pointer font-medium shadow-sm"
            >
                {options.map(opt => (
                    <option key={opt} value={opt}>
                        {opt === 'All' ? `All ${label}s` : opt}
                    </option>
                ))}
            </select>
        </div>
    );
}

/** 요일 토글 선택기 (Import 폼용 — 소형) */
export function DayPicker({ selectedDays, onToggle }) {
    return (
        <div className="flex justify-between bg-zinc-50 p-1 rounded-lg border border-border">
            {DAYS.map(d => (
                <button
                    key={d}
                    onClick={() => onToggle(d)}
                    className={`w-6 h-6 rounded flex items-center justify-center text-[10px] font-black transition-all ${selectedDays.includes(d) ? 'bg-black text-white shadow-md' : 'text-muted-foreground hover:bg-white hover:text-black'}`}
                >
                    {d}
                </button>
            ))}
        </div>
    );
}

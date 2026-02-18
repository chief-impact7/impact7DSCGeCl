import { Clock, Zap, Plus, Save } from 'lucide-react';
import { DAYS } from '../constants';

/**
 * Import Hub 상단 일괄 스케줄 입력 툴바
 *
 * 정규(검정) / 특강(남색) / 임의(오렌지) 요일 선택과 시간 입력을 제공하고,
 * 각각 "입력" 버튼으로 선택된 학생들에게 일괄 적용합니다.
 * 우측 "서버에 저장(COMMIT)" 버튼으로 스테이징 데이터를 IDB에 커밋합니다.
 *
 * @param {string[]}   batchDays
 * @param {Function}   setBatchDays
 * @param {string}     batchTime
 * @param {Function}   setBatchTime
 * @param {string[]}   specialDays
 * @param {Function}   setSpecialDays
 * @param {string}     specialTime
 * @param {Function}   setSpecialTime
 * @param {string[]}   arbitraryDays
 * @param {Function}   setArbitraryDays
 * @param {string}     startDate
 * @param {Function}   setStartDate
 * @param {string}     endDate
 * @param {Function}   setEndDate
 * @param {Function}   onApplyRegular
 * @param {Function}   onApplySpecial
 * @param {Function}   onApplyArbitrary
 * @param {Function}   onCommit
 */
export default function ScheduleToolbar({
    batchDays, setBatchDays, batchTime, setBatchTime,
    specialDays, setSpecialDays, specialTime, setSpecialTime,
    arbitraryDays, setArbitraryDays,
    startDate, setStartDate, endDate, setEndDate,
    onApplyRegular, onApplySpecial, onApplyArbitrary, onCommit,
}) {
    return (
        <div className="flex gap-4 items-stretch">
            <div className="flex-1 bg-white/80 p-1.5 rounded-2xl border border-zinc-100 shadow-sm flex flex-col gap-0.5">
                {/* 정규 줄 */}
                <div className="flex items-center justify-between pl-2 pr-1 py-0.5">
                    <div className="flex items-center gap-4">
                        <div className="flex gap-0.5">
                            {DAYS.map(d => (
                                <button
                                    key={d}
                                    onClick={() => setBatchDays(p => p.includes(d) ? p.filter(x => x !== d) : [...p, d])}
                                    className={`w-6 h-6 rounded flex items-center justify-center text-[10px] font-black transition-all border ${batchDays.includes(d) ? 'bg-black text-white border-black ring-2 ring-black/5' : 'bg-transparent text-zinc-300 border-zinc-100 hover:text-black hover:border-black/40'}`}
                                >
                                    {d}
                                </button>
                            ))}
                        </div>
                        <div className="h-4 w-[1px] bg-zinc-100" />
                        <input
                            type="time"
                            value={batchTime}
                            onChange={e => setBatchTime(e.target.value)}
                            className={`h-6 px-1.5 border border-zinc-100 rounded text-[10px] font-bold focus:outline-none bg-zinc-50/50 ${batchTime ? 'text-black' : 'text-zinc-400'}`}
                        />
                    </div>
                    <button
                        onClick={onApplyRegular}
                        className="h-6 px-3 bg-black text-white rounded-md text-[9px] font-black transition-all flex items-center gap-1.5 shadow-sm hover:scale-105 active:scale-95"
                    >
                        <Clock size={10} /> 정규 입력
                    </button>
                </div>

                {/* 특강 줄 */}
                <div className="flex items-center justify-between pl-2 pr-1 py-0.5 border-t border-zinc-50/50">
                    <div className="flex items-center gap-4">
                        <div className="flex gap-0.5">
                            {DAYS.map(d => (
                                <button
                                    key={d}
                                    onClick={() => setSpecialDays(p => p.includes(d) ? p.filter(x => x !== d) : [...p, d])}
                                    className={`w-6 h-6 rounded flex items-center justify-center text-[10px] font-black transition-all border ${specialDays.includes(d) ? 'bg-indigo-600 text-white border-indigo-600 ring-2 ring-indigo-500/10' : 'bg-transparent text-indigo-100 border-indigo-50 hover:text-indigo-600 hover:border-indigo-400'}`}
                                >
                                    {d}
                                </button>
                            ))}
                        </div>
                        <div className="h-4 w-[1px] bg-indigo-50" />
                        <div className="flex items-center gap-2">
                            <input
                                type="time"
                                value={specialTime}
                                onChange={e => setSpecialTime(e.target.value)}
                                className={`h-6 px-1.5 border border-indigo-50/50 rounded text-[10px] font-bold focus:outline-none bg-indigo-50/30 ${specialTime ? 'text-indigo-600' : 'text-indigo-200'}`}
                            />
                            <div className="flex items-center gap-1">
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={e => setStartDate(e.target.value)}
                                    className={`h-6 px-1 border border-indigo-50/50 rounded text-[9px] font-bold focus:outline-none bg-indigo-50/30 min-w-[95px] ${startDate ? 'text-indigo-600' : 'text-indigo-200'}`}
                                />
                                <span className="text-[10px] text-indigo-100">-</span>
                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={e => setEndDate(e.target.value)}
                                    className={`h-6 px-1 border border-indigo-50/50 rounded text-[9px] font-bold focus:outline-none bg-indigo-50/30 min-w-[95px] ${endDate ? 'text-indigo-600' : 'text-indigo-200'}`}
                                />
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={onApplySpecial}
                        className="h-6 px-3 bg-indigo-600 text-white rounded-md text-[9px] font-black transition-all flex items-center gap-1.5 shadow-sm hover:scale-105 active:scale-95"
                    >
                        <Zap size={10} /> 특강 입력
                    </button>
                </div>

                {/* 임의 줄 */}
                <div className="flex items-center justify-between pl-2 pr-1 py-0.5 border-t border-zinc-50/50">
                    <div className="flex items-center gap-4">
                        <div className="flex gap-0.5">
                            {DAYS.map(d => (
                                <button
                                    key={d}
                                    onClick={() => setArbitraryDays(p => p.includes(d) ? p.filter(x => x !== d) : [...p, d])}
                                    className={`w-6 h-6 rounded flex items-center justify-center text-[10px] font-black transition-all border ${arbitraryDays.includes(d) ? 'bg-orange-500 text-white border-orange-500 shadow-md' : 'bg-transparent text-orange-100 border-orange-50 hover:text-orange-600 hover:border-orange-400'}`}
                                >
                                    {d}
                                </button>
                            ))}
                        </div>
                    </div>
                    <button
                        onClick={onApplyArbitrary}
                        className="h-6 px-3 bg-orange-500 text-white rounded-md text-[9px] font-black transition-all flex items-center gap-1.5 shadow-sm hover:scale-105 active:scale-95"
                    >
                        <Plus size={10} /> 임의 입력
                    </button>
                </div>
            </div>

            {/* 서버 저장 버튼 (우측에 통합) */}
            <button
                onClick={onCommit}
                className="w-32 bg-gradient-to-br from-indigo-600 to-violet-700 hover:from-indigo-700 hover:to-violet-800 text-white rounded-2xl flex flex-col items-center justify-center gap-2 shadow-xl shadow-indigo-200 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
                <Save size={20} />
                <span className="font-black text-[12px] uppercase tracking-wider text-center px-2 leading-tight">서버에 저장</span>
                <div className="px-2 py-0.5 bg-white/20 rounded-full text-[8px] font-bold">COMMIT</div>
            </button>
        </div>
    );
}

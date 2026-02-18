import { DAYS, isDayMatch } from '../constants';

/**
 * Import 테이블 / 출석 테이블의 스케줄 셀
 *
 * 정규(초록), 특강(남색), 임의(오렌지), 중복(검정) 컬러로 요일 아이콘을 표시합니다.
 *
 * @param {object}  student               - 학생 세션 객체 (attendanceDays, specialDays, extraDays 필드 사용)
 * @param {string}  todayName             - 오늘 요일 (예: '화')
 * @param {boolean} [showHighlight=true]  - 오늘 요일 확대·강조 여부 (Import 허브에서는 false)
 */
export default function ScheduleCell({ student: st, todayName, showHighlight = true }) {
    return (
        <div className="flex flex-col items-center gap-1">
            <div className="flex gap-0.5 justify-center items-center">
                {DAYS.map(d => {
                    const isReg   = isDayMatch(st.attendanceDays, d);
                    const isSpec  = isDayMatch(st.specialDays, d);
                    const isExtra = isDayMatch(st.extraDays, d);

                    const count = [isReg, isSpec, isExtra].filter(Boolean).length;

                    let bg = 'bg-transparent text-zinc-200 border-zinc-100';
                    if (count >= 2) bg = 'bg-black text-white border-black';
                    else if (isReg)   bg = 'bg-emerald-500 text-white border-emerald-500';
                    else if (isSpec)  bg = 'bg-indigo-600 text-white border-indigo-600';
                    else if (isExtra) bg = 'bg-orange-500 text-white border-orange-500';

                    const isToday   = showHighlight && d === todayName;
                    const size      = isToday ? 'w-5 h-5 text-[10px]' : 'w-4 h-4 text-[8px]';
                    const todayRing = isToday ? 'border-zinc-900 border-2 shadow-sm' : 'border';

                    return (
                        <span
                            key={d}
                            className={`${size} rounded-[3px] flex items-center justify-center font-black ${bg} ${todayRing} transition-all`}
                        >
                            {d}
                        </span>
                    );
                })}
            </div>
        </div>
    );
}

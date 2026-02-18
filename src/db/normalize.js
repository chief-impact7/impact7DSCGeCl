// ─── 배열 변환 유틸 ──────────────────────────────────────────────────────────

/**
 * 배열 또는 쉼표/공백 구분 문자열을 string[] 로 변환합니다.
 * @param {any} val
 * @returns {string[]}
 */
export function toArray(val) {
  if (Array.isArray(val)) {
    return val
      .flatMap(v =>
        typeof v === 'string'
          ? v.split(/[,/\s]+/).map(s => s.trim().replace(/['"\[\]]/g, ''))
          : v
      )
      .filter(Boolean);
  }
  if (typeof val === 'string' && val.trim()) {
    return val
      .split(/[,/\s]+/)
      .map(v => v.trim().replace(/['"\[\]]/g, ''))
      .filter(Boolean);
  }
  return [];
}

// ─── checks 정규화 ────────────────────────────────────────────────────────────

/**
 * checks 필드를 안전한 기본값으로 정규화합니다.
 * @param {object} checks
 * @returns {object}
 */
export function normalizeChecks(checks = {}) {
  return {
    basic: {
      voca: 'none', idiom: 'none', step3: 'none', isc: 'none',
      ...(checks.basic || {}),
    },
    homework: {
      reading: 'none', grammar: 'none', practice: 'none', listening: 'none', etc: 'none',
      ...(checks.homework || {}),
    },
    review: {
      reading: 'none', grammar: 'none', practice: 'none', listening: 'none',
      ...(checks.review || {}),
    },
    nextHomework: {
      reading: '', grammar: '', practice: '', listening: '', extra: '',
      ...(checks.nextHomework || {}),
    },
    memos: {
      toDesk: '', fromDesk: '', toParent: '',
      ...(checks.memos || {}),
    },
    homeworkResult:    checks.homeworkResult    ?? 'none',
    summaryConfirmed:  checks.summaryConfirmed  ?? false,
  };
}

// ─── 세션 정규화 ──────────────────────────────────────────────────────────────

/**
 * 세션 객체를 정규화합니다.
 * - 배열 타입 필드 보장
 * - 빈 문자열 정리
 * - 중복 방지용 _dedupeKey 추가
 *
 * @param {object} raw
 * @returns {Session}
 */
export function normalizeSession(raw) {
  return {
    ...raw,
    classes:        toArray(raw.classes),
    attendanceDays: toArray(raw.attendanceDays),
    specialDays:    toArray(raw.specialDays),
    extraDays:      toArray(raw.extraDays),
    parentPhones:   toArray(raw.parentPhones),
    studentPhones:  toArray(raw.studentPhones),
    department:     raw.department    || '기타',
    schoolName:     raw.schoolName    || '',
    grade:          raw.grade         || '',
    attendanceTime: raw.attendanceTime || '',
    checks:         normalizeChecks(raw.checks),
    _dedupeKey:     `${(raw.name || '').trim()}_${(toArray(raw.classes)[0] || '')}`,
  };
}

// ─── 빈 세션 생성 ────────────────────────────────────────────────────────────

/**
 * 입력 데이터로부터 빈 세션 객체를 생성합니다.
 * 항상 normalizeSession()을 거쳐 사용하세요.
 *
 * @param {object} data - 학생 기초 정보 (name, department, classes, schoolGrade 등)
 * @returns {object} 초기값이 채워진 raw 세션 객체
 */
export function createBlankSession(data) {
  const schoolParts = String(data.schoolGrade || '').split(' ');
  return {
    id: data.id || (Date.now().toString() + Math.random().toString(36).substring(2, 9)),
    studentId: 'st_' + Math.random().toString(36).substring(2, 7),
    name: (data.name || 'Unknown').trim(),
    department: data.department || '기타',
    parentPhones: data.parentPhones || [],
    studentPhones: data.studentPhones || [],
    classes: data.classes || ['Unassigned'],
    attendanceDays: data.attendanceDays || [],
    attendanceTime: data.attendanceTime || '',
    specialDays: data.specialDays || [],
    specialTime: data.specialTime || '',
    extraDays: data.extraDays || [],
    schoolName: schoolParts[0] || '',
    grade: schoolParts.slice(1).join(' ') || '',
    status: 'waiting',
    backlogCount: 0,
    lastEditedBy: 'Teacher Kim',
    checks: {
      basic:        { voca: 'none', idiom: 'none', step3: 'none', isc: 'none' },
      homework:     { reading: 'none', grammar: 'none', practice: 'none', listening: 'none', etc: 'none' },
      review:       { reading: 'none', grammar: 'none', practice: 'none', listening: 'none' },
      nextHomework: { reading: '', grammar: '', practice: '', listening: '', extra: '' },
      memos:        { toDesk: '', fromDesk: '', toParent: '' },
      homeworkResult: 'none',
      summaryConfirmed: false,
    },
  };
}

// ─── 중복 제거 ────────────────────────────────────────────────────────────────

/**
 * name + classes[0] 기준으로 중복 세션을 제거합니다.
 * 중복이면 updatedAt이 더 최근인 항목을 유지합니다.
 *
 * @param {Session[]} sessions
 * @returns {Session[]}
 */
export function deduplicateSessions(sessions) {
  const seen = new Map();
  for (const s of sessions) {
    const key = s._dedupeKey || `${(s.name || '').trim()}_${(toArray(s.classes)[0] || '')}`;
    if (!seen.has(key)) {
      seen.set(key, s);
    } else {
      const prev = seen.get(key);
      if ((s.updatedAt || '') > (prev.updatedAt || '')) {
        seen.set(key, s);
      }
    }
  }
  return Array.from(seen.values());
}

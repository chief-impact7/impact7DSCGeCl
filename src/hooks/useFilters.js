import { useState, useEffect, useCallback } from 'react';
import { filterStore } from '../db/metaStore';

const DEFAULT_FILTERS = { departments: [], grades: [], class: 'All', school: 'All' };

/**
 * 필터 + 핀 상태 훅.
 * - 초기 로드: IDB META → React state
 * - 핀이 켜져 있을 때만 필터 변경을 IDB에 저장
 * - setIsFilterPinned 는 실제로 toggleFilterPin 으로 노출 (IDB 저장 포함)
 */
export function useFilters() {
  const [filters,        setFilters]        = useState(DEFAULT_FILTERS);
  const [isFilterPinned, _setIsFilterPinned] = useState(false);
  const [isLoaded,       setIsLoaded]       = useState(false);

  // 초기 로드
  useEffect(() => {
    Promise.all([filterStore.load(), filterStore.loadPinned()]).then(([f, pinned]) => {
      setFilters(f);
      _setIsFilterPinned(pinned);
      setIsLoaded(true);
    });
  }, []);

  // 핀 활성 시 필터 변경 → IDB 저장
  useEffect(() => {
    if (!isLoaded || !isFilterPinned) return;
    filterStore.save(filters);
  }, [filters, isFilterPinned, isLoaded]);

  // 핀 토글 (IDB 저장 포함)
  const setIsFilterPinned = useCallback((pinned) => {
    _setIsFilterPinned(pinned);
    filterStore.savePinned(pinned);
    if (!pinned) filterStore.clear();
  }, []);

  // 필터 전체 초기화
  const clearFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
    _setIsFilterPinned(false);
    filterStore.clear();
    filterStore.savePinned(false);
  }, []);

  return {
    filters,
    setFilters,
    isFilterPinned,
    setIsFilterPinned,
    clearFilters,
  };
}

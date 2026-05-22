'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { format, parseISO, subDays } from 'date-fns';
import { ko } from 'date-fns/locale';
import { useAdminEventList } from '@/services/admin';
import { fillVisitorTrendRange, useVisitorTrend } from '@/app/admin/api/visitors';
import { useVisitorSnapshot } from '@/hooks/useVisitorCount';
import { SearchableSelect, type SearchableSelectOption } from '@/components/common/Dropdown/SearchableSelect';
import type { VisitorTrendItem } from '@/types/visitor';

const MAIN_EVENT_ID = 'MAIN';
const CHART_HEIGHT = 160;
const BAR_MAX_HEIGHT = 120;
/** 툴팁 중앙 정렬 시 좌우 잘림 방지 (대략 반폭 px) */
const TOOLTIP_HALF_WIDTH = 96;
const TOOLTIP_EDGE_PAD = 12;

const PERIOD_PRESETS = [
  { label: '7일', days: 6 },
  { label: '30일', days: 29 },
  { label: '1년', days: 364 },
] as const;

/** 이 일수 이하일 때 막대·라벨을 차트 전체 너비에 균등 배치 */
const EVEN_BAR_SPACING_MAX_DAYS = 45;

const LINE_PLOT_HEIGHT = BAR_MAX_HEIGHT;
const LINE_PAD = { top: 8, right: 6, bottom: 6, left: 6 } as const;

/** 균등 배치 시 기간 일수에 따른 막대 너비(슬롯 대비 %) */
function getEvenSpacingBarWidthPercent(dayCount: number): number {
  if (dayCount <= 7) return 82;
  if (dayCount <= 14) return 68;
  if (dayCount <= 21) return 56;
  if (dayCount <= 31) return 46;
  return 38;
}

function getLinePointPx(
  index: number,
  total: number,
  count: number,
  maxCount: number,
  width: number,
  height: number
) {
  const innerW = Math.max(0, width - LINE_PAD.left - LINE_PAD.right);
  const innerH = Math.max(0, height - LINE_PAD.top - LINE_PAD.bottom);
  const x =
    total <= 1
      ? LINE_PAD.left + innerW / 2
      : LINE_PAD.left + (innerW * index) / (total - 1);
  const y =
    LINE_PAD.top +
    innerH -
    (maxCount > 0 ? (count / maxCount) * innerH : 0);
  return { x, y };
}

function buildLinePathPx(
  trend: VisitorTrendItem[],
  maxCount: number,
  width: number,
  height: number
) {
  if (trend.length === 0 || width <= 0) return '';
  return trend
    .map((item, i) => {
      const { x, y } = getLinePointPx(i, trend.length, item.count, maxCount, width, height);
      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
    })
    .join(' ');
}

function buildLineAreaPathPx(
  trend: VisitorTrendItem[],
  maxCount: number,
  width: number,
  height: number
) {
  if (trend.length === 0 || width <= 0) return '';
  const line = buildLinePathPx(trend, maxCount, width, height);
  const first = getLinePointPx(0, trend.length, trend[0].count, maxCount, width, height);
  const last = getLinePointPx(
    trend.length - 1,
    trend.length,
    trend[trend.length - 1].count,
    maxCount,
    width,
    height
  );
  const baseline = height - LINE_PAD.bottom;
  return `${line} L ${last.x} ${baseline} L ${first.x} ${baseline} Z`;
}

/** 꺾은선 X축 라벨 — 최대 12개 균등 간격 */
function getLineChartAxisIndices(total: number, maxLabels = 12): number[] {
  if (total <= 1) return [0];
  if (total <= maxLabels) {
    return Array.from({ length: total }, (_, i) => i);
  }
  const indices: number[] = [0];
  const step = (total - 1) / (maxLabels - 1);
  for (let i = 1; i < maxLabels - 1; i++) {
    indices.push(Math.round(i * step));
  }
  indices.push(total - 1);
  return [...new Set(indices)].sort((a, b) => a - b);
}

const DATE_FIELD_BOX =
  'h-10 w-[10.5rem] min-w-[10.5rem] max-w-[10.5rem] shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-white';
const DATE_INPUT_CLASS =
  'box-border h-full w-full min-w-full max-w-full appearance-none bg-transparent px-3 text-sm tabular-nums text-slate-900 [color-scheme:light]';
const DATE_LABEL_CLASS =
  'flex w-[10.5rem] min-w-[10.5rem] shrink-0 flex-col gap-1 text-xs font-medium text-slate-600';

function toDateInputValue(d: Date) {
  return format(d, 'yyyy-MM-dd');
}

function formatChartDate(date: string) {
  try {
    return format(parseISO(date), 'yyyy.MM.dd (EEE)', { locale: ko });
  } catch {
    return date;
  }
}

/** 목록 행용 — 대시보드 다른 블록과 동일한 날짜 표기 */
function formatListDate(date: string) {
  try {
    return parseISO(date).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  } catch {
    return date;
  }
}

function formatAxisDate(date: string) {
  try {
    return format(parseISO(date), 'M/d', { locale: ko });
  } catch {
    return date.slice(5);
  }
}

function PanelMessage({ label }: { label: string }) {
  return (
    <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 py-16 text-center text-sm text-slate-500">
      {label}
    </div>
  );
}

interface VisitorTrendPanelProps {
  /** xl 레이아웃: 오른쪽 「최근 등록된 대회」 하단과 맞출 패널 높이(px) */
  panelHeight?: number;
}

export default function VisitorTrendPanel({ panelHeight }: VisitorTrendPanelProps) {
  const today = useMemo(() => new Date(), []);
  const defaultEnd = toDateInputValue(today);

  const [eventId, setEventId] = useState(MAIN_EVENT_ID);
  const [startDate, setStartDate] = useState(toDateInputValue(subDays(today, 29)));
  const [endDate, setEndDate] = useState(defaultEnd);
  const [hoveredItem, setHoveredItem] = useState<VisitorTrendItem | null>(null);
  const [tooltipLeft, setTooltipLeft] = useState(0);
  const chartRef = useRef<HTMLDivElement>(null);
  const linePlotRef = useRef<HTMLDivElement>(null);
  const [linePlotWidth, setLinePlotWidth] = useState(0);

  const { data: eventData, isLoading: eventsLoading } = useAdminEventList({
    page: 1,
    size: 100,
  });

  const trendParams = useMemo(
    () => ({ eventId, startDate, endDate }),
    [eventId, startDate, endDate]
  );

  const chartAnimationKey = `${eventId}-${startDate}-${endDate}`;

  const { data: apiTrend = [], isLoading, error } = useVisitorTrend(trendParams);

  const trend = useMemo(
    () => fillVisitorTrendRange(startDate, endDate, apiTrend),
    [startDate, endDate, apiTrend]
  );
  const {
    data: snapshot,
    isLoading: snapshotLoading,
  } = useVisitorSnapshot(eventId);

  const eventOptions: SearchableSelectOption<string>[] = useMemo(() => {
    const events = eventData?.content ?? [];
    const sorted = [...events].sort(
      (a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
    );
    return [
      { value: MAIN_EVENT_ID, label: '메인 홈페이지' },
      ...sorted.map((e) => ({
        value: String(e.id),
        label: e.nameKr,
      })),
    ];
  }, [eventData]);

  const useLineChart = trend.length > EVEN_BAR_SPACING_MAX_DAYS;
  const evenBarSpacing = trend.length > 0 && !useLineChart;

  const barWidthPercent = useMemo(
    () => getEvenSpacingBarWidthPercent(trend.length),
    [trend.length]
  );

  const maxCount = useMemo(() => Math.max(1, ...trend.map((t) => t.count)), [trend]);

  useEffect(() => {
    if (!useLineChart) {
      setLinePlotWidth(0);
      return;
    }
    const el = linePlotRef.current;
    if (!el) return;

    const update = () => setLinePlotWidth(el.clientWidth);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [useLineChart, chartAnimationKey, isLoading]);

  const linePath = useMemo(
    () => buildLinePathPx(trend, maxCount, linePlotWidth, LINE_PLOT_HEIGHT),
    [trend, maxCount, linePlotWidth]
  );

  const lineAreaPath = useMemo(
    () => buildLineAreaPathPx(trend, maxCount, linePlotWidth, LINE_PLOT_HEIGHT),
    [trend, maxCount, linePlotWidth]
  );

  const hoveredLinePoint = useMemo(() => {
    if (!hoveredItem || linePlotWidth <= 0) return null;
    const index = trend.findIndex((t) => t.date === hoveredItem.date);
    if (index < 0) return null;
    return getLinePointPx(
      index,
      trend.length,
      hoveredItem.count,
      maxCount,
      linePlotWidth,
      LINE_PLOT_HEIGHT
    );
  }, [hoveredItem, trend, maxCount, linePlotWidth]);

  const lineAxisIndices = useMemo(
    () => getLineChartAxisIndices(trend.length),
    [trend.length]
  );

  const totalInRange = useMemo(() => trend.reduce((sum, t) => sum + t.count, 0), [trend]);

  const yAxisTicks = useMemo(() => {
    const step = maxCount <= 4 ? 1 : Math.ceil(maxCount / 4);
    const top = Math.ceil(maxCount / step) * step || 1;
    const ticks: number[] = [];
    for (let v = top; v >= 0; v -= step) ticks.push(v);
    if (ticks[ticks.length - 1] !== 0) ticks.push(0);
    return [...new Set(ticks)].sort((a, b) => b - a);
  }, [maxCount]);

  const applyPreset = useCallback(
    (days: number) => {
      setStartDate(toDateInputValue(subDays(today, days)));
      setEndDate(defaultEnd);
    },
    [today, defaultEnd]
  );

  const activePreset = PERIOD_PRESETS.find((p) => {
    const expectedStart = toDateInputValue(subDays(today, p.days));
    return startDate === expectedStart && endDate === defaultEnd;
  })?.label;

  const clampTooltipLeft = useCallback((centerPx: number) => {
    const chart = chartRef.current;
    if (!chart) return centerPx;
    const minLeft = TOOLTIP_EDGE_PAD + TOOLTIP_HALF_WIDTH;
    const maxLeft = chart.getBoundingClientRect().width - TOOLTIP_EDGE_PAD - TOOLTIP_HALF_WIDTH;
    return Math.min(Math.max(centerPx, minLeft), maxLeft);
  }, []);

  const handleBarHover = (item: VisitorTrendItem, barEl: HTMLElement) => {
    setHoveredItem(item);
    const chart = chartRef.current;
    if (!chart) return;
    const chartRect = chart.getBoundingClientRect();
    const barRect = barEl.getBoundingClientRect();
    const center = barRect.left - chartRect.left + barRect.width / 2;
    setTooltipLeft(clampTooltipLeft(center));
  };

  const setLineChartFocus = useCallback(
    (index: number) => {
      const item = trend[index];
      const chart = chartRef.current;
      const plot = linePlotRef.current;
      if (!item || !chart || !plot || linePlotWidth <= 0) return;

      setHoveredItem(item);
      const { x } = getLinePointPx(
        index,
        trend.length,
        item.count,
        maxCount,
        linePlotWidth,
        LINE_PLOT_HEIGHT
      );
      const plotRect = plot.getBoundingClientRect();
      const chartRect = chart.getBoundingClientRect();
      setTooltipLeft(clampTooltipLeft(plotRect.left - chartRect.left + x));
    },
    [trend, maxCount, linePlotWidth, clampTooltipLeft]
  );

  const handleLineChartHover = useCallback(
    (clientX: number) => {
      const plot = linePlotRef.current;
      if (!plot || trend.length === 0 || linePlotWidth <= 0) return;

      const plotRect = plot.getBoundingClientRect();
      const innerLeft = plotRect.left + LINE_PAD.left;
      const innerWidth = Math.max(
        1,
        plotRect.width - LINE_PAD.left - LINE_PAD.right
      );
      const ratio = Math.min(1, Math.max(0, (clientX - innerLeft) / innerWidth));
      const index =
        trend.length <= 1 ? 0 : Math.round(ratio * (trend.length - 1));
      setLineChartFocus(index);
    },
    [trend.length, linePlotWidth, setLineChartFocus]
  );

  const focusTrendItem = useCallback(
    (item: VisitorTrendItem) => {
      if (useLineChart) {
        const index = trend.findIndex((t) => t.date === item.date);
        if (index >= 0) setLineChartFocus(index);
        return;
      }
      setHoveredItem(item);
    },
    [useLineChart, trend, setLineChartFocus]
  );

  const isAlignedLayout = panelHeight != null && panelHeight > 0;

  return (
    <section
      className={`relative rounded-2xl border border-slate-200 bg-white p-4 md:p-5 shadow-sm ${isAlignedLayout ? 'flex min-h-0 flex-col' : ''
        }`}
      style={
        isAlignedLayout
          ? { height: panelHeight, minHeight: panelHeight, maxHeight: panelHeight }
          : undefined
      }
    >
      <div className="absolute -top-3 left-4 z-10 bg-white px-2 py-0 text-sm font-extrabold leading-normal text-slate-800">
        방문자 현황
      </div>

      <div
        className={
          isAlignedLayout
            ? 'flex min-h-0 flex-1 flex-col gap-4 pt-0.5'
            : 'space-y-4'
        }
      >
        <div
          className={`flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-end ${isAlignedLayout ? 'shrink-0' : ''
            }`}
        >
          <label className="flex min-w-[220px] flex-1 flex-col gap-1 text-xs font-medium text-slate-600">
            조회 대상
            <SearchableSelect
              value={eventId}
              options={eventOptions}
              onChange={setEventId}
              placeholder={eventsLoading ? '불러오는 중...' : '대상 선택'}
              searchable
              searchPlaceholder="대회명 검색..."
              variant="compact"
            />
          </label>
          <label className={DATE_LABEL_CLASS}>
            시작일
            <div className={DATE_FIELD_BOX}>
              <input
                type="date"
                value={startDate}
                max={endDate}
                onChange={(e) => setStartDate(e.target.value)}
                className={DATE_INPUT_CLASS}
              />
            </div>
          </label>
          <label className={DATE_LABEL_CLASS}>
            종료일
            <div className={DATE_FIELD_BOX}>
              <input
                type="date"
                value={endDate}
                min={startDate}
                max={defaultEnd}
                onChange={(e) => setEndDate(e.target.value)}
                className={DATE_INPUT_CLASS}
              />
            </div>
          </label>
          <div className="flex flex-wrap items-center gap-1.5 sm:pb-0.5">
            {PERIOD_PRESETS.map((preset) => (
              <button
                key={preset.label}
                type="button"
                onClick={() => applyPreset(preset.days)}
                className={`h-10 rounded-lg border px-2.5 text-xs font-semibold transition-colors ${activePreset === preset.label
                    ? 'border-blue-600 bg-blue-600 text-white'
                    : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300 hover:bg-slate-100'
                  }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        <div
          className={`grid grid-cols-3 gap-2 ${isAlignedLayout ? 'shrink-0' : ''}`}
        >
          {[
            {
              label: '오늘',
              value: snapshot?.dailyCount,
              loading: snapshotLoading,
              highlight: false,
            },
            {
              label: '기간 합계',
              value: totalInRange,
              loading: isLoading,
              highlight: false,
            },
            {
              label: '누적',
              value: snapshot?.totalCumulativeCount,
              loading: snapshotLoading,
              highlight: true,
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className={`rounded-lg border px-3 py-2.5 text-center sm:text-left ${stat.highlight
                  ? 'border-blue-100 bg-blue-50/60'
                  : 'border-slate-100 bg-slate-50'
                }`}
            >
              <p
                className={`text-[11px] ${stat.highlight ? 'font-medium text-blue-600' : 'text-slate-500'
                  }`}
              >
                {stat.label}
              </p>
              <p
                className={`mt-1 text-base font-bold tabular-nums ${stat.highlight ? 'text-blue-700' : 'text-slate-900'
                  }`}
              >
                {stat.loading ? '...' : (stat.value ?? 0).toLocaleString()}
              </p>
            </div>
          ))}
        </div>

        {error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-10 text-center text-sm text-red-700">
            방문자 현황을 불러오지 못했습니다.
          </div>
        ) : isLoading ? (
          <PanelMessage label="로딩 중..." />
        ) : trend.length === 0 ? (
          <PanelMessage label="조회 기간을 확인해 주세요." />
        ) : (
          <div
            className={
              isAlignedLayout
                ? 'flex min-h-0 flex-1 flex-col gap-4'
                : 'space-y-4'
            }
            onMouseLeave={() => setHoveredItem(null)}
          >
            <div
              ref={chartRef}
              className="relative shrink-0 overflow-visible rounded border border-[#dfe3ea] bg-[#fafbfc] px-3 pb-3 pt-10"
            >
              {hoveredItem ? (
                <div
                  className="pointer-events-none absolute z-20 max-w-[200px] -translate-x-1/2 whitespace-nowrap rounded-lg border border-slate-200 bg-white px-3 py-2 text-center shadow-md"
                  style={{ left: tooltipLeft, top: 10 }}
                >
                  <p className="text-[11px] font-medium text-slate-500">
                    {formatChartDate(hoveredItem.date)}
                  </p>
                  <p className="mt-0.5 text-base font-bold tabular-nums text-blue-600">
                    {hoveredItem.count.toLocaleString()}
                    <span className="ml-0.5 text-xs font-medium text-slate-500">명</span>
                  </p>
                </div>
              ) : null}

              <div className="flex gap-2" style={{ height: CHART_HEIGHT }}>
                <div className="flex w-9 shrink-0 flex-col justify-between py-1 text-right">
                  {yAxisTicks.map((tick) => (
                    <span key={tick} className="text-[10px] tabular-nums text-slate-400">
                      {tick.toLocaleString()}
                    </span>
                  ))}
                </div>

                <div className="relative min-w-0 flex-1">
                  <div className="absolute inset-0 flex flex-col justify-between py-1">
                    {yAxisTicks.map((tick) => (
                      <div
                        key={tick}
                        className="border-t border-dashed border-slate-200"
                      />
                    ))}
                  </div>

                  {useLineChart ? (
                    <div
                      key={chartAnimationKey}
                      className="relative flex h-full w-full flex-col pl-1 pr-1"
                    >
                      <div
                        ref={linePlotRef}
                        className="relative min-h-0 w-full flex-1 touch-none"
                        style={{ minHeight: LINE_PLOT_HEIGHT }}
                        onMouseMove={(e) => handleLineChartHover(e.clientX)}
                      >
                        {linePlotWidth > 0 && linePath ? (
                          <svg
                            width={linePlotWidth}
                            height={LINE_PLOT_HEIGHT}
                            viewBox={`0 0 ${linePlotWidth} ${LINE_PLOT_HEIGHT}`}
                            className="block h-full w-full overflow-visible"
                            aria-hidden
                          >
                            <defs>
                              <linearGradient
                                id="visitor-line-fill"
                                gradientUnits="userSpaceOnUse"
                                x1="0"
                                y1={LINE_PAD.top}
                                x2="0"
                                y2={LINE_PLOT_HEIGHT - LINE_PAD.bottom}
                              >
                                <stop offset="0%" stopColor="#2563eb" stopOpacity="0.2" />
                                <stop offset="100%" stopColor="#2563eb" stopOpacity="0.02" />
                              </linearGradient>
                            </defs>
                            <path d={lineAreaPath} fill="url(#visitor-line-fill)" />
                            <path
                              d={linePath}
                              fill="none"
                              stroke="#2563eb"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            {hoveredLinePoint ? (
                              <circle
                                cx={hoveredLinePoint.x}
                                cy={hoveredLinePoint.y}
                                r={5}
                                fill="#1d6fd8"
                                stroke="#fff"
                                strokeWidth="2"
                              />
                            ) : null}
                          </svg>
                        ) : null}
                      </div>
                      <div className="pointer-events-none relative mt-1 h-4 shrink-0">
                        {linePlotWidth > 0
                          ? lineAxisIndices.map((index) => {
                            const item = trend[index];
                            if (!item) return null;
                            const { x } = getLinePointPx(
                              index,
                              trend.length,
                              item.count,
                              maxCount,
                              linePlotWidth,
                              LINE_PLOT_HEIGHT
                            );
                            return (
                              <span
                                key={item.date}
                                className="absolute -translate-x-1/2 text-[10px] tabular-nums text-slate-400"
                                style={{
                                  left: `${(x / linePlotWidth) * 100}%`,
                                }}
                              >
                                {formatAxisDate(item.date)}
                              </span>
                            );
                          })
                          : null}
                      </div>
                    </div>
                  ) : (
                    <div
                      key={chartAnimationKey}
                      className="relative flex h-full w-full items-end gap-0 overflow-visible pb-1 pl-1 pr-1"
                    >
                      {trend.map((item, index) => {
                        const barHeight = Math.max(
                          item.count > 0 ? 6 : 2,
                          Math.round((item.count / maxCount) * BAR_MAX_HEIGHT)
                        );
                        const isHovered = hoveredItem?.date === item.date;
                        const showAxis =
                          trend.length <= 14 ||
                          index % Math.ceil(trend.length / 10) === 0 ||
                          item.date === trend[trend.length - 1]?.date;

                        return (
                          <div
                            key={item.date}
                            className="group flex min-w-0 flex-1 flex-col items-center justify-end"
                            onMouseEnter={(e) => handleBarHover(item, e.currentTarget)}
                          >
                            <button
                              type="button"
                              className="flex w-full flex-col items-center justify-end rounded-t focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1"
                              aria-label={`${formatChartDate(item.date)} 방문자 ${item.count}명`}
                            >
                              <div
                                className={`kma-visitor-bar mx-auto max-w-full shrink-0 rounded-t-[3px] transition-colors duration-200 ${isHovered
                                    ? 'bg-[#1d6fd8] ring-2 ring-[#93c5fd] ring-offset-1'
                                    : 'bg-[#2563eb] group-hover:bg-[#1d6fd8]'
                                  }`}
                                style={{
                                  ['--visitor-bar-h' as string]: `${barHeight}px`,
                                  animationDelay: `${index * 32}ms`,
                                  width: `${barWidthPercent}%`,
                                }}
                              />
                            </button>
                            {showAxis ? (
                              <span className="mt-1.5 text-[10px] tabular-nums text-slate-400">
                                {formatAxisDate(item.date)}
                              </span>
                            ) : (
                              <span className="mt-1.5 h-[14px]" aria-hidden />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div
              className={`${isAlignedLayout ? 'min-h-0 flex-1 overflow-y-auto' : ''}`}
            >
              <div
                className={`space-y-2 ${isAlignedLayout ? 'pr-0.5' : ''}`}
              >
                <div className="flex items-center justify-between px-1 text-xs font-medium text-slate-500">
                  <span>날짜</span>
                  <span>방문자</span>
                </div>
                {[...trend].reverse().map((item) => {
                  const active = hoveredItem?.date === item.date;
                  return (
                    <div
                      key={item.date}
                      role="row"
                      className={`flex items-center justify-between gap-4 rounded-xl border px-4 py-2.5 shadow-sm transition-colors ${active
                          ? 'border-blue-200 bg-blue-50'
                          : 'border-slate-200 bg-white hover:bg-slate-50'
                        }`}
                      onMouseEnter={() => focusTrendItem(item)}
                    >
                      <span className="text-sm font-medium text-slate-700">
                        {formatListDate(item.date)}
                      </span>
                      <span className="shrink-0 rounded-lg border border-slate-100 bg-slate-50 px-2.5 py-1 text-sm font-bold tabular-nums text-slate-900">
                        {item.count.toLocaleString()}
                        <span className="ml-0.5 text-xs font-medium text-slate-500">명</span>
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

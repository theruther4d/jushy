import {
  Fragment,
  useRef,
  useState,
  useMemo,
  RefObject,
  useEffect,
  useCallback,
} from "react";
import { useInfiniteQuery } from "react-query";
import { gql, GraphQLClient } from "graphql-request";
import subYears from "date-fns/subYears";
import {
  addDays,
  differenceInDays,
  format,
  isBefore,
  isSameMonth,
  isSameWeek,
  startOfDay,
  subDays,
} from "date-fns";

import { ReactComponent as ArrowLeft } from "./icons/arrow-left.svg";
import { ReactComponent as ArrowRight } from "./icons/arrow-right.svg";

import "./contributions.scss";

const token = process.env.REACT_APP_GITHUB_SECRET;

if (!token) {
  throw new Error(
    "You forgot to specify the github token at process.env.REACT_APP_GITHUB_SECRET"
  );
}

export function Contributions() {
  const { isLoading, isFetching, data, hasPreviousPage, fetchPreviousPage } =
    useContributionsCalendar();
  let lastLabeledWeek: Date;
  const chart = useRef<HTMLDivElement>(null);
  const viewport = useRef<HTMLDivElement>(null);
  const totalContributions = data?.pages.reduce(function sum(total, page) {
    return (
      total +
      page.viewer.contributionsCollection.contributionCalendar
        .totalContributions
    );
  }, 0);

  return (
    <section className="contributions noprint">
      <h3 className="breakable">Code Contributions ({totalContributions})</h3>
      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <>
          <Controls chart={chart} viewport={viewport} />
          <div className="content" ref={viewport}>
            <header>
              <span className="label calendar-day-1">
                <span className="background">Mon</span>
              </span>
              <span className="label calendar-day-3">
                <span className="background">Wed</span>
              </span>
              <span className="label calendar-day-5">
                <span className="background">Fri</span>
              </span>
            </header>
            <main>
              <figure ref={chart}>
                {data!.pages.map((page) => {
                  const { startedAt, endedAt, contributionCalendar } =
                    page.viewer.contributionsCollection;

                  return (
                    <Fragment key={`${startedAt}-${endedAt}`}>
                      {contributionCalendar.weeks.map((week) => {
                        const days = week.contributionDays;
                        const isCurrentWeek = week.contributionDays.some(
                          (day) => isSameWeek(parseDate(day.date), today)
                        );
                        const placeholderSpots = isCurrentWeek
                          ? [...new Array(7 - days.length)]
                          : [];

                        return (
                          <Fragment key={week.firstDay}>
                            {days.map((day) => {
                              const parsed = parseDate(day.date);
                              const offset = parsed.getDay() % 7;
                              const count = day.contributionCount;
                              const s = count === 1 ? "" : "s";
                              const date = relativeDate(parsed);
                              const on =
                                date === "Today" || date === "Yesterday"
                                  ? ""
                                  : "on";

                              return (
                                <time
                                  key={day.date}
                                  data-level={day.contributionLevel}
                                  data-contribution-count={count}
                                  data-tip={`${count} contribution${s} ${on} ${date}`}
                                  dateTime={format(
                                    new Date(parsed),
                                    "yyyy-MM-dd"
                                  )}
                                  className={`calendar-day-${offset}`}
                                />
                              );
                            })}
                            {placeholderSpots.map((_, i) => {
                              const date = addDays(today, i + 1);
                              const offset = date.getDay() % 7;

                              return (
                                <span
                                  key={date.toISOString()}
                                  data-level="NONE"
                                  data-contribution-count={0}
                                  className={`placeholder calendar-day-${offset}`}
                                />
                              );
                            })}
                          </Fragment>
                        );
                      })}
                    </Fragment>
                  );
                })}
              </figure>
            </main>
            <aside>
              {data!.pages.map((page) => {
                const { startedAt, endedAt, contributionCalendar } =
                  page.viewer.contributionsCollection;

                return (
                  <Fragment key={`${startedAt}-${endedAt}`}>
                    {contributionCalendar.weeks.map((week) => {
                      const firstDay = parseDate(week.firstDay);
                      const showLabel =
                        !lastLabeledWeek ||
                        !isSameMonth(lastLabeledWeek, firstDay);
                      let markup = showLabel ? (
                        <span className="label" key={week.firstDay}>
                          <span className="background">
                            {format(new Date(week.firstDay), "MMM yyyy")}
                          </span>
                        </span>
                      ) : (
                        <span className="spacer" key={week.firstDay} />
                      );

                      if (showLabel) {
                        lastLabeledWeek = firstDay;
                      }

                      return markup;
                    })}
                  </Fragment>
                );
              })}
            </aside>
            {hasPreviousPage && (
              <footer>
                <button
                  className="link"
                  disabled={isFetching}
                  onClick={() => fetchPreviousPage()}
                >
                  {isFetching ? "Grabbing..." : "Show Older"}
                </button>
              </footer>
            )}
          </div>
        </>
      )}
    </section>
  );
}

function Controls({ chart, viewport }: ControlProps) {
  const scroll = useRef(0);
  const { width, height } = useMeasure(chart);
  const viewportDimensions = useMeasure(viewport);
  const scrollSize = Math.max(width, height);
  const viewportSize = Math.max(
    viewportDimensions.width,
    viewportDimensions.height
  );

  const isNewerEnabled = useCallback(() => {
    return scroll.current !== 0;
  }, []);

  const isOlderEnabled = useCallback(() => {
    return scroll.current + viewportSize < scrollSize;
  }, [viewportSize, scrollSize]);

  const [newerEnabled, setNewerEnabled] = useState(isNewerEnabled);
  const [olderEnabled, setOlderEnabled] = useState(isOlderEnabled);

  function scrollTo(position: number) {
    viewport.current?.scrollTo({
      top: position,
      left: position,
      behavior: "smooth",
    });
  }

  useEffect(
    function bindListeners() {
      const element = viewport.current;
      const onScroll = function (e: Event) {
        const { scrollTop, scrollLeft } = e.target as HTMLElement;

        // Since we can only scroll in one direction at a time this works
        // for horizontal and vertical scroll position
        scroll.current = Math.max(scrollTop, scrollLeft);

        setNewerEnabled(isNewerEnabled);
        setOlderEnabled(isOlderEnabled);
      };

      element?.addEventListener("scroll", onScroll);

      return function onUnmount() {
        element?.removeEventListener("scroll", onScroll);
      };
    },
    [chart, isOlderEnabled, isNewerEnabled, viewport]
  );

  useEffect(
    function onDimensionsChanged() {
      setNewerEnabled(isNewerEnabled);
      setOlderEnabled(isOlderEnabled);
    },
    [viewportSize, scrollSize, isNewerEnabled, isOlderEnabled]
  );

  return (
    <div className="controls">
      <button
        aria-label="scroll newer"
        disabled={!newerEnabled}
        className="scroll-button newer"
        onClick={() => scrollTo(0)}
      >
        <ArrowLeft />
      </button>
      <button
        aria-label="scroll older"
        disabled={!olderEnabled}
        className="scroll-button older"
        onClick={() => scrollTo(scrollSize)}
      >
        <ArrowRight />
      </button>
    </div>
  );
}

interface ControlProps {
  chart: RefObject<HTMLElement>;
  viewport: RefObject<HTMLElement>;
}

const client = new GraphQLClient("https://api.github.com/graphql");
const today = new Date();

function parseDate(input: string) {
  const [, raw] = /^(\d\d\d\d-\d\d-\d\d)/.exec(input) ?? ["", ""];
  const [year, month, date] = raw.split("-").map(Number);
  return new Date(year, month - 1, date);
}

function useContributionsCalendar(
  from = startOfDay(subYears(today, 1)),
  to = startOfDay(today)
) {
  return useInfiniteQuery<ContributionsCalendarQuery>(
    ["contributions", from.toISOString(), to.toISOString()],
    ({ pageParam = [from.toISOString(), to.toISOString()] }) => {
      const [start, stop] = pageParam;
      const headers = {
        Authorization: `bearer ${token}`,
      };
      let variables;

      return client.request(
        gql`
      query {
        viewer {
          contributionsCollection(from: "${start}", to: "${stop}") {
            startedAt
            endedAt
            hasActivityInThePast
            contributionCalendar {
              totalContributions
              weeks {
                firstDay
                contributionDays {
                  contributionCount
                  contributionLevel
                  date
                }
              }
            }
          }
        }
      }
    `,
        variables,
        headers
      );
    },
    {
      staleTime: Infinity,
      getPreviousPageParam: (_, pages) => {
        const lastPage = [...pages].pop();
        if (
          lastPage?.viewer.contributionsCollection.hasActivityInThePast ===
          false
        ) {
          return;
        }

        const nextPage = pages.reduce(
          (
            earliestPage: ContributionsCalendarQuery,
            page: ContributionsCalendarQuery
          ) => {
            if (
              isBefore(
                parseDate(page.viewer.contributionsCollection.endedAt),
                parseDate(earliestPage.viewer.contributionsCollection.endedAt)
              )
            ) {
              return page;
            }

            return earliestPage;
          }
        );
        if (!nextPage) return;

        const { contributionCalendar } =
          nextPage.viewer.contributionsCollection;
        const earliestDate = contributionCalendar.weeks.reduce(
          (earliest: Date, week) => {
            return week.contributionDays.reduce(
              (weekEarliest: Date, day: ContributionDay) => {
                const parsed = parseDate(day.date);
                if (isBefore(parsed, weekEarliest)) {
                  return parsed;
                }

                return weekEarliest;
              },
              earliest
            );
          },
          today
        );
        const nextStart = subDays(earliestDate, 1);

        return [subYears(nextStart, 1).toISOString(), nextStart.toISOString()];
      },
      select: function sortDescending(data) {
        return {
          pages: data.pages
            .sort((a, b) => {
              return (
                Number(new Date(b.viewer.contributionsCollection.startedAt)) -
                Number(new Date(a.viewer.contributionsCollection.startedAt))
              );
            })
            .map((page) => {
              page.viewer.contributionsCollection.contributionCalendar.weeks =
                page.viewer.contributionsCollection.contributionCalendar.weeks.sort(
                  (a, b) => {
                    return (
                      Number(new Date(b.firstDay)) -
                      Number(new Date(a.firstDay))
                    );
                  }
                );

              return page;
            }),
          pageParams: data.pageParams,
        };
      },
    }
  );
}

function relativeDate(input: Date) {
  const difference = differenceInDays(input, today);

  if (difference === 0) return "Today";
  if (difference === -1) return "Yesterday";
  if (difference < 0 && difference >= -7) return format(input, "EEEE");
  return format(input, "MMM dd, yyyy");
}

class Rect {
  top = 0;
  right = 0;
  bottom = 0;
  left = 0;
  width = 0;
  height = 0;
}

function useMeasure<Node extends Element = HTMLElement>(
  node: RefObject<Node>
): Rect {
  const [measured, measure] = useState(new Rect());
  const observer = useMemo(() => {
    return new ResizeObserver(([observed]) => measure(observed.contentRect));
  }, []);

  useEffect(
    function bind() {
      if (!node.current) return;

      observer.observe(node.current);
      return function onUnmount() {
        observer.disconnect();
      };
    },
    [node, observer]
  );

  return measured;
}

interface ContributionDay {
  contributionCount: number;
  contributionLevel:
    | "FIRST_QUARTILE"
    | "SECOND_QUARTILE"
    | "THIRD_QUARTILE"
    | "FOURTH_QUARTILE"
    | "NONE";
  date: string;
}

interface ContributionWeek {
  firstDay: string;
  contributionDays: ContributionDay[];
}

interface ContributionsCalendarQuery {
  viewer: {
    contributionsCollection: {
      startedAt: string;
      endedAt: string;
      hasActivityInThePast: boolean;
      contributionCalendar: {
        totalContributions: number;
        weeks: ContributionWeek[];
      };
    };
  };
}

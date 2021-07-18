import { useInfiniteQuery } from "react-query";
import { gql, GraphQLClient } from "graphql-request";
import token from "./github.secret.json";
import { LegacyRef, useLayoutEffect, useMemo, useState } from "react";
import subYears from "date-fns/subYears";
import addYears from "date-fns/addYears";
import { format, isAfter, isSameDay, isSameMonth, startOfDay } from "date-fns";

export function Contributions() {
  const [container, { width }] = useMeasure<HTMLDivElement>();
  const { isLoading, data, hasPreviousPage, fetchPreviousPage } =
    useContributionsCalendar();
  const boxSize = (width - Y_AXIS_LABEL_SPACE - BOX_GAP * 6) / 7;
  const height = useMemo(() => {
    if (!data?.pages) return 100;
    const computed = data.pages.reduce((sum, page) => {
      const { weeks } =
        page.viewer.contributionsCollection.contributionCalendar;
      return sum + weeks.length * (boxSize + BOX_GAP);
    }, 0);
    return Math.max(computed, 100);
  }, [data?.pages, boxSize]);
  let yOffset = 0;
  let lastLabeledWeek: Date;

  return (
    <div ref={container}>
      <svg
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        style={{ width, background: "rgba(125, 0, 125, 0.4)" }}
      >
        {isLoading ? (
          <text
            textAnchor="middle"
            x={width / 2}
            y={50}
            dominantBaseline="hanging"
          >
            Loading...
          </text>
        ) : (
          data!.pages.map((page) => {
            const { startedAt, endedAt, contributionCalendar } =
              page.viewer.contributionsCollection;

            return (
              <g key={`${startedAt}-${endedAt}`}>
                {contributionCalendar.weeks.map((week) => {
                  const firstDay = new Date(week.firstDay);
                  const showLabel =
                    !lastLabeledWeek || !isSameMonth(lastLabeledWeek, firstDay);
                  let markup = (
                    <g key={week.firstDay}>
                      {week.contributionDays.map((day, i) => {
                        const alpha =
                          day.contributionLevel === "NONE"
                            ? 0.1
                            : day.contributionLevel === "FIRST_QUARTILE"
                            ? 0.25
                            : day.contributionLevel === "SECOND_QUARTILE"
                            ? 0.5
                            : day.contributionLevel === "THIRD_QUARTILE"
                            ? 0.75
                            : 1;

                        return (
                          <rect
                            key={day.date}
                            x={i * (boxSize + BOX_GAP)}
                            y={yOffset}
                            width={boxSize}
                            height={boxSize}
                            data-level={day.contributionLevel}
                            data-count={day.contributionCount}
                            data-date={day.date}
                            fill={`rgba(0, 255, 0, ${alpha})`}
                          />
                        );
                      })}
                      {showLabel && (
                        <text
                          y={yOffset + boxSize / 2}
                          x={(boxSize + BOX_GAP) * 7}
                          dominantBaseline="middle"
                        >
                          {format(new Date(week.firstDay), "MMM yy")}
                        </text>
                      )}
                    </g>
                  );

                  yOffset += boxSize + BOX_GAP;
                  if (showLabel) {
                    lastLabeledWeek = firstDay;
                  }

                  return markup;
                })}
              </g>
            );
          })
        )}
      </svg>
      {hasPreviousPage && (
        <button onClick={() => fetchPreviousPage()}>Show More</button>
      )}
    </div>
  );
}

const client = new GraphQLClient("https://api.github.com/graphql");

function useContributionsCalendar(
  from = startOfDay(subYears(new Date(), 1)),
  to = startOfDay(new Date())
) {
  return useInfiniteQuery<ContributionsCalendarQuery>(
    ["contributions", from.toISOString(), to.toISOString()],
    ({ pageParam = [from.toISOString(), to.toISOString()] }) => {
      const [start, stop] = pageParam;

      return client.request(
        gql`
      query {
        viewer {
          contributionsCollection(from: "${start}", to: "${stop}") {
            startedAt
            endedAt
            contributionCalendar {
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
        undefined,
        {
          Authorization: `bearer ${token}`,
        }
      );
    },
    {
      getNextPageParam: (lastPage) => {
        if (!lastPage) return;

        const contributions = lastPage.viewer.contributionsCollection;
        const endedAt = new Date(contributions.endedAt);
        const today = new Date();

        if (isSameDay(endedAt, today) || isAfter(endedAt, today)) return;

        return [endedAt, addYears(endedAt, 1).toISOString()];
      },
      getPreviousPageParam: (nextPage) => {
        if (!nextPage) return;

        const { startedAt } = nextPage.viewer.contributionsCollection;
        return [subYears(new Date(startedAt), 1).toISOString(), startedAt];
      },
    }
  );
}

class Box {
  x = 0;
  y = 0;
  width = 0;
  height = 0;
  top = 0;
  left = 0;
  bottom = 0;
  right = 0;
}

function useMeasure<NodeType extends Element>(): [LegacyRef<NodeType>, Box] {
  const [element, ref] = useState<NodeType | null>(null);
  const [rect, setRect] = useState(new Box());

  const observer = useMemo(() => {
    return new window.ResizeObserver(([entry]) => {
      if (!entry) return;
      setRect(entry.contentRect);
    });
  }, []);

  useLayoutEffect(() => {
    if (!element) return;

    observer.observe(element);

    return function onUnmount() {
      observer.disconnect();
    };
  }, [element, observer]);

  return [ref, rect];
}

interface ContributionWeek {
  firstDay: string;
  contributionDays: Array<{
    contributionCount: number;
    contributionLevel:
      | "FIRST_QUARTILE"
      | "SECOND_QUARTILE"
      | "THIRD_QUARTILE"
      | "FOURTH_QUARTILE"
      | "NONE";
    date: string;
  }>;
}

interface ContributionsCalendarQuery {
  viewer: {
    contributionsCollection: {
      startedAt: string;
      endedAt: string;
      contributionCalendar: {
        weeks: Array<ContributionWeek>;
      };
    };
  };
}

const Y_AXIS_LABEL_SPACE = 80;
const BOX_GAP = 2;

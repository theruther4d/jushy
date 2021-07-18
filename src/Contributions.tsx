import { useInfiniteQuery } from "react-query";
import { gql, GraphQLClient } from "graphql-request";
import token from "./github.secret.json";
import React from "react";
import subYears from "date-fns/subYears";
import { format, isBefore, isSameMonth, startOfDay } from "date-fns";

import "./contributions.scss";

export function Contributions() {
  const { isLoading, isFetching, data, hasPreviousPage, fetchPreviousPage } =
    useContributionsCalendar();
  let lastLabeledWeek: Date;

  return (
    <section className="contributions">
      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <>
          <header>
            <span className="calendar-day-1">Mon</span>
            <span className="calendar-day-3">Wed</span>
            <span className="calendar-day-5">Fri</span>
          </header>
          <main>
            {data!.pages.map((page) => {
              const { startedAt, endedAt, contributionCalendar } =
                page.viewer.contributionsCollection;

              return (
                <React.Fragment key={`${startedAt}-${endedAt}`}>
                  {contributionCalendar.weeks.map((week) => {
                    const firstDay = new Date(week.firstDay);
                    const showLabel =
                      !lastLabeledWeek ||
                      !isSameMonth(lastLabeledWeek, firstDay);
                    let markup = (
                      <React.Fragment key={week.firstDay}>
                        {week.contributionDays.map((day) => {
                          const [year, month, date] = day.date
                            .split("-")
                            .map(Number);
                          const parsed = new Date(year, month - 1, date);
                          const offset = parsed.getDay() % 7;

                          return (
                            <time
                              key={day.date}
                              data-day={day.date}
                              data-parsed={parsed}
                              data-level={day.contributionLevel}
                              dateTime={format(
                                new Date(day.date),
                                "yyyy-MM-dd"
                              )}
                              className={`calendar-day-${offset}`}
                            />
                          );
                        })}
                        {showLabel && (
                          <span className="calendar-week-label">
                            {format(new Date(week.firstDay), "MMM yy")}
                          </span>
                        )}
                      </React.Fragment>
                    );

                    if (showLabel) {
                      lastLabeledWeek = firstDay;
                    }

                    return markup;
                  })}
                </React.Fragment>
              );
            })}
          </main>
        </>
      )}
      {hasPreviousPage && (
        <button disabled={isFetching} onClick={() => fetchPreviousPage()}>
          Show More
        </button>
      )}
    </section>
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
      staleTime: Infinity,
      getPreviousPageParam: (_, pages) => {
        const nextPage = pages.reduce(
          (
            earliestPage: ContributionsCalendarQuery,
            page: ContributionsCalendarQuery
          ) => {
            if (
              isBefore(
                new Date(page.viewer.contributionsCollection.endedAt),
                new Date(earliestPage.viewer.contributionsCollection.endedAt)
              )
            ) {
              return page;
            }

            return earliestPage;
          }
        );
        if (!nextPage) return;

        const { startedAt } = nextPage.viewer.contributionsCollection;
        return [subYears(new Date(startedAt), 1).toISOString(), startedAt];
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

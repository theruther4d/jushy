import { useInfiniteQuery } from "react-query";
import { gql, GraphQLClient } from "graphql-request";
import token from "./github.secret.json";
import React from "react";
import subYears from "date-fns/subYears";
import { addDays, format, isBefore, isSameMonth, startOfDay } from "date-fns";

import "./contributions.scss";

export function Contributions() {
  const { isLoading, isFetching, data, hasPreviousPage, fetchPreviousPage } =
    useContributionsCalendar();
  let lastLabeledWeek: Date;

  return (
    <>
      <h2>Contributions</h2>
      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <section className="contributions">
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
            {data!.pages.map((page) => {
              const { startedAt, endedAt, contributionCalendar } =
                page.viewer.contributionsCollection;

              return (
                <React.Fragment key={`${startedAt}-${endedAt}`}>
                  {contributionCalendar.weeks.map((week) => {
                    const days = week.contributionDays;
                    const placeholderSpots = [...new Array(7 - days.length)];

                    return (
                      <React.Fragment key={week.firstDay}>
                        {days.map((day) => {
                          const [year, month, date] = day.date
                            .split("-")
                            .map(Number);
                          const parsed = new Date(year, month - 1, date);
                          const offset = parsed.getDay() % 7;

                          return (
                            <time
                              key={day.date}
                              data-level={day.contributionLevel}
                              data-contribution-count={day.contributionCount}
                              dateTime={format(new Date(parsed), "yyyy-MM-dd")}
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
                              className={`calendar-day-${offset}`}
                            />
                          );
                        })}
                      </React.Fragment>
                    );
                  })}
                </React.Fragment>
              );
            })}
          </main>
          <aside>
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
                </React.Fragment>
              );
            })}
          </aside>
          {hasPreviousPage && (
            <footer>
              <button disabled={isFetching} onClick={() => fetchPreviousPage()}>
                Show More
              </button>
            </footer>
          )}
        </section>
      )}
    </>
  );
}

const client = new GraphQLClient("https://api.github.com/graphql");
const today = new Date();

function useContributionsCalendar(
  from = startOfDay(subYears(today, 1)),
  to = startOfDay(today)
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

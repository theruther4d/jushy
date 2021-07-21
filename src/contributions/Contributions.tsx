import { Fragment } from "react";
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

  return (
    <section className="contributions unlimited">
      <h2 className="breakable limited">Code Contributions</h2>
      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <div className="content">
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
            <figure>
              {data!.pages.map((page) => {
                const { startedAt, endedAt, contributionCalendar } =
                  page.viewer.contributionsCollection;

                return (
                  <Fragment key={`${startedAt}-${endedAt}`}>
                    {contributionCalendar.weeks.map((week) => {
                      const days = week.contributionDays;
                      const isCurrentWeek = week.contributionDays.some((day) =>
                        isSameWeek(new Date(day.date), today)
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
              <button disabled={isFetching} onClick={() => fetchPreviousPage()}>
                Show More
              </button>
            </footer>
          )}
        </div>
      )}
    </section>
  );
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
        variables,
        headers
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
      contributionCalendar: {
        weeks: ContributionWeek[];
      };
    };
  };
}

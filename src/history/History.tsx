import { format, formatDistance } from "date-fns";

import { ReactComponent as Sourcebits } from "./logos/sourcebits.svg";
import { ReactComponent as Apple } from "./logos/apple.svg";
import { ReactComponent as RiskMatch } from "./logos/riskmatch.svg";
import { ReactComponent as Vertafore } from "./logos/vertafore.svg";

import "./history.scss";
import { Fragment, MouseEvent } from "react";

const today = new Date();
const contactId = "get-in-touch";

export function History() {
  const getInTouch = (event: MouseEvent) => {
    try {
      const section = document.getElementById(contactId);
      window.scroll({
        top: section!.getBoundingClientRect().top,
        behavior: "smooth",
      });
      event.preventDefault();
    } catch (error) {
      window.location.hash = contactId;
    }
  };

  return (
    <section className="history">
      <header>
        <h3>
          I've been lucky to work on some <em>amazing</em> teams.
        </h3>
        <p>
          But my best work is still ahead of me. If you think your team has a
          place for me{" "}
          <a onClick={getInTouch} href="#get-in-touch">
            get in touch.
          </a>
        </p>
      </header>
      <main>
        <article className="card">
          <div className="card-content">
            <h3>
              Employment
              <br />
              History
            </h3>
            <dl>
              {jobsDescending.map((job) => {
                const start = new Date(job.start);
                const end = job.end ? new Date(job.end) : today;
                const duration = formatDistance(start, end);

                return (
                  <Fragment key={`${job.name}-${job.title}`}>
                    <dt>{job.name}</dt>
                    <dd>
                      <figure>
                        <job.Logo />
                        <figcaption className="offscreen">
                          {job.name} logo
                        </figcaption>
                      </figure>
                      <span className="title">{job.title}</span>
                      <span className="when">
                        <time dateTime={start.toISOString()}>
                          {monthYear(start)}
                        </time>
                        {" - "}
                        <time dateTime={end.toISOString()}>
                          {job.end ? monthYear(end) : "Present"}
                        </time>
                        {" - "}
                        <time>{duration}</time>
                      </span>
                    </dd>
                  </Fragment>
                );
              })}
            </dl>
          </div>
        </article>
      </main>
    </section>
  );
}

export const jobs = [
  {
    name: "Sourcebits",
    title: "Frontend Developer",
    start: "July 1 2013",
    end: "November 30 2015",
    Logo: Sourcebits,
  },
  {
    name: "Apple",
    title: "Sr. UI Developer",
    start: "December 1 2015",
    end: "May 31 2016",
    Logo: Apple,
  },
  {
    name: "RiskMatch",
    title: "UI Prototype Developer",
    start: "June 1 2016",
    end: "May 31 2017",
    Logo: RiskMatch,
  },
  {
    name: "RiskMatch",
    title: "UI Development Team Lead",
    start: "Jun 1 2017",
    end: "December 31 2020",
    Logo: RiskMatch,
  },
  {
    name: "Vertafore",
    title: "Staff Architect",
    start: "January 1 2021",
    Logo: Vertafore,
  },
];
const jobsDescending = [...jobs].reverse();

function monthYear(input: Date) {
  return format(input, "MMM yyyy");
}

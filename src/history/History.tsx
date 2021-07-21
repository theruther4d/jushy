import { format, formatDistance } from "date-fns";

import { ReactComponent as Sourcebits } from "./logos/sourcebits.svg";
import { ReactComponent as Apple } from "./logos/apple.svg";
import { ReactComponent as RiskMatch } from "./logos/riskmatch.svg";
import { ReactComponent as Vertafore } from "./logos/vertafore.svg";

import "./history.scss";

const today = new Date();

export function History() {
  return (
    <section className="history">
      <header>
        <h2>
          I've been lucky to work on some <em>amazing</em> teams.
        </h2>
        <p>
          But my best work is still ahead of me. If you think your team has a
          place for me <a>get in touch.</a>
        </p>
      </header>
      <article className="card">
        <h3>
          Employment
          <br />
          History
        </h3>
        <dl>
          {jobs.map((job) => {
            const start = new Date(job.start);
            const end = job.end ? new Date(job.end) : today;
            const duration = formatDistance(start, end);

            return (
              <>
                <dt>{job.name}</dt>
                <dd>
                  <figure>
                    <job.Logo />
                    <figcaption>{job.name} logo</figcaption>
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
              </>
            );
          })}
        </dl>
      </article>
    </section>
  );
}

const jobs = [
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
].reverse();

function monthYear(input: Date) {
  return format(input, "MMM yyyy");
}

import { format, formatDistance } from "date-fns";

import { ReactComponent as Sourcebits } from "./logos/sourcebits.svg";
import { ReactComponent as Apple } from "./logos/apple.svg";
import { ReactComponent as RiskMatch } from "./logos/riskmatch.svg";
import { ReactComponent as Vertafore } from "./logos/vertafore.svg";
import { ReactComponent as Cloudflare } from "./logos/cloudflare.svg";

import "./history.scss";
import { MouseEvent } from "react";

const today = new Date();
const contactId = "get-in-touch";

export function History() {
  const getInTouch = (event: MouseEvent) => {
    try {
      const section = document.getElementById(contactId);
      section?.scrollIntoView({
        behavior: "smooth",
      });
      event.preventDefault();
    } catch (error) {
      window.location.hash = contactId;
    }
  };

  return (
    <section className="history">
      <header className="noprint">
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
              Employment <br className="noprint" />
              History
            </h3>
            <dl>
              {jobsDescending.map((job) => {
                const start = new Date(job.start);
                const end = job.end ? new Date(job.end) : today;
                const duration = formatDistance(start, end);

                return (
                  <li key={`${job.name}-${job.title}`} className="item">
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
                      <ul className="notes noscreen">
                        {job.notes.map((note) => (
                          <li key={note}>{note}</li>
                        ))}
                      </ul>
                    </dd>
                  </li>
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
    notes: [
      "Built app marketing websites",
      "After 1 year responsible for hiring and training junior developers",
    ],
  },
  {
    name: "Apple",
    title: "Sr. UI Developer",
    start: "December 1 2015",
    end: "May 31 2016",
    Logo: Apple,
    notes: [
      "Built product marketing pages for apple.com",
      "Created internal libraries for code reuse",
      "Interfaced with design team to bridge gaps in mockups",
    ],
  },
  {
    name: "RiskMatch",
    title: "UI Developer",
    start: "June 1 2016",
    end: "May 31 2017",
    Logo: RiskMatch,
    notes: [
      "Prototyped new UI features and wrote production styles",
      "Converted from legacy PHP setup to React + Webpack + Typescript",
      "Unified Prototyping and frontend development workflows to save speed up delivery",
    ],
  },
  {
    name: "RiskMatch",
    title: "UI Development Team Lead",
    start: "Jun 1 2017",
    end: "December 31 2020",
    Logo: RiskMatch,
    notes: [
      "Promoted to head of UI development in under a year",
      "Hired, trained, managed, and mentored team of 3-4 junior developers",
      "Lead all UI development for the company",
    ],
  },
  {
    name: "Vertafore",
    title: "Principal Architect",
    start: "January 1 2021",
    end: "November 5, 2021",
    Logo: Vertafore,
    notes: [
      "Promoted to core architecture group at parent company",
      "Oversaw UI development for entire company's portfolio of apps",
      "Consulted on all UI-related development company-wide",
    ],
  },
  {
    name: "Cloudflare",
    title: "Systems Engineer",
    start: "November 8 2021",
    Logo: Cloudflare,
    notes: ["Just getting started"],
  },
];
const jobsDescending = [...jobs].reverse();

function monthYear(input: Date) {
  return format(input, "MMM yyyy");
}

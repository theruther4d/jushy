import { differenceInYears } from "date-fns";
import { jobs } from "../history/History";

import "./stats.scss";

export function Stats() {
  return (
    <section className="stats">
      <main className="noprint">
        <h3>I've been around the block a few times</h3>
        <p>
          Which gives me a wealth of experience to draw on, but I love learning
          new things and exploring. There's a lot left to know.
        </p>
      </main>
      <dl className="card">
        <div className="card-content">
          <li>
            <dd>
              {differenceInYears(today, startDate)}
              <sup>+</sup>
            </dd>
            <dt>Years Professional Experience</dt>
          </li>
          <li>
            <dd>
              {differenceInYears(today, teamLeadStartDate)}
              <sup>+</sup>
            </dd>
            <dt>Years Leading Teams</dt>
          </li>
          <li>
            <dd>
              {differenceInYears(today, remoteStartDate)}
              <sup>+</sup>
            </dd>
            <dt>Years Working Remotely</dt>
          </li>
        </div>
      </dl>
      <div className="languages noscreen">
        <h3>Languages and Tools</h3>
        <p>
          React, Typescript, Node.js, HTML, CSS, Javascript, SCSS, D3.js,
          Webpack, Rollup, MSW, Jest, Testing-library, Cypress, Puppeteer
        </p>
      </div>
    </section>
  );
}

const [firstJob, , firstRemoteJob, firstTeamLeadJob] = jobs;
const startDate = new Date(firstJob.start);
const remoteStartDate = new Date(firstRemoteJob.start);
const teamLeadStartDate = new Date(firstTeamLeadJob.start);
const today = new Date();

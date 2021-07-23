import { differenceInYears } from "date-fns";
import { jobs } from "../history/History";

import "./stats.scss";

export function Stats() {
  return (
    <section className="stats">
      <main>
        <h3>I've been around the block a few times</h3>
        <p>
          Which gives me a wealth of experience to draw on, but I love learning
          new things and exploring. There's a lot left to know.
        </p>
      </main>
      <dl className="card">
        <div className="card-content">
          <dd>
            {differenceInYears(today, startDate)}
            <sup>+</sup>
          </dd>
          <dt>Years Professional Experience</dt>
          <dd>
            {differenceInYears(today, remoteStartDate)}
            <sup>+</sup>
          </dd>
          <dt>Years Leading Teams</dt>
          <dd>
            {differenceInYears(today, teamLeadStartDate)}
            <sup>+</sup>
          </dd>
          <dt>Years Working Remotely</dt>
          <dd>
            {/* @TODO: */}
            65.26
            <sup>+</sup>
          </dd>
          <dt>Thousands of lines of code written</dt>
        </div>
      </dl>
    </section>
  );
}

const [firstJob, , firstRemoteJob, firstTeamLeadJob] = jobs;
const startDate = new Date(firstJob.start);
const remoteStartDate = new Date(firstRemoteJob.start);
const teamLeadStartDate = new Date(firstTeamLeadJob.start);
const today = new Date();

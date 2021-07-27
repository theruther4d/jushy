import { useState } from "react";
import "./hero.scss";
import waving from "./waving.png";

export function Hero() {
  const [showMore, setShowMore] = useState(false);

  return (
    <section className="hero">
      <header>
        <figure className="noprint">
          <img
            src={waving}
            alt="Cartoon of me waving"
            width="156px"
            height="156px"
          />
        </figure>
        <div>
          <h1>Josh Rutherford</h1>
          <h2>Software Developer</h2>
        </div>
      </header>
      <p className="content">
        I’m a curiosity-driven developer with over 8 years of experience. I've
        spent most of that time focused on building web apps and UI, for the
        last 5 years working primarily with React and Typescript.{" "}
        {showMore ? null : (
          <button
            className="link noprint"
            onClick={function toggle() {
              setShowMore((showing) => !showing);
            }}
          >
            Read the whole story +
          </button>
        )}
      </p>
      <div
        className={showMore ? "more-content visible" : "more-content"}
        aria-hidden={!showMore}
      >
        <p>
          My background is in design, and in 2013{" "}
          <a
            href="https://blog.codepen.io/2013/08/23/josh-rutherford-gets-a-job-on-codepen/"
            rel="noreferrer"
            target="_blank"
            tabIndex={showMore ? undefined : -1}
          >
            I left my design job in Arkansas for a development gig at a startup
            in San Francisco
          </a>{" "}
          after spending the previous year learning web development in my spare
          time. I got the itch while working on a portfolio site for myself and
          haven't been able to stop tinkering since.
        </p>
        <p>
          Currently considering individual contributor roles. Especially
          interested in areas of nature, biology, physics, art, politics, and
          literature.{" "}
          <button
            className="link"
            tabIndex={showMore ? undefined : -1}
            onClick={function toggle() {
              setShowMore((showing) => !showing);
            }}
          >
            Show less -
          </button>
        </p>
      </div>
    </section>
  );
}

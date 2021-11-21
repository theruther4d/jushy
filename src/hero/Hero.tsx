import { useState } from "react";
import { address } from "../footer/Footer";
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
        <a className="address noscreen" href={`mailto:${address}`}>
          {address}
        </a>
      </header>
      <p className="content">
        I’m a curiosity-driven developer with over 8 years of experience. For
        the last 5 years I've been working primarily with React and Typescript.{" "}
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
          My background is in design, and in 2013 I left my design job in
          Arkansas for a{" "}
          <a
            href="https://blog.codepen.io/2013/08/23/josh-rutherford-gets-a-job-on-codepen/"
            rel="noreferrer"
            target="_blank"
            tabIndex={showMore ? undefined : -1}
          >
            development gig
          </a>{" "}
          at a startup in San Francisco after spending the previous year
          learning web development in my spare time.
        </p>
        <p>
          I've got a strong background in the web fundamentals of HTML, CSS, and
          Javascript while having the wealth of experience of using React and
          Typescript since nearly the beginning. Currently working remotely from
          my home state of Arkansas.{" "}
          <button
            className="link noprint"
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

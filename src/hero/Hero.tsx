import "./hero.scss";
import peeking from "./peeking.png";

export function Hero() {
  return (
    <section className="hero">
      <figure>
        <img
          src={peeking}
          alt="Cartoon of me peeking over a laptop"
          width="100"
        />
      </figure>
      <main>
        <h1>Josh Rutherford</h1>
        <h3>Software Developer</h3>
        <p>
          I’m a software developer with over 8 years of experience. Currently
          focused on user interface development and building web and mobile
          apps. I've worked primarily with Typescript and React for the past 4
          years.
        </p>
      </main>
    </section>
  );
}

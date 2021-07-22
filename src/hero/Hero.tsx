import "./hero.scss";
import waving from "./waving.png";

export function Hero() {
  return (
    <section className="hero">
      <header>
        <figure>
          <img src={waving} alt="Cartoon of me waving" width="156" />
        </figure>
        <div>
          <h1>Josh Rutherford</h1>
          <h3>Software Developer</h3>
        </div>
      </header>
      <main>
        <p>
          I’m a curiosity-driven developer with over 8 years of experience. Most
          of that time has been focused on user interface development and web
          apps. For the past 4 years I've worked primarily with Typescript and
          React.
        </p>
      </main>
    </section>
  );
}

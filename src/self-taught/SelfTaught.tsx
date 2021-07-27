import pondering from "./pondering.png";
import "./self-taught.scss";

export function SelfTaught() {
  return (
    <section className="self-taught">
      <main>
        <h3>Proudly self-taught</h3>
        <p>
          From 0 to landing my first development job in San Francisco in under a
          year. Working at apple in 2.5 years. Team Lead in 3.
        </p>
        <p className="noprint">
          I'm a self-starter who hates to be bored. I love learning new things
          and my best days are when I'm busy solving tough problems.
        </p>
      </main>
      <aside className="noprint">
        <figure>
          <div aria-hidden>
            <pre>
              <code>
                <span className="var">const</span> radians ={" "}
                <span className="constant">Math</span>.PI * Math.
                <span className="property">pow</span>(
                <span className="var">2</span>
                );
              </code>
            </pre>
            <span
              className="error"
              data-content="~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~"
            >
              <pre>
                <code>
                  <span className="var">const</span> angle = radianz *{" "}
                  <span className="constant">Math</span>.
                  <span className="property">pow</span>(
                  <span className="var">2</span>
                  );
                </code>
              </pre>
            </span>
          </div>
          <figcaption className="offscreen">
            Some lines of code with an error.
          </figcaption>
          <img
            src={pondering}
            width="170px"
            height="170px"
            alt="A cartoon of my face, pondering the code with an error."
          />
        </figure>
      </aside>
    </section>
  );
}

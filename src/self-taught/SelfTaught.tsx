import "./self-taught.scss";

export function SelfTaught() {
  return (
    <section className="self-taught">
      <main>
        <h2>Proudly self-taught</h2>
        <p>
          From zero to landing my first development job in San Francisco in
          under a year. Working at apple in 2.5 years. Team Lead in 3 years.
        </p>
      </main>
      <figure>
        <pre>
          <code>
            <span className="var">const</span> radians ={" "}
            <span className="constant">Math</span>.PI * Math.
            <span className="property">pow</span>(<span className="var">2</span>
            );
          </code>
        </pre>
        <span className="error" data-content="~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~">
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
        <figcaption className="offscreen">
          Some lines of code with an error.
        </figcaption>
      </figure>
    </section>
  );
}

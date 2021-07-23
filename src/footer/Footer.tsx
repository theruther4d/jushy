import { useState } from "react";
import { ReactComponent as Codepen } from "./icons/codepen.svg";
import { ReactComponent as Github } from "./icons/github.svg";
import { ReactComponent as Linkedin } from "./icons/linkedin.svg";
import { ReactComponent as Copy } from "./icons/clipboard.svg";
import { ReactComponent as Cancel } from "./icons/close.svg";

import callme from "./call-me.png";
import hearts from "./hearts.png";

import "./footer.scss";

export function Footer() {
  const [isContacting, contact] = useState(false);

  const onCopy = () => {
    try {
      navigator.clipboard.writeText("joshua.rutherford1@gmail.com");
    } catch (e) {
      alert("couldn't copy to clipboard :/");
    }
  };

  return (
    <footer className="footer">
      <div className="contact">
        <img
          src={callme}
          width="173px"
          height="173px"
          alt="Cartoon of me making a phone gesture with my hand"
        />
        <h3>Intrigued?</h3>
        <div className="contact-button-wrap">
          <div className={`contact-button ${isContacting ? "contacting" : ""}`}>
            {isContacting ? (
              <>
                <div className="email">contact@joshrutherford.me</div>
                <div className="copy">
                  <button onClick={onCopy}>
                    <Copy width={16} height={16} />
                    Copy
                  </button>
                </div>
                <div className="cancel">
                  <button onClick={() => contact(false)}>
                    <Cancel width={16} height={16} />
                    Cancel
                  </button>
                </div>
              </>
            ) : (
              <button onClick={() => contact(true)}>Get in touch</button>
            )}
          </div>
        </div>
      </div>
      <div className="meta">
        <div className="social">
          <a href="https://github.com/theruther4d">
            <span className="offscreen">Github</span>
            <Github width={36} height={36} />
          </a>
          <a href="https://codepen.io/the_ruther4d">
            <span className="offscreen">Codepen</span>
            <Codepen width={36} height={36} />
          </a>
          <a href="https://www.linkedin.com/in/josh-rutherford-b10b2190">
            <span className="offscreen">Linkedin</span>
            <Linkedin width={36} height={36} />
          </a>
        </div>
        <span className="copyright">
          <img
            src={hearts}
            alt="Cartoon of my face surrounded by hearts."
            width="42px"
            height="42px"
          />
          &copy; {today.getFullYear()} Josh Rutherford. All rights reserved.
        </span>
      </div>
    </footer>
  );
}

const today = new Date();

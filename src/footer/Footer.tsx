import { useState } from "react";
import { ReactComponent as Codepen } from "./icons/codepen.svg";
import { ReactComponent as Github } from "./icons/github.svg";
import { ReactComponent as Linkedin } from "./icons/linkedin.svg";

import callme from "./call-me.png";
import hearts from "./hearts.png";

import "./footer.scss";

export function Footer() {
  const [popupVisible, setPopupVisible] = useState(false);

  const onContact = () => {
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
          alt="Cartoon of me making a phone gesture with my hand"
        />
        <h2>Convinced yet?</h2>
        <div className="popup-wrap">
          {popupVisible && (
            <div className="popup">
              <button onClick={onContact} disabled>
                Click to Copy email address to clipboard
              </button>
            </div>
          )}
          <button onClick={() => setPopupVisible(true)}>Get in touch</button>
        </div>
      </div>
      <div className="meta">
        <div className="social">
          <a href="https://github.com/theruther4d">
            <Github width={36} height={36} />
          </a>
          <a href="https://codepen.io/the_ruther4d">
            <Codepen width={36} height={36} />
          </a>
          <a href="https://www.linkedin.com/in/josh-rutherford-b10b2190">
            <Linkedin width={36} height={36} />
          </a>
        </div>
        <span className="copyright">
          <img src={hearts} alt="Cartoon of my face surrounded by hearts." />
          &copy; {today.getFullYear()} Josh Rutherford. All rights reserved.
        </span>
      </div>
    </footer>
  );
}

const today = new Date();

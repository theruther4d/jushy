import { ReactComponent as Codepen } from "./icons/codepen.svg";
import { ReactComponent as Github } from "./icons/github.svg";
import { ReactComponent as Linkedin } from "./icons/linkedin.svg";

import "./footer.scss";
import { useState } from "react";

export function Footer() {
  const [popupVisible] = useState(false);

  const onContact = () => {
    try {
      navigator.clipboard.writeText("joshua.rutherford1@gmail.com");
    } catch (e) {
      alert("couldn't copy to clipboard :/");
    }
  };

  return (
    <footer className="footer">
      <div className="content">
        <div className="popup-wrap">
          {popupVisible && (
            <div className="popup">
              <button onClick={onContact}>
                Click to Copy email address to clipboard
              </button>
            </div>
          )}
          <button onClick={() => {}}>Get in touch</button>
        </div>
        <div className="social">
          <a href="https://github.com/theruther4d">
            <Github width={36} height={36} />
          </a>
          <a href="https://www.linkedin.com/in/josh-rutherford-b10b2190">
            <Linkedin width={36} height={36} />
          </a>
          <a href="https://codepen.io/the_ruther4d">
            <Codepen width={36} height={36} />
          </a>
        </div>
      </div>
    </footer>
  );
}

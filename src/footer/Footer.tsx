import { useEffect, useRef, useState, MouseEvent } from "react";
import { ReactComponent as Codepen } from "./icons/codepen.svg";
import { ReactComponent as Github } from "./icons/github.svg";
import { ReactComponent as Linkedin } from "./icons/linkedin.svg";
import { ReactComponent as Copy } from "./icons/clipboard.svg";
import { ReactComponent as CopyFailed } from "./icons/clipboard-sad.svg";
import { ReactComponent as CopySuccess } from "./icons/clipboard-check.svg";

import callme from "./call-me.png";
import hearts from "./hearts.png";
import awww from "./awww.png";
import fuck from "./fuck.png";

import "./footer.scss";

const address = "contact@joshrutherford.me";
const RESET_MS = 4000;

export function Footer() {
  const unmounted = useRef(false);
  const focused = useRef(false);
  const resetTimer = useRef<NodeJS.Timeout | number>();
  const input = useRef<HTMLInputElement | null>(null);
  const [copied, setCopied] = useState(false);
  const [failed, setFailed] = useState(false);
  const CopyIcon = failed ? CopyFailed : copied ? CopySuccess : Copy;

  const onSelect = () => {
    if (!input.current) return;
    if (focused.current) return;

    input.current.setSelectionRange(0, address.length);
    focused.current = true;
  };

  const onCopy = (e: MouseEvent) => {
    if (failed) return;

    try {
      navigator.clipboard.writeText(address);

      setCopied(true);

      clearTimeout(resetTimer.current as number);
      resetTimer.current = setTimeout(function resetCopiedState() {
        if (unmounted.current) return;
        setCopied(false);
      }, RESET_MS);
    } catch (e) {
      setCopied(false);
      setFailed(true);
    } finally {
      (e.target as HTMLButtonElement).blur();
    }
  };

  useEffect(() => {
    unmounted.current = false;

    return function onUnmount() {
      unmounted.current = true;
    };
  }, []);

  return (
    <footer className="footer">
      <div className="contact" id="get-in-touch">
        <figure className={failed ? "failed" : copied ? "copied" : ""}>
          <img
            className="uncopied-img"
            src={callme}
            width="173px"
            height="173px"
            alt="Cartoon of me making a phone gesture with my hand"
            aria-hidden={copied}
          />
          <img
            className="copied-img"
            src={awww}
            width="173px"
            height="173px"
            alt="Cartoon of me making a heart gesture with my hands"
            aria-hidden={!copied && !failed}
          />
          <img
            className="failed-img"
            src={fuck}
            width="173px"
            height="173px"
            alt="Cartoon of me making a heart gesture with my hands"
            aria-hidden={!failed}
          />
        </figure>
        <h3>Get in touch</h3>
        <div className="contact-button">
          <button
            disabled={failed}
            className="copy"
            onClick={onCopy}
            title="Copy email address to clipboard"
          >
            <CopyIcon width={24} height={24} />
          </button>
          <div className="email-wrap">
            <input
              ref={input}
              className="email"
              value={address}
              onChange={function preventChange() {}}
              onClick={onSelect}
              onBlur={() => (focused.current = false)}
            />
            <div className="width-holder">{address}</div>
          </div>
          <div className="message">
            {failed ? (
              <div className="error-message">
                Oops! Something went wrong. Try copying it manually 🥲
              </div>
            ) : copied ? (
              <div className="success-message">Copied! 🎉</div>
            ) : null}
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

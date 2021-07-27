import { useEffect, useRef, useState, MouseEvent } from "react";
import { ReactComponent as Codepen } from "./icons/codepen.svg";
import { ReactComponent as Github } from "./icons/github.svg";
import { ReactComponent as Linkedin } from "./icons/linkedin.svg";
import { ReactComponent as Copy } from "./icons/clipboard.svg";
import { ReactComponent as CopyFailed } from "./icons/clipboard-sad.svg";
import { ReactComponent as CopySuccess } from "./icons/clipboard-check.svg";
import { ReactComponent as SourceCode } from "./icons/code.svg";
import { ReactComponent as PDF } from "./icons/pdf.svg";

import callme from "./call-me.png";
import hearts from "./hearts.png";
import fuck from "./fuck.png";
import highFive from "./high-five.png";

import "./footer.scss";

export const address = "contact@joshrutherford.me";
const RESET_MS = 4000;

export function Footer() {
  const unmounted = useRef(false);
  const focused = useRef(false);
  const resetTimer = useRef<NodeJS.Timeout | number>();
  const input = useRef<HTMLInputElement | null>(null);
  const [copied, setCopied] = useState(false);
  const [failed, setFailed] = useState(false);

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
      <div className="contact noprint" id="get-in-touch">
        <figure
          className={cn("noprint", {
            failed,
            copied,
          })}
        >
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
            src={highFive}
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
        <h3 className="noprint">Get in touch</h3>
        <div className="contact-button">
          <button
            disabled={copied || failed}
            className={cn("copy noprint", { copied, failed })}
            onClick={onCopy}
            title="Copy email address to clipboard"
          >
            <div
              className={cn("icon-wrap", {
                failed,
                success: copied,
              })}
            >
              <CopySuccess />
              <Copy className="icon" />
              <CopyFailed />
            </div>
          </button>
          <div className="email-wrap">
            <input
              ref={input}
              className="email"
              aria-label="copy my email address"
              value={address}
              onChange={function preventChange() {}}
              onClick={onSelect}
              onBlur={() => (focused.current = false)}
            />
            <div className="width-holder">{address}</div>
          </div>
          <div className="message noprint">
            {failed ? (
              <div className="error-message">
                Oops! Something went wrong. Try copying it manually :/
              </div>
            ) : copied ? (
              <div className="success-message">Copied!</div>
            ) : null}
          </div>
        </div>
      </div>
      <div className="meta">
        <div className="social">
          <a href="https://github.com/theruther4d" title="Github">
            <Github />
          </a>
          <a href="https://codepen.io/the_ruther4d" title="Codepen">
            <Codepen />
          </a>
          <a
            href="https://www.linkedin.com/in/josh-rutherford-b10b2190"
            title="Linkedin"
          >
            <Linkedin />
          </a>
          <div className="gap noprint">
            <a href="https://github.com/theruther4d/jushy" title="Source">
              <SourceCode />
            </a>
            <a
              href={`${process.env.PUBLIC_URL}/josh-rutherford-resume.pdf`}
              title="Download as PDF"
            >
              <PDF />
            </a>
          </div>
        </div>
        <span className="copyright noprint">
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

function cn(...classNames: Array<string | Record<string, any>>) {
  return classNames.reduce(function combine(combined: string, current) {
    if (typeof current === "string") {
      return `${combined} ${current}`;
    }

    const valid = Object.keys(current).filter((key) =>
      current[key] ? key : ""
    );
    if (!valid.length) return combined;
    return `${combined} ${valid.join(" ")}`;
  }, "");
}

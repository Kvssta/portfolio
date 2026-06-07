"use client";

import {
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import Link from "next/link";
import {
  motion,
  useAnimationControls,
  useMotionValue,
  useSpring,
} from "motion/react";
import { SoundProvider, usePatch } from "@web-kits/audio/react";
import type { SoundPatch } from "@web-kits/audio";
import minimalJson from "@/sounds/minimal.json";
import {
  SignatureTablet,
  type Signature,
  type SignatureHandle,
} from "./signature-tablet";
import { SignatureReplay } from "./signature-replay";

const minimalPatch = minimalJson as unknown as SoundPatch;
const EASE = [0.23, 1, 0.32, 1] as const;
// Collapsed input height: 14px padding top/bottom + 20px line.
const INPUT_H = 48;
// Card proportions from Figma (480×290).
const CARD_RATIO = 290 / 480;

type SignState = "unsigned" | "signing" | "signed";

/**
 * Membership-card playground (Figma 51:364 / 51:374 / 51:323 / 51:420).
 * Desktop-only. Name input morphs into the card; "Sign card" opens a signature
 * tablet below it; "Approve Signature" stamps the drawing onto the card.
 */
export function MembershipCardFlow() {
  return (
    <SoundProvider>
      <MembershipCardFlowInner />
    </SoundProvider>
  );
}

function MembershipCardFlowInner() {
  const patch = usePatch(minimalPatch);
  const patchRef = useRef(patch);
  patchRef.current = patch;
  const playSound = (name: string) => {
    if (patchRef.current.ready) patchRef.current.play(name);
  };

  const [phase, setPhase] = useState<"input" | "card">("input");
  const [name, setName] = useState("");
  const [instant, setInstant] = useState(false); // skip the morph (refresh)
  const [fullWidth, setFullWidth] = useState(0);
  const [cardWidth, setCardWidth] = useState(0);
  const [cardHeight, setCardHeight] = useState(0);
  const [signState, setSignState] = useState<SignState>("unsigned");
  const [signature, setSignature] = useState<Signature | null>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const tabletRef = useRef<SignatureHandle>(null);
  const shake = useAnimationControls();

  useEffect(() => {
    if (boxRef.current) setFullWidth(boxRef.current.offsetWidth);
  }, []);

  const trimmed = name.trim();
  const canContinue = trimmed.length >= 3;
  // Title-case for the card: first letter of each word upper, the rest lower.
  const displayName = trimmed
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w[0].toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
  const isCard = phase === "card";

  // Subtle 3D tilt that follows the cursor while hovering the card.
  const tiltX = useMotionValue(0);
  const tiltY = useMotionValue(0);
  const rotateX = useSpring(tiltX, { stiffness: 150, damping: 15 });
  const rotateY = useSpring(tiltY, { stiffness: 150, damping: 15 });
  const onCardMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!isCard) return;
    const r = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    const MAX = 8;
    tiltX.set(py * MAX);
    tiltY.set(-px * MAX);
  };
  const onCardLeave = () => {
    tiltX.set(0);
    tiltY.set(0);
  };

  const toCard = () => {
    if (!canContinue) return;
    const w = boxRef.current?.offsetWidth || 576;
    const cardW = Math.max(200, w - 100); // 100px narrower than the column
    setInstant(false);
    setFullWidth(w);
    setCardWidth(cardW);
    setCardHeight(Math.round(cardW * CARD_RATIO));
    setSignState("unsigned");
    setSignature(null);
    setPhase("card");
  };

  // Refresh — jump straight back to the name input, no morph.
  const reset = () => {
    playSound("page-exit");
    setInstant(true);
    setName("");
    setSignState("unsigned");
    setSignature(null);
    setPhase("input");
  };

  const signLabel =
    signState === "signing"
      ? "Approve Signature"
      : signState === "signed"
        ? "Sign again"
        : "Sign card";

  const onSign = () => {
    if (signState === "unsigned") {
      setSignState("signing");
    } else if (signState === "signing") {
      const data = tabletRef.current?.capture() ?? null;
      if (!data) {
        // Can't approve an empty signature — gentle shake + error sound.
        playSound("error");
        shake.start({
          x: [0, -5, 4, -3, 2, -1, 0],
          transition: { duration: 0.4, ease: "easeInOut" },
        });
        return;
      }
      playSound("success");
      setSignature(data);
      setSignState("signed");
    } else {
      // signed → start over
      tabletRef.current?.clear();
      setSignature(null);
      setSignState("signing");
    }
  };

  const backLink = (
    <Link
      href="/"
      className="w-fit text-[#8d8d8d] transition-colors duration-150 ease-(--ease-out-strong) [@media(hover:hover)]:hover:text-black"
    >
      Index
    </Link>
  );

  return (
    <main className="flex min-h-screen w-full justify-center bg-white px-5 text-black">
      {/* Mobile — this flow is desktop-only. */}
      <div className="flex min-h-screen w-full flex-col text-[14px] leading-[20px] font-sans font-medium md:hidden">
        <div className="pt-12">{backLink}</div>
        <div className="flex flex-1 flex-col items-center justify-center gap-4 pb-16 text-center">
          <svg
            viewBox="0 0 16.6667 15.0002"
            className="size-5 text-black"
            fill="currentColor"
            aria-hidden
          >
            <path d="M0 2.5C0 1.11929 1.11929 0 2.5 0H14.1667C15.5474 0 16.6667 1.11929 16.6667 2.5V9.16667C16.6667 10.5474 15.5474 11.6667 14.1667 11.6667H2.5C1.11929 11.6667 0 10.5474 0 9.16667V2.5Z" />
            <path d="M3.60462 14.9547C5.09049 14.4436 6.68007 14.1667 8.33356 14.1667C9.98705 14.1667 11.5766 14.4436 13.0625 14.9547C13.4977 15.1044 13.9719 14.8729 14.1216 14.4377C14.2713 14.0025 14.0398 13.5283 13.6046 13.3786C11.9471 12.8085 10.1745 12.5 8.33356 12.5C6.49262 12.5 4.71998 12.8085 3.0625 13.3786C2.62729 13.5283 2.39584 14.0025 2.54554 14.4377C2.69524 14.8729 3.16941 15.1044 3.60462 14.9547Z" />
          </svg>
          <p className="text-black">Please view this page on desktop.</p>
        </div>
      </div>

      {/* Desktop — the membership-card flow. */}
      <div className="hidden w-full max-w-[576px] flex-col md:flex">
        <div className="flex items-center justify-between pt-12 text-[14px] leading-[20px] font-sans font-medium">
          {backLink}
          {isCard ? (
            <button
              type="button"
              onClick={reset}
              aria-label="Start over"
              className="cursor-pointer text-[#8d8d8d] transition-colors duration-150 ease-(--ease-out-strong) [@media(hover:hover)]:hover:text-black"
            >
              <svg
                viewBox="-2.5 -2.5 20 20"
                aria-hidden
                className="size-5"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.66667}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M1.66667 0.833333V3.54167C1.66667 3.88684 1.94649 4.16667 2.29167 4.16667H4.79167M13.3432 14.1667V11.4583C13.3432 11.1132 13.0634 10.8333 12.7182 10.8333H10.0099M0.833333 7.5C0.833333 11.1819 3.8181 14.1667 7.5 14.1667C9.69685 14.1667 11.6919 13.1041 12.9167 11.4648M14.1667 7.5C14.1667 3.8181 11.1819 0.833333 7.5 0.833333C5.30315 0.833333 3.30807 1.89593 2.08333 3.5352" />
              </svg>
            </button>
          ) : null}
        </div>

        <div className="flex flex-1 flex-col items-center justify-center py-16">
          <motion.div
            animate={shake}
            className="relative w-full text-[14px] leading-[20px] font-sans font-medium"
          >
            {/* Prompt — anchored above the box so it doesn't shift it; fades out. */}
            <motion.p
              initial={false}
              animate={{ opacity: isCard ? 0 : 1 }}
              transition={instant ? { duration: 0 } : { duration: 0.2, ease: EASE }}
              className="absolute bottom-full left-0 mb-3 text-black"
            >
              Hi! What&rsquo;s your name
            </motion.p>

            {/* The morphing box: input → card. */}
            <motion.div
              ref={boxRef}
              initial={false}
              animate={{
                width: isCard ? cardWidth : fullWidth || undefined,
                height: isCard ? cardHeight : INPUT_H,
                backgroundColor: isCard ? "#0013e5" : "#f9f9f9",
                borderRadius: isCard ? 26.628 : 12,
              }}
              transition={
                instant
                  ? { duration: 0 }
                  : {
                      width: { duration: 0.5, ease: EASE },
                      height: { duration: 0.5, ease: EASE },
                      borderRadius: { duration: 0.5, ease: EASE },
                      backgroundColor: {
                        duration: 0.35,
                        delay: 0.45,
                        ease: "linear",
                      },
                    }
              }
              onPointerMove={onCardMove}
              onPointerLeave={onCardLeave}
              style={{ rotateX, rotateY, transformPerspective: 800 }}
              className="relative mx-auto w-full overflow-hidden"
            >
              {!isCard ? (
                <>
                  <input
                    type="text"
                    value={name}
                    autoFocus
                    maxLength={20}
                    onChange={(e) => setName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key !== "Enter") return;
                      if (canContinue) {
                        toCard();
                      } else {
                        // Can't continue yet — shake the input + error sound.
                        playSound("error");
                        shake.start({
                          x: [0, -5, 4, -3, 2, -1, 0],
                          transition: { duration: 0.4, ease: "easeInOut" },
                        });
                      }
                    }}
                    placeholder="e.g John"
                    aria-label="Your name"
                    className="absolute inset-0 h-full w-full bg-transparent py-[14px] pr-12 pl-[14px] text-[#202020] outline-none placeholder:text-[#8d8d8d]"
                  />
                  {trimmed.length >= 3 ? (
                    <motion.button
                      type="button"
                      initial={{ opacity: 0, scale: 0.85 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.18, ease: EASE }}
                      onClick={toCard}
                      aria-label="Continue"
                      className="absolute top-2 right-2 flex size-8 cursor-pointer items-center justify-center rounded-[8px] bg-black/[0.04] font-sans text-[14px] leading-none font-medium text-[#838383] transition-colors duration-150 hover:bg-black/[0.08] [@media(hover:hover)]:hover:text-black"
                    >
                      <span className="block translate-y-[1.5px]">↵</span>
                    </motion.button>
                  ) : null}
                </>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3, delay: 0.6, ease: EASE }}
                  className="absolute inset-0"
                >
                  {signState === "signed" && signature ? (
                    <div className="pointer-events-none absolute top-8 left-8">
                      {/* Drawn along the exact path it was written. */}
                      <SignatureReplay
                        width={signature.width}
                        height={signature.height}
                        strokes={signature.strokes}
                      />
                    </div>
                  ) : null}
                  <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-[31.58px]">
                    <div className="flex min-w-0 flex-col">
                      <p className="truncate text-white">{displayName}&rsquo;s card</p>
                      <p className="text-white/50">0 calories tracked</p>
                    </div>
                    <button
                      type="button"
                      onClick={onSign}
                      className="shrink-0 cursor-pointer rounded-full bg-white/[0.12] px-[14px] py-2 whitespace-nowrap text-white transition-colors duration-150 hover:bg-white/20"
                    >
                      {signLabel}
                    </button>
                  </div>
                </motion.div>
              )}
            </motion.div>

            {/* Signature tablet — the rounded box animates its own height, so
                its corners stay rounded while the card glides up / back. */}
            {isCard ? (
              <div className="flex w-full flex-col items-center">
                <SignatureTablet
                  ref={tabletRef}
                  open={signState === "signing"}
                  onClear={() => playSound("delete")}
                />
                {signState === "signing" ? (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3, delay: 0.2, ease: EASE }}
                    className="mt-3 text-[12px] leading-[16px] text-[#8d8d8d]"
                  >
                    Captured at 1:1 scale
                  </motion.p>
                ) : null}
              </div>
            ) : null}
          </motion.div>
        </div>
      </div>
    </main>
  );
}

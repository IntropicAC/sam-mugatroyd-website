'use client';

import { motion } from "framer-motion";
import Image from "next/image";
import FadeInView from "@/components/ui/FadeInView";

function LensDivider() {
  return (
    <div
      className="flex items-center gap-4 my-14 md:my-20"
      aria-hidden="true"
    >
      <div className="flex-1 h-px bg-border" />
      <svg
        viewBox="0 0 20 20"
        className="w-3.5 h-3.5 flex-shrink-0 text-charcoal-muted opacity-40"
        fill="none"
      >
        <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1" />
        <circle cx="10" cy="10" r="4" stroke="currentColor" strokeWidth="0.5" />
        <circle cx="10" cy="10" r="1.5" fill="currentColor" />
      </svg>
      <div className="flex-1 h-px bg-border" />
    </div>
  );
}

export default function CoachingWhyDifferent() {
  return (
    <>
      <section
        className="relative py-16 md:py-32 px-5 md:px-8 lg:px-12 bg-cream overflow-hidden"
        aria-label="Why this work is different"
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-50"
          style={{
            background:
              "linear-gradient(90deg, rgba(61,89,72,0.045) 0 1px, transparent 1px 100%), linear-gradient(180deg, rgba(61,89,72,0.035) 0 1px, transparent 1px 100%)",
            backgroundSize: "82px 82px",
          }}
          aria-hidden="true"
        />

        <div className="relative max-w-7xl mx-auto">
          <FadeInView>
            <p className="font-body text-xs text-charcoal-muted tracking-[0.18em] uppercase mb-6">
              Why this work is different
            </p>
          </FadeInView>

          <div className="grid lg:grid-cols-[0.72fr_1fr] gap-8 lg:gap-16 items-start">
            <div className="lg:sticky lg:top-28">
              <FadeInView delay={0.1}>
                <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl text-charcoal mb-6 md:mb-8 leading-tight">
                  What I Do Not Do
                </h2>
              </FadeInView>
              <FadeInView delay={0.18}>
                <p className="font-body text-sm md:text-base text-charcoal-mid leading-relaxed max-w-md mb-6">
                  The work I will not do, and the work I will. The contrast is
                  the point.
                </p>
              </FadeInView>
              <div className="hidden lg:block h-px w-20 bg-green/50" aria-hidden="true" />
            </div>

            <div className="space-y-5 md:space-y-6">
              <FadeInView delay={0.15}>
                <div className="relative border border-border bg-cream-deep/75 px-5 py-6 md:px-8 md:py-9">
                  <svg
                    viewBox="0 0 24 24"
                    className="pointer-events-none absolute top-5 right-5 w-4 h-4 text-charcoal-muted/35"
                    fill="none"
                    aria-hidden="true"
                  >
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="0.8" />
                    <circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="0.6" />
                    <circle cx="12" cy="12" r="1.5" fill="currentColor" />
                  </svg>
                  <p className="font-heading italic text-xl md:text-2xl text-charcoal leading-snug pr-10">
                    This is not motivation. Motivation fades.
                  </p>
                </div>
              </FadeInView>

              <div>
                <FadeInView delay={0.2}>
                  <p className="font-body text-[10px] text-charcoal-muted tracking-[0.22em] uppercase mb-3 md:mb-4">
                    What it is not
                  </p>
                </FadeInView>

                <div className="grid gap-3">
                  {[
                    "I am not going to give you a morning routine.",
                    "I am not going to tell you to journal your limiting beliefs or repeat affirmations until something shifts.",
                    "I am not interested in a version of you that feels good for three weeks and then quietly drifts back to the same patterns with a different name.",
                  ].map((item, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 12 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{
                        duration: 0.7,
                        delay: 0.26 + i * 0.08,
                        ease: [0.16, 1, 0.3, 1],
                      }}
                      viewport={{ once: true, margin: "-60px" }}
                      className="flex items-start gap-4 border border-border/70 bg-cream/55 px-5 py-4 md:px-6 md:py-5"
                    >
                      <span
                        className="flex-shrink-0 mt-1 inline-flex items-center justify-center w-5 h-5 border border-charcoal-muted/40 text-charcoal-muted/70"
                        aria-hidden="true"
                      >
                        <svg viewBox="0 0 10 10" className="w-2.5 h-2.5" fill="none">
                          <path
                            d="M1.5 1.5 L8.5 8.5 M8.5 1.5 L1.5 8.5"
                            stroke="currentColor"
                            strokeWidth="1.2"
                            strokeLinecap="round"
                          />
                        </svg>
                      </span>
                      <p className="font-body text-base text-charcoal-mid leading-relaxed">
                        {item}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-4 pt-2" aria-hidden="true">
                <div className="flex-1 h-px bg-charcoal-muted/20" />
                <p className="font-body text-[10px] text-green tracking-[0.22em] uppercase">
                  What it is
                </p>
                <div className="flex-1 h-px bg-charcoal-muted/20" />
              </div>

              <FadeInView delay={0.5}>
                <div className="relative overflow-hidden border border-green/25 bg-charcoal px-5 py-6 md:px-8 md:py-9">
                  <div
                    className="pointer-events-none absolute -right-12 -top-12 h-36 w-36 rounded-full border border-cream/10"
                    aria-hidden="true"
                  />
                  <div
                    className="pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full border border-green/25"
                    aria-hidden="true"
                  />
                  <p className="font-body text-base md:text-lg text-cream/75 leading-relaxed">
                    What I offer is a fundamental change in how you see yourself
                    and the world around you, the kind that does not wear off
                    because it is not built on effort or willpower.
                    {" "}
                    <span className="text-green-hover font-heading italic">
                      It is built on understanding.
                    </span>
                  </p>
                </div>
              </FadeInView>

              <FadeInView delay={0.57}>
                <div className="border border-border bg-cream px-5 py-6 md:px-8 md:py-8">
                  <p className="font-body text-base text-charcoal-mid leading-relaxed">
                    Once you see why you built the mask, you cannot pretend it
                    is not there. Once you understand what is actually driving
                    the people-pleasing, the overthinking and the performance,
                    it loses its grip. Not because you fought it. Because you
                    finally saw it clearly.
                  </p>
                </div>
              </FadeInView>

              <FadeInView delay={0.64}>
                <div className="border border-green/35 bg-green/10 px-5 py-5 md:px-7 md:py-6">
                  <p className="font-heading italic text-lg md:text-xl text-green leading-snug pl-4 border-l-2 border-green/50">
                    You cannot unlearn that kind of thing.
                  </p>
                </div>
              </FadeInView>
            </div>
          </div>

          <LensDivider />

          <div className="relative overflow-hidden border border-border bg-cream-deep/70 px-5 py-8 md:px-8 md:py-10 lg:px-12 lg:py-12">
            <div
              className="pointer-events-none absolute right-0 top-0 h-64 w-64 translate-x-1/3 -translate-y-1/3 rounded-full border border-green/20"
              aria-hidden="true"
            />
            <div
              className="pointer-events-none absolute left-0 bottom-0 h-56 w-56 -translate-x-1/3 translate-y-1/3 rounded-full bg-green/10 blur-3xl"
              aria-hidden="true"
            />

            <div className="relative grid lg:grid-cols-[0.68fr_1fr] gap-8 lg:gap-16 items-start">
              <div className="lg:sticky lg:top-28">
                <FadeInView>
                  <p className="font-body text-[10px] text-charcoal-muted tracking-[0.18em] uppercase mb-5">
                    Who this is for
                  </p>
                </FadeInView>
                <FadeInView delay={0.06}>
                  <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl text-charcoal mb-8 leading-tight">
                    Who Is This For?
                  </h2>
                </FadeInView>
                <div className="hidden lg:block h-px w-20 bg-green/50" aria-hidden="true" />
              </div>

              <div className="relative">
                <FadeInView delay={0.1}>
                  <div className="relative z-10 border border-charcoal/10 bg-cream px-5 py-6 shadow-[12px_12px_0_rgba(61,89,72,0.10)] md:px-8 md:py-8">
                    <p className="font-heading italic text-xl md:text-3xl text-charcoal leading-snug">
                      You do not have to be falling apart for this to be for you.
                    </p>
                  </div>
                </FadeInView>

                <div className="grid gap-4 pt-5 md:grid-cols-2">
                  <FadeInView delay={0.18}>
                    <div className="h-full border-l-2 border-green/35 bg-cream/70 px-5 py-5">
                      <p className="font-body text-sm md:text-base text-charcoal-mid leading-relaxed">
                        Most people who work with me are functioning fine on the outside.
                      </p>
                    </div>
                  </FadeInView>
                  <FadeInView delay={0.25}>
                    <div className="h-full border-l-2 border-green/35 bg-cream/70 px-5 py-5">
                      <p className="font-body text-sm md:text-base text-charcoal-mid leading-relaxed">
                        They are capable. Reliable. Well-liked. They show up.
                      </p>
                    </div>
                  </FadeInView>
                </div>

                <FadeInView delay={0.32}>
                  <div className="mt-5 border border-border bg-cream px-5 py-6 md:px-8 md:py-8">
                    <p className="font-body text-sm md:text-base text-charcoal-mid leading-relaxed">
                      But something underneath all of that has been subtly off for a
                      long time. A sense that the life they are living was built
                      around what was expected of them rather than what is actually
                      true for them. A feeling that they have been so busy becoming
                      someone people like and accept that they have never really
                      asked who they are when no one is watching.
                    </p>
                  </div>
                </FadeInView>

                <div className="grid gap-4 pt-5 md:grid-cols-[0.9fr_1.1fr]">
                  <FadeInView delay={0.39}>
                    <div className="h-full border border-border bg-cream/70 px-5 py-5">
                      <p className="font-body text-sm md:text-base text-charcoal-mid leading-relaxed">
                        You do not need to be in crisis to want something more honest
                        than this.
                      </p>
                    </div>
                  </FadeInView>
                  <FadeInView delay={0.46}>
                    <div className="h-full border border-green/35 bg-green/10 px-5 py-5">
                      <p className="font-heading italic text-lg text-green leading-snug pl-4 border-l-2 border-green/50">
                        You just need to be ready to look at things differently.
                      </p>
                    </div>
                  </FadeInView>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        className="relative py-20 md:py-32 px-5 md:px-8 lg:px-12 bg-charcoal overflow-hidden"
        aria-label="Why Sam"
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(to bottom, transparent, transparent 71px, #F5F0EA 71px, #F5F0EA 72px)",
          }}
          aria-hidden="true"
        />

        <div className="relative max-w-7xl mx-auto">
          <FadeInView>
            <p className="font-body text-[10px] text-cream/35 tracking-[0.22em] uppercase mb-10">
              Why Sam?
            </p>
          </FadeInView>

          <div className="overflow-hidden">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
              viewport={{ once: true, margin: "-80px" }}
              className="float-right ml-4 mb-4 md:ml-8 md:mb-5 w-28 sm:w-32 md:w-44 lg:w-52"
            >
              <div className="relative aspect-[3/4] overflow-hidden">
                <Image
                  src="/images/sam-headshot.jpg"
                  alt="Sam Murgatroyd - Authenticity Coach and Author"
                  fill
                  className="object-cover object-top"
                  sizes="(max-width: 640px) 112px, (max-width: 768px) 128px, (max-width: 1024px) 176px, 208px"
                />
                <div
                  className="absolute inset-0 mix-blend-multiply"
                  style={{ backgroundColor: "rgba(26,40,32,0.25)" }}
                  aria-hidden="true"
                />
              </div>
              <div className="mt-2.5">
                <p className="font-heading text-xs text-cream leading-snug">
                  Sam Murgatroyd
                </p>
                <p className="font-body text-[10px] text-cream/45 mt-0.5 leading-snug">
                  Authenticity Coach · Author
                </p>
                <p className="font-body text-[10px] text-green-hover mt-1 leading-snug">
                  Amazon Bestseller
                </p>
              </div>
            </motion.div>

            <FadeInView className="mb-4 md:mb-5">
              <h2 className="font-heading text-2xl md:text-3xl text-cream leading-tight">
                Why Sam?
              </h2>
            </FadeInView>

            <FadeInView delay={0.08} className="mb-4 md:mb-5">
              <p className="font-heading italic text-base md:text-lg text-cream leading-snug">
                I did not learn this from a course.
              </p>
            </FadeInView>

            <FadeInView delay={0.15} className="mb-4 md:mb-5">
              <p className="font-body text-sm md:text-base text-cream/55 leading-relaxed">
                Before coaching I spent years working in psychiatric
                hospitals, probation services, children&apos;s care homes, drug
                and alcohol rehabilitation services and SEN schools. I have
                worked with people at their lowest points and darkest times,
                and across such a wide range of backgrounds and experiences
                that I have developed a genuine understanding of the many
                different ways people see themselves and the world around them.
              </p>
            </FadeInView>

            <FadeInView delay={0.22} className="mb-4 md:mb-5">
              <p className="font-body text-sm md:text-base text-cream/55 leading-relaxed">
                What I saw in almost all of those environments, and what I
                have seen in every person I have coached since, was the same
                thing.
              </p>
            </FadeInView>

            <FadeInView delay={0.3} className="mb-4 md:mb-5">
              <p className="font-heading italic text-base md:text-lg text-cream/80 leading-snug pl-4 border-l-2 border-green/50">
                People who had spent so long becoming who they thought they
                had to be that they had completely lost sight of who they
                actually were.
              </p>
            </FadeInView>

            <FadeInView delay={0.38} className="mb-4 md:mb-5">
              <p className="font-body text-sm md:text-base text-cream/55 leading-relaxed">
                I have also written three books exploring exactly this
                territory. Identity, honesty, what it costs us to perform and
                what becomes possible when we stop. Not because I figured it
                out from the outside. Because I lived it from the inside.
              </p>
            </FadeInView>

            <FadeInView delay={0.45}>
              <p className="font-heading italic text-base md:text-lg text-green-hover leading-snug">
                This work comes from somewhere real. That is why it lands the
                way it does.
              </p>
            </FadeInView>
          </div>
        </div>
      </section>
    </>
  );
}

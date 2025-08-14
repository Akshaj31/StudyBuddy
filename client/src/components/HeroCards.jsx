import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const HeroCards = () => {
  const cardsRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.utils.toArray(".feature-item").forEach((item, i) => {
        gsap.fromTo(
          item,
          { y: 60, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 1.2,
            ease: "power4.out",
            scrollTrigger: {
              trigger: item,
              start: "top 85%",
              toggleActions: "play none none reverse",
              once: true,
            },
            delay: i * 0.15,
          }
        );
      });
    }, cardsRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={cardsRef} className="features flex justify-center px-6 md:px-12 py-20 bg-black/20 min-h-screen">
      <div className="grid md:grid-cols-3 gap-12 max-w-6xl text-center">
        {[
          {
            title: "📚 Smarter Notes",
            color: "text-[#ffd859]",
            desc: "AI-generated summaries tailored to your learning style, helping you focus on key concepts and save study time.",
          },
          {
            title: "⚡ Instant Doubt Solving",
            color: "text-[#4f8bff]",
            desc: "Get instant, clear answers to your questions anytime, so you never get stuck during your study sessions.",
          },
          {
            title: "🧠 AI-Powered Revision",
            color: "text-[#ff8b8b]",
            desc: "Engage with smart flashcards and personalized quizzes that adapt to your progress and reinforce your knowledge.",
          },
        ].map(({ title, color, desc }, i) => (
          <div
            key={i}
            className="feature-item bg-white/10 border border-gray-700 p-8 rounded-2xl shadow-lg hover:shadow-yellow-400/60 transition-shadow cursor-pointer"
          >
            <h3 className={`text-2xl font-bold mb-4 ${color}`}>{title}</h3>
            <p className="text-gray-300 text-base leading-relaxed">{desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default HeroCards;   
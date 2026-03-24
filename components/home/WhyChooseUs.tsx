"use client";

import { motion } from "framer-motion";
import { Shield, MapPin, BadgeDollarSign, CreditCard } from "lucide-react";

export type WhyChooseUsContent = {
  title: string;
  subtitle?: string;
  cards: Array<{
    title: string;
    description: string;
    stat?: string;
  }>;
};

const WHY_ICONS = [Shield, MapPin, BadgeDollarSign, CreditCard] as const;

export function WhyChooseUs({ content }: { content: WhyChooseUsContent }) {
  const cards = content.cards.slice(0, 4);

  return (
    <section className="py-16 px-4 bg-secondary/50">
      <div className="container">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="font-hero text-3xl md:text-4xl font-bold text-center text-foreground"
        >
          {content.title}
        </motion.h2>
        {content.subtitle ? (
          <p className="text-center text-muted-foreground mt-2 max-w-2xl mx-auto">{content.subtitle}</p>
        ) : null}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mt-10">
          {cards.map((card, i) => {
            const Icon = WHY_ICONS[i] ?? Shield;
            return (
              <motion.div
                key={`${card.title}-${i}`}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-card rounded-2xl p-5 shadow-card text-center"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto">
                  <Icon className="w-6 h-6 text-yellow-500" />
                </div>
                <h3 className="font-heading font-semibold mt-3 text-foreground text-sm md:text-base">
                  {card.title}
                </h3>
                <p className="text-muted-foreground text-xs md:text-sm mt-2">
                  {card.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

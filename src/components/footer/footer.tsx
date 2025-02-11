"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { FooterSection } from "./footer-section";
import { SocialLinks } from "./social-links";

const sections = {
  quickLinks: [
    { label: "Features", href: "/features" },
    // { label: "Team", href: "/team" },
    { label: "Get Started", href: "/get-started" },
  ],
  contact: [
    {
      label: "Email: trexroars0@gmail.com",
      href: "mailto:trexroars0@gmail.com",
    },
    { label: "Location: LPU, Punjab", href: "#" },
  ],
};

export function Footer() {
  return (
    <footer className="border-t w-full overflow-hidden bg-black text-white px-24 ">
      <div className="container py-8">
        <div className="grid gap-1 sm:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="flex items-center space-x-3 p-3 rounded-lg"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, duration: 0.4 }}
              >
                <Image
                  unoptimized
                  src="/videos/t-rex.gif"
                  width={50}
                  height={50}
                  alt="T-Rex Logo"
                />
              </motion.div>
              <div className="flex flex-col">
                <motion.h1
                  initial={{ x: -50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                  className="text-3xl font-extrabold"
                >
                  SAMAY
                  <span
                    className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-pink-500"
                    style={{
                      textShadow:
                        "0 0 8px rgba(255, 0, 150, 0.8), 0 0 15px rgba(255, 0, 150, 0.6)",
                    }}
                  >
                    CHA<b>K</b>RA
                  </span>
                </motion.h1>
                <motion.span
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5, duration: 0.4 }}
                  className="text-sm text-pink-300"
                >
                  Product by T-Rex
                </motion.span>
              </div>
            </motion.div>
            <p className="mt-4 max-w-xs text-sm text-muted-foreground">
              Explore, Experience, and Evolve with Samay<b>Chakra</b> – Your Gateway to Timeless Adventures!
            </p>
            <div className="mt-4">
              <SocialLinks />
            </div>
          </div>

          <FooterSection
            title="Quick Links"
            links={sections.quickLinks}
            delay={0.1}
          />
          <FooterSection title="Contact" links={sections.contact} delay={0.2} />
        </div>

        <div className="mt-8 border-t pt-6">
          <div className="flex flex-col justify-between space-y-4 sm:flex-row sm:space-y-0">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} SamayChakra. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

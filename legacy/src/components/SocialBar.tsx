"use client";

import { FloatingDock } from "@/components/ui/FloatingDock";
import React from "react";
import {
  IconBrandGithub,
  IconBrandLinkedin,
  IconBrandYoutube,
  IconHexagonLetterD,
} from "@tabler/icons-react";

export default function SocialBar() {
  const links = [
    {
      title: "LinkedIn",
      icon: (
        <IconBrandLinkedin className="h-full w-full text-neutral-500 dark:text-neutral-300" />
      ),
      href: "https://linkedin.com/in/ryan-ni",
    },
    {
      title: "GitHub",
      icon: (
        <IconBrandGithub className="h-full w-full text-neutral-500 dark:text-neutral-300" />
      ),
      href: "https://github.com/ryunzz",
    },
    {
      title: "Devpost",
      icon: (
        <IconHexagonLetterD className="h-full w-full text-neutral-500 dark:text-neutral-300" />
      ),
      href: "https://devpost.com/ryan-ni",
    },
    {
      title: "Youtube",
      icon: (
        <IconBrandYoutube className="h-full w-full text-neutral-500 dark:text-neutral-300" />
      ),
      href: "https://www.youtube.com/@ryun-zz",
    },
  ];

  return (
    <section>
      <FloatingDock
        items={links}
      />
    </section>
  );
}
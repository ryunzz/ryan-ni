import Experience from "@/components/Experience";  //uncomment this after making Experience tabs
import LinkWithIcon from "@/components/LinkWithIcon";
import Projects from "@/components/Projects";
import Socials from "@/components/Socials";
import { Button } from "@/components/ui/Button";
import { TextGenerateEffect } from "@/components/ui/TextGenerateEffect";
import {
  FileDown,
  ArrowRightIcon,
  MapPin,
  Mail
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const LIMIT = 2; // for formatting only show 2 max


export default async function Home() {
  
  return (
    <article className="mt-8 flex flex-col gap-16 pb-16">
      <section className="flex flex-col items-start gap-8 md:flex-row-reverse md:items-center md:justify-between">
        <Image
          className="rounded-lg"
          src="/ryan.jpg"
          alt="Photo of Ryan"
          width={175}
          height={175}
          priority
        />
        <div className="flex flex-col">
            <TextGenerateEffect
              className="title text-2xl sm:text-3xl"
              words="hi, i'm Ryan Ni👋"
              duration={0.3}
            />
          <p className="mt-4 font-light">
            Software Engineer | Full Stack Developer
          </p>
          

          <div className=" flex items-center font-light">
            <MapPin className="mr-2 size-5 " /> California, USA |

            <Link href="mailto:rani@ucsd.edu?subject=Hello&body=Hi Ryan, I would like to get in touch with you!">
              <div className=" flex items-center font-light hover:text-blue">
                <Mail className=" ml-2 mr-2 size-5 " />
                rani@ucsd.edu
              </div>
            </Link>
          </div>

          <section className="mt-8 flex items-center gap-8">
            <Link href="/Ryan Ni Resume.pdf" target="_blank">
              <Button variant="outline">
                <span className="font-semibold ">Resume</span>
                <FileDown className="ml-2 size-5 animate-bounce" />
              </Button>
            </Link>
            <Socials />
          </section>
        </div>
      </section>

      <Experience />
      <section className="flex flex-col gap-8">
        <div className="flex justify-between">
          <h2 className="title text-2xl sm:text-3xl">Recent Projects</h2>
          <LinkWithIcon
            href="/projects"
            position="right"
            icon={<ArrowRightIcon className="size-5" />}
            text="view more"
          />
        </div>
        <Projects limit={LIMIT} />
      </section>

    </article>
  );
}


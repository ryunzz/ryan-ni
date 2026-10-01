import data from "@/data/socials.json";
import { socialSchema } from "@/lib/schemas";
import Icon from "./Icon";

export default function Socials() {
  const socials = socialSchema.parse(data).socials;

  return (


    <section className="flex gap-6">
      {socials.map((item) => (
        <a
          href={item.href}
          key={item.name}
          target="_blank"
          className=" inline-flex justify-center whitespace-nowrap px-2 py-2 rounded-full border-gray-500  dark:border-neutral-800 border-2 dark:bg-neutral-900 dark:bg-opacity-50
            hover:bg-blue dark:hover:bg-blue

            text-muted-foreground hover:text-foreground"
          rel="noopener noreferrer"
          title={item.name}
        >
          <Icon name={item.icon} className="size-5" />
        </a>
      ))}
    </section>
  );
}

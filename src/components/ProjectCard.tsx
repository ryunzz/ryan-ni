import { Badge } from "@/components/ui/Badge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { Project } from "@/lib/schemas";
import Image from "next/image";
import Link from "next/link";
import Markdown from "react-markdown";
import Icon from "./Icon";

interface Props {
  project: Project;
}

export function ProjectCard({ project }: Props) {
  const { name, href, description, image, tags, links, devpost, awarded } = project;

  return (
    <Card className="flex flex-col hover:translate-y-[-8px] hover:bg-gray-200 dark:hover:bg-gray-900 transform transition ease-out duration-100 ">
      <CardHeader>
        {image && (
          <Link href={href || image}>
            <Image
              src={image}
              alt={name}
              width={500}
              height={400}
              className="h-40 w-full object-cover object-top"
            />
          </Link>
        )}
      </CardHeader>
      <CardContent className="flex flex-col gap-2 ">
        <CardTitle>{name}</CardTitle>

        {devpost && awarded && (
            <Link href={devpost} target="_blank" className="prose max-w-full text-pretty font-sans text-xs text-muted-foreground dark:prose-invert hover:text-blue text-decoration-line: underline">
              {awarded}
            </Link>
          )}

        <Markdown className="prose max-w-full text-pretty font-sans text-xs text-muted-foreground dark:prose-invert">
          {description}
        </Markdown>
      </CardContent>
      <CardFooter className="flex h-full flex-col items-start justify-between gap-4">
        {tags && tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {tags.map((tag) => (
              <Badge
                key={tag}
                className="px-1 py-0 text-[10px]"
                variant="secondary"
              >
                {tag}
              </Badge>
            ))}
          </div>
        )}
        {links && links.length > 0 && (
          <div className="flex flex-row flex-wrap items-start gap-1">
            {links.map((link, idx) => (
              <Link href={link?.href} key={idx} target="_blank">
                <Badge key={idx} className="flex gap-2 px-2 py-1 text-[10px]">
                  <Icon name={link.icon} className="size-3" />
                  {link.name}
                </Badge>
              </Link>
            ))}
          </div>
        )}
      </CardFooter>
    </Card>
  );
}

import { FC, ReactNode } from "react";
import LZString from "lz-string";

export type SankeyLinkProps = {
  code: string;
  width: number;
  height: number;
  children: ReactNode;
};

export const SankeyLink: FC<SankeyLinkProps> = ({
  code,
  children,
  width,
  height,
}) => {
  const codeWithSize = `${code}\nsize w ${width}\n  h ${height}`;
  const lzEncoded = LZString.compressToEncodedURIComponent(codeWithSize);
  const sankeyUrl = `https://sankeymatic.com/build/?i=${lzEncoded}`;
  return (
    <a href={sankeyUrl} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  );
};

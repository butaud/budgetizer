import { FC, ReactNode } from "react";
import LZString from "lz-string";

export type SankeyLinkProps = {
  code: string;
  children: ReactNode;
};

export const SankeyLink: FC<SankeyLinkProps> = ({ code, children }) => {
  const lzEncoded = LZString.compressToEncodedURIComponent(code);
  const sankeyUrl = `https://sankeymatic.com/build/?i=${lzEncoded}`;
  return (
    <a href={sankeyUrl} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  );
};

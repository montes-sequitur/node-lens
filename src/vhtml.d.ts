declare module 'vhtml' {
  function vhtml(
    name: string | ((props: Record<string, unknown>) => string),
    attrs?: Record<string, unknown> | null,
    ...children: unknown[]
  ): string;
  export = vhtml;
}

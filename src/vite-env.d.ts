/// <reference types="vite/client" />

declare module 'json5' {
  const JSON5: {
    parse(text: string, reviver?: (key: string, value: any) => any): any;
    stringify(value: any, replacer?: ((key: string, value: any) => any) | null, space?: string | number): string;
  };
  export default JSON5;
}

declare module 'tinycolor2' {
  interface TinyColorInstance {
    toRgbString(): string;
    toHexString(): string;
    toHslString(): string;
    darken(amount?: number): TinyColorInstance;
    lighten(amount?: number): TinyColorInstance;
    setAlpha(alpha: number): TinyColorInstance;
    spin(degrees: number): TinyColorInstance;
    saturate(amount?: number): TinyColorInstance;
    isValid(): boolean;
    getAlpha(): number;
    getBrightness(): number;
    isLight(): boolean;
    isDark(): boolean;
  }

  namespace tinycolor {
    type Instance = TinyColorInstance;
  }

  function tinycolor(color: string | { r: number; g: number; b: number; a?: number }): TinyColorInstance;
  export default tinycolor;
}

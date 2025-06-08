declare function cn(...classes: (string | undefined | null | false)[]): string;
declare function formatDate(date: Date | string): string;
declare function sleep(ms: number): Promise<void>;

export { cn, formatDate, sleep };

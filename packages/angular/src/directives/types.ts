export type ScopedContext<TItem, TScope> = TScope & { $implicit: TItem }

export function ok<Code extends string, P = undefined>(
  code: Code,
  payload?: P,
): P extends undefined
  ? { ok: true; code: `${Code}` }
  : { ok: true; code: `${Code}`; payload: P } {
  if (payload === undefined) {
    return { ok: true, code: `${code}` } as any;
  }

  return { ok: true, code: `${code}`, payload } as any;
}

export function fail<Code extends string, P = undefined>(
  code: Code,
  payload?: P,
): P extends undefined
  ? { ok: false; code: `${Code}` }
  : { ok: false; code: `${Code}`; payload: P } {
  if (payload === undefined) {
    return { ok: false, code: `${code}` } as any;
  }

  return { ok: false, code: `${code}`, payload } as any;
}

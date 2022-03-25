import hash from 'object-hash';

import {DuckAppearance} from '../duck';

type CompareDecision = (
  dinMissingKinds: string[],
  dofMissingKinds: string[],
) => boolean;

/**
 *
 * @param din duck in nest
 * @param dof duck of finding
 * @param cd decision function
 * @returns boolean
 */
function compareKinds(
  din: DuckAppearance,
  dof: DuckAppearance,
  cd: CompareDecision = (): boolean => true,
): boolean {
  let ks = new Set(Object.keys(din.kinds));
  // missing kinds
  let mks: string[] = [];

  for (let [k, v] of Object.entries(dof.kinds)) {
    if (ks.has(k)) {
      ks.delete(k);

      if (din.kinds[k] !== v) {
        return false;
      }
    } else {
      mks.push(k);
    }
  }

  return cd(mks, [...ks]);
}

/**
 * should match all finding kinds
 * @param din duck in nest
 * @param dof duck of finding
 * @returns
 */
export function strictCompareKinds(
  din: DuckAppearance,
  dof: DuckAppearance,
): boolean {
  return compareKinds(din, dof, k => !k.length);
}

export function hashDuck(duck: DuckAppearance): string | undefined {
  if (Object.keys(duck.identifier).length <= 1) {
    return undefined;
  }

  return hash(duck.identifier);
}

import {DuckAppearance} from '../duck';

export type CompareDecision = (
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
export function compareKinds(
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

      let _v = din.kinds[k];

      if (typeof _v !== typeof v) {
        return false;
      }

      if (_v !== v) {
        if (Array.isArray(v)) {
          if (!Array.isArray(_v)) {
            return false;
          }

          let m = Math.min(v.length, _v.length);

          if (v.slice(0, m).toString() !== _v.slice(0, m).toString()) {
            return false;
          }
        } else {
          return false;
        }
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

import UAParser, {IResult} from 'ua-parser-js';

export function getUA(): Pick<IResult, 'engine' | 'device' | 'os'> {
  let result = new UAParser().getResult();
  return result;
}

import { v4 } from 'uuid';

export const join = (...args: (boolean | string)[]) => args.filter(e => e).join(' ');

export class HelperLib {
  // own
  static async getCurrentState<T>(executor: (value: React.SetStateAction<T>) => void): Promise<T> {
    return new Promise(res => executor((prev: T) => { res(prev); return prev; }));
  }

  static saveToLocalStorage<T>(key: string, value: T) {
    localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
  }

  static removeFromLocalStorage(key: string) {
    localStorage.removeItem(key);
  }

  static getFromLocalStorage<T>(key: string): T | null {
    const result = localStorage.getItem(key);
    return result ? JSON.parse(result) as T : null;
  }

  // common
  static generateUniqueId = () => v4();
  
  static sleep = (ms: number) => new Promise(resolve => { setTimeout(resolve, ms); })

  static isDefined = <T>(argument: T | null | undefined): argument is T => argument !== null && argument !== undefined;

  static isEmptyObject = <T extends object>(obj: T) => Object.keys(obj).length === 0;

  static getEnv = () => process.env.NODE_ENV || 'development';

  static toUTF8 = (str: string) => Buffer.from(str, 'latin1').toString('utf8');

  static getUniqueArray = <T>(arr: T[]) => [...new Set(arr)];

  static getUnix = (date: Date | string = new Date()) => parseInt((new Date(date).getTime() / 1000).toString(), 10);

  static getRandomNumber = (min: number, max: number) => Math.floor(Math.random() * (max - min)) + min;

  // static getRandomString = (limit: number) => crypto.randomBytes(20).toString('hex').substring(0, limit);

  static getQueue = <T>(arr: T[], limiter: number) => {
    const queues = [];
    const lArr = arr.length;
  
    let targetIndex = 0;
    const numberIterations = Math.ceil(lArr / limiter);
  
    for (let i = 0; i < numberIterations; i += 1) {
      const newQueue = [];
  
      let conditionValue = limiter;
  
      if (i === (numberIterations - 1)) {
        conditionValue = lArr - targetIndex;
      }
  
      for (let j = 0; j < conditionValue; j += 1) {
        newQueue.push(arr[targetIndex]);
        targetIndex += 1;
      }
  
      queues.push(newQueue);
    }
  
    return queues;
  };
}

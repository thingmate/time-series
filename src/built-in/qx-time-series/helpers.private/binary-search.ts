export function binarySearch(length: number, callback: (index: number) => number): number {
  let low: number = 0;
  let high: number = length - 1;

  while (low <= high) {
    const mid: number = Math.floor((low + high) / 2);

    const result: number = callback(mid);

    if (result === 0) {
      low = mid;
      break;
    } else if (result < 0) {
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }

  return low;
}

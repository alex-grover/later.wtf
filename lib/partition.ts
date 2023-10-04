export default function partition<T>(
  array: T[],
  filter: (value: T, index: number, array: T[]) => boolean,
) {
  const passing: T[] = []
  const failing: T[] = []

  array.forEach((value, index, array) => {
    const result = filter(value, index, array) ? passing : failing
    result.push(value)
  })

  return [passing, failing]
}

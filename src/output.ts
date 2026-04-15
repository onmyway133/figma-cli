export function output(data: unknown, pretty: boolean): void {
  const json = pretty
    ? JSON.stringify(data, null, 2)
    : JSON.stringify(data)
  process.stdout.write(json + "\n")
}

export function errorExit(message: string): never {
  process.stderr.write(`error: ${message}\n`)
  process.exit(1)
}

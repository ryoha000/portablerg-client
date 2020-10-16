interface FFmpeg {
  load: () => Promise<void>
  write: (path: string, data: string | Uint8Array) => Promise<void>
  writeText: (path: string, text: string) => undefined
  read: (path: string) => Promise<{ data: Uint8Array }>
  remove: (path: string) => Promise<void>
  ls: (path: string) => Promise<string[]>
  transcode: (input: string, output: string, options?: string) => Promise<void>
  trim: (input: string, output: string, from: string | number, to: string | number, options?: string) => Promise<void>
  concatDemuxer: (input: string[], output: string, options?: string) => Promise<void>
  run: (args: string) => Promise<void>
}

import { CucumberExpressions, ParserAdapter, Suggestion } from '@helgardf/cucumber-language-service'
import { WasmParserAdapter } from '@helgardf/cucumber-language-service/wasm'
import { PassThrough } from 'stream'
import { Connection, TextDocuments } from 'vscode-languageserver'
import { createConnection } from 'vscode-languageserver/node'
import { TextDocument } from 'vscode-languageserver-textdocument'

import { CucumberLanguageServer } from '../CucumberLanguageServer.js'
import { Files } from '../Files.js'

export type ServerInfo = {
  writer: NodeJS.WritableStream
  reader: NodeJS.ReadableStream
  server: CucumberLanguageServer
  connection: Connection
}

export function startEmbeddedServer(
  wasmBaseUrl: string,
  makeFiles: (rootUri: string) => Files,
  onReindexed: (
    registry: CucumberExpressions.ParameterTypeRegistry,
    expressions: readonly CucumberExpressions.Expression[],
    suggestions: readonly Suggestion[]
  ) => void
): ServerInfo {
  const adapter: ParserAdapter = new WasmParserAdapter(wasmBaseUrl)
  const inputStream = new PassThrough()
  const outputStream = new PassThrough()

  const connection = createConnection(inputStream, outputStream)
  const documents = new TextDocuments(TextDocument)
  const server = new CucumberLanguageServer(connection, documents, adapter, makeFiles, onReindexed)
  connection.listen()

  return {
    writer: inputStream,
    reader: outputStream,
    server,
    connection,
  }
}

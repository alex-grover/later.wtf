import {
  ColumnType,
  Generated,
  Insertable,
  Selectable,
  Updateable,
} from 'kysely'

export type Database = {
  cast: CastTable
}

export type CastTable = {
  id: Generated<number>
  created_at: ColumnType<Date, string | undefined, never>

  text: string
  scheduled_for: ColumnType<Date, string | undefined, string | undefined>
  channel: string | null
}

export type Cast = Selectable<CastTable>
export type NewCast = Insertable<CastTable>
export type CastUpdate = Updateable<CastTable>

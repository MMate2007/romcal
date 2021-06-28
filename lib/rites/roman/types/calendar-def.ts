import { LiturgicalColors } from '@roman-rite/constants/colors';
import { ProperCycles } from '@roman-rite/constants/cycles';
import { LiturgicalDefBuiltData } from '@roman-rite/general-calendar/proper-of-time';
import { RomcalConfig } from '@roman-rite/models/config';
import LiturgicalDay from '@roman-rite/models/liturgical-day';
import { RomcalConfigInput } from '@roman-rite/types/config';
import { RomcalCalendarMetadata } from '@roman-rite/types/liturgical-day';
import { Dates } from '@roman-rite/utils/dates';
import { PatronTitles, Titles } from '@romcal/constants/martyrology-metadata';
import { SaintCount } from '@romcal/types/martyrology';
import { Dayjs } from 'dayjs';

export type LiturgicalCalendar = Record<string, LiturgicalDay[]>;

export type ParticularConfig = Partial<
  Pick<RomcalConfig, 'ascensionOnSunday' | 'epiphanyOnSunday' | 'corpusChristiOnSunday'>
>;

export type TitlesDef =
  | (Titles | PatronTitles)[]
  | ((titles: (Titles | PatronTitles)[]) => (Titles | PatronTitles)[]);

export type MartyrologyItemPointer = (string | MartyrologyItemRedefined)[];
export type MartyrologyItemRedefined = {
  key: string;
  titles?: TitlesDef;
  hideTitles?: boolean;
  count?: SaintCount;
};

/**
 * General date definition collection, used in the [CalendarDef] class
 */
export type DateDefinitions = Record<string, DateDefInput>;
export type ProperOfTimeDateDefinitions = Record<string, ProperOfTimeDateDefInput>;

/**
 * Used specifically for the Proper of Time.
 */
export type ProperOfTimeDateDefInput = Required<
  Pick<LiturgicalDay, 'precedence' | 'seasons' | 'periods' | 'liturgicalColors' | 'name'>
> & {
  date: (year: number) => Dayjs | null;
  calendar: (date: Dayjs) => RomcalCalendarMetadata;
  isHolyDayOfObligation?: boolean;
};
/**
 * Used for the General Roman Calendar, and any Particular Calendars.
 */
export type DateDefInput = Partial<Pick<LiturgicalDay, 'precedence'>> & PartialInput;

// Partial type def, used bellow on ProperOfTimeDateDefInput and DateDefInput.
type PartialInput = {
  /**
   * Specify a custom locale key for this date definition, in this calendar.
   */
  customLocaleKey?: string;

  /**
   * Date as a String (in the 'M-D' format), or as a Dayjs object.
   */
  date?: string | ((year: number) => Dayjs | null);

  /**
   * Holy days of obligation are days on which the faithful are expected to attend Mass,
   * and engage in rest from work and recreation.
   */
  isHolyDayOfObligation?: boolean | ((year: number) => boolean);

  /**
   * Link one or multiple Saints, Blessed, or any other celebrations from the Martyrology catalog.
   */
  martyrology?: MartyrologyItemPointer;

  /**
   * Replace (using an Array) or extend (using a Function) the titles of each Saints linked to this date definition.
   */
  titles?: TitlesDef;

  /**
   * The liturgical colors of the liturgical day.
   */
  liturgicalColors?: LiturgicalColors | LiturgicalColors[];

  /**
   * The proper cycle in which the liturgical day is part.
   */
  properCycle?: ProperCycles;

  /**
   * If this liturgical day must be removed from this calendar and from all those it inherits,
   * on the final calendar generated by romcal.
   */
  drop?: boolean;
};

/**
 * Root interface for Constructor Interfaces. This is a workaround for
 * TypeScript's lack of "static" methods for classes.
 *
 * Based on StackOverflow user chris's solution. See
 * - https://stackoverflow.com/a/43484801/1037165
 * - https://pastebin.com/v8Rf6g6Y
 *
 * @interface IConstructor
 * @template InstanceInterface
 */
interface IConstructor<InstanceInterface> {
  /**
   * Explicitly typed constructor is required, so make an extremely permissive
   * declaration that can be refined in subclasses.
   *
   * @constructor
   */
  new (config: RomcalConfig): InstanceInterface;
}

/**
 * Base [CalendarDef] interface
 */
export interface ICalendarDef {
  inheritFrom?: BaseCalendarDef | null;
  inheritFromInstance?: InstanceType<BaseCalendarDef>;
  particularConfig?: ParticularConfig;
  definitions: DateDefinitions;
  dates: Dates;
  updateConfig: (config?: RomcalConfigInput) => void;
  buildAllDates: (builtData: LiturgicalDefBuiltData) => LiturgicalDefBuiltData;
}

/**
 * Create a Constructor Interface by extending IConstructor and
 * specifying [ICalendarDef].
 * This allows to define static methods from [ICalendarDef]
 */
interface StaticCalendarComputing<T extends ICalendarDef> extends IConstructor<T> {
  generateCalendar: (builtData: LiturgicalDefBuiltData) => LiturgicalCalendar;
}

export type BaseCalendarDef = StaticCalendarComputing<ICalendarDef>;

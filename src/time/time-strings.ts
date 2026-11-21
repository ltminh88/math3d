// Texts of time items for 7-9 year olds (vi source, KNTT terms; en mirror). Generators
// only name keys. Digital times are one key (`digital` = "8:15"); weekdays are one key
// per weekday (`wd_1` = "thứ Hai"); Roman numerals are one key (`roman` = "VIII").
import { defineStrings } from '../i18n/i18n';
import type { PromptRef } from '../reasoning/reasoning-types';

const vi = {
  digital: '{h}:{mm}',
  num: '{n}',
  roman: '{r}',
  hour: '{h} giờ',
  wd_0: 'Chủ nhật',
  wd_1: 'thứ Hai',
  wd_2: 'thứ Ba',
  wd_3: 'thứ Tư',
  wd_4: 'thứ Năm',
  wd_5: 'thứ Sáu',
  wd_6: 'thứ Bảy',
  seq: '{a}, {b}, {c}',
  clockStory: 'Nhìn đồng hồ.',
  askClock: 'Đồng hồ chỉ mấy giờ?',
  sangChieuStoryMorning: 'Buổi sáng đồng hồ chỉ như hình. Hỏi là mấy giờ?',
  sangChieuStoryAfternoon: 'Buổi chiều đồng hồ chỉ như hình. Hỏi là mấy giờ?',
  sangChieuStoryEvening: 'Buổi tối đồng hồ chỉ như hình. Hỏi là mấy giờ?',
  elapsedStory: 'Hai đồng hồ chỉ giờ bắt đầu và giờ kết thúc. Hỏi đã qua bao nhiêu phút?',
  askElapsed: 'Đã qua bao nhiêu phút?',
  orderStory: 'Có ba giờ: {a}, {b}, {c}. Xếp theo thứ tự từ sớm đến muộn.',
  askOrder: 'Thứ tự đúng là:',
  monthStory: 'Tháng {m} năm {y}.',
  askMonthDays: 'Tháng này có bao nhiêu ngày?',
  calendarStory: 'Xem tờ lịch tháng {m} năm {y}.',
  askWeekday: 'Ngày {d} là thứ mấy?',
  askBetween: 'Ngày {d1} và ngày {d2} cách nhau bao nhiêu ngày?',
  roman24Story: 'Buổi chiều đồng hồ có số La Mã chỉ như hình. Hỏi là mấy giờ?',
};

const en = {
  digital: '{h}:{mm}',
  num: '{n}',
  roman: '{r}',
  hour: "{h} o'clock",
  wd_0: 'Sunday',
  wd_1: 'Monday',
  wd_2: 'Tuesday',
  wd_3: 'Wednesday',
  wd_4: 'Thursday',
  wd_5: 'Friday',
  wd_6: 'Saturday',
  seq: '{a}, {b}, {c}',
  clockStory: 'Look at the clock.',
  askClock: 'What time is it?',
  sangChieuStoryMorning: 'In the morning the clock shows this time. What time is it?',
  sangChieuStoryAfternoon: 'In the afternoon the clock shows this time. What time is it?',
  sangChieuStoryEvening: 'In the evening the clock shows this time. What time is it?',
  elapsedStory: 'The two clocks show the start time and the end time. How many minutes passed?',
  askElapsed: 'How many minutes passed?',
  orderStory: 'Here are three times: {a}, {b}, {c}. Put them in order from earliest to latest.',
  askOrder: 'The correct order is:',
  monthStory: 'Month {m}, {y}.',
  askMonthDays: 'How many days are in this month?',
  calendarStory: 'Look at the calendar page for month {m}, {y}.',
  askWeekday: 'What day of the week is the {d}th?',
  askBetween: 'How many days are there between the {d1}th and the {d2}th?',
  roman24Story: 'In the afternoon the clock with Roman numerals shows this time. What time is it?',
};

const ts = defineStrings('time', { vi, en });

export type Translator = (key: string, params?: Record<string, string | number>) => string;

/** Renders with `tr`; `i:<noun>` params become the translated `item_<noun>` of the same table. */
export function renderPromptWith(tr: Translator, prompt: PromptRef): string {
  const params: Record<string, string | number> = {};
  for (const [name, value] of Object.entries(prompt.params ?? {}))
    params[name] =
      typeof value === 'string' && value.startsWith('i:') ? tr(`item_${value.slice(2)}`) : value;
  return tr(prompt.key, params);
}

export const renderTimePrompt = (prompt: PromptRef): string =>
  renderPromptWith(ts as Translator, prompt);

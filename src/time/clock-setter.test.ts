// Clock setter math (R37): pointer angle <-> time on a 12-hour face, minute snap,
// and the tolerance check for a set clock. The child drags hands, so the contract is
// in angles: the minute hand must sit within half a snap step of the target minute,
// the hour hand within half an hour division of its true position (which already
// accounts for the minutes — 3:25 puts it between 3 and 4).
import { describe, expect, it } from 'vitest';
import {
  angleToHour,
  angleToMinutes,
  hourHandAngle,
  isSetClockCorrect,
  minuteHandAngle,
  snapMinutesForTier,
} from './clock-setter';

describe('clock setter math', () => {
  it('angleToMinutes snaps to the 5-minute grid (low tiers)', () => {
    expect(angleToMinutes(0, 5)).toBe(0);
    expect(angleToMinutes(90, 5)).toBe(15);
    expect(angleToMinutes(180, 5)).toBe(30);
    expect(angleToMinutes(270, 5)).toBe(45);
    expect(angleToMinutes(359, 5)).toBe(0);
    expect(angleToMinutes(16, 5)).toBe(5);
    expect(angleToMinutes(7, 5)).toBe(0);
    expect(angleToMinutes(-90, 5)).toBe(45);
  });

  it('angleToMinutes snaps to 1 minute (high tier)', () => {
    expect(angleToMinutes(0, 1)).toBe(0);
    expect(angleToMinutes(93, 1)).toBe(16);
    expect(angleToMinutes(87, 1)).toBe(15);
    expect(angleToMinutes(359, 1)).toBe(0);
  });

  it('angleToHour takes the nearest hour mark (0 is 12)', () => {
    expect(angleToHour(0)).toBe(12);
    expect(angleToHour(30)).toBe(1);
    expect(angleToHour(90)).toBe(3);
    expect(angleToHour(14)).toBe(12);
    expect(angleToHour(16)).toBe(1);
    expect(angleToHour(359)).toBe(12);
    expect(angleToHour(-30)).toBe(11);
  });

  it('angleToHour counts the minutes: at :30 the hand sits between two marks', () => {
    // 10:30 puts the hour hand at 315°, exactly between 10 and 11 — the hour is 10.
    expect(angleToHour(315, 30)).toBe(10);
    expect(angleToHour(102.5, 25)).toBe(3);
    expect(angleToHour(15, 30)).toBe(12);
    expect(angleToHour(345, 30)).toBe(11);
    expect(angleToHour(0, 45)).toBe(11);
    expect(angleToHour(15, 45)).toBe(12);
  });

  it('hand angles follow the face (0 is 12 o’clock, clockwise)', () => {
    expect(minuteHandAngle(0)).toBe(0);
    expect(minuteHandAngle(25)).toBe(150);
    expect(hourHandAngle(12, 0)).toBe(0);
    expect(hourHandAngle(3, 0)).toBe(90);
    expect(hourHandAngle(3, 25)).toBeCloseTo(102.5);
    expect(hourHandAngle(3, 30)).toBe(105);
  });

  it('snapMinutesForTier: 5 minutes on tiers 1–2, 1 minute on tier 3', () => {
    expect(snapMinutesForTier(1)).toBe(5);
    expect(snapMinutesForTier(2)).toBe(5);
    expect(snapMinutesForTier(3)).toBe(1);
  });

  it('isSetClockCorrect: the exact setting passes', () => {
    expect(isSetClockCorrect({ h: 3, m: 25 }, { h: 3, m: 25 }, 5)).toBe(true);
    expect(isSetClockCorrect({ h: 12, m: 0 }, { h: 12, m: 0 }, 5)).toBe(true);
    expect(isSetClockCorrect({ h: 7, m: 43 }, { h: 7, m: 43 }, 1)).toBe(true);
  });

  it('isSetClockCorrect: an hour off, or a minute off by a snap, fails', () => {
    expect(isSetClockCorrect({ h: 4, m: 25 }, { h: 3, m: 25 }, 5)).toBe(false);
    expect(isSetClockCorrect({ h: 3, m: 30 }, { h: 3, m: 25 }, 5)).toBe(false);
    expect(isSetClockCorrect({ h: 3, m: 20 }, { h: 3, m: 25 }, 5)).toBe(false);
    expect(isSetClockCorrect({ h: 7, m: 44 }, { h: 7, m: 43 }, 1)).toBe(false);
    expect(isSetClockCorrect({ h: 11, m: 55 }, { h: 12, m: 0 }, 5)).toBe(false);
  });
});

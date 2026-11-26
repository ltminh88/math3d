// Step-kit order/match strings (boost, Phase 2B): the order and match step
// widgets' own texts. vi is source of truth, en required.
import { defineStrings } from '../../i18n/i18n';

export const tkm = defineStrings('stepKitOrderMatch', {
  vi: {
    orderCue: 'Xếp các ô theo thứ tự',
    orderSlots: 'Các ô đã xếp',
    orderBank: 'Các ô chưa xếp',
    matchCue: 'Nối mỗi ô bên trái với một ô bên phải',
    matchLeft: 'Bên trái',
    matchRight: 'Bên phải',
    placed: 'Đã xếp: {label}',
    returned: 'Đã trả lại: {label}',
    paired: 'Đã nối: {label}',
    unpaired: 'Đã bỏ nối: {label}',
  },
  en: {
    orderCue: 'Put the tiles in order',
    orderSlots: 'Placed tiles',
    orderBank: 'Tiles to place',
    matchCue: 'Match each left tile with a right one',
    matchLeft: 'Left',
    matchRight: 'Right',
    placed: 'Placed: {label}',
    returned: 'Returned: {label}',
    paired: 'Paired: {label}',
    unpaired: 'Unpaired: {label}',
  },
});

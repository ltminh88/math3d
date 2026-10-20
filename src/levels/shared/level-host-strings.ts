import { defineStrings } from '../../i18n/i18n';

/** Level host + gate strings (vi source; en names follow the recovered translator's). */
export const tl = defineStrings('levelHost', {
  vi: {
    gateField: 'Cổng Cánh Đồng Phép Tính',
    gateForest: 'Cổng Rừng Nhân Chia',
    enter: 'Vào {gate}',
    stateLocked: 'Đang khóa',
    stateOpen: 'Cổng đã mở',
    stateCompleted: 'Đã hoàn thành {stars}',
    comingSoon: 'Sắp ra mắt',
    lockedBridge: 'Hoàn thành Cây cầu tình bạn để mở cổng này nhé!',
    lockedField: 'Hoàn thành Cánh Đồng Phép Tính để mở cổng này nhé!',
    comingSoonToast: 'Màn chơi này sắp ra mắt. Hẹn bạn quay lại nhé!',
    mapGate: 'Cổng màn chơi: {state}',
    leave: 'Về thế giới',
    loadFailed: 'Chưa mở được màn chơi. Bạn thử lại nhé!',
    levelDone: 'Hoàn thành màn chơi! +{xp} XP, +{coins} xu',
    backAtGate: 'Bạn đã trở lại cổng.',
  },
  en: {
    gateField: 'Math Meadow Gate',
    gateForest: 'Multiplication Forest Gate',
    enter: 'Enter {gate}',
    stateLocked: 'Locked',
    stateOpen: 'Gate open',
    stateCompleted: 'Completed {stars}',
    comingSoon: 'Coming soon',
    lockedBridge: 'Finish the Friendship Bridge to open this gate!',
    lockedField: 'Finish the Math Meadow to open this gate!',
    comingSoonToast: 'This level is coming soon. See you again!',
    mapGate: 'Level gate: {state}',
    leave: 'Back to the world',
    loadFailed: 'Could not open the level. Please try again!',
    levelDone: 'Level complete! +{xp} XP, +{coins} coins',
    backAtGate: 'You are back at the gate.',
  },
});

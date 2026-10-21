import { defineStrings } from '../i18n/i18n';

/** Quest chain after the bridge (vi source; gate names come from the level host strings). */
export const tq = defineStrings('questChain', {
  vi: {
    eyebrowNext: 'NHIỆM VỤ TIẾP THEO',
    eyebrowDone: 'CHÚC MỪNG BẠN',
    titleField: 'Cánh Đồng Phép Tính',
    titleForest: 'Rừng Nhân Chia',
    titleDone: 'Bạn đã qua cả ba chặng!',
    copyField:
      'Đi theo con đường bên kia cầu tới cánh đồng lúa vàng. Tìm cổng có dấu ✨ {gate}, rồi nhấn E hoặc bấm nút Vào cổng nhé!',
    copyForest:
      'Cổng mới đã mở! Đi theo con đường bên kia cầu tới khu rừng xanh. Tìm cổng có dấu ✨ {gate}, rồi nhấn E hoặc bấm nút Vào cổng nhé!',
    copyDone:
      'Bạn có thể luyện thêm cùng {guide}, hoặc ghé {shop} trong làng để tiêu xu. Thành Phố Con Số và Tháp Toán Học sắp ra mắt!',
    progressField: 'Đến Cổng Cánh Đồng',
    progressForest: 'Đến Cổng Rừng Nhân Chia',
    progressDone: '✓ Hoàn thành',
    rewardLevel: '+{xp} XP, +{coins} xu',
    rewardPractice: '+10 XP / câu',
    stepBridge: 'Cây cầu',
    stepField: 'Cánh Đồng',
    stepForest: 'Khu Rừng',
    stepDone: 'Chặng {n}: {name}, đã xong',
    stepTodo: 'Chặng {n}: {name}, chưa xong',
    guideField:
      '{gate} đang chờ bạn ở cuối con đường bên kia cầu. Bạn cũng có thể luyện thêm phép nhân cùng mình nhé!',
    guideForest:
      '{gate} đã mở! Cổng đang chờ bạn ở cuối con đường bên kia cầu, phía khu rừng xanh. Bạn cũng có thể luyện thêm phép nhân cùng mình nhé!',
    completeNote:
      '✨ {gate} đã mở! Cổng ở cuối con đường bên kia cầu, phía cánh đồng lúa vàng. Nhấn M để xem bản đồ nhé!',
  },
  en: {
    eyebrowNext: 'NEXT QUEST',
    eyebrowDone: 'WELL DONE',
    titleField: 'Math Meadow',
    titleForest: 'Multiplication Forest',
    titleDone: 'You finished all three stages!',
    copyField:
      'Follow the road across the bridge to the golden meadow. Find the ✨ {gate}, then press E or tap Enter to go in!',
    copyForest:
      'A new gate is open! Follow the road across the bridge to the green forest. Find the ✨ {gate}, then press E or tap Enter to go in!',
    copyDone:
      'Practise more with {guide}, or visit the {shop} in the village to spend your coins. Number City and Math Tower are coming soon!',
    progressField: 'Reach the Meadow Gate',
    progressForest: 'Reach the Forest Gate',
    progressDone: '✓ Complete',
    rewardLevel: '+{xp} XP, +{coins} coins',
    rewardPractice: '+10 XP / answer',
    stepBridge: 'Bridge',
    stepField: 'Meadow',
    stepForest: 'Forest',
    stepDone: 'Stage {n}: {name}, done',
    stepTodo: 'Stage {n}: {name}, not done yet',
    guideField:
      'The {gate} is waiting for you at the end of the road across the bridge. We can also practise multiplication together!',
    guideForest:
      'The {gate} is open! It is waiting at the end of the road across the bridge, by the green forest. We can also practise multiplication together!',
    completeNote:
      '✨ The {gate} is open! It stands at the end of the road across the bridge, by the golden meadow. Press M to see the map!',
  },
});

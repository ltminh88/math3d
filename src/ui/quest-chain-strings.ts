import { defineStrings } from '../i18n/i18n';

/** Quest chain after the bridge (vi source; gate names come from the level host strings). */
export const tq = defineStrings('questChain', {
  vi: {
    eyebrowNext: 'NHIỆM VỤ TIẾP THEO',
    eyebrowDone: 'CHÚC MỪNG BẠN',
    titleField: 'Cánh Đồng Phép Tính',
    titleForest: 'Rừng Nhân Chia',
    titleCity: 'Thành Phố Con Số',
    titleTower: 'Tháp Toán Học',
    titleDone: 'Bạn đã qua cả năm chặng!',
    copyField:
      'Đi theo con đường bên kia cầu tới cánh đồng lúa vàng. Tìm cổng có dấu ✨ {gate}, rồi nhấn E hoặc bấm nút Vào cổng nhé!',
    copyForest:
      'Cổng mới đã mở! Đi theo con đường bên kia cầu tới khu rừng xanh. Tìm cổng có dấu ✨ {gate}, rồi nhấn E hoặc bấm nút Vào cổng nhé!',
    copyCity:
      'Cổng mới đã mở! Đi theo con đường bên kia cầu tới thành phố của những tòa nhà mang số. Tìm cổng có dấu ✨ {gate}, rồi nhấn E hoặc bấm nút Vào cổng nhé!',
    copyTower:
      'Chặng cuối đã mở! Đi theo con đường bên kia cầu tới ngọn tháp cao nhất. Tìm cổng có dấu ✨ {gate}, rồi nhấn E hoặc bấm nút Vào cổng nhé!',
    copyDone: 'Bạn có thể luyện thêm cùng {guide}, hoặc ghé {shop} trong làng để tiêu xu.',
    progressField: 'Đến Cổng Cánh Đồng',
    progressForest: 'Đến Cổng Rừng Nhân Chia',
    progressCity: 'Đến Cổng Thành Phố Con Số',
    progressTower: 'Đến Cổng Tháp Toán Học',
    progressDone: '✓ Hoàn thành',
    rewardLevel: '+{xp} XP, +{coins} xu',
    rewardPractice: '+10 XP / câu',
    stepBridge: 'Cây cầu',
    stepField: 'Cánh Đồng',
    stepForest: 'Khu Rừng',
    stepCity: 'Thành Phố',
    stepTower: 'Tháp',
    stepDone: 'Chặng {n}: {name}, đã xong',
    stepTodo: 'Chặng {n}: {name}, chưa xong',
    guideField:
      '{gate} đang chờ bạn ở cuối con đường bên kia cầu. Bạn cũng có thể luyện thêm phép nhân cùng mình nhé!',
    guideForest:
      '{gate} đã mở! Cổng đang chờ bạn ở cuối con đường bên kia cầu, phía khu rừng xanh. Bạn cũng có thể luyện thêm phép nhân cùng mình nhé!',
    guideCity:
      '{gate} đã mở! Cổng đang chờ bạn ở cuối con đường bên kia cầu, phía thành phố con số. Bạn cũng có thể luyện thêm phép nhân cùng mình nhé!',
    guideTower:
      '{gate} đã mở! Cổng đang chờ bạn ở cuối con đường bên kia cầu, dưới chân ngọn tháp cao nhất. Bạn cũng có thể luyện thêm phép nhân cùng mình nhé!',
    completeNote:
      '✨ {gate} đã mở! Cổng ở cuối con đường bên kia cầu, phía cánh đồng lúa vàng. Nhấn M để xem bản đồ nhé!',
  },
  en: {
    eyebrowNext: 'NEXT QUEST',
    eyebrowDone: 'WELL DONE',
    titleField: 'Math Meadow',
    titleForest: 'Multiplication Forest',
    titleCity: 'Number City',
    titleTower: 'Math Tower',
    titleDone: 'You finished all five stages!',
    copyField:
      'Follow the road across the bridge to the golden meadow. Find the ✨ {gate}, then press E or tap Enter to go in!',
    copyForest:
      'A new gate is open! Follow the road across the bridge to the green forest. Find the ✨ {gate}, then press E or tap Enter to go in!',
    copyCity:
      'A new gate is open! Follow the road across the bridge to the city of numbered buildings. Find the ✨ {gate}, then press E or tap Enter to go in!',
    copyTower:
      'The last stage is open! Follow the road across the bridge to the tallest tower. Find the ✨ {gate}, then press E or tap Enter to go in!',
    copyDone: 'Practise more with {guide}, or visit the {shop} in the village to spend your coins.',
    progressField: 'Reach the Meadow Gate',
    progressForest: 'Reach the Forest Gate',
    progressCity: 'Reach the City Gate',
    progressTower: 'Reach the Tower Gate',
    progressDone: '✓ Complete',
    rewardLevel: '+{xp} XP, +{coins} coins',
    rewardPractice: '+10 XP / answer',
    stepBridge: 'Bridge',
    stepField: 'Meadow',
    stepForest: 'Forest',
    stepCity: 'City',
    stepTower: 'Tower',
    stepDone: 'Stage {n}: {name}, done',
    stepTodo: 'Stage {n}: {name}, not done yet',
    guideField:
      'The {gate} is waiting for you at the end of the road across the bridge. We can also practise multiplication together!',
    guideForest:
      'The {gate} is open! It is waiting at the end of the road across the bridge, by the green forest. We can also practise multiplication together!',
    guideCity:
      'The {gate} is open! It is waiting at the end of the road across the bridge, by Number City. We can also practise multiplication together!',
    guideTower:
      'The {gate} is open! It is waiting at the end of the road across the bridge, at the foot of the tallest tower. We can also practise multiplication together!',
    completeNote:
      '✨ The {gate} is open! It stands at the end of the road across the bridge, by the golden meadow. Press M to see the map!',
  },
});
